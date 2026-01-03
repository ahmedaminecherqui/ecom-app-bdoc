package ma.emsi.cherqui.chatbotservice.services;

import jakarta.annotation.PostConstruct;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    @Value("classpath:docs/Documentation.pdf")
    private Resource pdfResource;

    public RagService(ChatClient.Builder chatClientBuilder, EmbeddingModel embeddingModel) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = new SimpleVectorStore(embeddingModel);
    }

    @PostConstruct
    public void init() {
        // Asynchronously ingest the PDF on startup
        new Thread(() -> {
            try {
                if (pdfResource.exists()) {
                    System.out.println("Starting document ingestion from: " + pdfResource.getFilename());
                    ingestDocument(pdfResource);
                    System.out.println("Document ingestion completed successfully.");
                } else {
                    System.err.println("Default document cours.pdf not found in classpath:docs/");
                }
            } catch (Exception e) {
                System.err.println("Error during initial ingestion: " + e.getMessage());
            }
        }).start();
    }

    public void ingestDocument(Resource resource) {
        try {
            PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(resource);
            List<Document> documents = pdfReader.get();

            TokenTextSplitter splitter = new TokenTextSplitter();
            List<Document> chunks = splitter.apply(documents);

            vectorStore.add(chunks);
            System.out.println("Ingested " + chunks.size() + " chunks.");
        } catch (Exception e) {
            System.err.println("Error ingesting document: " + e.getMessage());
        }
    }

    public String ask(String query) {
        // 1. Retrieve similar documents
        List<Document> similarDocuments = vectorStore.similaritySearch(query);

        String context = similarDocuments.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n"));

        // 2. Use ChatClient to generate response with context
        return chatClient.prompt()
                .system("You are a helpful assistant. Use the following context to answer the question. If you don't know, say so.\nContext:\n"
                        + context)
                .user(query)
                .call()
                .content();
    }
}
