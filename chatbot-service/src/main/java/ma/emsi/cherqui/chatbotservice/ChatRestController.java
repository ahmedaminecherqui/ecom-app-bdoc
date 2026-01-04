package ma.emsi.cherqui.chatbotservice.web;

import ma.emsi.cherqui.chatbotservice.services.RagService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin("*")
public class ChatRestController {

    private final RagService ragService;

    public ChatRestController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        String chatId = request.getOrDefault("chatId", "default-user");
        System.out.println("Received chat request from " + chatId + ": " + query);

        try {
            String response = ragService.ask(chatId, query);
            System.out.println("Assistant responded successfully.");
            return Map.of("response", response != null ? response : "I'm sorry, I couldn't generate a response.");
        } catch (Exception e) {
            System.err.println("Chatbot error: " + e.getMessage());
            e.printStackTrace();
            return Map.of("response", "Error: " + e.getMessage());
        }
    }
}
