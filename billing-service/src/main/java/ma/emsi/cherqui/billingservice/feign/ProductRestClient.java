package ma.emsi.cherqui.billingservice.feign;

import ma.emsi.cherqui.billingservice.model.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.hateoas.PagedModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name="inventory-service")
public interface ProductRestClient {
    @GetMapping("/api/products/{id}")
    public Product getProductById(String id);

    @GetMapping("/api/customers")
    PagedModel<Product> findAllProducts();
}
