# CodeNexus – Online Exam Cheating Detector

## 📌 Project Overview

CodeNexus is a secure online examination system designed to conduct coding and multiple-choice examinations with basic online proctoring features.

The system combines a web-based frontend, Spring Boot backend, MySQL database, camera monitoring, cheating activity detection, and automated code evaluation.

---

## 🎯 Objectives

- Provide secure student login.
- Conduct online coding examinations.
- Conduct multiple-choice questions (MCQs).
- Monitor the student's camera during the examination.
- Detect suspicious activities such as tab switching and copying.
- Display warnings for detected activities.
- Automatically evaluate coding submissions.
- Store examination results.
- Provide a final result page after submission.

---

## ✨ Features

### 🔐 Secure Login

- Student email and password authentication.
- Invalid login credentials are rejected.
- Student email is stored for the examination session.

### 📋 Examination Instructions

Before starting the examination, students can view:

- Examination duration
- Number of coding questions
- Number of MCQs
- Examination rules
- Camera monitoring requirements

### 📷 Camera Monitoring

- Camera permission is requested before the examination.
- Camera monitoring remains active during the examination.
- The system detects camera access problems.
- Suspicious camera-related activities can generate warnings.

### ⏱️ Examination Timer

- The examination has a 60-minute timer.
- The examination is automatically submitted when the time expires.

### 💻 Coding Questions

The examination contains coding questions such as:

- Two Sum
- Reverse String

Students can:

- Write code.
- Select a programming language.
- Provide test input.
- Run code.
- Submit code.

### 🤖 Automated Code Evaluation

Code submissions are evaluated using the Judge0 code execution service.

The system can identify:

- Accepted submissions
- Wrong answers
- Compilation errors
- Runtime errors
- Time limit exceeded errors

### 📝 MCQ Section

The system contains 10 multiple-choice questions.

Students must answer all MCQs before final submission.

### ⚠️ Cheating Detection

The system monitors activities such as:

- Tab switching
- Copying
- Cutting
- Pasting
- Right-click attempts
- Camera problems
- Suspicious face/head movement where supported

A maximum of 5 warnings is allowed.

After the warning limit is reached, the examination can be automatically submitted.

### 📊 Result Page

After submission, the result page displays:

- Student email ID
- Coding score
- MCQ score
- Total score
- Examination status

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Java
- Spring Boot
- REST APIs
- Maven

### Database

- MySQL

### Code Execution

- Judge0 API

### Development Tools

- Visual Studio Code
- Git
- GitHub
- MySQL Workbench

---

## 🏗️ System Architecture

```text
                ┌──────────────────────┐
                │       Student        │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │      Frontend        │
                │ HTML / CSS / JS      │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │    Spring Boot      │
                │      Backend        │
                └───────┬───────┬──────┘
                        │       │
             ┌──────────┘       └──────────┐
             ▼                             ▼
    ┌──────────────────┐          ┌──────────────────┐
    │      MySQL       │          │     Judge0 API   │
    │     Database     │          │ Code Evaluation  │
    └──────────────────┘          └──────────────────┘
