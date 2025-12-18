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
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Random;

@EnableDiscoveryClient
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

                    System.out.println(
                            "Seeding: Found " + customers.size() + " customers and " + products.size() + " products.");

                    customers.forEach(customer -> {
                        Bill bill = Bill.builder().customerId(customer.getId()).build();
                        Bill savedBill = billRepository.save(bill);
                        System.out.println(
                                "Seeding: Saved Bill " + savedBill.getId() + " for customer " + customer.getId());

                        products.forEach(product -> {
                            ProductItem productItem = ProductItem.builder()
                                    .bill(savedBill)
                                    .productId(product.getId())
                                    .quantity(new Random().nextInt(10) + 1)
                                    .unitPrice(product.getPrice())
                                    .build();
                            productItemRepository.save(productItem);
                        });
                    });

                    System.out.println(
                            "Billing service data seeded successfully! Total Bills: " + billRepository.count());
                    break;
                } catch (Exception e) {
                    System.err.println("Attempt " + (i + 1) + "/" + maxRetries + " failed: " + e.getMessage());
                    if (i == maxRetries - 1) {
                        System.err.println("Data seeding ABORTED after 10 attempts.");
                    } else {
                        Thread.sleep(retryDelay);
                    }
                }
            }
        };
    }

    @Bean
    public RepositoryRestConfigurer repositoryRestConfigurer() {
        return new RepositoryRestConfigurer() {
            @Override
            public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
                config.exposeIdsFor(Bill.class);
                config.exposeIdsFor(ProductItem.class);
            }
        };
    }
}
