package ma.emsi.cherqui.billingservice.repository;

import ma.emsi.cherqui.billingservice.model.ProductItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductItemRepository extends JpaRepository<ProductItem,Long> {
}
