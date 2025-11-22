package ma.emsi.cherqui.inventoryservice;


import ma.emsi.cherqui.inventoryservice.entities.Product;
import ma.emsi.cherqui.inventoryservice.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

import java.util.UUID;

@SpringBootApplication
@EnableDiscoveryClient
public class InventoryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventoryServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner commandLineRunner(ProductRepository productRepository) {
        return args -> {
            productRepository.save(Product.builder().
                    id(UUID.randomUUID().toString()).
                    name("computer").
                    price(3200).
                    quantity(10).
                    build());
            productRepository.save(Product.builder().
                    id(UUID.randomUUID().toString()).
                    name("iphone").
                    price(1200).
                    quantity(100).
                    build());
            productRepository.save(Product.builder().
                    id(UUID.randomUUID().toString()).
                    name("tablet").
                    price(4350).
                    quantity(35).
                    build());

            productRepository.findAll().forEach(p->{
                System.out.println(p.toString());
            });
        };
    }


}