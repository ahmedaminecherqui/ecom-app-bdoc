package ma.emsi.cherqui.customerservice;

import ma.emsi.cherqui.customerservice.entities.Customer;
import ma.emsi.cherqui.customerservice.repository.CustomerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.*;

@SpringBootApplication
public class CustomerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CustomerServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(CustomerRepository repository) {
        return args -> {
            repository.save(Customer.builder().
                    name("Mohamed").email("med@gmail.com").
                    build());

            repository.save(Customer.builder().
                    name("Imane").email("imane@gmail.com").
                    build());

            repository.save(Customer.builder().
                    name("Yassine").email("yassine@gmail.com").
                    build());
            repository.findAll().forEach(c-> {
                        System.out.println("==================");
                        System.out.println(c.getId());
                        System.out.println(c.getName());
                        System.out.println(c.getEmail());
                        System.out.println("==================");
                    }
            );
        };
    }

}
