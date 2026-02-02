package com.incomemanager.plan.controller;

import com.incomemanager.plan.dto.PlanRequest;
import com.incomemanager.plan.dto.PlanResponse;
import com.incomemanager.plan.entity.MoneyPlan;
import com.incomemanager.plan.repository.MoneyPlanRepository;
import com.incomemanager.user.entity.AppUser;
import com.incomemanager.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.RoundingMode;
import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class MoneyPlanController {
    private final MoneyPlanRepository moneyPlanRepository;
    private final UserRepository userRepository;

    public MoneyPlanController(MoneyPlanRepository moneyPlanRepository, UserRepository userRepository) {
        this.moneyPlanRepository = moneyPlanRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public PlanResponse createPlan(
            @Valid @RequestBody PlanRequest request,
            Authentication authentication
    ) {
        AppUser user = findUser(authentication);
        MoneyPlan plan = MoneyPlan.builder()
                .name(request.name())
                .description(request.description())
                .amount(request.amount().setScale(2, RoundingMode.HALF_UP))
                .type(request.type())
                .user(user)
                .build();
        MoneyPlan savedPlan = moneyPlanRepository.save(plan);
        return toResponse(savedPlan);
    }

    @GetMapping
    public List<PlanResponse> listPlans(Authentication authentication) {
        AppUser user = findUser(authentication);
        return moneyPlanRepository.findAllByUser(user).stream()
                .map(this::toResponse)
                .toList();
    }

    private PlanResponse toResponse(MoneyPlan plan) {
        return new PlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getDescription(),
                plan.getAmount(),
                plan.getType(),
                plan.getCreatedAt()
        );
    }

    private AppUser findUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }
}
