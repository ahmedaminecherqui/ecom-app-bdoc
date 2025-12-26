package ma.emsi.cherqui.billingservice.web;

import ma.emsi.cherqui.billingservice.entities.Bill;
import ma.emsi.cherqui.billingservice.model.BillEvent;
import ma.emsi.cherqui.billingservice.repository.BillRepository;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BillEventController {
    private StreamBridge streamBridge;
    private BillRepository billRepository;

    public BillEventController(StreamBridge streamBridge, BillRepository billRepository) {
        this.streamBridge = streamBridge;
        this.billRepository = billRepository;
    }

    @GetMapping("/publishEvent/{id}")
    public Bill publishEvent(@PathVariable Long id) {
        Bill bill = billRepository.findById(id).get();
        BillEvent billEvent = BillEvent.builder()
                .id(bill.getId())
                .billingDate(bill.getBillingDate())
                .customerId(bill.getCustomerId())
                .totalAmount(
                        bill.getProductItems().stream().mapToDouble(pi -> pi.getUnitPrice() * pi.getQuantity()).sum())
                .build();
        streamBridge.send("bill-topic", billEvent);
        return bill;
    }
}
