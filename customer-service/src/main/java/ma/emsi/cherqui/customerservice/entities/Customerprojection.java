package ma.emsi.cherqui.customerservice.entities;

import org.springframework.data.rest.core.config.Projection;

@Projection(name="all",types=Customer.class)
public interface Customerprojection {
    String getName();
    String getEmail();
}
