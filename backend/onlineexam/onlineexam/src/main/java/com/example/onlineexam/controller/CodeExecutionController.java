package com.example.onlineexam.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = "*")
public class CodeExecutionController {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String JUDGE0_URL =
            "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

    @PostMapping("/run")
    public ResponseEntity<?> runCode(
            @RequestBody CodeRequest request) {

        try {

            if (request.getSourceCode() == null ||
                    request.getSourceCode().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(createError(
                                "NO_CODE",
                                "Please write your code first."
                        ));
            }

            if (request.getLanguageId() == null) {

                return ResponseEntity.badRequest()
                        .body(createError(
                                "NO_LANGUAGE",
                                "Please select a programming language."
                        ));
            }

            List<TestCase> tests =
                    getHiddenTests(request.getQuestionId());

            if (tests == null) {

                return ResponseEntity.badRequest()
                        .body(createError(
                                "INVALID_QUESTION",
                                "Invalid coding question."
                        ));
            }

            for (TestCase test : tests) {

                Map<String, Object> submission =
                        new HashMap<>();

                submission.put(
                        "language_id",
                        request.getLanguageId()
                );

                submission.put(
                        "source_code",
                        request.getSourceCode()
                );

                submission.put(
                        "stdin",
                        test.input
                );

                submission.put(
                        "cpu_time_limit",
                        3
                );

                submission.put(
                        "wall_time_limit",
                        5
                );

                HttpHeaders headers =
                        new HttpHeaders();

                headers.setContentType(
                        MediaType.APPLICATION_JSON
                );

                HttpEntity<Map<String, Object>> entity =
                        new HttpEntity<>(
                                submission,
                                headers
                        );

                ResponseEntity<Map> response =
                        restTemplate.postForEntity(
                                JUDGE0_URL,
                                entity,
                                Map.class
                        );

                Map result =
                        response.getBody();

                if (result == null) {

                    return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(createError(
                                    "SERVER_ERROR",
                                    "No response from code execution service."
                            ));
                }

                // Compilation error

                Object compileOutput =
                        result.get("compile_output");

                if (compileOutput != null &&
                        !String.valueOf(compileOutput)
                                .trim()
                                .isEmpty()) {

                    Map<String, Object> error =
                            new HashMap<>();

                    error.put(
                            "correct",
                            false
                    );

                    error.put(
                            "type",
                            "COMPILATION_ERROR"
                    );

                    error.put(
                            "message",
                            "Compilation Error"
                    );

                    error.put(
                            "error",
                            compileOutput
                    );

                    return ResponseEntity.ok(error);
                }

                // Runtime error

                Object stderr =
                        result.get("stderr");

                if (stderr != null &&
                        !String.valueOf(stderr)
                                .trim()
                                .isEmpty()) {

                    Map<String, Object> error =
                            new HashMap<>();

                    error.put(
                            "correct",
                            false
                    );

                    error.put(
                            "type",
                            "RUNTIME_ERROR"
                    );

                    error.put(
                            "message",
                            "Runtime Error"
                    );

                    error.put(
                            "error",
                            stderr
                    );

                    return ResponseEntity.ok(error);
                }

                // Check Judge0 status

                Object statusObject =
                        result.get("status");

                if (statusObject instanceof Map) {

                    Map status =
                            (Map) statusObject;

                    String description =
                            String.valueOf(
                                    status.get("description")
                            );

                    if (description.equals(
                            "Time Limit Exceeded"
                    )) {

                        Map<String, Object> error =
                                new HashMap<>();

                        error.put(
                                "correct",
                                false
                        );

                        error.put(
                                "type",
                                "TIME_LIMIT_EXCEEDED"
                        );

                        error.put(
                                "message",
                                "Time Limit Exceeded"
                        );

                        error.put(
                                "error",
                                "Your program took too long to execute."
                        );

                        return ResponseEntity.ok(error);
                    }

                    if (!description.equals("Accepted")) {

                        Map<String, Object> error =
                                new HashMap<>();

                        error.put(
                                "correct",
                                false
                        );

                        error.put(
                                "type",
                                "RUNTIME_ERROR"
                        );

                        error.put(
                                "message",
                                description
                        );

                        error.put(
                                "error",
                                description
                        );

                        return ResponseEntity.ok(error);
                    }
                }

                // Get actual output

                String actualOutput =
                        result.get("stdout") == null
                                ? ""
                                : String.valueOf(
                                        result.get("stdout")
                                );

                actualOutput =
                        normalizeOutput(actualOutput);

                String expectedOutput =
                        normalizeOutput(
                                test.expectedOutput
                        );

                // Wrong answer

                if (!actualOutput.equals(
                        expectedOutput
                )) {

                    Map<String, Object> error =
                            new HashMap<>();

                    error.put(
                            "correct",
                            false
                    );

                    error.put(
                            "type",
                            "WRONG_ANSWER"
                    );

                    error.put(
                            "message",
                            "Wrong Answer"
                    );

                    error.put(
                            "error",
                            "Your output is incorrect for a hidden test case."
                    );

                    return ResponseEntity.ok(error);
                }
            }

            // All hidden tests passed

            Map<String, Object> success =
                    new HashMap<>();

            success.put(
                    "correct",
                    true
            );

            success.put(
                    "type",
                    "ACCEPTED"
            );

            success.put(
                    "message",
                    "All hidden test cases passed."
            );

            return ResponseEntity.ok(success);

        } catch (Exception e) {

            e.printStackTrace();

            Map<String, Object> error =
                    new HashMap<>();

            error.put(
                    "correct",
                    false
            );

            error.put(
                    "type",
                    "SERVER_ERROR"
            );

            error.put(
                    "message",
                    "Server Error"
            );

            error.put(
                    "error",
                    e.getMessage()
            );

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error);
        }
    }


    // ==================================================
    // HIDDEN TEST CASES
    // ==================================================

    private List<TestCase> getHiddenTests(
            Integer questionId) {

        List<TestCase> tests =
                new ArrayList<>();

        // Question 1 - Two Sum

        if (questionId != null &&
                questionId == 0) {

            tests.add(
                    new TestCase(
                            "4\n2 7 11 15\n9\n",
                            "0 1"
                    )
            );

            tests.add(
                    new TestCase(
                            "3\n3 2 4\n6\n",
                            "1 2"
                    )
            );

            tests.add(
                    new TestCase(
                            "2\n3 3\n6\n",
                            "0 1"
                    )
            );
        }

        // Question 2 - Reverse String

        else if (questionId != null &&
                questionId == 1) {

            tests.add(
                    new TestCase(
                            "hello\n",
                            "olleh"
                    )
            );

            tests.add(
                    new TestCase(
                            "exam\n",
                            "maxe"
                    )
            );

            tests.add(
                    new TestCase(
                            "coding\n",
                            "gnidoc"
                    )
            );

            tests.add(
                    new TestCase(
                            "OpenAI\n",
                            "IAnepO"
                    )
            );
        }

        else {

            return null;
        }

        return tests;
    }


    // ==================================================
    // NORMALIZE OUTPUT
    // ==================================================

    private String normalizeOutput(
            String output) {

        if (output == null) {
            return "";
        }

        return output
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .trim();
    }


    // ==================================================
    // ERROR RESPONSE
    // ==================================================

    private Map<String, Object> createError(
            String type,
            String message) {

        Map<String, Object> error =
                new HashMap<>();

        error.put(
                "correct",
                false
        );

        error.put(
                "type",
                type
        );

        error.put(
                "message",
                message
        );

        return error;
    }


    // ==================================================
    // REQUEST CLASS
    // ==================================================

    public static class CodeRequest {

        private Integer questionId;

        private Integer languageId;

        private String sourceCode;

        private String stdin;


        public Integer getQuestionId() {
            return questionId;
        }


        public void setQuestionId(
                Integer questionId) {

            this.questionId =
                    questionId;
        }


        public Integer getLanguageId() {
            return languageId;
        }


        public void setLanguageId(
                Integer languageId) {

            this.languageId =
                    languageId;
        }


        public String getSourceCode() {
            return sourceCode;
        }


        public void setSourceCode(
                String sourceCode) {

            this.sourceCode =
                    sourceCode;
        }


        public String getStdin() {
            return stdin;
        }


        public void setStdin(
                String stdin) {

            this.stdin =
                    stdin;
        }
    }


    // ==================================================
    // TEST CASE CLASS
    // ==================================================

    private static class TestCase {

        String input;

        String expectedOutput;


        TestCase(
                String input,
                String expectedOutput) {

            this.input =
                    input;

            this.expectedOutput =
                    expectedOutput;
        }
    }
}