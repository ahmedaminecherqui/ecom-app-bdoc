package ma.emsi.cherqui.inventoryservice.service;

import ma.emsi.cherqui.inventoryservice.model.BillEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

@Service
public class BillEventService {

    @Bean
    public Consumer<BillEvent> billEventConsumer() {
        return billEvent -> {
            System.out.println("***************************");
            System.out.println("Received Bill Event:");
            System.out.println("Bill ID: " + billEvent.getId());
            System.out.println("Customer ID: " + billEvent.getCustomerId());
            System.out.println("Total Amount: " + billEvent.getTotalAmount());
            System.out.println("***************************");
        };
    }
}
