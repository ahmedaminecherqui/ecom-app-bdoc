package ma.emsi.cherqui.billingservice;

import ma.emsi.cherqui.billingservice.entities.Bill;
import ma.emsi.cherqui.billingservice.entities.ProductItem;
import ma.emsi.cherqui.billingservice.feign.CustomerRestClient;
import ma.emsi.cherqui.billingservice.feign.ProductRestClient;
import ma.emsi.cherqui.billingservice.model.Customer;
import ma.emsi.cherqui.billingservice.model.Product;
import ma.emsi.cherqui.billingservice.repository.BillRepository;
import ma.emsi.cherqui.billingservice.repository.ProductItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Random;

@EnableFeignClients
@SpringBootApplication
public class BillingServiceApplication {

	public static void main(String[] args) {

        SpringApplication.run(BillingServiceApplication.class, args);

	}

    @Bean
    CommandLineRunner commandLineRunner(BillRepository billRepository
    , ProductItemRepository productItemRepository, CustomerRestClient customerRestClient
    ,ProductRestClient  productRestClient ) {

        return args -> {
            Collection<Customer> customers = customerRestClient.findAllCustomers().getContent();
            Collection<Product> products = productRestClient.findAllProducts().getContent();

            customers.forEach(customer -> {
                Bill bill = Bill.builder().
                        customerId(customer.getId())
                        .build();
                billRepository.save(bill);
                products.forEach(product -> {
                    ProductItem productItem = ProductItem.builder()
                            .bill(bill)
                            .productId(product.getId())
                            .quantity(new Random().nextInt(10))
                            .unitPrice(product.getPrice())
                            .build();
                    productItemRepository.save(productItem);
                });

            });
        };

    }

}
