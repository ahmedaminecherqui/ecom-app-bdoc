package ma.emsi.cherqui.billingservice.entities;

import jakarta.persistence.*;

@Entity
public class ProductItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private long productId;
    @ManyToOne
    private Bill bill;
    private int quantity;
    private double unitPrice;

}
