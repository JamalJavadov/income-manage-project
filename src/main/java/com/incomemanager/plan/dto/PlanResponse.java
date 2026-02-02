package com.incomemanager.plan.dto;

import com.incomemanager.plan.entity.PlanType;

import java.math.BigDecimal;
import java.time.Instant;

public record PlanResponse(
        Long id,
        String name,
        String description,
        BigDecimal amount,
        PlanType type,
        Instant createdAt
) {
}
