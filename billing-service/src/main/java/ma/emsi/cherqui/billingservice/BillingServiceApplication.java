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
    CommandLineRunner commandLineRunner(BillRepository billRepository, ProductItemRepository productItemRepository,
            CustomerRestClient customerRestClient, ProductRestClient productRestClient) {

        return args -> {
            // Retry logic to handle race conditions where dependent services are not yet
            // ready
            int maxRetries = 10;
            int retryDelay = 5000; // 5 seconds

            for (int i = 0; i < maxRetries; i++) {
                try {
                    Collection<Customer> customers = customerRestClient.findAllCustomers().getContent();
                    Collection<Product> products = productRestClient.findAllProducts().getContent();

                    customers.forEach(customer -> {
                        Bill bill = Bill.builder().customerId(customer.getId())
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

                    System.out.println("Billing service data seeded successfully!");
                    break; // Success, exit loop

                } catch (Exception e) {
                    System.err.println(
                            "Attempt " + (i + 1) + "/" + maxRetries + " failed to seed data: " + e.getMessage());
                    if (i == maxRetries - 1) {
                        System.err
                                .println("Giving up on data seeding. Billing service may handle requests incorrectly.");
                    } else {
                        System.out.println("Retrying in " + (retryDelay / 1000) + " seconds...");
                        try {
                            Thread.sleep(retryDelay);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }
            }
        };

    }

}
