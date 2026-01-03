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
        String response = ragService.ask(chatId, query);
        return Map.of("response", response);
    }
}
