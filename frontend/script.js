/* =========================================================
   CODENEXUS - ONLINE EXAM SCRIPT
   ========================================================= */


/* =========================================================
   LOGIN
   ========================================================= */

const validEmail = "student@codenexus.com";
const validPassword = "123456";

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email")?.value.trim();

        const password =
            document.getElementById("password")?.value;

        const loginError =
            document.getElementById("loginError");

        if (
            email === validEmail &&
            password === validPassword
        ) {

            sessionStorage.setItem(
                "examEmail",
                email
            );

            sessionStorage.setItem(
                "examStarted",
                "true"
            );

            sessionStorage.removeItem(
                "examSubmitted"
            );

            sessionStorage.removeItem(
                "cameraPermission"
            );

            sessionStorage.removeItem(
                "mcqScore"
            );

            sessionStorage.removeItem(
                "codingScore"
            );

            sessionStorage.removeItem(
                "totalScore"
            );

            sessionStorage.removeItem(
                "warnings"
            );

            sessionStorage.removeItem(
                "submissionReason"
            );

            window.location.href =
                "instructions.html";

        } else {

            if (loginError) {

                loginError.textContent =
                    "Invalid email ID or password.";

            }

        }

    });

}


/* =========================================================
   CODING QUESTIONS
   ========================================================= */

const codingQuestions = [

    {
        title: "1. Two Sum",

        description:
            "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",

        input:
            "First line: n\nSecond line: n integers\nThird line: target",

        output:
            "Print the two indices.",

        exampleInput:
            "4\n2 7 11 15\n9",

        exampleOutput:
            "0 1"
    },

    {
        title: "2. Reverse a String",

        description:
            "Given a string, reverse the string and print the reversed string.",

        input:
            "A single string.",

        output:
            "Print the reversed string.",

        exampleInput:
            "hello",

        exampleOutput:
            "olleh"
    }

];


/* =========================================================
   MCQ QUESTIONS - 10
   ========================================================= */

const mcqQuestions = [

    {
        question:
            "Which data structure follows LIFO?",

        options: [
            "Queue",
            "Stack",
            "Array",
            "Tree"
        ],

        answer: "Stack"
    },

    {
        question:
            "Which language is mainly used for styling web pages?",

        options: [
            "HTML",
            "CSS",
            "Java",
            "Python"
        ],

        answer: "CSS"
    },

    {
        question:
            "Which SQL command is used to retrieve data?",

        options: [
            "INSERT",
            "UPDATE",
            "SELECT",
            "DELETE"
        ],

        answer: "SELECT"
    },

    {
        question:
            "What does CPU stand for?",

        options: [
            "Central Processing Unit",
            "Computer Processing Utility",
            "Central Program Unit",
            "Computer Program Unit"
        ],

        answer:
            "Central Processing Unit"
    },

    {
        question:
            "Which of the following is an operating system?",

        options: [
            "Linux",
            "HTML",
            "CSS",
            "SQL"
        ],

        answer: "Linux"
    },

    {
        question:
            "Which sorting algorithm has average complexity O(n log n)?",

        options: [
            "Bubble Sort",
            "Selection Sort",
            "Merge Sort",
            "Linear Search"
        ],

        answer: "Merge Sort"
    },

    {
        question:
            "Which keyword is used to create a class in Java?",

        options: [
            "function",
            "class",
            "struct",
            "object"
        ],

        answer: "class"
    },

    {
        question:
            "What does DBMS stand for?",

        options: [
            "Database Management System",
            "Data Backup Management System",
            "Database Memory System",
            "Data Management Software"
        ],

        answer:
            "Database Management System"
    },

    {
        question:
            "Which protocol is used for secure web communication?",

        options: [
            "HTTP",
            "FTP",
            "HTTPS",
            "SMTP"
        ],

        answer: "HTTPS"
    },

    {
        question:
            "Which one is NOT a programming language?",

        options: [
            "Java",
            "Python",
            "HTML",
            "C++"
        ],

        answer: "HTML"
    }

];


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentCodingQuestion = 0;

let codingSolved = [
    false,
    false
];

let warningCount = 0;

let examSubmitted = false;

let cameraStream = null;

let examTime = 60 * 60;

let timerInterval = null;

let cameraCheckInterval = null;

let faceDetectionInterval = null;

let cameraWarningShown = false;

let lastHeadWarning = 0;

let lastTabWarning = 0;

let lastCopyWarning = 0;

let protectionStarted = false;

let examStartTime = null;


/* =========================================================
   START EXAM PAGE
   ========================================================= */

if (
    document.getElementById("codeEditor") &&
    document.getElementById("problem")
) {

    startExam();

}


/* =========================================================
   START EXAM
   ========================================================= */

async function startExam() {

    const examStarted =
        sessionStorage.getItem("examStarted");

    const email =
        sessionStorage.getItem("examEmail");

    const alreadySubmitted =
        sessionStorage.getItem("examSubmitted");


    if (
        examStarted !== "true" ||
        !email ||
        alreadySubmitted === "true"
    ) {

        window.location.href =
            "index.html";

        return;

    }


    examStartTime =
        Date.now();


    try {

        await startExamCamera();

    } catch (error) {

        showWarning(
            "Camera access is unavailable. Please keep your camera enabled."
        );

    }


    showCodingQuestion(0);

    loadMCQs();

    startTimer();

    startExamProtection();

}


/* =========================================================
   CAMERA
   ========================================================= */

async function startExamCamera() {

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        throw new Error(
            "Camera API is not supported."
        );

    }


    cameraStream =
        await navigator.mediaDevices.getUserMedia({

            video: {
                facingMode: "user"
            },

            audio: false

        });


    const camera =
        document.getElementById("camera");


    if (!camera) {

        return;

    }


    camera.srcObject =
        cameraStream;


    camera.muted = true;

    camera.playsInline = true;

    camera.autoplay = true;


    await camera.play();


    monitorCamera();

}


/* =========================================================
   CAMERA MONITORING
   ========================================================= */

function monitorCamera() {

    const camera =
        document.getElementById("camera");


    if (
        !camera ||
        !camera.srcObject
    ) {

        return;

    }


    const tracks =
        camera.srcObject.getVideoTracks();


    if (
        !tracks ||
        tracks.length === 0
    ) {

        showWarning(
            "Camera is unavailable. Please keep your camera enabled."
        );

        return;

    }


    const track =
        tracks[0];


    cameraWarningShown = false;


    track.onended = function () {

        if (
            !examSubmitted &&
            !cameraWarningShown
        ) {

            cameraWarningShown = true;

            showWarning(
                "Camera has been closed or disconnected. Please keep your camera active."
            );

        }

    };


    if (cameraCheckInterval) {

        clearInterval(
            cameraCheckInterval
        );

    }


    cameraCheckInterval =
        setInterval(function () {

            if (examSubmitted) {

                clearInterval(
                    cameraCheckInterval
                );

                return;

            }


            const cameraActive =
                track.enabled &&
                track.readyState === "live";


            if (!cameraActive) {

                if (!cameraWarningShown) {

                    cameraWarningShown = true;

                    showWarning(
                        "Camera has been disabled or closed. Please keep your camera active."
                    );

                }

            } else {

                cameraWarningShown = false;

            }

        }, 1000);

}


/* =========================================================
   WARNING SYSTEM
   ========================================================= */

function showWarning(message) {

    if (examSubmitted) {
        return;
    }


    if (warningCount >= 5) {
        return;
    }


    warningCount++;


    const warningBox =
        document.getElementById("warningBox");


    if (!warningBox) {

        return;

    }


    warningBox.innerHTML = `

        <div style="
            font-size:22px;
            font-weight:bold;
            margin-bottom:12px;
        ">

            ⚠️ WARNING ${warningCount}/5

        </div>

        <div style="
            font-size:15px;
            line-height:1.5;
        ">

            ${escapeHTML(message)}

        </div>

        <div style="
            margin-top:12px;
            color:#ffcc00;
            font-size:13px;
        ">

            ${5 - warningCount}
            warning(s) remaining

        </div>

    `;


    warningBox.style.display =
        "block";


    if (warningCount < 5) {

        setTimeout(function () {

            if (
                !examSubmitted &&
                warningBox
            ) {

                warningBox.style.display =
                    "none";

            }

        }, 3500);

    }


    if (warningCount === 5) {

        warningBox.innerHTML = `

            <div style="
                font-size:24px;
                font-weight:bold;
                margin-bottom:12px;
            ">

                🚨 WARNING LIMIT REACHED

            </div>

            <div style="
                font-size:16px;
                line-height:1.6;
            ">

                You have received 5 warnings.

                <br><br>

                Your examination will be
                submitted automatically.

            </div>

        `;


        warningBox.style.display =
            "block";


        setTimeout(function () {

            if (!examSubmitted) {

                submitExam(
                    "Maximum 5 warnings reached"
                );

            }

        }, 2000);

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   EXAM PROTECTION
   ========================================================= */

function startExamProtection() {

    if (protectionStarted) {
        return;
    }


    protectionStarted = true;


    /* TAB SWITCH */

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.hidden &&
                !examSubmitted
            ) {

                const now =
                    Date.now();


                if (
                    now - lastTabWarning >
                    3000
                ) {

                    lastTabWarning =
                        now;


                    showWarning(
                        "Please do not switch tabs during the examination."
                    );

                }

            }

        }
    );


    /* WINDOW BLUR */

    window.addEventListener(
        "blur",
        function () {

            if (examSubmitted) {
                return;
            }


            const now =
                Date.now();


            if (
                now - lastTabWarning >
                3000
            ) {

                lastTabWarning =
                    now;


                showWarning(
                    "Please remain on the examination window."
                );

            }

        }
    );


    /* COPY */

    document.addEventListener(
        "copy",
        function (event) {

            if (examSubmitted) {
                return;
            }


            event.preventDefault();


            const now =
                Date.now();


            if (
                now - lastCopyWarning >
                2000
            ) {

                lastCopyWarning =
                    now;


                showWarning(
                    "Copying exam questions or content is not allowed."
                );

            }

        }
    );


    /* CUT */

    document.addEventListener(
        "cut",
        function (event) {

            if (examSubmitted) {
                return;
            }


            event.preventDefault();


            showWarning(
                "Cutting exam content is not allowed."
            );

        }
    );


    /* PASTE */

    document.addEventListener(
        "paste",
        function (event) {

            if (examSubmitted) {
                return;
            }


            event.preventDefault();


            showWarning(
                "Pasting content during the examination is not allowed."
            );

        }
    );


    /* RIGHT CLICK */

    document.addEventListener(
        "contextmenu",
        function (event) {

            if (examSubmitted) {
                return;
            }


            event.preventDefault();


            showWarning(
                "Right-click is not allowed during the examination."
            );

        }
    );


    /* KEYBOARD COPY / CUT / PASTE */

    document.addEventListener(
        "keydown",
        function (event) {

            if (examSubmitted) {
                return;
            }


            const key =
                event.key.toLowerCase();


            if (
                (event.ctrlKey ||
                 event.metaKey) &&
                (
                    key === "c" ||
                    key === "x" ||
                    key === "v"
                )
            ) {

                event.preventDefault();


                showWarning(
                    "Copy, cut and paste are not allowed during the examination."
                );

            }


            /* F12 */

            if (event.key === "F12") {

                event.preventDefault();

                showWarning(
                    "Developer tools are not allowed during the examination."
                );

            }


            /* CTRL + SHIFT + I */

            if (
                event.ctrlKey &&
                event.shiftKey &&
                key === "i"
            ) {

                event.preventDefault();

                showWarning(
                    "Developer tools are not allowed during the examination."
                );

            }


            /* CTRL + SHIFT + J */

            if (
                event.ctrlKey &&
                event.shiftKey &&
                key === "j"
            ) {

                event.preventDefault();

                showWarning(
                    "Developer tools are not allowed during the examination."
                );

            }


            /* CTRL + U */

            if (
                event.ctrlKey &&
                key === "u"
            ) {

                event.preventDefault();

                showWarning(
                    "Viewing page source is not allowed during the examination."
                );

            }

        }
    );


    startFaceDetection();

}


/* =========================================================
   FACE / HEAD MOVEMENT DETECTION
   ========================================================= */

function startFaceDetection() {

    if (
        !("FaceDetector" in window)
    ) {

        return;

    }


    let detector;


    try {

        detector =
            new FaceDetector({

                fastMode: true,

                maxDetectedFaces: 1

            });

    } catch (error) {

        return;

    }


    const camera =
        document.getElementById("camera");


    if (!camera) {
        return;
    }


    if (faceDetectionInterval) {

        clearInterval(
            faceDetectionInterval
        );

    }


    faceDetectionInterval =
        setInterval(async function () {

            if (
                examSubmitted ||
                !camera ||
                camera.readyState !== 4
            ) {

                return;

            }


            try {

                const faces =
                    await detector.detect(camera);


                if (
                    !faces ||
                    faces.length === 0
                ) {

                    return;

                }


                const face =
                    faces[0].boundingBox;


                const centerX =
                    face.x +
                    face.width / 2;


                const centerY =
                    face.y +
                    face.height / 2;


                if (
                    !window.lastFacePosition
                ) {

                    window.lastFacePosition = {

                        x: centerX,

                        y: centerY

                    };

                    return;

                }


                const movementX =
                    Math.abs(
                        centerX -
                        window.lastFacePosition.x
                    );


                const movementY =
                    Math.abs(
                        centerY -
                        window.lastFacePosition.y
                    );


                const now =
                    Date.now();


                if (
                    (
                        movementX > 50 ||
                        movementY > 50
                    ) &&
                    now - lastHeadWarning > 4000
                ) {

                    lastHeadWarning =
                        now;


                    showWarning(
                        "Significant head movement detected. Please remain focused on the examination."
                    );

                }


                window.lastFacePosition = {

                    x: centerX,

                    y: centerY

                };


            } catch (error) {

                /* Face detection is not supported */

            }

        }, 2000);

}


/* =========================================================
   TIMER
   ========================================================= */

function startTimer() {

    updateTimer();


    if (timerInterval) {

        clearInterval(
            timerInterval
        );

    }


    timerInterval =
        setInterval(function () {

            if (examSubmitted) {

                clearInterval(
                    timerInterval
                );

                return;

            }


            examTime--;


            updateTimer();


            if (examTime <= 0) {

                clearInterval(
                    timerInterval
                );


                submitExam(
                    "Time limit reached"
                );

            }

        }, 1000);

}


/* =========================================================
   UPDATE TIMER
   ========================================================= */

function updateTimer() {

    const timer =
        document.getElementById("timer");


    if (!timer) {
        return;
    }


    const minutes =
        Math.floor(
            examTime / 60
        );


    const seconds =
        examTime % 60;


    timer.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");


    if (examTime <= 300) {

        timer.style.color =
            "#ffcc00";

    }


    if (examTime <= 60) {

        timer.style.color =
            "#ff5555";

    }

}


/* =========================================================
   SHOW CODING QUESTION
   ========================================================= */

function showCodingQuestion(index) {

    if (
        index < 0 ||
        index >= codingQuestions.length
    ) {

        return;

    }


    currentCodingQuestion =
        index;


    const question =
        codingQuestions[index];


    const problem =
        document.getElementById("problem");


    const mcqSection =
        document.getElementById("mcqSection");


    const leftPanel =
        document.querySelector(".left-panel");


    const rightPanel =
        document.querySelector(".right-panel");


    if (!problem) {
        return;
    }


    if (mcqSection) {

        mcqSection.style.display =
            "none";

    }


    if (leftPanel) {

        leftPanel.style.display =
            "block";

    }


    if (rightPanel) {

        rightPanel.style.display =
            "flex";

    }


    problem.innerHTML = `

        <h2>
            ${escapeHTML(question.title)}
        </h2>

        <p>
            ${escapeHTML(question.description)}
        </p>

        <h3>
            Input
        </h3>

        <p>
            ${escapeHTML(question.input)
                .replace(/\n/g, "<br>")}
        </p>

        <h3>
            Output
        </h3>

        <p>
            ${escapeHTML(question.output)}
        </p>

        <h3>
            Example
        </h3>

        <div class="example">

            <strong>
                Input
            </strong>

            <br>

            ${escapeHTML(question.exampleInput)
                .replace(/\n/g, "<br>")}

            <br><br>

            <strong>
                Output
            </strong>

            <br>

            ${escapeHTML(question.exampleOutput)}

        </div>

    `;


    document
        .querySelectorAll(".question-tab")
        .forEach(function (button, i) {

            button.classList.toggle(
                "active",
                i === index
            );

        });


    loadStarterCode(index);

    updateLineNumbers();


    const status =
        document.getElementById(
            "codingStatus"
        );


    if (status) {

        if (codingSolved[index]) {

            status.textContent =
                "This coding question has already been submitted successfully.";

        } else {

            status.textContent =
                "Ready";

        }

    }

}


/* =========================================================
   STARTER CODE
   ========================================================= */

function loadStarterCode(index) {

    const editor =
        document.getElementById(
            "codeEditor"
        );


    const testInput =
        document.getElementById(
            "testInput"
        );


    const output =
        document.getElementById(
            "output"
        );


    if (!editor) {
        return;
    }


    if (index === 0) {

        editor.value =
`#include <bits/stdc++.h>
using namespace std;

int main() {

    int n;
    cin >> n;

    vector<int> nums(n);

    for(int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    int target;
    cin >> target;

    // Write your solution here

    return 0;
}`;


        if (testInput) {

            testInput.value =
`4
2 7 11 15
9`;

        }

    } else {

        editor.value =
`#include <bits/stdc++.h>
using namespace std;

int main() {

    string s;
    cin >> s;

    // Write your solution here

    return 0;
}`;


        if (testInput) {

            testInput.value =
                "hello";

        }

    }


    if (output) {

        output.value = "";

    }


    updateLineNumbers();

}


/* =========================================================
   LINE NUMBERS
   ========================================================= */

function updateLineNumbers() {

    const editor =
        document.getElementById(
            "codeEditor"
        );


    const numbers =
        document.getElementById(
            "lineNumbers"
        );


    if (
        !editor ||
        !numbers
    ) {

        return;

    }


    const lineCount =
        editor.value.split("\n").length;


    let result = "";


    for (
        let i = 1;
        i <= lineCount;
        i++
    ) {

        result += i + "\n";

    }


    numbers.textContent =
        result;

}


/* =========================================================
   CODE EDITOR EVENTS
   ========================================================= */

const codeEditor =
    document.getElementById(
        "codeEditor"
    );


if (codeEditor) {

    codeEditor.addEventListener(
        "input",
        function () {

            updateLineNumbers();

        }
    );


    codeEditor.addEventListener(
        "scroll",
        function () {

            syncLineNumbers();

        }
    );


    codeEditor.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Tab") {

                event.preventDefault();


                const start =
                    codeEditor.selectionStart;


                const end =
                    codeEditor.selectionEnd;


                codeEditor.value =
                    codeEditor.value.substring(
                        0,
                        start
                    ) +
                    "    " +
                    codeEditor.value.substring(
                        end
                    );


                codeEditor.selectionStart =
                    start + 4;

                codeEditor.selectionEnd =
                    start + 4;


                updateLineNumbers();

            }

        }
    );

}


/* =========================================================
   SYNC LINE NUMBERS
   ========================================================= */

function syncLineNumbers() {

    const editor =
        document.getElementById(
            "codeEditor"
        );


    const numbers =
        document.getElementById(
            "lineNumbers"
        );


    if (
        !editor ||
        !numbers
    ) {

        return;

    }


    numbers.scrollTop =
        editor.scrollTop;

}


/* =========================================================
   RUN CODE
   ========================================================= */

async function runCode() {

    if (examSubmitted) {
        return;
    }


    const editor =
        document.getElementById(
            "codeEditor"
        );


    const language =
        document.getElementById(
            "languageSelect"
        );


    const output =
        document.getElementById(
            "output"
        );


    const status =
        document.getElementById(
            "codingStatus"
        );


    const testInput =
        document.getElementById(
            "testInput"
        );


    if (
        !editor ||
        !language ||
        !output
    ) {

        return;

    }


    const sourceCode =
        editor.value;


    const languageId =
        Number(
            language.value
        );


    if (!sourceCode.trim()) {

        output.value =
            "Please write your code first.";

        return;

    }


    output.value =
        "Running...";


    if (status) {

        status.textContent =
            "Executing your code...";

    }


    try {

        const response =
            await fetch(
                "http://localhost:8080/api/code/run",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        questionId:
                            currentCodingQuestion,

                        languageId:
                            languageId,

                        sourceCode:
                            sourceCode,

                        stdin:
                            testInput
                                ? testInput.value
                                : ""

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Backend returned an error."
            );

        }


        const result =
            await response.json();


        if (result.correct) {

            output.value =
                result.output ||
                result.message ||
                "Accepted";


            if (status) {

                status.textContent =
                    "Accepted";

            }

        } else {

            output.value =
                result.error ||
                result.message ||
                "Execution failed.";


            if (status) {

                status.textContent =
                    result.message ||
                    "Execution failed.";

            }

        }


    } catch (error) {

        output.value =
            "Unable to connect to backend.\n\n" +
            "Make sure Spring Boot is running on port 8080.";


        if (status) {

            status.textContent =
                "Backend connection error.";

        }

    }

}


/* =========================================================
   SUBMIT CODING QUESTION
   ========================================================= */

async function submitCodingQuestion() {

    if (examSubmitted) {
        return;
    }


    const editor =
        document.getElementById(
            "codeEditor"
        );


    const language =
        document.getElementById(
            "languageSelect"
        );


    const testInput =
        document.getElementById(
            "testInput"
        );


    const status =
        document.getElementById(
            "codingStatus"
        );


    if (
        !editor ||
        !language
    ) {

        return;

    }


    const sourceCode =
        editor.value;


    const languageId =
        Number(
            language.value
        );


    if (
        codingSolved[
            currentCodingQuestion
        ]
    ) {

        if (status) {

            status.textContent =
                "This coding question has already been submitted.";

        }

        return;

    }


    if (!sourceCode.trim()) {

        if (status) {

            status.textContent =
                "Please write your code first.";

        }

        return;

    }


    if (status) {

        status.textContent =
            "Checking hidden test cases...";

    }


    try {

        const response =
            await fetch(
                "http://localhost:8080/api/code/run",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        questionId:
                            currentCodingQuestion,

                        languageId:
                            languageId,

                        sourceCode:
                            sourceCode,

                        stdin:
                            testInput
                                ? testInput.value
                                : ""

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Backend error"
            );

        }


        const result =
            await response.json();


        if (result.correct) {

            codingSolved[
                currentCodingQuestion
            ] = true;


            if (status) {

                status.textContent =
                    "Accepted — hidden test cases passed.";

            }


        } else {

            if (status) {

                status.textContent =
                    result.message ||
                    result.error ||
                    "Submission failed.";

            }

        }


    } catch (error) {

        if (status) {

            status.textContent =
                "Backend connection error.";

        }

    }

}


/* =========================================================
   LOAD MCQs
   ========================================================= */

function loadMCQs() {

    const container =
        document.getElementById(
            "mcqContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    mcqQuestions.forEach(
        function (mcq, index) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "mcq-card";


            let optionsHTML = "";


            mcq.options.forEach(
                function (option) {

                    optionsHTML += `

                        <label class="mcq-option">

                            <input
                                type="radio"
                                name="mcq${index}"
                                value="${escapeHTML(option)}"
                            >

                            ${escapeHTML(option)}

                        </label>

                    `;

                }
            );


            card.innerHTML = `

                <div class="mcq-question">

                    <strong>
                        ${index + 1}.
                    </strong>

                    ${escapeHTML(mcq.question)}

                </div>

                ${optionsHTML}

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   SHOW MCQs
   ========================================================= */

function showMCQs() {

    const examContainer =
        document.querySelector(
            ".exam-container"
        );


    const leftPanel =
        document.querySelector(
            ".left-panel"
        );


    const rightPanel =
        document.querySelector(
            ".right-panel"
        );


    const mcqSection =
        document.getElementById(
            "mcqSection"
        );


    if (examContainer) {

        examContainer.style.display =
            "none";

    }


    if (leftPanel) {

        leftPanel.style.display =
            "none";

    }


    if (rightPanel) {

        rightPanel.style.display =
            "none";

    }


    if (mcqSection) {

        mcqSection.style.display =
            "block";

    }


    loadMCQs();


    document
        .querySelectorAll(".question-tab")
        .forEach(function (button) {

            button.classList.remove(
                "active"
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   CALCULATE MCQ SCORE
   ========================================================= */

function calculateMCQScore() {

    let score = 0;


    mcqQuestions.forEach(
        function (mcq, index) {

            const selected =
                document.querySelector(
                    `input[name="mcq${index}"]:checked`
                );


            if (
                selected &&
                selected.value ===
                mcq.answer
            ) {

                score++;

            }

        }
    );


    return score;

}


/* =========================================================
   SUBMIT EXAM FROM MCQ SECTION
   ========================================================= */

function submitMCQExam() {

    if (examSubmitted) {
        return;
    }


    const unanswered = [];


    mcqQuestions.forEach(
        function (mcq, index) {

            const selected =
                document.querySelector(
                    `input[name="mcq${index}"]:checked`
                );


            if (!selected) {

                unanswered.push(
                    index + 1
                );

            }

        }
    );


    if (unanswered.length > 0) {

        alert(
            "Please answer all MCQ questions before submitting.\n\n" +
            "Unanswered questions: " +
            unanswered.join(", ")
        );

        return;

    }


    const confirmSubmit =
        confirm(
            "Are you sure you want to submit the examination?"
        );


    if (!confirmSubmit) {
        return;
    }


    submitExam(
        "Exam submitted by student"
    );

}


/* =========================================================
   SUBMIT EXAM
   ========================================================= */

function submitExam(reason) {

    if (examSubmitted) {
        return;
    }


    examSubmitted = true;


    if (timerInterval) {

        clearInterval(
            timerInterval
        );

    }


    if (cameraCheckInterval) {

        clearInterval(
            cameraCheckInterval
        );

    }


    if (faceDetectionInterval) {

        clearInterval(
            faceDetectionInterval
        );

    }


    const mcqScore =
        calculateMCQScore();


    const codingScore =
        codingSolved.filter(
            Boolean
        ).length;


    const totalScore =
        mcqScore +
        codingScore;


    sessionStorage.setItem(
        "mcqScore",
        mcqScore
    );


    sessionStorage.setItem(
        "codingScore",
        codingScore
    );


    sessionStorage.setItem(
        "totalScore",
        totalScore
    );


    sessionStorage.setItem(
        "warnings",
        warningCount
    );


    sessionStorage.setItem(
        "submissionReason",
        reason
    );


    sessionStorage.setItem(
        "examSubmitted",
        "true"
    );


    sessionStorage.setItem(
        "examEndTime",
        new Date().toISOString()
    );


    /* STOP CAMERA */

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(function (track) {

                track.stop();

            });

    }


    cameraStream = null;


    /* GO TO RESULT */

    setTimeout(function () {

        window.location.href =
            "result.html";

    }, 100);

}