package ma.emsi.cherqui.customerservice.config;

import ma.emsi.cherqui.customerservice.entities.Customer;
import ma.emsi.cherqui.customerservice.repository.CustomerRepository;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

public class RestRepositoryconfig implements RepositoryRestConfigurer {
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry registry) {
        config.exposeIdsFor(Customer.class);
    }
}
