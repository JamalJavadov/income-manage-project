package com.incomemanager.user.dto;

import com.incomemanager.user.entity.Role;

import java.math.BigDecimal;
import java.time.Instant;

public record ProfileResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        BigDecimal monthlyIncome,
        Instant createdAt
) {
}
