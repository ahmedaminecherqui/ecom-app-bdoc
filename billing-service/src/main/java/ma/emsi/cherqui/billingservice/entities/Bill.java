package ma.emsi.cherqui.billingservice.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import ma.emsi.cherqui.billingservice.model.ProductItem;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
public class Bill {
    @Id
    private Long id;
    private Date billingDate;
    private long customerId;
    private List<ProductItem> ProductItems = new ArrayList<>();
}
