package com.example.onlineexam.controller;

import com.example.onlineexam.entity.ExamResult;
import com.example.onlineexam.repository.ExamResultRepository;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class ExamResultController {

    private final ExamResultRepository examResultRepository;

    public ExamResultController(ExamResultRepository examResultRepository) {
        this.examResultRepository = examResultRepository;
    }

    @PostMapping
    public ExamResult saveResult(@RequestBody ExamResult result) {

        if (result.getStatus() == null || result.getStatus().isBlank()) {

            if (result.getSuspiciousActivities() >= 3) {
                result.setStatus("FLAGGED");
            } else {
                result.setStatus("NORMAL");
            }
        }

        return examResultRepository.save(result);
    }
}