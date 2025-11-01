package ma.emsi.cherqui.inventoryservice.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class Product {

@Id
    private String id;
    private String name;
    private int price;
    private int quantity;

}
