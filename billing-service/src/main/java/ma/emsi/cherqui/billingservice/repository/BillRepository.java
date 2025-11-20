package ma.emsi.cherqui.billingservice.repository;

import ma.emsi.cherqui.billingservice.entities.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill,Long> {
}
