package com.incomemanager.income.dto;

import java.math.BigDecimal;

public class IncomeStatusResponse {
    private boolean hasMonthlyIncome;
    private BigDecimal monthlyIncome;

    public IncomeStatusResponse(boolean hasMonthlyIncome, BigDecimal monthlyIncome) {
        this.hasMonthlyIncome = hasMonthlyIncome;
        this.monthlyIncome = monthlyIncome;
    }

    public boolean isHasMonthlyIncome() {
        return hasMonthlyIncome;
    }

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }
}
