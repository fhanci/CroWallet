package com.crowallet.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Map;

import com.crowallet.backend.entity.InvestmentHolding;

@Repository
public interface InvestmentHoldingRepository extends JpaRepository<InvestmentHolding, Long> {
    List<InvestmentHolding> findByAccountId(Long accountId);
    void deleteByAccountId(Long accountId);
    List<InvestmentHolding> findByUserId(Long accountId);



    @Query(value = """
        SELECT investment_holdings.*,((investment_holdings.current_price - investment_holdings.purchase_price) * investment_holdings.quantity) as profitLoss,accounts.name as hesapAdi,accounts.account_type as hesapTipi,accounts.balance as totalPrice, users.id as userID
        FROM users
        INNER JOIN accounts ON users.id = accounts.user_id
        INNER JOIN investment_holdings ON investment_holdings.account_id = accounts.id
        WHERE users.id =:userID                
        """,nativeQuery =true )
    List<Map<String,Object>> findByAccountInvesment(Long userID);


}

