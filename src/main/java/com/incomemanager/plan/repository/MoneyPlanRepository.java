package com.incomemanager.plan.repository;

import com.incomemanager.plan.entity.MoneyPlan;
import com.incomemanager.user.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MoneyPlanRepository extends JpaRepository<MoneyPlan, Long> {
    List<MoneyPlan> findAllByUser(AppUser user);
}
