package com.incomemanager.income.dto;

import java.math.BigDecimal;

public class IncomeRequest {
    private BigDecimal monthlyIncome;

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }
}
