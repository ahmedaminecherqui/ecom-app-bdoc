package ma.emsi.cherqui.billingservice.web;

import ma.emsi.cherqui.billingservice.entities.Bill;
import ma.emsi.cherqui.billingservice.feign.CustomerRestClient;
import ma.emsi.cherqui.billingservice.feign.ProductRestClient;
import ma.emsi.cherqui.billingservice.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ma.emsi.cherqui.billingservice.entities.ProductItem;
import ma.emsi.cherqui.billingservice.repository.ProductItemRepository;
import java.util.Date;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@RestController
public class BillRestController {
    @Autowired
    private BillRepository billRepository;
    @Autowired
    private ProductRestClient productRestClient;
    @Autowired
    private CustomerRestClient customerRestClient;
    @Autowired
    private ProductItemRepository productItemRepository;

    @PostMapping(path = "/api/bills/full")
    public Bill saveBill(@RequestBody OrderRequest orderRequest) {
        if (orderRequest == null || orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
            throw new RuntimeException("Invalid order: No items provided");
        }

        System.out.println("Processing order for customer: " + orderRequest.getCustomerId());

        Bill bill = Bill.builder()
                .billingDate(new Date())
                .customerId(orderRequest.getCustomerId())
                .build();
        Bill savedBill = billRepository.save(bill);

        orderRequest.getItems().forEach(item -> {
            ProductItem productItem = ProductItem.builder()
                    .productId(item.getProductId())
                    .unitPrice(item.getUnitPrice())
                    .quantity(item.getQuantity())
                    .bill(savedBill)
                    .build();
            productItemRepository.save(productItem);
        });

        System.out.println("Bill " + savedBill.getId() + " saved. Attempting enrichment...");

        try {
            // Attempt to enrich data but don't fail the whole request if a service is down
            savedBill.setCustomer(customerRestClient.findCustomerById(savedBill.getCustomerId()));
            savedBill.getProductItems().forEach(item -> {
                try {
                    item.setProduct(productRestClient.getProductById(item.getProductId()));
                } catch (Exception e) {
                    System.err.println("Could not fetch product " + item.getProductId());
                }
            });
        } catch (Exception e) {
            System.err.println("Enrichment failed: " + e.getMessage());
        }

        return savedBill;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderRequest {
        private Long customerId;
        private List<OrderItemRequest> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        private String productId;
        private double unitPrice;
        private int quantity;
    }

    @GetMapping(path = "/api/bills/fullBills")
    public List<Bill> fullBills() {
        List<Bill> bills = billRepository.findAll();
        bills.forEach(bill -> {
            try {
                bill.setCustomer(customerRestClient.findCustomerById(bill.getCustomerId()));
            } catch (Exception e) {
                System.err.println("Could not fetch customer " + bill.getCustomerId() + ": " + e.getMessage());
            }

            bill.getProductItems().forEach(item -> {
                try {
                    item.setProduct(productRestClient.getProductById(item.getProductId()));
                } catch (Exception e) {
                    System.err.println("Could not fetch product " + item.getProductId() + ": " + e.getMessage());
                }
            });
        });
        return bills;
    }

    @GetMapping(path = "/api/bills/customer/{customerId}")
    public List<Bill> getBillsByCustomer(@PathVariable(name = "customerId") Long customerId) {
        List<Bill> bills = billRepository.findByCustomerId(customerId);
        bills.forEach(bill -> {
            try {
                bill.setCustomer(customerRestClient.findCustomerById(bill.getCustomerId()));
            } catch (Exception e) {
                System.err.println("Could not fetch customer " + bill.getCustomerId() + ": " + e.getMessage());
            }

            bill.getProductItems().forEach(item -> {
                try {
                    item.setProduct(productRestClient.getProductById(item.getProductId()));
                } catch (Exception e) {
                    System.err.println("Could not fetch product " + item.getProductId() + ": " + e.getMessage());
                }
            });
        });
        return bills;
    }

    @GetMapping(path = "/api/bills/{id}")
    public Bill getBill(@PathVariable(name = "id") Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with ID: " + id));
        try {
            bill.setCustomer(customerRestClient.findCustomerById(bill.getCustomerId()));
        } catch (Exception e) {
            System.err.println("Could not fetch customer " + bill.getCustomerId() + ": " + e.getMessage());
        }

        bill.getProductItems().forEach(item -> {
            try {
                item.setProduct(productRestClient.getProductById(item.getProductId()));
            } catch (Exception e) {
                System.err.println("Could not fetch product " + item.getProductId() + ": " + e.getMessage());
            }
        });
        return bill;
    }

}
