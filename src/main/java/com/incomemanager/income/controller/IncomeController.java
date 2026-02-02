package com.incomemanager.income.controller;

import com.incomemanager.income.dto.IncomeRequest;
import com.incomemanager.income.dto.IncomeSplitResponse;
import com.incomemanager.income.dto.IncomeStatusResponse;
import com.incomemanager.user.entity.AppUser;
import com.incomemanager.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;

@RestController
@RequestMapping("/api/income")
public class IncomeController {
    private static final BigDecimal FIXED_PERCENT = new BigDecimal("0.50");
    private static final BigDecimal GROWTH_PERCENT = new BigDecimal("0.30");
    private static final BigDecimal PERSONAL_PERCENT = new BigDecimal("0.20");

    private final UserRepository userRepository;

    public IncomeController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/status")
    public IncomeStatusResponse status(Authentication authentication) {
        AppUser user = findUser(authentication);
        BigDecimal income = user.getMonthlyIncome();
        return new IncomeStatusResponse(income != null, income);
    }

    @PostMapping
    public IncomeStatusResponse updateIncome(
            @RequestBody IncomeRequest request,
            Authentication authentication
    ) {
        AppUser user = findUser(authentication);
        BigDecimal income = request.getMonthlyIncome();
        if (income == null || income.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Monthly income must be greater than zero.");
        }
        BigDecimal normalizedIncome = income.setScale(2, RoundingMode.HALF_UP);
        user.setMonthlyIncome(normalizedIncome);
        userRepository.save(user);
        return new IncomeStatusResponse(true, normalizedIncome);
    }

    @GetMapping("/strategy")
    public IncomeSplitResponse strategy(Authentication authentication) {
        AppUser user = findUser(authentication);
        BigDecimal income = user.getMonthlyIncome();
        if (income == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Monthly income not set.");
        }
        BigDecimal fixed = calculatePortion(income, FIXED_PERCENT);
        BigDecimal growth = calculatePortion(income, GROWTH_PERCENT);
        BigDecimal personal = calculatePortion(income, PERSONAL_PERCENT);
        return new IncomeSplitResponse(income, fixed, growth, personal);
    }

    private BigDecimal calculatePortion(BigDecimal income, BigDecimal percent) {
        return income.multiply(percent).setScale(2, RoundingMode.HALF_UP);
    }

    private AppUser findUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }
}
