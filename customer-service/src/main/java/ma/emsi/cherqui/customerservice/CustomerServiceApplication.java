package ma.emsi.cherqui.customerservice;

import ma.emsi.cherqui.customerservice.config.CustomerConfigParams;
import ma.emsi.cherqui.customerservice.entities.Customer;
import ma.emsi.cherqui.customerservice.repository.CustomerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@SpringBootApplication
@EnableConfigurationProperties(CustomerConfigParams.class)
public class CustomerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CustomerServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(CustomerRepository repository) {
        return args -> {
            repository.save(Customer.builder().name("Mohamed").email("med@gmail.com").build());

            repository.save(Customer.builder().name("Imane").email("imane@gmail.com").build());

            repository.save(Customer.builder().name("Yassine").email("yassine@gmail.com").build());
            repository.findAll().forEach(c -> {
                System.out.println("==================");
                System.out.println(c.getId());
                System.out.println(c.getName());
                System.out.println(c.getEmail());
                System.out.println("==================");
            });
        };
    }

    @Bean
    public RepositoryRestConfigurer repositoryRestConfigurer() {
        return new RepositoryRestConfigurer() {
            @Override
            public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
                config.exposeIdsFor(Customer.class);
            }
        };
    }
}
