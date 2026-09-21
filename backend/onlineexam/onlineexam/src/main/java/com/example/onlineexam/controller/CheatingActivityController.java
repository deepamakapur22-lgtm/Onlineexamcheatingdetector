package com.example.onlineexam.controller;

import com.example.onlineexam.entity.CheatingActivity;
import com.example.onlineexam.repository.CheatingActivityRepository;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cheating")
@CrossOrigin(origins = "*")
public class CheatingActivityController {

    private final CheatingActivityRepository cheatingActivityRepository;

    public CheatingActivityController(
            CheatingActivityRepository cheatingActivityRepository) {

        this.cheatingActivityRepository =
                cheatingActivityRepository;
    }

    @PostMapping
    public CheatingActivity saveActivity(
            @RequestBody CheatingActivity activity) {

        return cheatingActivityRepository.save(activity);
    }
}
