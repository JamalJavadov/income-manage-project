package com.incomemanager.income.dto;

import java.math.BigDecimal;

public class IncomeSplitResponse {
    private BigDecimal monthlyIncome;
    private BigDecimal fixedAndEssential;
    private BigDecimal growthAndReinvestment;
    private BigDecimal personalWants;

    public IncomeSplitResponse(
            BigDecimal monthlyIncome,
            BigDecimal fixedAndEssential,
            BigDecimal growthAndReinvestment,
            BigDecimal personalWants
    ) {
        this.monthlyIncome = monthlyIncome;
        this.fixedAndEssential = fixedAndEssential;
        this.growthAndReinvestment = growthAndReinvestment;
        this.personalWants = personalWants;
    }

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public BigDecimal getFixedAndEssential() {
        return fixedAndEssential;
    }

    public BigDecimal getGrowthAndReinvestment() {
        return growthAndReinvestment;
    }

    public BigDecimal getPersonalWants() {
        return personalWants;
    }
}
