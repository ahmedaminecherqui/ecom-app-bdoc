package ma.emsi.cherqui.billingservice.web;

import ma.emsi.cherqui.billingservice.entities.Bill;
import ma.emsi.cherqui.billingservice.feign.CustomerRestClient;
import ma.emsi.cherqui.billingservice.feign.ProductRestClient;
import ma.emsi.cherqui.billingservice.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.Controller;

@RestController
public class BillRestController {
    @Autowired
    ProductRestClient productRestClient = null;
    @Autowired
    BillRepository billRepository = null;
    @Autowired
    ProductRestClient productRestClient2 = null;
    @Autowired
    private CustomerRestClient customerRestClient;

    @GetMapping(path = "/bills/{id}")
    public Bill getBill(@PathVariable(name = "id") Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with ID: " + id));
        bill.setCustomer(customerRestClient.findCustomerById(bill.getCustomerId()));
        bill.getProductItems().forEach(item -> {
            item.setProduct(productRestClient.getProductById(item.getProductId()));
        });
        return bill;
    }

}
