package ma.emsi.cherqui.analyticsservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillEvent {
    private Long id;
    private Date billingDate;
    private long customerId;
    private double totalAmount;
}
