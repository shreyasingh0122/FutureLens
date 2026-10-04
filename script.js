document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================

       FUTURELENS — GLOBAL USER STATE

    ===================================================== */


    const userState = {


        goal: {

            type: "",

            target: "",

            timeline: ""

        },


        currentState: {


            year: null,


            cgpa: null,


            projects: 0,


            skills: {


                dsa: 50,


                programming: 50,


                ml: 30,


                development: 40


            },


            hoursPerWeek: 15


        },


        priorities: [],


        tradeoffs: [],


        consistency: 70,


        riskPreference: "balanced",


        constraints: [],


        additionalNotes: ""


    };


    const initialUserState = JSON.parse(JSON.stringify(userState));



    /* =====================================================

       GLOBAL HELPERS

    ===================================================== */


    const safeGet = (id) => {


        return document.getElementById(id);


    };



    const qs = (selector) => {


        return document.querySelector(selector);


    };



    const qsa = (selector) => {


        return document.querySelectorAll(selector);


    };



    /* -----------------------------------------------------

       MESSAGE / ALERT HELPER

    ----------------------------------------------------- */


    function showMessage(message) {


        /*

            If your project already has a custom notification

            system, this function can be replaced later.

        */


        alert(message);


    }


    /* -----------------------------------------------------

       SAFE USER-STATE DEBUG HELPER

       Keeps the existing flow from failing when a user

       advances through onboarding.

    ----------------------------------------------------- */


    function logUserState() {

        try {

            window.futureLensUserState =

                JSON.parse(

                    JSON.stringify(userState)

                );

        } catch (error) {

            console.warn(

                "FutureLens state snapshot failed:",

                error

            );

        }

    }


    /* =====================================================

       STEP NAVIGATION

    ===================================================== */


    function showStep(stepNumber) {


        const sections =

            document.querySelectorAll(

                ".onboarding-section"

            );



        if (!sections.length) {


            console.warn(

                "No onboarding sections found."

            );


            return;


        }



        sections.forEach(section => {


            section.classList.remove(

                "active",

                "visible"

            );



            const sectionStep =

                section.dataset.step ||

                section.id.replace("step", "");



            if (

                String(sectionStep) ===

                String(stepNumber)

            ) {


                section.classList.add(

                    "active",

                    "visible"

                );


            }


        });



        /*

            Update review information whenever

            Step 4 is opened.

        */


        if (

            String(stepNumber) === "4" &&

            typeof updateReviewScreen === "function"

        ) {


            updateReviewScreen();


        }



        /*

            Update Future Landscape whenever

            it is opened.

        */


        if (

            typeof updateFutureLandscape === "function"

        ) {


            updateFutureLandscape();


        }



        const activeSection = Array.from(sections).find(section =>

            section.classList.contains("active") || section.classList.contains("visible")

        );

        if (activeSection) {

            const progress = activeSection.querySelectorAll(".progress-step");

            const lines = activeSection.querySelectorAll(".progress-line");

            const current = Number(stepNumber);

            progress.forEach((item, index) => {

                item.classList.toggle("completed", index + 1 < current);

                item.classList.toggle("active", index + 1 === current);

                const marker = item.querySelector("span");

                if (marker) marker.textContent = index + 1 < current ? "✓" : String(index + 1).padStart(2, "0");

                if (index + 1 === current) item.setAttribute("aria-current", "step");

                else item.removeAttribute("aria-current");

            });

            lines.forEach((line, index) => line.classList.toggle("completed", index + 1 < current));

            activeSection.setAttribute("tabindex", "-1");

            activeSection.scrollIntoView({ behavior: "smooth", block: "start" });

            window.setTimeout(() => activeSection.focus({ preventScroll: true }), 350);

        }


    }



    /* =====================================================

       STEP 1 — GOAL SELECTION

    ===================================================== */


    const goalOptions =

        document.querySelectorAll(

            "[data-goal], .goal-domain"

        );



    const specificGoal =

        safeGet("specificGoal");



    const goalTimeline =

        safeGet("goalTimeline");



    const continueGoal =

        safeGet("continueGoal");



    let selectedGoalType =

        userState.goal.type || "";


    const goalValidation = safeGet("goalValidation");

    function setGoalValidation(message, field = "") {

        if (goalValidation) {

            goalValidation.textContent = message || "";

            goalValidation.hidden = !message;

        }

        specificGoal?.setAttribute("aria-invalid", String(field === "specific"));

        goalTimeline?.setAttribute("aria-invalid", String(field === "timeline"));

    }



    /* -----------------------------------------------------

       DOMAIN / GOAL TYPE SELECTION

    ----------------------------------------------------- */


    function resolveGoalType(option) {


        const explicit =

            option?.dataset?.goal ||

            option?.dataset?.domain ||

            option?.dataset?.value ||

            "";


        if (explicit) {

            return String(explicit).toLowerCase().trim();

        }


        const text =

            String(option?.textContent || "")

                .toLowerCase()

                .trim();


        if (

            text.includes("career") ||

            text.includes("education")

        ) {

            return "career";

        }


        if (

            text.includes("startup") ||

            text.includes("business") ||

            text.includes("entrepreneur")

        ) {

            return "startup";

        }


        if (

            text.includes("sustainability") ||

            text.includes("environment")

        ) {

            return "sustainability";

        }


        return "";

    }



    goalOptions.forEach(option => {

        option.setAttribute("aria-pressed", "false");


        option.addEventListener(

            "click",

            () => {


                goalOptions.forEach(item => {

                    item.classList.remove("selected", "active");

                    item.setAttribute("aria-pressed", "false");

                });


                option.classList.add("selected", "active");

                option.setAttribute("aria-pressed", "true");


                selectedGoalType =

                    resolveGoalType(option);

                setGoalValidation("");


                userState.goal.type =

                    selectedGoalType;


                populateSpecificGoals(selectedGoalType);

                if (goalTimeline && !goalTimeline.value) goalTimeline.value = "6 months";


                if (

                    !specificGoal ||

                    !goalTimeline

                ) {


                    if (selectedGoalType === "career") {

                        userState.goal.target =

                            "Build my career";

                        userState.goal.timeline =

                            "6 months";

                    }


                    else if (selectedGoalType === "startup") {

                        userState.goal.target =

                            "Build and grow a startup";

                        userState.goal.timeline =

                            "1 year";

                    }


                    else if (selectedGoalType === "sustainability") {

                        userState.goal.target =

                            "Improve sustainability impact";

                        userState.goal.timeline =

                            "1 year";

                    }


                }


            }

        );


    });



    /* =====================================================

       SPECIFIC GOAL OPTIONS

    ===================================================== */


    const goalChoices = {


        career: [

            { value: "internship", label: "Get an internship" },

            { value: "job", label: "Prepare for a job" },

            { value: "technical-skills", label: "Build technical skills" },

            { value: "higher-studies", label: "Prepare for higher studies" }

        ],


        startup: [

            { value: "validate-idea", label: "Validate a startup idea" },

            { value: "build-mvp", label: "Build an MVP" },

            { value: "launch-startup", label: "Launch a startup" },

            { value: "grow-startup", label: "Grow a startup" }

        ],


        sustainability: [

            { value: "sustainable-project", label: "Build a sustainable project" },

            { value: "reduce-impact", label: "Reduce environmental impact" },

            { value: "learn-sustainability", label: "Learn sustainability" },

            { value: "social-impact", label: "Create social impact" }

        ]


    };



    function populateSpecificGoals(goalType) {


        if (!specificGoal) {

            return;

        }


        const choices = goalChoices[goalType] || [];


        specificGoal.innerHTML = "";


        const placeholder = document.createElement("option");

        placeholder.value = "";

        placeholder.textContent = choices.length

            ? "Select a specific goal"

            : "Select a domain first";

        specificGoal.appendChild(placeholder);


        choices.forEach(choice => {

            const option = document.createElement("option");

            option.value = choice.value;

            option.textContent = choice.label;

            specificGoal.appendChild(option);

        });


        specificGoal.disabled = choices.length === 0;

        specificGoal.style.pointerEvents = choices.length ? "auto" : "none";

        specificGoal.style.opacity = choices.length ? "1" : "0.6";

    }



    /* =====================================================

       STEP 1 → STEP 2 — SINGLE SAFE HANDLER

    ===================================================== */


    if (continueGoal) {


        continueGoal.type = "button";


        continueGoal.onclick = function (event) {


            event.preventDefault();

            event.stopPropagation();


            const selectedDomain =

                document.querySelector(

                    ".goal-domain.selected, .goal-domain.active, [data-goal].selected, [data-goal].active"

                );


            const goalType =

                selectedDomain?.dataset?.goal ||

                selectedGoalType ||

                "";


            if (!goalType) {

                setGoalValidation("Choose a goal area before continuing.");

                document.querySelector(".goal-domain")?.focus();

                return;

            }


            if (specificGoal && !specificGoal.value) {

                setGoalValidation("Choose a specific goal to continue.", "specific");

                specificGoal.focus();

                return;

            }


            if (goalTimeline && !goalTimeline.value) {

                setGoalValidation("Choose a timeline to continue.", "timeline");

                goalTimeline.focus();

                return;

            }


            setGoalValidation("");


            userState.goal = {

                type: goalType,

                target: specificGoal?.value || "Build my career",

                timeline: goalTimeline?.value || "6 months"

            };


            selectedGoalType = goalType;


            logUserState();


            /*

               Move first. Only close the modal if Step 2 was

               actually activated. This prevents the UI from

               dropping back to the dashboard when navigation fails.

            */

            showStep(2);


            const step2 =

                document.querySelector(

                    '.onboarding-section[data-step="2"], .onboarding-section#step2'

                );


            const step2IsActive =

                step2 &&

                (step2.classList.contains("active") ||

                 step2.classList.contains("visible"));


            if (step2IsActive) {

                // Continue the onboarding scroll; do not restore focus to the landing CTA.

                goalModalReturnFocus = null;

                closeModal();

                step2.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            } else {

                console.error(

                    "FutureLens: Step 2 could not be activated. Check the Step 2 HTML section."

                );

                showMessage("Step 2 could not be opened. Please refresh and try again.");

            }

        };

    }



    /* =====================================================

       ORIGINAL GOAL MODAL COMPATIBILITY

    ===================================================== */


    /*

        If the current HTML does NOT contain the newer

        "Continue" button, clicking a goal card itself

        can still start the journey.


        This keeps the existing FutureLens modal

        functional.

    */


    if (!continueGoal) {


        goalOptions.forEach(option => {


            option.addEventListener(

                "dblclick",

                () => {


                    const goalType =

                        resolveGoalType(option);



                    if (!goalType) {


                        return;


                    }



                    userState.goal.type =

                        goalType;



                    if (

                        goalType ===

                        "career"

                    ) {


                        userState.goal.target =

                            "Build my career";


                        userState.goal.timeline =

                            "6 months";


                    }



                    else if (

                        goalType ===

                        "startup"

                    ) {


                        userState.goal.target =

                            "Build and grow a startup";


                        userState.goal.timeline =

                            "1 year";


                    }



                    else if (

                        goalType ===

                        "sustainability"

                    ) {


                        userState.goal.target =

                            "Improve sustainability impact";


                        userState.goal.timeline =

                            "1 year";


                    }



                    closeModal();



                    showStep(2);


                }

            );


        });


    }



    /* =====================================================

       STEP 1 — OPTIONAL GOAL FIELD HELPERS

    ===================================================== */


    /*

        If the enhanced Step 1 HTML has a goal selector,

        changing it updates the user state immediately.

    */


    if (specificGoal) {


        specificGoal.addEventListener(

            "change",

            () => {

                setGoalValidation("");


                userState.goal.target =

                    specificGoal.value;


            }

        );


    }



    if (goalTimeline) {


        goalTimeline.addEventListener(

            "change",

            () => {

                setGoalValidation("");


                userState.goal.timeline =

                    goalTimeline.value;


            }

        );


    }



    /* =====================================================

       STEP 1 — PREVENT ACCIDENTAL FORM SUBMISSION

    ===================================================== */


    document

        .querySelectorAll(

            ".goal-form"

        )

        .forEach(form => {


            form.addEventListener(

                "submit",

                event => {


                    event.preventDefault();


                }

            );


        });



    /* =====================================================

       END OF PART 1

    ===================================================== */


        /* =====================================================

       STEP 2 — CURRENT STATE

    ===================================================== */


    const currentYear =

        safeGet("currentYear");


    const cgpa =

        safeGet("cgpa");


    const projects =

        safeGet("projects");


    const dsaSkill =

        safeGet("dsaSkill");


    const programmingSkill =

        safeGet("programmingSkill");


    const mlSkill =

        safeGet("mlSkill");


    const developmentSkill =

        safeGet("developmentSkill");


    const hoursPerWeek =

        safeGet("hoursPerWeek");


    const dsaValue =

        safeGet("dsaValue");


    const programmingValue =

        safeGet("programmingValue");


    const mlValue =

        safeGet("mlValue");


    const developmentValue =

        safeGet("developmentValue");


    const hoursValue =

        safeGet("hoursValue");


    const continueState =

        safeGet("continueState");


    const backToGoal =

        safeGet("backToGoal");



    /* =====================================================

       STEP 2 — CURRENT STATE INPUTS

    ===================================================== */


    /*

        Current year

    */


    if (currentYear) {


        currentYear.addEventListener(

            "change",

            () => {


                userState.currentState.year =

                    Number(currentYear.value);


            }

        );


    }



    /*

        CGPA

    */


    if (cgpa) {


        cgpa.addEventListener(

            "input",

            () => {


                userState.currentState.cgpa =

                    Number(cgpa.value);


            }

        );


    }



    /*

        Number of projects

    */


    if (projects) {


        projects.addEventListener(

            "input",

            () => {


                userState.currentState.projects =

                    Math.max(

                        0,

                        Number(projects.value) || 0

                    );


            }

        );


    }



    /* =====================================================

       STEP 2 — SKILL SLIDERS

    ===================================================== */


    function updateSkillSlider(

        slider,

        output,

        skillName

    ) {


        if (!slider) {


            return;


        }



        const update = () => {


            const value =

                Number(slider.value);



            /*

                Update visible percentage.

            */


            if (output) {


                output.textContent =

                    `${value}%`;


            }



            /*

                Update user state.

            */


            userState.currentState.skills[

                skillName

            ] = value;


        };



        slider.addEventListener(

            "input",

            update

        );



        /*

            Initialize immediately.

        */


        update();


    }



    updateSkillSlider(

        dsaSkill,

        dsaValue,

        "dsa"

    );



    updateSkillSlider(

        programmingSkill,

        programmingValue,

        "programming"

    );



    updateSkillSlider(

        mlSkill,

        mlValue,

        "ml"

    );



    updateSkillSlider(

        developmentSkill,

        developmentValue,

        "development"

    );



    /* =====================================================

       STEP 2 — WEEKLY HOURS

    ===================================================== */


    if (hoursPerWeek) {


        const updateHours = () => {


            const value =

                Number(hoursPerWeek.value);



            userState.currentState.hoursPerWeek =

                value;



            if (hoursValue) {


                hoursValue.textContent =

                    `${value} hrs/week`;


            }


        };



        hoursPerWeek.addEventListener(

            "input",

            updateHours

        );



        updateHours();


    }



    /* =====================================================

       STEP 2 — VALIDATION

    ===================================================== */


    function validateCurrentState() {


        /*

            Current year

        */


        if (

            !currentYear ||

            !currentYear.value

        ) {


            showMessage(

                "Please select your current year."

            );


            return false;


        }



        /*

            CGPA

        */


        const cgpaValue =

            Number(

                cgpa?.value

            );



        if (

            !cgpa ||

            cgpa.value === "" ||

            Number.isNaN(cgpaValue) ||

            cgpaValue < 0 ||

            cgpaValue > 10

        ) {


            showMessage(

                "Please enter a valid CGPA between 0 and 10."

            );


            return false;


        }



        /*

            Projects

        */


        const projectValue =

            Number(

                projects?.value

            );



        if (

            projects &&

            (

                projects.value === "" ||

                Number.isNaN(projectValue) ||

                projectValue < 0

            )

        ) {


            showMessage(

                "Please enter a valid number of projects."

            );


            return false;


        }



        return true;


    }



    /* =====================================================

       STEP 2 — CONTINUE

    ===================================================== */


    if (continueState) {


        continueState.addEventListener(

            "click",

            () => {


                /*

                    Validate first.

                */


                if (

                    !validateCurrentState()

                ) {


                    return;


                }



                /*

                    Make absolutely sure all

                    values are synchronized.

                */


                userState.currentState.year =

                    Number(

                        currentYear.value

                    );



                userState.currentState.cgpa =

                    Number(

                        cgpa.value

                    );



                userState.currentState.projects =

                    Number(

                        projects.value

                    ) || 0;



                if (dsaSkill) {


                    userState.currentState.skills.dsa =

                        Number(

                            dsaSkill.value

                        );


                }



                if (programmingSkill) {


                    userState.currentState.skills.programming =

                        Number(

                            programmingSkill.value

                        );


                }



                if (mlSkill) {


                    userState.currentState.skills.ml =

                        Number(

                            mlSkill.value

                        );


                }



                if (developmentSkill) {


                    userState.currentState.skills.development =

                        Number(

                            developmentSkill.value

                        );


                }



                if (hoursPerWeek) {


                    userState.currentState.hoursPerWeek =

                        Number(

                            hoursPerWeek.value

                        );


                }



                logUserState();



                /*

                    Move to Step 3.

                */


                showStep(3);


            }

        );


    }



    /* =====================================================

       STEP 2 — BACK

    ===================================================== */


    if (backToGoal) {


        backToGoal.addEventListener(

            "click",

            () => {


                /*

                    Step 1 is a modal in the

                    current FutureLens design.


                    Therefore we reopen the modal

                    instead of using showStep(1).

                */


                openModal();


            }

        );


    }



    /* =====================================================

       STEP 3 — PRIORITIES & CONSTRAINTS

    ===================================================== */


    /*

        Make sure the additional state properties

        exist before Step 3 starts.

    */


    if (!userState.priorities) {


        userState.priorities = [];


    }



    if (!userState.tradeoffs) {


        userState.tradeoffs = [];


    }



    if (!userState.constraints) {


        userState.constraints = [];


    }



    if (

        typeof userState.consistency !==

        "number"

    ) {


        userState.consistency = 70;


    }



    if (!userState.riskPreference) {


        userState.riskPreference =

            "balanced";


    }



    if (

        typeof userState.additionalNotes !==

        "string"

    ) {


        userState.additionalNotes = "";


    }



    /* =====================================================

       STEP 3 — PRIORITY CARDS

    ===================================================== */


    const priorityCards =

        document.querySelectorAll(

            "[data-priority]"

        );



    priorityCards.forEach(card => {

        card.setAttribute("aria-pressed", String(card.classList.contains("selected")));


        card.addEventListener(

            "click",

            () => {


                const priority =

                    card.dataset.priority;



                if (!priority) {


                    return;


                }



                /*

                    If already selected,

                    remove it.

                */


                if (

                    card.classList.contains(

                        "selected"

                    )

                ) {


                    card.classList.remove(

                        "selected"

                    );

                    card.setAttribute("aria-pressed", "false");



                    userState.priorities =

                        userState.priorities.filter(

                            item =>

                                item !== priority

                        );


                }



                /*

                    Otherwise add it,

                    but maximum 3 priorities.

                */


                else {


                    if (

                        userState.priorities

                            .length >= 3

                    ) {


                        showMessage(

                            "You can select up to 3 priorities."

                        );


                        return;


                    }



                    card.classList.add(

                        "selected"

                    );

                    card.setAttribute("aria-pressed", "true");



                    userState.priorities.push(

                        priority

                    );


                }



                updateDecisionProfile();


            }

        );


    });



    /* =====================================================

       STEP 3 — TRADE-OFFS

    ===================================================== */


    const tradeoffOptions =

        document.querySelectorAll(

            'input[name="tradeoff"]'

        );



    tradeoffOptions.forEach(option => {


        option.addEventListener(

            "change",

            () => {


                const value =

                    option.value;



                /*

                    "Nothing" means no

                    trade-offs.

                */


                if (

                    value === "nothing"

                ) {


                    if (option.checked) {


                        tradeoffOptions.forEach(

                            other => {


                                if (

                                    other !== option

                                ) {


                                    other.checked =

                                        false;


                                }


                            }

                        );



                        userState.tradeoffs =

                            [

                                "nothing"

                            ];


                    }


                    else {


                        userState.tradeoffs =

                            [];


                    }


                }



                /*

                    Any normal trade-off

                    deselects "nothing".

                */


                else {


                    const nothingOption =

                        document.querySelector(

                            'input[name="tradeoff"][value="nothing"]'

                        );



                    if (

                        option.checked &&

                        nothingOption

                    ) {


                        nothingOption.checked =

                            false;


                    }



                    userState.tradeoffs =

                        Array.from(

                            tradeoffOptions

                        )

                            .filter(

                                item =>

                                    item.checked

                            )

                            .map(

                                item =>

                                    item.value

                            );


                }



                updateDecisionProfile();


            }

        );


    });



    /* =====================================================

       STEP 3 — CONSISTENCY SLIDER

    ===================================================== */


    const consistencySlider =

        safeGet(

            "consistencySlider"

        );



    const consistencyValue =

        safeGet(

            "consistencyValue"

        );



    const consistencyLabel =

        safeGet(

            "consistencyLabel"

        );



    function getConsistencyLabel(

        value

    ) {


        if (value < 35) {


            return "Occasional";


        }



        if (value < 55) {


            return "Somewhat consistent";


        }



        if (value < 75) {


            return "Usually consistent";


        }



        if (value < 90) {


            return "Highly consistent";


        }



        return "Very disciplined";


    }



    if (consistencySlider) {


        const updateConsistency = () => {


            const value =

                Number(

                    consistencySlider.value

                );



            userState.consistency =

                value;



            if (consistencyValue) {


                consistencyValue.textContent =

                    `${value}%`;


            }



            if (consistencyLabel) {


                consistencyLabel.textContent =

                    getConsistencyLabel(

                        value

                    );


            }



            updateDecisionProfile();


        };



        consistencySlider.addEventListener(

            "input",

            updateConsistency

        );


    }



    /* =====================================================

       STEP 3 — RISK PREFERENCE

    ===================================================== */


    const riskCards =

        document.querySelectorAll(

            "[data-risk]"

        );



    riskCards.forEach(card => {

        card.setAttribute("aria-pressed", String(card.classList.contains("active")));


        card.addEventListener(

            "click",

            () => {


                const risk =

                    card.dataset.risk;



                if (!risk) {


                    return;


                }



                /*

                    Remove active state.

                */


                riskCards.forEach(

                    item => {


                        item.classList.remove(

                            "active",

                            "selected"

                        );

                        item.setAttribute("aria-pressed", "false");


                    }

                );



                /*

                    Activate current card.

                */


                card.classList.add(

                    "active"

                );

                card.setAttribute("aria-pressed", "true");



                userState.riskPreference =

                    risk;



                updateDecisionProfile();


            }

        );


    });



    /* =====================================================

       STEP 3 — CONSTRAINTS

    ===================================================== */


    const constraintOptions =

        document.querySelectorAll(

            'input[name="constraint"]'

        );



    constraintOptions.forEach(option => {


        option.addEventListener(

            "change",

            () => {


                const value =

                    option.value;



                /*

                    "No major constraints"

                    is mutually exclusive.

                */


                if (

                    value ===

                    "no-constraints"

                ) {


                    if (option.checked) {


                        constraintOptions.forEach(

                            other => {


                                if (

                                    other !== option

                                ) {


                                    other.checked =

                                        false;


                                }


                            }

                        );



                        userState.constraints =

                            [

                                "no-constraints"

                            ];


                    }


                    else {


                        userState.constraints =

                            [];


                    }


                }



                else {


                    const noConstraints =

                        document.querySelector(

                            'input[name="constraint"][value="no-constraints"]'

                        );



                    if (

                        option.checked &&

                        noConstraints

                    ) {


                        noConstraints.checked =

                            false;


                    }



                    userState.constraints =

                        Array.from(

                            constraintOptions

                        )

                            .filter(

                                item =>

                                    item.checked

                            )

                            .map(

                                item =>

                                    item.value

                            );


                }



                updateDecisionProfile();


            }

        );


    });



    /* =====================================================

       STEP 3 — ADDITIONAL NOTES

    ===================================================== */


    const additionalNotes =

        safeGet(

            "additionalNotes"

        );



    if (additionalNotes) {


        additionalNotes.addEventListener(

            "input",

            () => {


                userState.additionalNotes =

                    additionalNotes.value;


                updateDecisionProfile();


            }

        );


    }



    /* =====================================================

       STEP 3 — DISPLAY NAMES

    ===================================================== */


    const displayNames = {


        priorities: {


            internship:

                "Internship",


            "technical-skills":

                "Technical Skills",


            projects:

                "Projects",


            research:

                "Research",


            "higher-studies":

                "Higher Studies",


            "competitive-programming":

                "Competitive Programming",


            entrepreneurship:

                "Entrepreneurship"


        },



        tradeoffs: {


            "social-activities":

                "Social activities",


            entertainment:

                "Entertainment / free time",


            coursework:

                "Other coursework",


            "competitive-programming":

                "Competitive programming",


            nothing:

                "Balanced — no specific trade-off"


        },



        constraints: {


            "limited-time":

                "Limited time",


            "college-workload":

                "College workload",


            "limited-budget":

                "Limited budget",


            "upcoming-exams":

                "Upcoming exams",


            "weak-foundation":

                "Weak foundation",


            "no-experience":

                "No experience yet",


            "no-constraints":

                "No major constraints"


        },


        risks: {


            safe:

                "🛡️ Safe & Steady",


            balanced:

                "⚖️ Balanced",


            growth:

                "🚀 High Growth"


        }


    };



    /* =====================================================

       STEP 3 — DECISION PROFILE

    ===================================================== */


    const profilePriority =

        safeGet(

            "profilePriority"

        );



    const profileOtherPriorities =

        safeGet(

            "profileOtherPriorities"

        );



    const profileTradeoffs =

        safeGet(

            "profileTradeoffs"

        );



    const profileConsistency =

        safeGet(

            "profileConsistency"

        );



    const profileRisk =

        safeGet(

            "profileRisk"

        );



    const profileConstraints =

        safeGet(

            "profileConstraints"

        );



    function getPriorityName(

        value

    ) {


        return (

            displayNames

                .priorities[value] ||

            value

        );


    }



    function getTradeoffName(

        value

    ) {


        return (

            displayNames

                .tradeoffs[value] ||

            value

        );


    }



    function getConstraintName(

        value

    ) {


        return (

            displayNames

                .constraints[value] ||

            value

        );


    }



    function getRiskName(

        value

    ) {


        return (

            displayNames

                .risks[value] ||

            value

        );


    }



    function updateDecisionProfile() {


        /*

            Primary priority

        */


        const priorities =

            userState.priorities || [];



        if (profilePriority) {


            profilePriority.textContent =

                priorities.length

                    ? getPriorityName(

                        priorities[0]

                    )

                    : "Not selected";


        }



        /*

            Other priorities

        */


        if (profileOtherPriorities) {


            const others =

                priorities

                    .slice(1)

                    .map(

                        getPriorityName

                    );



            profileOtherPriorities.textContent =

                others.length

                    ? others.join(", ")

                    : "None";


        }



        /*

            Trade-offs

        */


        if (profileTradeoffs) {


            const tradeoffs =

                userState.tradeoffs || [];



            profileTradeoffs.textContent =

                tradeoffs.length

                    ? tradeoffs

                        .map(

                            getTradeoffName

                        )

                        .join(", ")

                    : "None";


        }



        /*

            Consistency

        */


        if (profileConsistency) {


            profileConsistency.textContent =

                `${userState.consistency}%`;


        }



        /*

            Risk

        */


        if (profileRisk) {


            profileRisk.textContent =

                getRiskName(

                    userState.riskPreference

                );


        }



        /*

            Constraints

        */


        if (profileConstraints) {


            const constraints =

                userState.constraints || [];



            profileConstraints.textContent =

                constraints.length

                    ? constraints

                        .map(

                            getConstraintName

                        )

                        .join(", ")

                    : "None";


        }


    }



    /* =====================================================

       STEP 3 — VALIDATION

    ===================================================== */


    function validatePriorities() {


        if (

            !userState.priorities ||

            userState.priorities.length === 0

        ) {


            showMessage(

                "Please select at least one priority."

            );


            return false;


        }



        return true;


    }



    /* =====================================================

       STEP 3 — CONTINUE TO REVIEW

    ===================================================== */


    const continuePriorities =

        safeGet(

            "continuePriorities"

        );



    if (continuePriorities) {


        continuePriorities.addEventListener(

            "click",

            () => {


                if (

                    !validatePriorities()

                ) {


                    return;


                }



                /*

                    Synchronize notes.

                */


                if (additionalNotes) {


                    userState.additionalNotes =

                        additionalNotes.value;


                }



                /*

                    Make sure consistency

                    has a valid value.

                */


                userState.consistency =

                    Number(

                        consistencySlider?.value ||

                        userState.consistency ||

                        70

                    );



                /*

                    Make sure risk has a value.

                */


                if (

                    !userState.riskPreference

                ) {


                    userState.riskPreference =

                        "balanced";


                }



                logUserState();



                /*

                    Move to Step 4.

                */


                showStep(4);


            }

        );


    }



    /* =====================================================

       STEP 3 — BACK TO CURRENT STATE

    ===================================================== */


    const backToState =

        safeGet(

            "backToState"

        );



    if (backToState) {


        backToState.addEventListener(

            "click",

            () => {


                showStep(2);


            }

        );


    }



    /* =====================================================

       INITIAL STEP 3 PROFILE

    ===================================================== */


    if (consistencySlider) {

        const initialConsistency =

            Number(consistencySlider.value);


        if (!Number.isNaN(initialConsistency)) {

            userState.consistency =

                initialConsistency;

        }


        if (consistencyValue) {

            consistencyValue.textContent =

                `${userState.consistency}%`;

        }


        if (consistencyLabel) {

            consistencyLabel.textContent =

                getConsistencyLabel(

                    userState.consistency

                );

        }

    }


    updateDecisionProfile();



    /* =====================================================

       END OF PART 2

    ===================================================== */


        /* =====================================================

       STEP 4 — REVIEW & CONFIRM

    ===================================================== */


    const reviewGoal =

        safeGet("reviewGoal");


    const reviewTimeline =

        safeGet("reviewTimeline");


    const reviewYear =

        safeGet("reviewYear");


    const reviewCgpa =

        safeGet("reviewCgpa");


    const reviewProjects =

        safeGet("reviewProjects");


    const reviewHours =

        safeGet("reviewHours");


    const reviewSkills =

        safeGet("reviewSkills");


    const reviewPriorities =

        safeGet("reviewPriorities");


    const reviewTradeoffs =

        safeGet("reviewTradeoffs");


    const reviewConsistency =

        safeGet("reviewConsistency");


    const reviewRisk =

        safeGet("reviewRisk");


    const reviewConstraints =

        safeGet("reviewConstraints");


    const reviewNotes =

        safeGet("reviewNotes");



    /* =====================================================

       STEP 4 — UPDATE REVIEW SCREEN

    ===================================================== */


    function updateReviewScreen() {


        /*

            -------------------------------

            GOAL

            -------------------------------

        */


        if (reviewGoal) {

            reviewGoal.textContent = specificGoal?.selectedOptions?.[0]?.textContent?.trim() || userState.goal.target || "Not specified";


        }



        if (reviewTimeline) {


            reviewTimeline.textContent =

                userState.goal.timeline ||

                "Not specified";


        }



        /*

            -------------------------------

            CURRENT STATE

            -------------------------------

        */


        if (reviewYear) {


            const year =

                userState.currentState.year;



            const yearNames = {


                1: "1st Year",


                2: "2nd Year",


                3: "3rd Year",


                4: "4th Year"


            };



            reviewYear.textContent =

                yearNames[year] ||

                year ||

                "—";


        }



        if (reviewCgpa) {


            reviewCgpa.textContent =

                userState.currentState.cgpa !== null

                    ? userState.currentState.cgpa

                    : "—";


        }



        if (reviewProjects) {


            reviewProjects.textContent =

                userState.currentState.projects;


        }



        if (reviewHours) {


            reviewHours.textContent =

                `${userState.currentState.hoursPerWeek} hrs/week`;


        }



        /*

            -------------------------------

            SKILLS

            -------------------------------

        */


        if (reviewSkills) {


            const skills =

                userState.currentState.skills;



            reviewSkills.textContent =

                `DSA ${skills.dsa}% · ` +

                `Programming ${skills.programming}% · ` +

                `ML ${skills.ml}% · ` +

                `Development ${skills.development}%`;


        }



        /*

            -------------------------------

            PRIORITIES

            -------------------------------

        */


        if (reviewPriorities) {


            const priorities =

                userState.priorities || [];



            reviewPriorities.textContent =

                priorities.length

                    ? priorities

                        .map(

                            value =>

                                displayNames.priorities[value] ||

                                value

                        )

                        .join(", ")

                    : "None";


        }



        /*

            -------------------------------

            TRADE-OFFS

            -------------------------------

        */


        if (reviewTradeoffs) {


            const tradeoffs =

                userState.tradeoffs || [];



            reviewTradeoffs.textContent =

                tradeoffs.length

                    ? tradeoffs

                        .map(

                            value =>

                                displayNames.tradeoffs[value] ||

                                value

                        )

                        .join(", ")

                    : "None";


        }



        /*

            -------------------------------

            CONSISTENCY

            -------------------------------

        */


        if (reviewConsistency) {


            reviewConsistency.textContent =

                `${userState.consistency}%`;


        }



        /*

            -------------------------------

            RISK

            -------------------------------

        */


        if (reviewRisk) {


            reviewRisk.textContent =

                displayNames.risks[

                    userState.riskPreference

                ] ||

                "⚖️ Balanced";


        }



        /*

            -------------------------------

            CONSTRAINTS

            -------------------------------

        */


        if (reviewConstraints) {


            const constraints =

                userState.constraints || [];



            reviewConstraints.textContent =

                constraints.length

                    ? constraints

                        .map(

                            value =>

                                displayNames.constraints[value] ||

                                value

                        )

                        .join(", ")

                    : "None";


        }



        /*

            -------------------------------

            ADDITIONAL NOTES

            -------------------------------

        */


        if (reviewNotes) {


            const notes =

                userState.additionalNotes?.trim();



            reviewNotes.textContent =

                notes ||

                "No additional notes";


        }


    }



    /* =====================================================

       STEP 4 — BACK

    ===================================================== */


    const backFromReview =

        safeGet("backFromReview");



    if (backFromReview) {


        backFromReview.addEventListener(

            "click",

            () => {


                showStep(3);


            }

        );


    }



    /* =====================================================

       SIMULATION ENGINE

    ===================================================== */


    /*

        FutureLens does not claim to predict the future.


        It creates model-based scenarios using:

        - current skill levels

        - available weekly time

        - consistency

        - priorities

        - trade-offs

        - constraints

        - risk preference


        The values below are therefore simulation

        parameters rather than real-world probabilities.

    */



    /* =====================================================

       GROWTH CALCULATION

    ===================================================== */


    function calculateGrowth(

        currentValue,

        allocatedHours,

        consistency,

        months,

        difficulty = 1

    ) {


        /*

            More available time produces more growth.


            Consistency controls how much of the

            allocated time is effectively converted

            into progress.

        */


        const consistencyFactor =

            Math.max(

                0.35,

                consistency / 100

            );



        const hourFactor =

            Math.min(

                1.5,

                allocatedHours / 10

            );



        const learningFactor =

            Math.max(

                0.35,

                difficulty

            );



        /*

            Diminishing returns:

            growth becomes slower as the skill

            approaches 100%.

        */


        const remaining =

            Math.max(

                0,

                100 - currentValue

            );



        const rawGrowth =

            allocatedHours *

            consistencyFactor *

            learningFactor *

            months *

            0.22;



        const adjustedGrowth =

            rawGrowth *

            (remaining / 100);



        return Math.min(

            100,

            Math.max(

                0,

                currentValue +

                adjustedGrowth

            )

        );


    }



    /* =====================================================

       READINESS CALCULATION

    ===================================================== */


    function calculateReadiness(

        skills,

        projects,

        cgpa,

        consistency,

        goalType

    ) {


        /*

            General readiness model.


            This is intentionally transparent rather

            than pretending to be a real hiring model.

        */


        const technicalAverage =

            (

                skills.dsa +

                skills.programming +

                skills.ml +

                skills.development

            ) / 4;



        const projectScore =

            Math.min(

                100,

                projects * 12

            );



        const cgpaScore =

            Math.min(

                100,

                (cgpa / 10) * 100

            );



        const consistencyScore =

            consistency;



        let readiness =

            technicalAverage * 0.40 +

            projectScore * 0.20 +

            cgpaScore * 0.15 +

            consistencyScore * 0.25;



        /*

            Goal-specific adjustment.

        */


        if (

            goalType === "career"

        ) {


            readiness +=

                skills.development * 0.05;


        }



        if (

            goalType === "startup"

        ) {


            readiness +=

                skills.programming * 0.05;


        }



        if (

            goalType === "sustainability"

        ) {


            readiness +=

                skills.ml * 0.05;


        }



        return Math.min(

            100,

            Math.max(

                0,

                Math.round(readiness)

            )

        );


    }



    /* =====================================================

       SCENARIO ALLOCATION

    ===================================================== */


    function getScenarioAllocation(

        scenarioType

    ) {


        const hours =

            userState.currentState.hoursPerWeek;



        /*

            Base allocation percentages.

        */


        const allocations = {


            dsa: {


                dsa: 0.50,


                programming: 0.20,


                ml: 0.10,


                development: 0.20


            },



            ml: {


                dsa: 0.15,


                programming: 0.20,


                ml: 0.45,


                development: 0.20


            },



            balanced: {


                dsa: 0.25,


                programming: 0.25,


                ml: 0.25,


                development: 0.25


            }


        };



        let allocation =

            allocations[

                scenarioType

            ] ||

            allocations.balanced;



        /*

            Clone so the original object is

            never accidentally mutated.

        */


        allocation = {

            ...allocation

        };



        /*

            Priorities influence the allocation.

        */


        const priorities =

            userState.priorities || [];



        if (

            priorities.includes(

                "internship"

            )

        ) {


            allocation.development +=

                0.05;


            allocation.dsa +=

                0.03;


        }



        if (

            priorities.includes(

                "technical-skills"

            )

        ) {


            allocation.programming +=

                0.05;


            allocation.dsa +=

                0.03;


        }



        if (

            priorities.includes(

                "projects"

            )

        ) {


            allocation.development +=

                0.08;


            allocation.ml -=

                0.02;


        }



        if (

            priorities.includes(

                "research"

            )

        ) {


            allocation.ml +=

                0.08;


            allocation.programming +=

                0.03;


        }



        if (

            priorities.includes(

                "higher-studies"

            )

        ) {


            allocation.ml +=

                0.06;


            allocation.programming +=

                0.03;


        }



        if (

            priorities.includes(

                "competitive-programming"

            )

        ) {


            allocation.dsa +=

                0.10;


        }



        if (

            priorities.includes(

                "entrepreneurship"

            )

        ) {


            allocation.development +=

                0.06;


            allocation.programming +=

                0.04;


        }



        /*

            Make sure percentages never

            become negative.

        */


        Object.keys(allocation)

            .forEach(key => {


                allocation[key] =

                    Math.max(

                        0.05,

                        allocation[key]

                    );


            });



        /*

            Normalize the allocation so the

            percentages always add up to 100%.

        */


        const total =

            Object.values(

                allocation

            )

                .reduce(

                    (sum, value) =>

                        sum + value,

                    0

                );



        Object.keys(allocation)

            .forEach(key => {


                allocation[key] =

                    allocation[key] /

                    total;


            });



        /*

            Convert percentages to hours.

        */


        return {


            dsa:

                hours *

                allocation.dsa,


            programming:

                hours *

                allocation.programming,


            ml:

                hours *

                allocation.ml,


            development:

                hours *

                allocation.development


        };


    }



    /* =====================================================

       SCENARIO SIMULATION

    ===================================================== */


    function simulateScenario(

        scenarioType

    ) {


        const current =

            userState.currentState;



        const skills =

            current.skills;



        const months =

            getTimelineMonths(

                userState.goal.timeline

            );



        const allocation =

            getScenarioAllocation(

                scenarioType

            );



        /*

            Consistency affects the effectiveness

            of the available study time.

        */


        let consistency =

            userState.consistency;



        /*

            Constraints can reduce effective time.

        */


        const constraints =

            userState.constraints || [];



        if (

            constraints.includes(

                "limited-time"

            )

        ) {


            consistency -= 8;


        }



        if (

            constraints.includes(

                "college-workload"

            )

        ) {


            consistency -= 5;


        }



        if (

            constraints.includes(

                "upcoming-exams"

            )

        ) {


            consistency -= 4;


        }



        consistency =

            Math.max(

                20,

                Math.min(

                    100,

                    consistency

                )

            );



        /*

            Calculate projected skills.

        */


        const projectedSkills = {


            dsa:

                calculateGrowth(

                    skills.dsa,

                    allocation.dsa,

                    consistency,

                    months,

                    1

                ),


            programming:

                calculateGrowth(

                    skills.programming,

                    allocation.programming,

                    consistency,

                    months,

                    1

                ),


            ml:

                calculateGrowth(

                    skills.ml,

                    allocation.ml,

                    consistency,

                    months,

                    1

                ),


            development:

                calculateGrowth(

                    skills.development,

                    allocation.development,

                    consistency,

                    months,

                    1

                )


        };



        /*

            Project growth.


            More project-focused paths get

            stronger portfolio growth.

        */


        let projectGrowth =

            Math.round(

                (

                    allocation.development *

                    0.55 +

                    allocation.ml *

                    0.20 +

                    allocation.programming *

                    0.15 +

                    allocation.dsa *

                    0.10

                ) *

                months *

                0.7

            );



        /*

            Keep project growth realistic.

        */


        projectGrowth =

            Math.max(

                0,

                Math.min(

                    12,

                    projectGrowth

                )

            );



        const projectedProjects =

            current.projects +

            projectGrowth;



        /*

            Calculate readiness.

        */


        const readiness =

            calculateReadiness(

                projectedSkills,

                projectedProjects,

                current.cgpa,

                consistency,

                userState.goal.type

            );



        /*

            Determine dominant strengths.

        */


        const skillEntries =

            Object.entries(

                projectedSkills

            );



        skillEntries.sort(

            (a, b) =>

                b[1] - a[1]

        );



        const strongestSkill =

            skillEntries[0][0];



        /*

            Build a human-readable explanation.

        */


        const explanation =

            getScenarioExplanation(

                scenarioType,

                strongestSkill,

                allocation,

                consistency

            );



        return {


            type:

                scenarioType,


            allocation,


            projectedSkills,


            projectedProjects,


            readiness,


            effectiveConsistency:

                consistency,


            strongestSkill,


            explanation,


            months


        };


    }



    /* =====================================================

       TIMELINE → MONTHS

    ===================================================== */


    function getTimelineMonths(

        timeline

    ) {


        if (!timeline) {


            return 6;


        }



        const normalized =

            timeline

                .toLowerCase()

                .trim();



        if (

            normalized.includes(

                "3"

            )

        ) {


            return 3;


        }



        if (

            normalized.includes(

                "6"

            )

        ) {


            return 6;


        }



        if (

            normalized.includes(

                "1 year"

            ) ||

            normalized.includes(

                "1-year"

            )

        ) {


            return 12;


        }



        if (

            normalized.includes(

                "2"

            )

        ) {


            return 24;


        }



        return 6;


    }



    /* =====================================================

       SCENARIO EXPLANATIONS

    ===================================================== */


    function getScenarioExplanation(

        scenarioType,

        strongestSkill,

        allocation,

        consistency

    ) {


        const explanations = {


            dsa:

                "This path gives more of your available time to DSA and problem-solving. It can strengthen interview-oriented technical fundamentals, while leaving less time for ML and development.",


            ml:

                "This path shifts more time toward machine learning and technical depth. It can accelerate ML progression, but portfolio and interview preparation may grow more slowly.",


            balanced:

                "This path spreads your available time across DSA, programming, ML and development. It aims to avoid over-investing in one area while building broader capability."


        };



        let explanation =

            explanations[

                scenarioType

            ] ||

            explanations.balanced;



        /*

            Add consistency context.

        */


        if (

            consistency >= 80

        ) {


            explanation +=

                " Your high consistency makes the allocated time more effective.";


        }


        else if (

            consistency < 50

        ) {


            explanation +=

                " Because consistency is lower, the simulation assumes slower progress from the same available time.";


        }



        /*

            Add dominant-skill context.

        */


        const skillNames = {


            dsa:

                "DSA",


            programming:

                "programming",


            ml:

                "machine learning",


            development:

                "development"


        };



        if (

            skillNames[strongestSkill]

        ) {


            explanation +=

                ` The strongest projected area is ${skillNames[strongestSkill]}.`;


        }



        return explanation;


    }



    /* =====================================================

       GENERATE SCENARIOS

    ===================================================== */


    function generateScenarios() {


        const scenarioTypes = [


            "dsa",


            "ml",


            "balanced"


        ];



        const scenarios =

            scenarioTypes.map(

                scenario =>

                    simulateScenario(

                        scenario

                    )

            );



        /*

            Risk preference changes the

            emphasis of the scenario set.


            It does NOT represent real-world

            probabilities.

        */


        if (

            userState.riskPreference ===

            "safe"

        ) {


            scenarios.forEach(

                scenario => {


                    scenario.riskStyle =

                        "steady";


                }

            );


        }



        else if (

            userState.riskPreference === "growth" ||

            userState.riskPreference === "high-growth"

        ) {


            scenarios.forEach(

                scenario => {


                    scenario.riskStyle =

                        "growth";


                }

            );


        }



        else {


            scenarios.forEach(

                scenario => {


                    scenario.riskStyle =

                        "balanced";


                }

            );


        }



        return scenarios;


    }



    /* =====================================================

       GENERATE MY FUTURES

    ===================================================== */


    const futureExplorer = safeGet("futureExplorer");

    const futureExplorerEmpty = safeGet("futureExplorerEmpty");

    const futureExplorerContent = safeGet("futureExplorerContent");

    const futureTree = safeGet("futureTree");

    const scenarioDetailPanel = safeGet("scenarioDetailPanel");

    const comparisonControls = safeGet("comparisonControls");

    const comparisonTable = safeGet("comparisonTable");

    const comparisonDifferences = safeGet("comparisonDifferences");

    const treeGuidance = safeGet("treeGuidance");

    const emptyGenerateFutures = safeGet("emptyGenerateFutures");

    let selectedScenarioId = null;

    let comparisonScenarioIds = new Set();

    let comparisonMode = "overview";

    let selectedComparisonMetric = null;

    const whatIfHours = safeGet("whatIfHours");
    const whatIfHoursValue = safeGet("whatIfHoursValue");
    const whatIfConsistency = safeGet("whatIfConsistency");
    const whatIfConsistencyValue = safeGet("whatIfConsistencyValue");
    const whatIfProjects = safeGet("whatIfProjects");
    const whatIfStatus = safeGet("whatIfStatus");
    const whatIfCurrentReadiness = safeGet("whatIfCurrentReadiness");
    const whatIfNextReadiness = safeGet("whatIfNextReadiness");
    const whatIfCurrentMetrics = safeGet("whatIfCurrentMetrics");
    const whatIfNextMetrics = safeGet("whatIfNextMetrics");
    const whatIfChanges = safeGet("whatIfChanges");
    const whatIfExplanation = safeGet("whatIfExplanation");
    const whatIfAssumptions = safeGet("whatIfAssumptions");
    const applyWhatIf = safeGet("applyWhatIf");
    const resetWhatIf = safeGet("resetWhatIf");
    const whatIfAppliedBadge = safeGet("whatIfAppliedBadge");
    let whatIfBaseScenario = null;
    let whatIfPreviewScenario = null;
    let whatIfAppliedOriginal = null;
    let whatIfTimer = null;
    let whatIfController = null;
    let whatIfRunId = 0;
    let whatIfBaseProfile = null;


    const scenarioLabel = type => ({

        dsa: "DSA Focus",

        ml: "ML Focus",

        balanced: "Balanced Path",

        "career-focused": "Career-First Path",

        "stability-focused": "Stability-First Path"

    }[type] || String(type));

    const scenarioDisplayLabel = scenario => `${scenarioLabel(scenario.type)}${scenario.isWhatIf ? " · Applied what-if" : ""}`;

    const skillLabel = key => ({ dsa: "DSA", programming: "Programming", ml: "Machine learning", development: "Development" }[key] || key);

    const constraintLabel = key => ({ "limited-time": "Limited weekly time", "college-workload": "College workload", "upcoming-exams": "Upcoming exams" }[key] || key);


    function buildFutureTree(scenarios) {

        const decision = { id: "decision", parentId: "current-state", type: "decision", label: "Your decision", description: userState.goal.target || "Your selected priorities" };

        return {

            id: "current-state",

            type: "root",

            label: "Current state",

            description: `${userState.currentState.hoursPerWeek} modeled hours/week available`,

            children: [decision],

            decision,

            scenarios: scenarios.map(scenario => ({

                id: `scenario-${scenario.type}`,

                parentId: decision.id,

                type: "scenario",

                scenarioId: scenario.type,

                label: scenarioDisplayLabel(scenario),

                description: scenario.explanation,

                score: scenario.readiness,

                isWhatIf: scenario.isWhatIf === true,

                children: [{

                    id: `${scenario.type}-outlook`, parentId: `scenario-${scenario.type}`, type: "outcome", scenarioId: scenario.type,

                    label: `${scenario.months}-month modeled outlook`, time: `${scenario.months} months`, metrics: scenario.projectedSkills, children: []

                }]

            }))

        };

    }


    function makeTreeNode(className, eyebrow, title, description) {

        const node = document.createElement("div");

        const label = document.createElement("span");

        const heading = document.createElement("strong");

        const copy = document.createElement("small");

        node.className = `tree-node ${className}`;

        label.textContent = eyebrow;

        heading.textContent = title;

        copy.textContent = description;

        node.append(label, heading, copy);

        return node;

    }


    function renderFutureTree(tree) {

        if (!futureTree) return;

        futureTree.replaceChildren();

        const trunk = document.createElement("div");

        trunk.className = "tree-trunk";

        trunk.append(makeTreeNode("tree-root", "STARTING POINT", tree.label, tree.description));

        trunk.append(makeTreeNode("tree-decision", "DECISION POINT", tree.decision.label, tree.decision.description));

        futureTree.appendChild(trunk);

        const branches = document.createElement("div");

        branches.className = "tree-branches";

        tree.scenarios.forEach(node => {

            const branch = document.createElement("div");

            const button = document.createElement("button");

            const stage = node.children[0];

            const active = node.scenarioId === selectedScenarioId;

            branch.className = `tree-branch ${active ? "active" : ""}`;

            button.className = "tree-node tree-scenario";

            button.type = "button";

            button.setAttribute("aria-pressed", String(active));

            const pathLabel = document.createElement("span");
            pathLabel.textContent = node.isWhatIf ? "APPLIED WHAT-IF MODEL" : "MODELED PATH";
            const pathTitle = document.createElement("strong");
            pathTitle.textContent = scenarioLabel(node.scenarioId);
            const pathScore = document.createElement("small");
            pathScore.textContent = `Readiness ${node.score}/100`;
            button.append(pathLabel, pathTitle, pathScore);

            button.addEventListener("click", () => selectScenario(node.scenarioId));

            branch.appendChild(button);

            branch.appendChild(makeTreeNode("tree-outcome", stage.time.toUpperCase(), stage.label, "Projected skills under current assumptions"));

            branches.appendChild(branch);

        });

        futureTree.appendChild(branches);

    }


    function makeTextList(items) {

        const list = document.createElement("ul");

        items.forEach(item => { const row = document.createElement("li"); row.textContent = item; list.appendChild(row); });

        return list;

    }


    function renderScenarioDetail(scenario) {

        if (!scenarioDetailPanel || !scenario) return;

        scenarioDetailPanel.replaceChildren();

        const top = document.createElement("div");

        const eyebrow = document.createElement("span");

        const title = document.createElement("h3");

        const copy = document.createElement("p");

        eyebrow.textContent = scenario.isWhatIf ? "APPLIED MODELED WHAT-IF" : "SELECTED MODELED PATH";

        title.textContent = scenarioDisplayLabel(scenario);

        copy.textContent = scenario.explanation;

        top.append(eyebrow, title, copy);

        const score = document.createElement("div");

        score.className = "detail-score";

        score.innerHTML = `<span>MODELED READINESS</span><strong>${scenario.readiness}</strong><small>/100</small>`;

        const header = document.createElement("div"); header.className = "detail-header"; header.append(top, score);

        const metrics = document.createElement("div"); metrics.className = "detail-metrics";

        [...Object.entries(scenario.projectedSkills), ["projects", scenario.projectedProjects], ["consistency", scenario.effectiveConsistency]].forEach(([key, value]) => {

            const metric = document.createElement("div"); metric.innerHTML = `<span>${key === "projects" ? "Current projects" : key === "consistency" ? "Modeled consistency" : skillLabel(key)}</span><strong>${Math.round(value)}${key === "projects" ? "" : "%"}</strong>`;

            if (key !== "projects") { const track = document.createElement("span"); const fill = document.createElement("i"); track.className = "detail-metric-track"; fill.style.width = `${Math.max(0, Math.min(100, Number(value)))}%`; track.appendChild(fill); metric.appendChild(track); }

            metrics.appendChild(metric);

        });

        const detailGrid = document.createElement("div"); detailGrid.className = "detail-disclosure";

        const strongest = skillLabel(scenario.strongestSkill);

        const allocationEntries = Object.entries(scenario.allocation || {});

        const allocationText = allocationEntries.length

            ? allocationEntries

                .sort((a, b) => b[1] - a[1])

                .slice(0, 2)

                .map(([key]) => skillLabel(key))

                .join(" and ")

            : "the backend's modeled decision factors";

        const backendBasis =

            scenario.backendScenario?.selectionBasis ||

            scenario.backendScenario?.description ||

            "the current inputs and assumptions";

        const sections = [

            ["Trade-offs", [`This path is differentiated by ${allocationText}.`]],

            ["Risks", (userState.constraints || []).length ? userState.constraints.map(constraintLabel) : ["No user-declared constraints are available in this simulation."]],

            ["Opportunities", [`The strongest projected area is ${strongest}.`]],

            ["Assumptions", [`${scenario.modelInputs?.currentState?.hoursPerWeek ?? userState.currentState.hoursPerWeek} available hours per week remain similar.`, `Progress follows the simulation's modeled consistency of ${scenario.effectiveConsistency}%.`, `Scenario basis: ${backendBasis}`, ...(scenario.backendScenario?.assumptions || [])]],

            ["Uncertainty", ["This is a conditional model-based scenario, not a prediction of the user's actual future."]]

        ];

        sections.forEach(([label, items]) => { const details = document.createElement("details"); const summary = document.createElement("summary"); summary.textContent = label; details.append(summary, makeTextList(items)); detailGrid.appendChild(details); });

        const actions = document.createElement("div"); actions.className = "detail-actions";

        const why = document.createElement("button"); why.type = "button"; why.className = "secondary-btn"; why.innerHTML = '<i class="ri-sparkling-2-line"></i> Why does this path differ?';

        why.addEventListener("click", () => aiInsights && aiInsights.scrollIntoView({ behavior: "smooth", block: "start" }));

        actions.appendChild(why);

        scenarioDetailPanel.append(header, metrics, detailGrid, actions);

    }


    function renderComparison(scenarios) {

        const chosen = scenarios.filter(scenario => comparisonScenarioIds.has(scenario.type));

        if (comparisonControls) {

            comparisonControls.replaceChildren();

            const modeControls = document.createElement("div");

            modeControls.className = "comparison-mode-controls";

            ["overview", "detailed"].forEach(mode => {

                const button = document.createElement("button");

                button.type = "button";

                button.className = comparisonMode === mode ? "active" : "";

                button.setAttribute("aria-pressed", String(comparisonMode === mode));

                button.textContent = mode === "overview" ? "Overview" : "Detailed metrics";

                button.addEventListener("click", () => { comparisonMode = mode; renderComparison(scenarios); });

                modeControls.appendChild(button);

            });

            comparisonControls.appendChild(modeControls);

            scenarios.forEach(scenario => {

                const label = document.createElement("label"); const input = document.createElement("input");

                input.type = "checkbox"; input.checked = comparisonScenarioIds.has(scenario.type); input.setAttribute("aria-label", `Compare ${scenarioDisplayLabel(scenario)}`);

                input.addEventListener("change", () => { input.checked ? comparisonScenarioIds.add(scenario.type) : comparisonScenarioIds.delete(scenario.type); renderComparison(scenarios); });

                label.append(input, document.createTextNode(scenarioDisplayLabel(scenario))); comparisonControls.appendChild(label);

            });

        }

        if (comparisonTable) {

            comparisonTable.replaceChildren();

            const overviewRows = [["Modeled readiness", s => `${s.readiness}/100`], ["DSA", s => `${Math.round(s.projectedSkills.dsa)}%`], ["Machine learning", s => `${Math.round(s.projectedSkills.ml)}%`], ["Projects", s => Math.round(s.projectedProjects)]];

            const detailedRows = [...overviewRows, ["Programming", s => `${Math.round(s.projectedSkills.programming)}%`], ["Development", s => `${Math.round(s.projectedSkills.development)}%`], ["Effective consistency", s => `${s.effectiveConsistency}%`]];

            const rows = comparisonMode === "overview" ? overviewRows : detailedRows;

            const head = document.createElement("tr"); head.appendChild(document.createElement("th")); chosen.forEach(s => { const cell = document.createElement("th"); cell.textContent = scenarioDisplayLabel(s); head.appendChild(cell); }); comparisonTable.appendChild(head);

            rows.forEach(([label, getter]) => { const row = document.createElement("tr"); const name = document.createElement("th"); const metric = document.createElement("button"); metric.type = "button"; metric.textContent = label; metric.className = selectedComparisonMetric === label ? "active" : ""; metric.setAttribute("aria-pressed", String(selectedComparisonMetric === label)); metric.addEventListener("click", () => { selectedComparisonMetric = selectedComparisonMetric === label ? null : label; renderComparison(scenarios); }); name.appendChild(metric); row.className = selectedComparisonMetric === label ? "metric-highlighted" : ""; row.appendChild(name); chosen.forEach(s => { const cell = document.createElement("td"); cell.textContent = getter(s); row.appendChild(cell); }); comparisonTable.appendChild(row); });

        }

        if (comparisonDifferences) {

            comparisonDifferences.replaceChildren();

            chosen.forEach(scenario => { const card = document.createElement("button"); card.type = "button"; card.className = "comparison-difference"; const title = document.createElement("strong"); title.textContent = scenarioDisplayLabel(scenario); const copy = document.createElement("span"); copy.textContent = scenario.explanation; card.append(title, copy); card.addEventListener("click", () => selectScenario(scenario.type)); comparisonDifferences.appendChild(card); });

        }

    }


    function selectScenario(id) {

        const scenarios = window.futureLensScenarios || [];

        const scenario = scenarios.find(item => item.type === id);

        if (!scenario) return;

        if (whatIfAppliedOriginal && id !== whatIfAppliedOriginal.type) restoreWhatIfCurrent();

        if (scenario.isWhatIf && whatIfAppliedOriginal?.type === id) {
            whatIfBaseScenario = whatIfAppliedOriginal;
            whatIfPreviewScenario = scenario;
            if (whatIfHours) whatIfHours.value = String(scenario.modelInputs?.currentState?.hoursPerWeek ?? userState.currentState.hoursPerWeek);
            if (whatIfConsistency) whatIfConsistency.value = String(scenario.modelInputs?.consistency ?? userState.consistency);
            if (whatIfProjects) whatIfProjects.value = String(scenario.modelInputs?.currentState?.projects ?? userState.currentState.projects);
            updateWhatIfLabels();
            renderWhatIfModels(whatIfBaseScenario, scenario, whatIfBaseProfile || userState, scenario.modelInputs || userState);
            if (whatIfAppliedBadge) whatIfAppliedBadge.hidden = false;
            if (applyWhatIf) applyWhatIf.disabled = false;
            setWhatIfStatus("This path has an applied modeled what-if. Reset to Current restores the original scenario.");
        } else if (!scenario.isWhatIf) {
            whatIfBaseScenario = scenario;
            whatIfBaseProfile = copyProfile(userState);
            whatIfPreviewScenario = null;
            if (whatIfHours) whatIfHours.value = String(userState.currentState.hoursPerWeek);
            if (whatIfConsistency) whatIfConsistency.value = String(userState.consistency);
            if (whatIfProjects) whatIfProjects.value = String(userState.currentState.projects);
            updateWhatIfLabels();
            renderWhatIfModels(scenario, scenario, userState, userState);
            if (whatIfAppliedBadge) whatIfAppliedBadge.hidden = true;
            if (applyWhatIf) applyWhatIf.disabled = true;
            setWhatIfStatus("Showing the current model. Change a value to compare another modeled scenario.");
        }

        selectedScenarioId = id;

        if (treeGuidance) treeGuidance.hidden = true;

        renderFutureTree(window.futureLensTree);

        renderScenarioDetail(scenario);

        renderComparison(scenarios);

        updateDecisionGuidance(scenario.modelInputs || userState, scenario.type, scenario.isWhatIf === true);

    }

    function adaptBackendScenarios(result, profile = userState) {


        const backendScenarios =

            result?.result?.simulation?.scenarios || [];


        const months =

            getTimelineMonths(

                profile.goal?.timeline

            );


        return backendScenarios.map(scenario => {


            const metrics =

                scenario.metrics || {};


            const skills =

                Math.max(

                    0,

                    Math.min(

                        100,

                        Number(metrics.skills) || 0

                    )

                );


            const career =

                Math.max(

                    0,

                    Math.min(

                        100,

                        Number(metrics.career) || 0

                    )

                );


            const time =

                Math.max(

                    0,

                    Math.min(

                        100,

                        Number(metrics.time) || 0

                    )

                );


            /*

                The backend currently exposes high-level

                decision metrics rather than four separate

                technical skill projections. We keep the

                existing FutureLens UI stable by mapping:

                - skills → DSA / ML

                - career → programming / development

            */

            const projectedSkills = {

                dsa: skills,

                programming: career,

                ml: skills,

                development: career

            };


            const strongestSkill =

                Object.entries(projectedSkills)

                    .sort(

                        (a, b) => b[1] - a[1]

                    )[0]?.[0] || "programming";


            const backendTitle =

                scenario.title ||

                scenario.id ||

                "Modeled Path";


            const backendDescription =

                scenario.description ||

                "The simulation indicates this modeled path under the current assumptions.";


            const allocation =

                scenario.id === "career-focused"

                    ? getScenarioAllocation("dsa")

                    : scenario.id === "stability-focused"

                        ? getScenarioAllocation("balanced")

                        : getScenarioAllocation("balanced");


            return {


                type:

                    scenario.id,


                title:

                    backendTitle,


                readiness:

                    Math.round(

                        Math.max(

                            0,

                            Math.min(

                                100,

                                Number(

                                    scenario.overallScore

                                ) || 0

                            )

                        )

                    ),


                projectedSkills,


                projectedProjects: Math.max(0, Math.floor(Number(profile.currentState?.projects) || 0)),


                effectiveConsistency:

                    Number(result?.result?.context?.studentProfile?.consistency ?? profile.consistency ?? time),


                strongestSkill,


                explanation:

                    backendDescription,


                months,


                allocation,


                backendScenario: scenario,

                modelInputs: JSON.parse(JSON.stringify(profile)),

                isWhatIf: false


            };


        });

    }



    function buildFutureLensSimulationInput(state = userState) {
        const goalTitle = String(state.goal?.target || "Explore my future");
        const goalDescription = String(state.additionalNotes || "").slice(0, 600);
        const skills = state.currentState?.skills || {};
        const skillValues = Object.values(skills).map(value => Number(value) || 0);
        const averageSkill = skillValues.length
            ? skillValues.reduce((total, value) => total + value, 0) / skillValues.length
            : 50;
        const selectedPriorities = Array.isArray(state.priorities) ? state.priorities : [];
        const constraints = Array.isArray(state.constraints) ? state.constraints : [];
        const riskTolerance = ["growth", "high-growth"].includes(state.riskPreference)
            ? 80
            : state.riskPreference === "safe" ? 30 : 50;

        return {
            decision: { title: goalTitle, description: goalDescription },
            goal: {
                title: goalTitle,
                description: state.goal?.timeline || "",
                type: state.goal?.type || "",
                timeline: state.goal?.timeline || ""
            },
            currentState: {
                career: Math.round(Number(skills.development) || 0),
                academics: Math.round((Number(state.currentState?.cgpa) || 0) * 10),
                financial: 50,
                time: Math.max(0, Math.min(100, Math.round((Number(state.currentState?.hoursPerWeek) || 0) / 40 * 100))),
                skills: Math.round(averageSkill),
                personal: Math.max(0, Math.min(100, Number(state.consistency) || 0))
            },
            preferences: {
                careerPriority: selectedPriorities.includes("internship") ? 90
                    : selectedPriorities.includes("technical-skills") ? 85
                    : selectedPriorities.includes("projects") || selectedPriorities.includes("entrepreneurship") ? 80
                    : selectedPriorities.includes("competitive-programming") ? 75 : 50,
                academicPriority: selectedPriorities.includes("higher-studies") ? 90 : 50,
                financialPriority: selectedPriorities.includes("entrepreneurship") ? 75 : 50,
                timePriority: constraints.includes("limited-time") || constraints.includes("college-workload") ? 80 : 50,
                riskTolerance
            },
            studentProfile: {
                academicYear: state.currentState?.year,
                goalType: state.goal?.type || "",
                specificGoalId: state.goal?.target || "",
                timeline: state.goal?.timeline || "",
                cgpa: Number(state.currentState?.cgpa) || 0,
                projects: Math.max(0, Math.min(100, Math.floor(Number(state.currentState?.projects) || 0))),
                skills: Object.fromEntries(Object.entries(skills).map(([name, value]) => [name, Math.max(0, Math.min(100, Number(value) || 0))])),
                hoursPerWeek: Math.max(0, Math.min(40, Number(state.currentState?.hoursPerWeek) || 0)),
                priorities: [...selectedPriorities],
                tradeoffs: [...(state.tradeoffs || [])],
                consistency: Math.max(0, Math.min(100, Number(state.consistency) || 0)),
                riskPreference: state.riskPreference || "balanced",
                constraints: [...constraints],
                additionalNotes: goalDescription
            }
        };
    }

    async function requestFutureLensSimulation(state = userState, options = {}) {
        const payload = buildFutureLensSimulationInput(state);
        if (options.mode) payload.mode = options.mode;
        const controller = new AbortController();
        const forwardAbort = () => controller.abort(options.signal?.reason);
        if (options.signal?.aborted) forwardAbort();
        else options.signal?.addEventListener("abort", forwardAbort, { once: true });
        const timeout = window.setTimeout(() => controller.abort(new Error("Simulation request timed out.")), 30000);
        try {
            const response = await fetch("/api/ai/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            let result;
            try {
                result = await response.json();
            } catch {
                throw new Error("The simulation returned an unreadable response.");
            }

            if (!response.ok || !result.success || !result.result) {
                throw new Error(result?.message || result?.error || "FutureLens simulation unavailable.");
            }

            return result;
        } finally {
            window.clearTimeout(timeout);
            options.signal?.removeEventListener("abort", forwardAbort);
        }
    }

    function renderFutureExplorer(scenarios) {

        if (!futureExplorer || !Array.isArray(scenarios) || !scenarios.length) return;

        window.futureLensTree = buildFutureTree(scenarios);

        window.futureLensComparison = { scenarioIds: scenarios.map(scenario => scenario.type) };

        selectedScenarioId = scenarios.some(scenario => scenario.type === selectedScenarioId) ? selectedScenarioId : scenarios[0].type;

        comparisonScenarioIds = new Set(scenarios.map(scenario => scenario.type));

        comparisonMode = "overview";

        selectedComparisonMetric = null;

        futureExplorer.classList.add("active", "visible");

        if (futureExplorerEmpty) futureExplorerEmpty.hidden = true;

        if (futureExplorerContent) futureExplorerContent.hidden = false;

        if (treeGuidance) treeGuidance.hidden = false;

        renderFutureTree(window.futureLensTree);

        renderScenarioDetail(scenarios.find(scenario => scenario.type === selectedScenarioId));

        renderComparison(scenarios);

        initializeWhatIf(scenarios);

    }

    function copyProfile(profile) {
        return JSON.parse(JSON.stringify(profile));
    }

    function setWhatIfStatus(message, state = "ready") {
        if (!whatIfStatus) return;
        whatIfStatus.textContent = message;
        whatIfStatus.dataset.state = state;
        whatIfStatus.setAttribute("aria-busy", String(state === "loading"));
        if (applyWhatIf) {
            applyWhatIf.setAttribute("aria-busy", String(state === "loading"));
            applyWhatIf.title = state === "loading"
                ? "The deterministic model is recalculating."
                : "Apply the recalculated path while keeping the original profile unchanged.";
        }
    }

    function readWhatIfInputs() {
        return {
            hours: Math.max(5, Math.min(40, Number(whatIfHours?.value) || 5)),
            consistency: Math.max(0, Math.min(100, Number(whatIfConsistency?.value) || 0)),
            projects: Math.max(0, Math.min(100, Math.floor(Number(whatIfProjects?.value) || 0)))
        };
    }

    function updateWhatIfLabels() {
        const values = readWhatIfInputs();
        if (whatIfHoursValue) whatIfHoursValue.textContent = `${values.hours} hrs`;
        if (whatIfConsistencyValue) whatIfConsistencyValue.textContent = `${values.consistency}%`;
        if (whatIfProjects && String(values.projects) !== whatIfProjects.value) whatIfProjects.value = String(values.projects);
        return values;
    }

    function makeWhatIfProfile() {
        const profile = copyProfile(whatIfBaseProfile || userState);
        const values = updateWhatIfLabels();
        profile.currentState.hoursPerWeek = values.hours;
        profile.currentState.projects = values.projects;
        profile.consistency = values.consistency;
        return profile;
    }

    function addWhatIfMetric(list, label, value) {
        if (!list) return;
        const item = document.createElement("div");
        const term = document.createElement("dt");
        const detail = document.createElement("dd");
        term.textContent = label;
        detail.textContent = value;
        item.append(term, detail);
        list.appendChild(item);
    }

    function renderWhatIfModels(currentScenario, nextScenario, currentProfile, nextProfile) {
        if (!currentScenario || !nextScenario) return;
        if (whatIfCurrentReadiness) whatIfCurrentReadiness.textContent = String(currentScenario.readiness);
        if (whatIfNextReadiness) whatIfNextReadiness.textContent = String(nextScenario.readiness);

        const renderMetrics = (container, scenario, profile) => {
            if (!container) return;
            container.replaceChildren();
            const projectedSkills = Object.values(scenario.projectedSkills || {});
            const skillSignal = projectedSkills.length
                ? Math.round(projectedSkills.reduce((total, value) => total + Number(value || 0), 0) / projectedSkills.length)
                : null;
            addWhatIfMetric(container, "Projects", String(profile.currentState.projects));
            addWhatIfMetric(container, "Consistency", `${Math.round(profile.consistency)}%`);
            addWhatIfMetric(container, "Hours / week", `${Math.round(profile.currentState.hoursPerWeek)} hrs`);
            if (skillSignal !== null) addWhatIfMetric(container, "Modeled skill signal", `${skillSignal}%`);
        };

        renderMetrics(whatIfCurrentMetrics, currentScenario, currentProfile);
        renderMetrics(whatIfNextMetrics, nextScenario, nextProfile);

        if (whatIfChanges) {
            whatIfChanges.replaceChildren();
            const changeRows = [
                ["Readiness", `${currentScenario.readiness}`, `${nextScenario.readiness}`],
                ["Projects", `${currentProfile.currentState.projects}`, `${nextProfile.currentState.projects}`],
                ["Consistency", `${currentProfile.consistency}%`, `${nextProfile.consistency}%`],
                ["Hours / week", `${currentProfile.currentState.hoursPerWeek}`, `${nextProfile.currentState.hoursPerWeek}`]
            ];
            changeRows.forEach(([label, from, to]) => {
                const item = document.createElement("div");
                item.className = "what-if-change-item";
                const name = document.createElement("span");
                const values = document.createElement("strong");
                const arrow = document.createElement("em");
                name.textContent = label;
                values.append(document.createTextNode(from), arrow, document.createTextNode(to));
                arrow.textContent = "→";
                item.append(name, values);
                whatIfChanges.appendChild(item);
            });
        }

        const parts = [];
        if (currentProfile.currentState.hoursPerWeek !== nextProfile.currentState.hoursPerWeek) {
            parts.push(`Weekly availability changes from ${currentProfile.currentState.hoursPerWeek} to ${nextProfile.currentState.hoursPerWeek} hours.`);
        }
        if (currentProfile.consistency !== nextProfile.consistency) {
            parts.push(`The personal progress signal changes from ${currentProfile.consistency}% to ${nextProfile.consistency}%.`);
        }
        if (currentProfile.currentState.projects !== nextProfile.currentState.projects) {
            parts.push(`Project count changes from ${currentProfile.currentState.projects} to ${nextProfile.currentState.projects}; the model applies a capped portfolio signal to career and skill readiness.`);
        }
        const scoreDelta = nextScenario.readiness - currentScenario.readiness;
        const scoreText = scoreDelta > 0
            ? `Modeled readiness moves up ${scoreDelta} point${scoreDelta === 1 ? "" : "s"}.`
            : scoreDelta < 0
                ? `Modeled readiness moves down ${Math.abs(scoreDelta)} point${scoreDelta === -1 ? "" : "s"}.`
                : "Modeled readiness rounds to the same score; the input changes remain visible in the model.";
        if (whatIfExplanation) {
            whatIfExplanation.textContent = `${parts.join(" ") || "Your inputs match the current model."} ${scoreText} The goal and path strategy stay the same.`;
        }

        if (whatIfAssumptions) {
            whatIfAssumptions.replaceChildren();
            const assumptions = [
                "Goal, selected path, priorities, skills, constraints, and timeline are held constant.",
                "The deterministic simulator converts weekly hours and consistency into modeled time and personal signals.",
                "Each current project adds 3 points to career and skill signals, capped at 15 points. This is a simplifying portfolio assumption, not a hiring probability.",
                ...(nextScenario.backendScenario?.assumptions || [])
            ];
            [...new Set(assumptions)].forEach(text => {
                const item = document.createElement("li");
                item.textContent = text;
                whatIfAssumptions.appendChild(item);
            });
        }
    }

    function initializeWhatIf(scenarios) {
        whatIfController?.abort();
        whatIfController = null;
        window.clearTimeout(whatIfTimer);
        whatIfRunId += 1;
        whatIfAppliedOriginal = null;
        whatIfPreviewScenario = null;
        whatIfBaseProfile = copyProfile(userState);
        whatIfBaseScenario = scenarios.find(scenario => scenario.type === selectedScenarioId) || scenarios[0];
        if (whatIfHours) whatIfHours.value = String(Math.max(5, Math.min(40, Number(userState.currentState.hoursPerWeek) || 5)));
        if (whatIfConsistency) whatIfConsistency.value = String(Math.max(0, Math.min(100, Number(userState.consistency) || 0)));
        const projectCount = Math.max(0, Math.min(100, Math.floor(Number(userState.currentState.projects) || 0)));
        if (whatIfProjects) whatIfProjects.value = String(projectCount);
        const values = updateWhatIfLabels();
        renderWhatIfModels(whatIfBaseScenario, whatIfBaseScenario, whatIfBaseProfile, makeWhatIfProfile());
        setWhatIfStatus("Showing the current model. Change a value to compare another modeled scenario.");
        if (applyWhatIf) applyWhatIf.disabled = true;
        if (whatIfAppliedBadge) whatIfAppliedBadge.hidden = true;
    }

    function scheduleWhatIfRun() {
        updateWhatIfLabels();
        const current = whatIfBaseProfile;
        const next = makeWhatIfProfile();
        const changed = current && (
            current.currentState.hoursPerWeek !== next.currentState.hoursPerWeek ||
            current.consistency !== next.consistency ||
            current.currentState.projects !== next.currentState.projects
        );
        if (!changed) {
            whatIfController?.abort();
            whatIfPreviewScenario = null;
            renderWhatIfModels(whatIfBaseScenario, whatIfBaseScenario, current || userState, next);
            setWhatIfStatus("Inputs match the current model.");
            if (applyWhatIf) applyWhatIf.disabled = true;
            return;
        }

        setWhatIfStatus("Ready to recalculate this path.");
        if (applyWhatIf) applyWhatIf.disabled = true;
        window.clearTimeout(whatIfTimer);
        whatIfTimer = window.setTimeout(runWhatIfSimulation, 250);
    }

    async function runWhatIfSimulation() {
        if (!whatIfBaseScenario || !whatIfBaseProfile) return;
        const nextProfile = makeWhatIfProfile();
        const requestId = ++whatIfRunId;
        whatIfController?.abort();
        whatIfController = new AbortController();
        setWhatIfStatus("Recalculating with the deterministic FutureLens scenario model…", "loading");
        if (applyWhatIf) applyWhatIf.disabled = true;

        try {
            const result = await requestFutureLensSimulation(nextProfile, {
                mode: "what-if",
                signal: whatIfController.signal
            });
            if (requestId !== whatIfRunId) return;
            const alternatives = adaptBackendScenarios(result, nextProfile);
            const matchingScenario = alternatives.find(scenario => scenario.type === whatIfBaseScenario.type);
            if (!matchingScenario) throw new Error("The current path was not returned by the simulator.");
            matchingScenario.modelInputs = copyProfile(nextProfile);
            whatIfPreviewScenario = matchingScenario;
            renderWhatIfModels(whatIfAppliedOriginal || whatIfBaseScenario, matchingScenario, whatIfBaseProfile, nextProfile);
            setWhatIfStatus("What-if model updated. Review the assumptions, then apply it or reset to the current profile.");
            if (applyWhatIf) applyWhatIf.disabled = false;
        } catch (error) {
            if (error.name === "AbortError" || requestId !== whatIfRunId) return;
            console.warn("FutureLens what-if recalculation failed.", error);
            whatIfPreviewScenario = null;
            setWhatIfStatus("We couldn't refresh this what-if model. Your current scenarios are unchanged; try again when the simulation service is available.", "error");
            if (applyWhatIf) applyWhatIf.disabled = true;
        }
    }

    function restoreWhatIfCurrent() {
        window.clearTimeout(whatIfTimer);
        whatIfController?.abort();
        whatIfRunId += 1;
        if (whatIfAppliedOriginal && Array.isArray(window.futureLensScenarios)) {
            const index = window.futureLensScenarios.findIndex(scenario => scenario.type === whatIfAppliedOriginal.type);
            if (index >= 0) window.futureLensScenarios[index] = whatIfAppliedOriginal;
            whatIfAppliedOriginal = null;
            const scenarios = window.futureLensScenarios;
            window.futureLensTree = buildFutureTree(scenarios);
            renderFutureTree(window.futureLensTree);
            renderScenarioDetail(scenarios.find(scenario => scenario.type === selectedScenarioId));
            renderComparison(scenarios);
            renderProfileBasedActions(false, userState, selectedScenarioId);
        }
        whatIfPreviewScenario = null;
        if (whatIfBaseProfile) {
            if (whatIfHours) whatIfHours.value = String(whatIfBaseProfile.currentState.hoursPerWeek);
            if (whatIfConsistency) whatIfConsistency.value = String(whatIfBaseProfile.consistency);
            if (whatIfProjects) whatIfProjects.value = String(whatIfBaseProfile.currentState.projects);
        }
        updateWhatIfLabels();
        renderWhatIfModels(whatIfBaseScenario, whatIfBaseScenario, whatIfBaseProfile || userState, whatIfBaseProfile || userState);
        setWhatIfStatus("Reset to the original profile and current modeled path.");
        if (applyWhatIf) applyWhatIf.disabled = true;
        if (whatIfAppliedBadge) whatIfAppliedBadge.hidden = true;
    }

    [whatIfHours, whatIfConsistency, whatIfProjects].forEach(control => {
        control?.addEventListener("input", scheduleWhatIfRun);
        control?.addEventListener("change", scheduleWhatIfRun);
    });
    safeGet("whatIfProjectsDown")?.addEventListener("click", () => {
        if (whatIfProjects) whatIfProjects.value = String(Math.max(0, Number(whatIfProjects.value || 0) - 1));
        scheduleWhatIfRun();
    });
    safeGet("whatIfProjectsUp")?.addEventListener("click", () => {
        if (whatIfProjects) whatIfProjects.value = String(Math.min(100, Number(whatIfProjects.value || 0) + 1));
        scheduleWhatIfRun();
    });
    resetWhatIf?.addEventListener("click", restoreWhatIfCurrent);
    applyWhatIf?.addEventListener("click", () => {
        if (!whatIfPreviewScenario || !Array.isArray(window.futureLensScenarios)) return;
        const scenarioIndex = window.futureLensScenarios.findIndex(scenario => scenario.type === whatIfBaseScenario?.type);
        if (scenarioIndex < 0) return;
        if (!whatIfAppliedOriginal) whatIfAppliedOriginal = window.futureLensScenarios[scenarioIndex];
        const applied = {
            ...whatIfPreviewScenario,
            isWhatIf: true,
            modelInputs: makeWhatIfProfile(),
            explanation: `${whatIfPreviewScenario.explanation} This card reflects an applied, deterministic what-if model. It is not a prediction.`
        };
        window.futureLensScenarios[scenarioIndex] = applied;
        selectedScenarioId = applied.type;
        window.futureLensTree = buildFutureTree(window.futureLensScenarios);
        renderFutureTree(window.futureLensTree);
        renderScenarioDetail(applied);
        renderComparison(window.futureLensScenarios);
        renderProfileBasedActions(false, applied.modelInputs, applied.type);
        if (whatIfAppliedBadge) whatIfAppliedBadge.hidden = false;
        setWhatIfStatus("Applied to this modeled path. Your original profile stays unchanged until you choose to edit it.");
    });


    function renderFutureExplorerError() {

        if (!futureExplorer) return;

        futureExplorer.classList.add("active", "visible");

        if (futureExplorerContent) futureExplorerContent.hidden = true;

        if (futureExplorerEmpty) {

            futureExplorerEmpty.hidden = false;

            futureExplorerEmpty.querySelector("strong").textContent = "Something interrupted your simulation.";

            futureExplorerEmpty.querySelector("span").textContent = "Your previous inputs are still available. Review them and try generating futures again.";

        }

    }


    const aiInsights = safeGet("aiInsights");

    const aiAnalysisStatus = safeGet("aiAnalysisStatus");

    const aiAnalysisLoading = safeGet("aiAnalysisLoading");

    const aiAnalysisContent = safeGet("aiAnalysisContent");

    const retryAiAnalysis = safeGet("retryAiAnalysis");

    let aiRequestId = 0;


    function setAiAnalysisState(state, message) {

        if (aiInsights) aiInsights.classList.add("active", "visible");

        if (aiAnalysisLoading) aiAnalysisLoading.hidden = state !== "loading";

        if (aiAnalysisContent) aiAnalysisContent.hidden = state !== "success" && state !== "fallback";

        if (aiAnalysisStatus) {

            aiAnalysisStatus.hidden = state === "loading" || state === "success";

            aiAnalysisStatus.textContent = message || "";

        }

        if (retryAiAnalysis) retryAiAnalysis.hidden = state !== "error" && state !== "fallback";

    }


    function renderAiList(id, items) {

        const list = safeGet(id);

        if (!list) return;

        list.replaceChildren();

        (items || []).forEach(item => {

            const line = document.createElement("li");

            line.textContent = item;

            list.appendChild(line);

        });

    }


    function renderAiAnalysis(analysis) {

        const profileActionPlan = safeGet("profileActionPlan");

        if (profileActionPlan) profileActionPlan.hidden = true;

        const summary = safeGet("aiSummary");

        const scenarioContainer = safeGet("aiScenarioAnalysis");

        if (summary) summary.textContent = analysis.summary;

        if (scenarioContainer) {

            scenarioContainer.replaceChildren();

            (analysis.scenarioAnalysis || []).forEach(scenario => {

                const card = document.createElement("article");

                const label = document.createElement("span");

                const title = document.createElement("h3");

                const explanation = document.createElement("p");

                card.className = "ai-scenario-card";

                label.textContent = "SCENARIO EXPLANATION";

                title.textContent = scenario.id;

                explanation.textContent = scenario.explanation;

                card.append(label, title, explanation);

                scenarioContainer.appendChild(card);

            });

        }

        renderAiList("aiTradeoffs", analysis.keyTradeoffs || []);

        renderAiList("aiRisks", analysis.risks || []);

        renderAiList("aiOpportunities", analysis.opportunities || []);

        renderAiList("aiAssumptions", analysis.assumptions || []);

        renderAiList("aiSensitivity", analysis.sensitivityFactors || []);

        renderAiList("aiNextActions", analysis.nextActions || []);

    }


    function renderWorkflowStages(workflow) {

        const container = safeGet("workflowSteps");

        if (!container || !workflow) return;

        const agents = workflow.agents || [];

        const stages = [
            ["Context Agent", agents.find(agent => agent.name === "Context Agent")?.status || "unknown", "Understood your goal, starting point, and constraints"],
            ["Scenario Agent", agents.find(agent => agent.name === "Scenario Agent")?.status || "unknown", "Selected future paths that fit your priorities"],
            ["Simulation Engine", (workflow.stages || []).includes("simulation") ? "completed" : "unknown", "Modeled outcomes from your current profile"],
            ["Analysis Agent", agents.find(agent => agent.name === "Analysis Agent")?.status || "unknown", ""]
        ];

        container.replaceChildren();

        stages.forEach(([name, status, detail]) => {

            const item = document.createElement("li");

            const skipped = status === "skipped";
            const completed = status === "completed";
            const fallback = status === "fallback";
            item.className = completed ? "workflow-complete" : fallback || skipped ? "workflow-fallback" : "workflow-pending";

            const icon = document.createElement("i");

            icon.className = completed ? "ri-check-line" : skipped ? "ri-forbidden-line" : "ri-information-line";

            icon.setAttribute("aria-hidden", "true");

            const text = document.createElement("span");

            const title = document.createElement("strong");

            const note = document.createElement("small");

            title.textContent = name;

            note.textContent = name === "Analysis Agent"
                ? completed
                    ? "Compared scenario trade-offs and risks"
                    : skipped
                        ? "Not run for this simulation-only recalculation"
                        : fallback
                            ? "AI interpretation is unavailable; model results are ready"
                            : "Analysis status was not returned"
                : detail;

            text.append(title, note);

            item.append(icon, text);

            container.appendChild(item);

        });

        container.hidden = false;

    }


    function renderProfileBasedActions(updateRiskSummary = true, profile = userState, scenarioType = selectedScenarioId) {

        const hours = Math.max(1, Math.round(Number(profile.currentState.hoursPerWeek) || 1));

        const projectCount = Math.max(0, Number(profile.currentState.projects) || 0);

        const skillEntries = Object.entries(profile.currentState.skills || {});

        const focusSkill = skillEntries.sort((a, b) => a[1] - b[1])[0]?.[0] || "programming";

        const skillNames = { dsa: "problem solving", programming: "programming fundamentals", ml: "machine learning", development: "software development" };

        renderAiList("aiNextActions", [

            `For the ${scenarioLabel(scenarioType || "balanced")} you selected, reserve ${Math.min(hours, 3)} of your ${hours} available weekly hours for a repeatable ${skillNames[focusSkill]} practice block.`,

            projectCount ? "Choose one existing project and write down the next concrete improvement you can finish this week." : "Choose one small portfolio project connected to your goal and define a one week first milestone.",

            "At the end of the week, review what felt sustainable and adjust your plan before adding more commitments."

        ]);

        renderAiList("planWeek", [

            `Schedule two focused ${skillNames[focusSkill]} sessions that fit your ${hours}-hour weekly availability.`,

            projectCount ? "Write and complete one small improvement to an existing project." : `Choose a starter project that supports your goal: ${profile.goal.target || "your selected goal"}.`

        ]);

        renderAiList("planMonth", [

            projectCount ? "Publish a clearer README or demo for one project and ask one person for feedback." : "Complete a small working project milestone and capture what you learned.",

            "Review your weekly schedule and adjust the plan based on what you could sustain."

        ]);

        renderAiList("planExperiment", [

            `Try a one-week ${skillNames[focusSkill]} routine using no more than ${Math.min(hours, 3)} hours, then decide whether this path fits your energy and priorities.`

        ]);

        const risks = profile.riskPreference === "high-growth"

            ? ["Set a weekly checkpoint so ambitious goals do not crowd out study, rest, or existing commitments."]

            : hours <= 8

                ? [`You reported ${hours} available hours per week; avoid adding parallel goals that exceed that time.`]

                : ["Keep the plan to one main skill focus and one project milestone so the workload stays manageable."];

        renderAiList("planRisks", risks);

        if (updateRiskSummary) renderAiList("aiRisks", risks);

        const plan = safeGet("profileActionPlan");

        if (plan) plan.hidden = false;

        updateDecisionGuidance(profile, scenarioType, Boolean(window.futureLensScenarios?.find(scenario => scenario.type === scenarioType)?.isWhatIf));

    }


    function updateDecisionGuidance(profile = userState, scenarioType = selectedScenarioId, isAppliedWhatIf = false) {
        const hours = Math.max(1, Math.round(Number(profile.currentState?.hoursPerWeek) || 1));
        const projects = Math.max(0, Math.floor(Number(profile.currentState?.projects) || 0));
        const goal = profile.goal?.target || "your selected goal";
        const focus = scenarioLabel(scenarioType || "balanced");
        const now = safeGet("guidanceNow");
        const why = safeGet("guidanceWhy");
        const week = safeGet("guidanceWeek");
        const weekDetail = safeGet("guidanceWeekDetail");
        const watch = safeGet("guidanceWatch");
        const watchDetail = safeGet("guidanceWatchDetail");
        const badge = safeGet("guidanceBadge");
        if (now) now.textContent = projects
            ? `Choose one project that supports ${goal} and define a small improvement to finish this week.`
            : `Choose one starter project connected to ${goal} and scope a one-week milestone.`;
        if (why) why.textContent = `The ${focus} is a modeled possibility based on your profile and the assumptions shown above.`;
        if (week) week.textContent = `Protect up to ${Math.min(hours, 3)} of your ${hours} weekly hours for focused practice.`;
        if (weekDetail) weekDetail.textContent = projects
            ? "Complete one small improvement, then review whether the effort felt sustainable."
            : "Finish one small first milestone and note what you learned.";
        if (watch) watch.textContent = "Watch whether this workload fits your real schedule.";
        if (watchDetail) watchDetail.textContent = "If hours, consistency, projects, or constraints change, rerun the model and compare the updated trade-offs.";
        if (badge) badge.textContent = isAppliedWhatIf ? "Applied modeled what-if" : "Model-based guidance";
    }


    function getAiRequestPayload() {

        const workflow = window.futureLensBackendResult?.result;

        if (workflow?.context && workflow?.simulation) {

            return {

                decision: workflow.context.decision,

                goal: workflow.context.goal,

                currentState: workflow.context.currentState,

                preferences: workflow.context.preferences,

                studentProfile: workflow.context.studentProfile,

                scenarios: workflow.simulation.scenarios,

                weights: workflow.simulation.weights

            };

        }

        return {

            decision: { title: specificGoal?.selectedOptions?.[0]?.textContent?.trim() || userState.goal.target || "Explore my future", description: String(userState.additionalNotes || "").slice(0, 600) },

            goal: { title: specificGoal?.selectedOptions?.[0]?.textContent?.trim() || userState.goal.target || "Explore my future", description: userState.goal.timeline || "", type: userState.goal.type, timeline: userState.goal.timeline },

            currentState: {

                career: Number(userState.currentState.skills?.development) || 50,

                academics: Math.round((Number(userState.currentState.cgpa) || 5) * 10),

                financial: 50,

                time: Math.round((Number(userState.currentState.hoursPerWeek) || 20) / 40 * 100),

                skills: Math.round(Object.values(userState.currentState.skills || {}).reduce((sum, value) => sum + Number(value || 0), 0) / Math.max(1, Object.keys(userState.currentState.skills || {}).length)),

                personal: Number(userState.consistency) || 70

            },

            preferences: { careerPriority: 50, academicPriority: 50, financialPriority: 50, timePriority: 50, riskTolerance: userState.riskPreference === "growth" || userState.riskPreference === "high-growth" ? 80 : userState.riskPreference === "safe" ? 30 : 50 },

            studentProfile: {

                academicYear: userState.currentState.year,

                goalType: userState.goal.type,

                specificGoalId: userState.goal.target,

                timeline: userState.goal.timeline,

                cgpa: Number(userState.currentState.cgpa) || 0,

                projects: Number(userState.currentState.projects) || 0,

                skills: { ...(userState.currentState.skills || {}) },

                hoursPerWeek: Number(userState.currentState.hoursPerWeek) || 0,

                priorities: [...(userState.priorities || [])],

                tradeoffs: [...(userState.tradeoffs || [])],

                consistency: Number(userState.consistency) || 0,

                riskPreference: userState.riskPreference,

                constraints: [...(userState.constraints || [])],

                additionalNotes: String(userState.additionalNotes || "").slice(0, 600)

            },

            scenarios: (window.futureLensScenarios || []).map(scenario => ({ id: scenario.type, title: scenario.title, description: scenario.explanation, overallScore: scenario.readiness, metrics: { career: scenario.projectedSkills?.development, skills: scenario.projectedSkills?.programming, academics: scenario.projectedSkills?.dsa, time: scenario.effectiveConsistency }, assumptions: [] }))

        };

    }


    async function requestAiAnalysis() {

        if (!window.futureLensScenarios || !window.futureLensScenarios.length) return;

        const requestId = ++aiRequestId;

        const hadFallbackPlan = Boolean(safeGet("profileActionPlan") && !safeGet("profileActionPlan").hidden);

        setAiAnalysisState("loading");

        try {

            const response = await fetch("/api/ai/analyze", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify(getAiRequestPayload())

            });

            const result = await response.json();

            if (!response.ok || !result.success || !result.analysis) throw new Error(result.message || "AI unavailable");

            if (requestId !== aiRequestId) return;

            renderAiAnalysis(result.analysis);

            renderProfileBasedActions(false);

            setAiAnalysisState("success");

        } catch (error) {

            if (requestId !== aiRequestId) return;

            if (hadFallbackPlan) {

                renderProfileBasedActions(true);

                setAiAnalysisState("fallback", "AI analysis is still unavailable. Your modeled scenarios and profile-based starter plan remain available; retry when connected.");

            } else {

                setAiAnalysisState("error", "AI analysis is temporarily unavailable. Your model-based simulation is still available.");

            }

        }

    }


    if (retryAiAnalysis) {

        retryAiAnalysis.addEventListener("click", requestAiAnalysis);

    }


    function setSimulationProgressStage(index, state = "active", detail = "") {

        const container = safeGet("simulationProgressStages");

        if (!container) return;

        const items = Array.from(container.querySelectorAll("li"));

        items.forEach((item, itemIndex) => {

            item.classList.remove("workflow-current", "workflow-done", "workflow-fallback", "workflow-pending");

            item.removeAttribute("aria-current");

            if (itemIndex < index) item.classList.add("workflow-done");

            else if (itemIndex === index) {

                item.classList.add(state === "fallback" ? "workflow-fallback" : "workflow-current");

                item.setAttribute("aria-current", "step");

            } else item.classList.add("workflow-pending");

        });

        if (items[index] && detail) {

            const note = items[index].querySelector("small");

            if (note) note.textContent = detail;

        }

    }


    function startSimulationProgress() {

        const progress = safeGet("simulationProgress");

        if (!progress) return () => {};

        progress.hidden = false;
        const stageItems = safeGet("simulationProgressStages")?.querySelectorAll("li") || [];
        stageItems.forEach(item => {
            item.classList.remove("workflow-current", "workflow-done", "workflow-fallback");
            item.classList.add("workflow-pending");
            item.removeAttribute("aria-current");
            const note = item.querySelector("small");
            if (note) note.textContent = "Awaiting the backend workflow result";
        });

        setSimulationProgressStage(0, "active", "Waiting for the backend workflow result; stages update when confirmed.");
        return () => {};

    }


    function finishSimulationProgress(workflow, fallback = false) {

        const container = safeGet("simulationProgressStages");

        if (!container) return;

        const items = Array.from(container.querySelectorAll("li"));

        const agents = workflow?.agents || [];
        const stages = workflow?.stages || [];
        const statusByName = Object.fromEntries(agents.map(agent => [agent.name, agent.status]));
        const confirmed = fallback
            ? [
                { status: "fallback", detail: "Agent workflow unavailable; local fallback used" },
                { status: "fallback", detail: "Agent workflow unavailable" },
                { status: "fallback", detail: "Agent workflow unavailable" },
                { status: "completed", detail: "Local deterministic scenario model completed" },
                { status: "fallback", detail: "AI interpretation unavailable" }
            ]
            : [
                { status: workflow ? "completed" : "unknown", detail: workflow ? "Backend returned the workflow result" : "Workflow status was not returned" },
                { status: statusByName["Context Agent"] || "unknown", detail: statusByName["Context Agent"] === "completed" ? "Goal and starting state understood" : "Context stage status not confirmed" },
                { status: statusByName["Scenario Agent"] || "unknown", detail: statusByName["Scenario Agent"] === "completed" ? "Future paths selected from your profile" : "Scenario stage status not confirmed" },
                { status: stages.includes("simulation") ? "completed" : "unknown", detail: stages.includes("simulation") ? "Scenario outcomes modeled successfully" : "Simulation stage status not confirmed" },
                { status: statusByName["Analysis Agent"] || "unknown", detail: statusByName["Analysis Agent"] === "completed" ? "Trade-offs and risks analyzed" : statusByName["Analysis Agent"] === "skipped" ? "Skipped for this simulation-only recalculation" : statusByName["Analysis Agent"] === "fallback" ? "AI unavailable; deterministic simulation is ready" : "Analysis stage status not confirmed" }
            ];
        items.forEach((item, index) => {
            const entry = confirmed[index];
            if (!entry) return;
            item.classList.remove("workflow-current", "workflow-pending", "workflow-done", "workflow-fallback");
            item.removeAttribute("aria-current");
            if (entry.status === "completed") item.classList.add("workflow-done");
            else if (["fallback", "skipped"].includes(entry.status)) item.classList.add("workflow-fallback");
            else item.classList.add("workflow-pending");
            const note = item.querySelector("small");
            if (note) note.textContent = entry.detail;
        });

    }


    const generateFutures =

        safeGet(

            "generateFutures"

        );



   if (generateFutures) {


    const generateButtonLabelNode = Array.from(generateFutures.childNodes).find(
        node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    );
    const originalGenerateButtonLabel = generateButtonLabelNode?.textContent.trim() || "Generate My Futures";
    const setGenerateButtonLabel = label => {
        if (generateButtonLabelNode) generateButtonLabelNode.textContent = ` ${label} `;
    };

    const simulationProgress = safeGet("simulationProgress");


    generateFutures.addEventListener(

        "click",

        async () => {


            if (generateFutures.disabled) return;


            let stopSimulationProgress = () => {};


            try {


                /*

                    Make sure Step 4 displays

                    the latest information.

                */


                updateReviewScreen();



                /*

                    Show a temporary loading state.

                */


                generateFutures.disabled = true;

                generateFutures.setAttribute("aria-busy", "true");

                stopSimulationProgress = startSimulationProgress();


                setGenerateButtonLabel("Running FutureLens agents…");



                /*

                    Ask the FutureLens backend

                    to run the full agentic workflow.

                */


                let backendResult;


                try {


                    backendResult =

                        await requestFutureLensSimulation();


                }


                catch (backendError) {


                    /*

                        Backend unavailable.


                        Preserve the existing local

                        simulation as a fallback.

                    */


                    console.warn(

                        "Backend simulation unavailable. Using local simulation.",

                        backendError

                    );


                    const localScenarios =

                        generateScenarios();


                    window.futureLensScenarios =

                        localScenarios;

                    window.futureLensBackendResult = null;


                    window.futureLensUserState =

                        JSON.parse(

                            JSON.stringify(

                                userState

                            )

                        );


                    renderFutureExplorer(

                        localScenarios

                    );


                    updateFutureLandscape();


                    if (aiInsights) aiInsights.classList.add("active", "visible");

                    renderAiAnalysis({ summary: "These local paths are model-based possibilities. Start the FutureLens server to run the context, scenario, and analysis agents.", scenarioAnalysis: [], keyTradeoffs: [], risks: [], opportunities: [], assumptions: [], sensitivityFactors: [], nextActions: [] });

                    renderProfileBasedActions();

                    setAiAnalysisState("fallback", "The simulation server is unavailable. These local modeled scenarios and starter actions are ready; restart the server to enable agent analysis.");

                    if (futureExplorer) futureExplorer.scrollIntoView({ behavior: "smooth", block: "start" });


                    finishSimulationProgress(null, true);

                    window.setTimeout(() => {

                        if (simulationProgress) simulationProgress.hidden = true;

                    }, 900);

                    stopSimulationProgress();

                    generateFutures.disabled = false;


                    return;

                }



                /*

                    Convert backend scenarios into

                    the format already expected by

                    the FutureLens frontend.

                */


                const scenarios =

                    adaptBackendScenarios(

                        backendResult

                    );



                if (

                    !scenarios.length

                ) {


                    throw new Error(

                        "No scenarios were returned."

                    );


                }



                /*

                    Save the scenarios globally.

                */


                window.futureLensScenarios =

                    scenarios;



                /*

                    Save the complete user state.

                */


                window.futureLensUserState =

                    JSON.parse(

                        JSON.stringify(

                            userState

                        )

                    );



                /*

                    Save the complete backend

                    workflow for future UI features.

                */


                window.futureLensBackendResult =

                    backendResult;



                /*

                    Render the existing Future

                    Explorer using the backend data.

                */


                renderFutureExplorer(

                    scenarios

                );



                /*

                    Reveal Future Landscape.

                */


                const futureLandscape =

                    safeGet(

                        "futureLandscape"

                    );



                if (futureLandscape) {


                    futureLandscape.classList.add(

                        "visible",

                        "active"

                    );



                    futureLandscape.scrollIntoView(

                        {

                            behavior:

                                "smooth",


                            block:

                                "start"

                        }

                    );


                }


                else {


                    const simulator =

                        safeGet(

                            "simulator"

                        );



                    if (simulator) {


                        simulator.scrollIntoView(

                            {

                                behavior:

                                    "smooth",


                                block:

                                    "start"

                            }

                        );


                    }


                }



                /*

                    Update the existing

                    Future Landscape UI.

                */


                if (

                    typeof updateFutureLandscape ===

                    "function"

                ) {


                    updateFutureLandscape();


                }



                /*

                    Render AI analysis returned

                    by the Analysis Agent.


                    If the provider is unavailable,

                    the backend safely returns its

                    fallback analysis.

                */


                const analysis =

                    backendResult?.result?.analysis;


                finishSimulationProgress(backendResult?.result?.workflow, false);

                renderWorkflowStages(backendResult?.result?.workflow);



                if (

                    analysis &&

                    typeof renderAiAnalysis ===

                    "function"

                ) {


                    renderAiAnalysis(

                        analysis

                    );

                    renderProfileBasedActions(!backendResult.aiAvailable);


                    setAiAnalysisState(

                        backendResult.aiAvailable ? "success" : "fallback",

                        backendResult.aiAvailable ? "" : "Your modeled futures are ready. AI interpretation is unavailable right now; you can retry it below."

                    );


                }



                /*

                    Scroll to the Future Explorer.

                */


                if (futureExplorer) {


                    futureExplorer.scrollIntoView(

                        {

                            behavior:

                                "smooth",


                            block:

                                "start"

                        }

                    );


                }


            }


            catch (error) {


                console.error(

                    "FutureLens simulation error:",

                    error

                );


                renderFutureExplorerError();


            }


            finally {


                stopSimulationProgress?.();

                generateFutures.disabled =

                    false;


                generateFutures.removeAttribute("aria-busy");

                window.setTimeout(() => {

                    if (simulationProgress) simulationProgress.hidden = true;

                }, 1000);


                setGenerateButtonLabel(originalGenerateButtonLabel);


            }


        }

    );


}


    if (emptyGenerateFutures) {


        emptyGenerateFutures.addEventListener(

            "click",

            () => {


                if (generateFutures) {


                    generateFutures.click();


                }


                else {


                    showStep(4);


                }


            }

        );


    }


    const resetJourneyButton = safeGet("resetJourney");

    if (resetJourneyButton) {

        resetJourneyButton.addEventListener("click", () => {

            Object.assign(userState, JSON.parse(JSON.stringify(initialUserState)));

            selectedGoalType = "";

            document.querySelectorAll("#step2 input, #step2 select, #step2 textarea, #step3 input, #step3 select, #step3 textarea").forEach(control => {

                if (control === specificGoal) return;

                if (control.matches("input[type=checkbox], input[type=radio]")) control.checked = control.defaultChecked;

                else if (control.tagName === "SELECT") {

                    const initialOption = Array.from(control.options).find(option => option.defaultSelected) || control.options[0];

                    control.value = initialOption?.value || "";

                } else control.value = control.defaultValue;

            });

            ["#step2 input", "#step2 select", "#step2 textarea", "#step3 input", "#step3 select", "#step3 textarea"].forEach(selector => {

                document.querySelectorAll(selector).forEach(control => control.dispatchEvent(new Event(control.matches("input[type=checkbox], input[type=radio]") || control.tagName === "SELECT" ? "change" : "input", { bubbles: true })));

            });

            goalOptions.forEach(option => {

                option.classList.remove("selected", "active");

                option.setAttribute("aria-pressed", "false");

            });

            populateSpecificGoals("");

            if (goalTimeline) goalTimeline.value = "";

            priorityCards.forEach(card => {

                card.classList.remove("selected");

                card.setAttribute("aria-pressed", "false");

            });

            riskCards.forEach(card => {

                const selected = card.dataset.risk === "balanced";

                card.classList.toggle("active", selected);

                card.classList.remove("selected");

                card.setAttribute("aria-pressed", String(selected));

            });

            document.querySelectorAll(".onboarding-section").forEach(section => section.classList.remove("active", "visible"));

            window.futureLensScenarios = null;

            window.futureLensUserState = null;

            window.futureLensTree = null;

            window.futureLensComparison = null;

            window.futureLensBackendResult = null;

            selectedScenarioId = null;

            comparisonScenarioIds.clear();

            comparisonMode = "overview";

            selectedComparisonMetric = null;

            logUserState();

            futureExplorerContent && (futureExplorerContent.hidden = true);

            if (futureExplorerEmpty) {

                futureExplorerEmpty.hidden = false;

                const title = futureExplorerEmpty.querySelector("strong");

                const message = futureExplorerEmpty.querySelector("span");

                if (title) title.textContent = "Your future map is waiting.";

                if (message) message.textContent = "Complete your profile and generate futures to explore different modeled paths.";

            }

            ["futureTree", "scenarioDetailPanel", "comparisonControls", "comparisonTable", "comparisonDifferences", "workflowSteps"].forEach(id => {

                const node = safeGet(id);

                node?.replaceChildren();

            });

            const workflow = safeGet("workflowSteps");

            if (workflow) workflow.hidden = true;

            aiAnalysisContent && (aiAnalysisContent.hidden = true);

            retryAiAnalysis && (retryAiAnalysis.hidden = true);

            aiAnalysisStatus && (aiAnalysisStatus.hidden = false, aiAnalysisStatus.textContent = "Generate your futures to compare the assumptions and trade-offs behind them.");

            aiInsights?.classList.remove("active", "visible");

            const resetProgress = safeGet("simulationProgress");

            if (resetProgress) resetProgress.hidden = true;

            if (aiAnalysisLoading) aiAnalysisLoading.hidden = true;

            const actionPlan = safeGet("profileActionPlan");

            if (actionPlan) actionPlan.hidden = true;

            whatIfController?.abort();
            window.clearTimeout(whatIfTimer);
            whatIfRunId += 1;
            whatIfBaseScenario = null;
            whatIfPreviewScenario = null;
            whatIfAppliedOriginal = null;
            whatIfBaseProfile = null;
            isDemoMode = false;
            demoModeBanner && (demoModeBanner.hidden = true);
            safeGet("whatIfPanel")?.classList.remove("demo-what-if-highlight");

            openModal();

        });

    }



    /* =====================================================

       END OF PART 3

    ===================================================== */

        /* =====================================================

       FUTURE LANDSCAPE

    ===================================================== */


    function updateFutureLandscape(

        scenarios = window.futureLensScenarios

    ) {


        if (!scenarios) {


            return;


        }



        /*

            -------------------------------

            SCORE ELEMENTS

            -------------------------------

        */


        const dsaResult =

            safeGet("futureDsaScore");


        const mlResult =

            safeGet("futureMlScore");


        const balancedResult =

            safeGet("futureBalancedScore");



        if (

            dsaResult &&

            scenarios.dsa

        ) {


            dsaResult.textContent =

                `${scenarios.dsa.readiness}%`;


        }



        if (

            mlResult &&

            scenarios.ml

        ) {


            mlResult.textContent =

                `${scenarios.ml.readiness}%`;


        }



        if (

            balancedResult &&

            scenarios.balanced

        ) {


            balancedResult.textContent =

                `${scenarios.balanced.readiness}%`;


        }



        /*

            -------------------------------

            DETAILED METRICS

            -------------------------------

        */


        const futureDsaDetails =

            safeGet("futureDsaDetails");


        const futureMlDetails =

            safeGet("futureMlDetails");


        const futureBalancedDetails =

            safeGet("futureBalancedDetails");



        if (

            futureDsaDetails &&

            scenarios.dsa

        ) {


            futureDsaDetails.textContent =

                `DSA ${Math.round(

                    scenarios.dsa.projectedSkills.dsa

                )}% · ML ${Math.round(

                    scenarios.dsa.projectedSkills.ml

                )}% · Projects ${Math.round(

                    scenarios.dsa.projectedProjects

                )}`;


        }



        if (

            futureMlDetails &&

            scenarios.ml

        ) {


            futureMlDetails.textContent =

                `DSA ${Math.round(

                    scenarios.ml.projectedSkills.dsa

                )}% · ML ${Math.round(

                    scenarios.ml.projectedSkills.ml

                )}% · Projects ${Math.round(

                    scenarios.ml.projectedProjects

                )}`;


        }



        if (

            futureBalancedDetails &&

            scenarios.balanced

        ) {


            futureBalancedDetails.textContent =

                `DSA ${Math.round(

                    scenarios.balanced.projectedSkills.dsa

                )}% · ML ${Math.round(

                    scenarios.balanced.projectedSkills.ml

                )}% · Projects ${Math.round(

                    scenarios.balanced.projectedProjects

                )}`;


        }



        /*

            -------------------------------

            OPTIONAL READINESS ELEMENTS

            -------------------------------

        */


        const futureDsaReadiness =

            safeGet("futureDsaReadiness");


        const futureMlReadiness =

            safeGet("futureMlReadiness");


        const futureBalancedReadiness =

            safeGet("futureBalancedReadiness");



        if (

            futureDsaReadiness &&

            scenarios.dsa

        ) {


            futureDsaReadiness.textContent =

                `${scenarios.dsa.readiness}%`;


        }



        if (

            futureMlReadiness &&

            scenarios.ml

        ) {


            futureMlReadiness.textContent =

                `${scenarios.ml.readiness}%`;


        }



        if (

            futureBalancedReadiness &&

            scenarios.balanced

        ) {


            futureBalancedReadiness.textContent =

                `${scenarios.balanced.readiness}%`;


        }


    }



    /* =====================================================

       MOBILE MENU

    ===================================================== */


    const menuBtn =

        safeGet("menuBtn");


    const mobileMenu =

        safeGet("mobileMenu");



    if (

        menuBtn &&

        mobileMenu

    ) {


        menuBtn.setAttribute("aria-expanded", "false");

        menuBtn.setAttribute("aria-controls", "mobileMenu");


        menuBtn.addEventListener(

            "click",

            () => {


                mobileMenu.classList.toggle(

                    "active"

                );



                menuBtn.classList.toggle(

                    "active"

                );

                menuBtn.setAttribute("aria-expanded", String(mobileMenu.classList.contains("active")));


            }

        );



        /*

            Close mobile menu after clicking

            a navigation link.

        */


        mobileMenu

            .querySelectorAll("a")

            .forEach(

                link => {


                    link.addEventListener(

                        "click",

                        () => {


                            mobileMenu.classList.remove(

                                "active"

                            );



                            menuBtn.classList.remove(

                                "active"

                            );

                            menuBtn.setAttribute("aria-expanded", "false");


                        }

                    );


                }

            );


    }



    /* =====================================================

       MODAL

    ===================================================== */


    const modalOverlay =

        safeGet("modalOverlay");


    const openModalButtons =

        document.querySelectorAll(

            "[data-open-modal]"

        );


    const closeModalButtons =

        document.querySelectorAll(

            "[data-close-modal]"

        );

    let goalModalReturnFocus = null;



    function openModal() {


        if (!modalOverlay) {


            return;


        }



        modalOverlay.classList.add(

            "active"

        );

        goalModalReturnFocus = document.activeElement;



        document.body.classList.add(

            "modal-open"

        );

        window.setTimeout(() => safeGet("modalClose")?.focus(), 0);


    }



    function closeModal() {


        if (!modalOverlay) {


            return;


        }



        modalOverlay.classList.remove(

            "active"

        );



        document.body.classList.remove(

            "modal-open"

        );

        goalModalReturnFocus?.focus?.();


    }



    /*

        Open modal buttons.

    */


    openModalButtons.forEach(

        button => {


            button.addEventListener(

                "click",

                event => {


                    event.preventDefault();


                    openModal();

                    mobileMenu?.classList.remove("active");

                    menuBtn?.classList.remove("active");

                    menuBtn?.setAttribute("aria-expanded", "false");


                }

            );


        }

    );



    /*

        Close modal buttons.

    */


    closeModalButtons.forEach(

        button => {


            button.addEventListener(

                "click",

                event => {


                    event.preventDefault();


                    closeModal();


                }

            );


        }

    );



    /*

        Close when clicking outside

        the modal content.

    */


    if (modalOverlay) {


        modalOverlay.addEventListener(

            "click",

            event => {


                if (

                    event.target ===

                    modalOverlay

                ) {


                    closeModal();


                }


            }

        );


    }



    /*

        Escape key closes modal.

    */


    document.addEventListener(

        "keydown",

        event => {


            if (

                event.key ===

                "Escape" && modalOverlay?.classList.contains("active")

            ) {


                closeModal();


            }


            if (event.key === "Tab" && modalOverlay?.classList.contains("active")) {

                const focusable = Array.from(modalOverlay.querySelectorAll("button, select, input, textarea, [href], [tabindex]:not([tabindex='-1'])")).filter(item => !item.disabled);

                if (!focusable.length) return;

                const first = focusable[0];

                const last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {

                    event.preventDefault();

                    last.focus();

                } else if (!event.shiftKey && document.activeElement === last) {

                    event.preventDefault();

                    first.focus();

                }

            }


        }

    );



    /* =====================================================

       PRIMARY START / SIGN-IN CONTROLS

    ===================================================== */


    /*

        The current HTML uses explicit IDs/classes for the

        landing-page CTA buttons. Wire them directly so the

        journey does not depend on data attributes being present.

    */


    const startJourneyButtons =

        document.querySelectorAll(

            "#startNavBtn:not([data-open-modal]), #mobileStart:not([data-open-modal]), #heroStartBtn:not([data-open-modal]), #ctaBtn:not([data-open-modal])"

        );


    startJourneyButtons.forEach(

        button => {


            button.addEventListener(

                "click",

                event => {


                    event.preventDefault();


                    if (modalOverlay) {

                        openModal();

                    } else {

                        showStep(1);

                    }


                }

            );


        }

    );



    const loginModal = safeGet("loginModal");
    const loginDialog = loginModal?.querySelector(".login-dialog");
    const loginForm = safeGet("loginForm");
    const loginEmail = safeGet("loginEmail");
    const loginPassword = safeGet("loginPassword");
    const createAccountForm = safeGet("createAccountForm");
    const createName = safeGet("createName");
    const createEmail = safeGet("createEmail");
    const createPassword = safeGet("createPassword");
    const confirmPassword = safeGet("confirmPassword");
    const demoTerms = safeGet("demoTerms");
    const signinView = safeGet("signinView");
    const createAccountView = safeGet("createAccountView");
    const loginClose = safeGet("loginClose");
    const loginTrigger = safeGet("loginTrigger");
    const createAccountTrigger = qs('[data-auth-action="create"]');
    const accountTrigger = safeGet("accountTrigger");
    const accountMenu = safeGet("accountMenu");
    const mobileAccountName = safeGet("mobileAccountName");
    const mobileSignInTrigger = qs(".mobile-auth-signin");
    const mobileCreateTrigger = qs(".mobile-auth-create");
    const loginMessage = safeGet("loginMessage");
    const createAccountMessage = safeGet("createAccountMessage");
    const authToast = safeGet("authToast");
    const demoAccountsKey = "futurelens.demoAccounts.v1";
    const demoSessionKey = "futurelens.demoSession.v1";
    const demoPasswordIterations = 120000;
    let signedInDemoAccount = null;
    let previousFocus = null;
    let authToastTimer = null;

    function readDemoAccounts() {
        try {
            const stored = localStorage.getItem(demoAccountsKey);
            if (!stored) return [];
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : null;
        } catch {
            return null;
        }
    }

    function showAuthToast(message, state = "success") {
        if (!authToast) return;
        authToast.textContent = message;
        authToast.dataset.state = state;
        authToast.hidden = false;
        window.clearTimeout(authToastTimer);
        authToastTimer = window.setTimeout(() => { authToast.hidden = true; }, 4500);
    }

    function updateAuthHeader() {
        const signedIn = Boolean(signedInDemoAccount);
        if (loginTrigger) {
            loginTrigger.hidden = signedIn;
            loginTrigger.removeAttribute("aria-label");
        }
        if (createAccountTrigger) createAccountTrigger.hidden = signedIn;
        if (accountTrigger) {
            accountTrigger.hidden = !signedIn;
            accountTrigger.textContent = signedIn ? `Hi, ${signedInDemoAccount.name}` : "";
            accountTrigger.setAttribute("aria-label", signedIn ? `Account menu for ${signedInDemoAccount.name}` : "Account menu");
            accountTrigger.setAttribute("aria-expanded", String(Boolean(accountMenu && !accountMenu.hidden)));
        }
        if (accountMenu && !signedIn) accountMenu.hidden = true;
        if (mobileSignInTrigger) mobileSignInTrigger.hidden = signedIn;
        if (mobileCreateTrigger) mobileCreateTrigger.hidden = signedIn;
        if (mobileAccountName) {
            mobileAccountName.hidden = !signedIn;
            mobileAccountName.textContent = signedIn ? `Hi, ${signedInDemoAccount.name}` : "";
        }
        const mobileSignOut = qs(".mobile-auth-signout");
        if (mobileSignOut) mobileSignOut.hidden = !signedIn;
    }

    function setAuthView(mode) {
        const createMode = mode === "create";
        if (signinView) signinView.hidden = createMode;
        if (createAccountView) createAccountView.hidden = !createMode;
        loginDialog?.setAttribute("aria-labelledby", createMode ? "createAccountTitle" : "loginTitle");
        loginDialog?.setAttribute("aria-describedby", createMode ? "createAccountDescription" : "loginDescription");
        loginClose?.setAttribute("aria-label", createMode ? "Close create account" : "Close sign in");
        clearPasswordFields();
        clearAuthErrors();
        if (loginMessage) loginMessage.hidden = true;
        if (createAccountMessage) createAccountMessage.hidden = true;
        window.setTimeout(() => (createMode ? createName : loginEmail)?.focus(), 0);
    }

    function openLogin(mode = "signin", focusTarget = document.activeElement) {
        if (!loginModal) return;
        previousFocus = focusTarget;
        setAuthView(mode);
        loginModal.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeLogin() {
        if (!loginModal) return;
        loginModal.hidden = true;
        document.body.classList.remove("modal-open");
        clearPasswordFields();
        if (previousFocus && !previousFocus.hidden) previousFocus.focus?.();
        else (signedInDemoAccount ? accountTrigger : loginTrigger)?.focus?.();
    }

    function clearPasswordFields() {
        [loginPassword, createPassword, confirmPassword].forEach(input => {
            if (!input) return;
            input.value = "";
            input.type = "password";
        });
        loginModal?.querySelectorAll(".password-toggle").forEach(button => {
            button.textContent = "Show";
            button.setAttribute("aria-label", "Show password");
            button.setAttribute("aria-pressed", "false");
        });
    }

    function setFieldError(inputId, messageId, message) {
        const input = safeGet(inputId);
        const note = safeGet(messageId);
        if (input) input.setAttribute("aria-invalid", String(Boolean(message)));
        if (note) note.textContent = message || "";
    }

    function clearAuthErrors() {
        [
            ["loginEmail", "loginEmailError"], ["loginPassword", "loginPasswordError"],
            ["createName", "createNameError"], ["createEmail", "createEmailError"],
            ["createPassword", "createPasswordError"], ["confirmPassword", "confirmPasswordError"],
            ["demoTerms", "demoTermsError"]
        ].forEach(([inputId, messageId]) => setFieldError(inputId, messageId, ""));
    }

    function setAuthMessage(node, message, state = "error") {
        if (!node) return;
        node.textContent = message;
        node.dataset.state = state;
        node.hidden = !message;
    }

    function validEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    }

    function encodeBytes(bytes) {
        let binary = "";
        bytes.forEach(byte => { binary += String.fromCharCode(byte); });
        return btoa(binary);
    }

    async function deriveDemoPasswordVerifier(password, salt) {
        if (!window.crypto?.subtle || !window.crypto?.getRandomValues) {
            throw new Error("Secure local password verification is unavailable in this browser. Open FutureLens on localhost and try again.");
        }
        const material = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
        const bits = await window.crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: demoPasswordIterations, hash: "SHA-256" }, material, 256);
        return encodeBytes(new Uint8Array(bits));
    }

    function saveDemoSession(account) {
        const session = { name: account.name, email: account.email };
        try { localStorage.setItem(demoSessionKey, JSON.stringify(session)); } catch { /* keep this session signed in if storage becomes read-only */ }
        signedInDemoAccount = session;
        updateAuthHeader();
    }

    function restoreDemoSession() {
        try {
            const session = JSON.parse(localStorage.getItem(demoSessionKey) || "null");
            const accounts = readDemoAccounts();
            if (session && accounts && accounts.some(account => account.email === session.email && account.name === session.name)) {
                signedInDemoAccount = { name: session.name, email: session.email };
            }
        } catch {
            signedInDemoAccount = null;
        }
        updateAuthHeader();
    }

    loginClose?.addEventListener("click", closeLogin);
    loginModal?.addEventListener("click", event => { if (event.target === loginModal) closeLogin(); });

    document.addEventListener("click", event => {
        if (accountMenu && !accountMenu.hidden && !event.target.closest("#accountMenu, #accountTrigger")) {
            accountMenu.hidden = true;
            accountTrigger?.setAttribute("aria-expanded", "false");
        }
        const switchButton = event.target.closest("[data-auth-switch]");
        if (switchButton) {
            setAuthView(switchButton.dataset.authSwitch);
            return;
        }
        const actionButton = event.target.closest("[data-auth-action]");
        if (!actionButton) return;
        const action = actionButton.dataset.authAction;
        if (action === "create" || action === "signin") {
            const mobileAction = Boolean(actionButton.closest(".mobile-menu"));
            if (mobileAction) safeGet("mobileMenu")?.classList.remove("active");
            openLogin(action === "create" ? "create" : "signin", mobileAction ? safeGet("menuBtn") : actionButton);
        } else if (action === "toggle-account") {
            if (!accountMenu) return;
            accountMenu.hidden = !accountMenu.hidden;
            accountTrigger?.setAttribute("aria-expanded", String(!accountMenu.hidden));
        } else if (action === "signout") {
            const signOutFocusTarget = actionButton.closest(".mobile-menu") ? mobileSignInTrigger : loginTrigger;
            try { localStorage.removeItem(demoSessionKey); } catch { /* the in-memory sign-out still applies */ }
            signedInDemoAccount = null;
            if (accountMenu) accountMenu.hidden = true;
            updateAuthHeader();
            signOutFocusTarget?.focus();
            showAuthToast("Signed out. Your local demo account remains saved in this browser.");
        }
    });

    accountTrigger?.addEventListener("click", () => {
        if (!accountMenu) return;
        accountMenu.hidden = !accountMenu.hidden;
        accountTrigger.setAttribute("aria-expanded", String(!accountMenu.hidden));
    });

    loginForm?.addEventListener("submit", async event => {
        event.preventDefault();
        clearAuthErrors();
        setAuthMessage(loginMessage, "");
        const email = String(loginEmail?.value || "").trim().toLowerCase();
        const password = String(loginPassword?.value || "");
        let firstInvalid = null;
        if (!email) { setFieldError("loginEmail", "loginEmailError", "Enter your email address."); firstInvalid ||= loginEmail; }
        else if (!validEmail(email)) { setFieldError("loginEmail", "loginEmailError", "Enter a valid email address."); firstInvalid ||= loginEmail; }
        if (!password) { setFieldError("loginPassword", "loginPasswordError", "Enter your password."); firstInvalid ||= loginPassword; }
        if (firstInvalid) { firstInvalid.focus(); return; }

        const accounts = readDemoAccounts();
        if (!accounts) { setAuthMessage(loginMessage, "Local demo account storage is unavailable in this browser."); return; }
        const account = accounts.find(item => item.email === email);
        if (!account) {
            setAuthMessage(loginMessage, "No demo account was found for this email. Create an account first.");
            return;
        }
        const submitButton = loginForm.querySelector('[type="submit"]');
        if (submitButton) { submitButton.disabled = true; submitButton.setAttribute("aria-busy", "true"); }
        try {
            const salt = Uint8Array.from(atob(account.salt), char => char.charCodeAt(0));
            const verifier = await deriveDemoPasswordVerifier(password, salt);
            if (verifier !== account.verifier) {
                setAuthMessage(loginMessage, "That password doesn't match this local demo account.");
                return;
            }
            saveDemoSession(account);
            loginPassword.value = "";
            closeLogin();
            showAuthToast(`Welcome back, ${account.name}.`);
        } catch {
            setAuthMessage(loginMessage, "We couldn't verify this demo account in the current browser.");
        } finally {
            if (submitButton) { submitButton.disabled = false; submitButton.removeAttribute("aria-busy"); }
        }
    });

    createAccountForm?.addEventListener("submit", async event => {
        event.preventDefault();
        clearAuthErrors();
        setAuthMessage(createAccountMessage, "");
        const name = String(createName?.value || "").trim().replace(/\s+/g, " ");
        const email = String(createEmail?.value || "").trim().toLowerCase();
        const password = String(createPassword?.value || "");
        const confirmation = String(confirmPassword?.value || "");
        let firstInvalid = null;
        if (!name) { setFieldError("createName", "createNameError", "Enter your full name."); firstInvalid ||= createName; }
        else if (name.length < 2) { setFieldError("createName", "createNameError", "Name must contain at least 2 characters."); firstInvalid ||= createName; }
        if (!email) { setFieldError("createEmail", "createEmailError", "Enter your email address."); firstInvalid ||= createEmail; }
        else if (!validEmail(email)) { setFieldError("createEmail", "createEmailError", "Enter a valid email address."); firstInvalid ||= createEmail; }
        if (!password) {
            setFieldError("createPassword", "createPasswordError", "Enter a password.");
            firstInvalid ||= createPassword;
        } else if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
            setFieldError("createPassword", "createPasswordError", "Use at least 8 characters, including a letter and a number.");
            firstInvalid ||= createPassword;
        }
        if (!confirmation) { setFieldError("confirmPassword", "confirmPasswordError", "Confirm your password."); firstInvalid ||= confirmPassword; }
        else if (password !== confirmation) { setFieldError("confirmPassword", "confirmPasswordError", "Passwords do not match."); firstInvalid ||= confirmPassword; }
        if (!demoTerms?.checked) { setFieldError("demoTerms", "demoTermsError", "Agree to the demo terms to continue."); firstInvalid ||= demoTerms; }
        if (firstInvalid) { firstInvalid.focus(); return; }

        let accounts = readDemoAccounts();
        if (!accounts) { setAuthMessage(createAccountMessage, "Local demo account storage is unavailable in this browser."); return; }
        if (accounts.some(account => account.email === email)) {
            setAuthMessage(createAccountMessage, "An account with this email already exists. Try signing in.");
            return;
        }

        const submitButton = createAccountForm.querySelector('[type="submit"]');
        if (submitButton) { submitButton.disabled = true; submitButton.setAttribute("aria-busy", "true"); }
        try {
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const verifier = await deriveDemoPasswordVerifier(password, salt);
            accounts = readDemoAccounts();
            if (!accounts) throw new Error("Account storage is unavailable.");
            if (accounts.some(account => account.email === email)) {
                setAuthMessage(createAccountMessage, "An account with this email already exists. Try signing in.");
                return;
            }
            const account = { name, email, salt: encodeBytes(salt), verifier };
            accounts.push(account);
            localStorage.setItem(demoAccountsKey, JSON.stringify(accounts));
            saveDemoSession(account);
            createAccountForm.reset();
            closeLogin();
            showAuthToast("Account created. Your FutureLens profile is ready.", "success");
        } catch {
            setAuthMessage(createAccountMessage, "We couldn't save this local demo account. Check browser storage and try again.");
        } finally {
            if (submitButton) { submitButton.disabled = false; submitButton.removeAttribute("aria-busy"); }
        }
    });

    document.querySelectorAll("[data-password-toggle]").forEach(button => {
        button.addEventListener("click", () => {
            const input = safeGet(button.dataset.passwordToggle);
            if (!input) return;
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            button.textContent = show ? "Hide" : "Show";
            button.setAttribute("aria-label", `${show ? "Hide" : "Show"} password`);
            button.setAttribute("aria-pressed", String(show));
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && loginModal && !loginModal.hidden) closeLogin();
        else if (event.key === "Escape" && accountMenu && !accountMenu.hidden) {
            accountMenu.hidden = true;
            accountTrigger?.setAttribute("aria-expanded", "false");
            accountTrigger?.focus();
        }
        if (event.key === "Tab" && loginModal && !loginModal.hidden) {
            const focusable = Array.from(loginModal.querySelectorAll("button, input, [href], select, textarea, [tabindex]:not([tabindex='-1'])"))
                .filter(item => !item.disabled && !item.closest("[hidden]") && item.getClientRects().length > 0);
            if (!focusable.length) return;
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });

    restoreDemoSession();



    const seeDemoBtn = safeGet("seeDemoBtn");
    const startDemoBtn = safeGet("startDemoBtn");
    const demoModeBanner = safeGet("demoModeBanner");
    const demoStageCopy = safeGet("demoStageCopy");
    const demoBannerTitle = safeGet("demoBannerTitle");
    const demoLaunchStatus = safeGet("demoLaunchStatus");
    const demoLaunchMessage = safeGet("demoLaunchMessage");
    const retryDemoBtn = safeGet("retryDemo");
    const resetDemoBtn = safeGet("resetDemo");
    const exitDemoBtn = safeGet("exitDemo");
    let isDemoMode = false;
    let demoRunInProgress = false;

    function setDemoLaunchStatus(message, { error = false, retry = false } = {}) {
        if (!demoLaunchStatus) return;
        demoLaunchStatus.hidden = false;
        demoLaunchStatus.dataset.state = error ? "error" : "loading";
        if (demoLaunchMessage) demoLaunchMessage.textContent = message;
        if (retryDemoBtn) retryDemoBtn.hidden = !retry;
    }

    function clearDemoLaunchStatus() {
        if (demoLaunchStatus) {
            demoLaunchStatus.hidden = true;
            delete demoLaunchStatus.dataset.state;
        }
        if (retryDemoBtn) retryDemoBtn.hidden = true;
    }

    function hasValidGeneratedSimulation() {
        return Array.isArray(window.futureLensScenarios) &&
            window.futureLensScenarios.length > 0 &&
            window.futureLensScenarios.every(scenario =>
                scenario && typeof scenario.type === "string" && Number.isFinite(Number(scenario.readiness))
            );
    }

    function waitForDemoCondition(condition, timeoutMs = 12000) {
        const startedAt = Date.now();
        return new Promise((resolve, reject) => {
            const poll = () => {
                if (condition()) return resolve(true);
                if (Date.now() - startedAt >= timeoutMs) return reject(new Error("The demo step took too long. Your profile is still available."));
                window.setTimeout(poll, 80);
            };
            poll();
        });
    }

    function setDemoField(id, value, eventName = "input") {
        const field = safeGet(id);
        if (!field) throw new Error(`Demo setup couldn't find ${id}.`);
        field.value = String(value);
        field.dispatchEvent(new Event(eventName, { bubbles: true }));
    }

    function resetDemoToBlank() {
        resetJourneyButton?.click();
        closeModal();
        isDemoMode = false;
        demoModeBanner && (demoModeBanner.hidden = true);
        clearDemoLaunchStatus();
        safeGet("whatIfPanel")?.classList.remove("demo-what-if-highlight");
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (startDemoBtn) {
            startDemoBtn.disabled = false;
            startDemoBtn.innerHTML = '<i class="ri-rocket-2-line"></i> Try Live Demo';
        }
    }

    async function runJudgeDemo({ resetFirst = false } = {}) {
        if (demoRunInProgress) return;

        const hasSimulation = hasValidGeneratedSimulation();
        if (hasSimulation && !resetFirst) {
            demoRunInProgress = true;
            isDemoMode = true;
            if (startDemoBtn) startDemoBtn.disabled = true;
            setDemoLaunchStatus("Opening the existing modeled futures…");
            try {
                const scenarios = window.futureLensScenarios;
                const defaultScenario = scenarios.find(scenario => scenario.type === "balanced") || scenarios[0];
                selectedScenarioId = defaultScenario.type;
                renderFutureExplorer(scenarios);
                selectScenario(defaultScenario.type);
                updateFutureLandscape(scenarios);
                renderProfileBasedActions(false, userState, defaultScenario.type);
                const workflow = window.futureLensBackendResult?.result?.workflow;
                if (workflow) renderWorkflowStages(workflow);
                else {
                    const workflowSteps = safeGet("workflowSteps");
                    if (workflowSteps) workflowSteps.hidden = true;
                }
                if (whatIfHours) whatIfHours.value = String(Math.min(40, Math.max(5, Number(userState.currentState.hoursPerWeek) || 8) + 4));
                if (whatIfConsistency) whatIfConsistency.value = String(Math.min(100, Math.max(0, Number(userState.consistency) || 0) + 13));
                if (whatIfProjects) whatIfProjects.value = String(Math.min(100, Math.max(0, Number(userState.currentState.projects) || 0) + 1));
                updateWhatIfLabels();
                await runWhatIfSimulation();
                if (demoBannerTitle) demoBannerTitle.textContent = "Explore this already generated modeled profile and test a different choice.";
                if (demoStageCopy) demoStageCopy.textContent = "These futures use the profile already in this session. They remain model-based possibilities, not predictions.";
                if (demoModeBanner) demoModeBanner.hidden = false;
                safeGet("whatIfPanel")?.classList.add("demo-what-if-highlight");
                if (futureExplorer) {
                    futureExplorer.classList.add("active", "visible");
                    futureExplorer.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                if (startDemoBtn) {
                    startDemoBtn.disabled = false;
                    startDemoBtn.innerHTML = '<i class="ri-refresh-line"></i> Run Demo Again';
                }
                if (whatIfStatus?.dataset.state === "error") {
                    setDemoLaunchStatus("Your existing futures are open, but What-If could not refresh. Retry to start a fresh demo.", { error: true, retry: true });
                    demoLaunchStatus?.scrollIntoView({ behavior: "smooth", block: "center" });
                } else clearDemoLaunchStatus();
            } catch (error) {
                console.error("FutureLens could not open the existing demo results:", error);
                setDemoLaunchStatus("We couldn't open these saved futures. Retry to start a fresh demo profile.", { error: true, retry: true });
                if (startDemoBtn) startDemoBtn.disabled = false;
                demoLaunchStatus?.scrollIntoView({ behavior: "smooth", block: "center" });
            } finally {
                demoRunInProgress = false;
            }
            return;
        }

        if (resetFirst) resetDemoToBlank();
        else {
            // Start from a known profile so no partial form values leak into the sample.
            resetJourneyButton?.click();
            closeModal();
        }

        demoRunInProgress = true;
        isDemoMode = true;
        clearDemoLaunchStatus();
        setDemoLaunchStatus("Demo Mode — preparing your demo future…");
        if (startDemoBtn) {
            startDemoBtn.disabled = true;
            startDemoBtn.textContent = "Preparing your demo future…";
        }
        if (demoBannerTitle) demoBannerTitle.textContent = "Explore this fictional student profile, then change the modeled inputs.";
        if (demoStageCopy) demoStageCopy.textContent = "A fictional second-year student is exploring an internship path. FutureLens will run the same onboarding and simulation used in a normal session.";

        try {
            openModal();
            await new Promise(resolve => window.setTimeout(resolve, 120));
            const careerDomain = document.querySelector('.goal-domain[data-goal="career"]');
            if (!careerDomain) throw new Error("The career goal option is unavailable.");
            careerDomain.click();
            setDemoField("specificGoal", "internship", "change");
            setDemoField("goalTimeline", "6 months", "change");
            safeGet("continueGoal")?.click();
            await waitForDemoCondition(() => safeGet("step2")?.classList.contains("active"));

            setDemoField("currentYear", "2", "change");
            setDemoField("cgpa", "8.2");
            setDemoField("projects", "2");
            setDemoField("dsaSkill", "48");
            setDemoField("programmingSkill", "64");
            setDemoField("mlSkill", "35");
            setDemoField("developmentSkill", "56");
            setDemoField("hoursPerWeek", "8");
            safeGet("continueState")?.click();
            await waitForDemoCondition(() => safeGet("step3")?.classList.contains("active"));

            document.querySelector('.selection-card[data-priority="internship"]')?.click();
            document.querySelector('.selection-card[data-priority="projects"]')?.click();
            setDemoField("consistencySlider", "72");
            document.querySelector('.risk-card[data-risk="high-growth"]')?.click();
            safeGet("continuePriorities")?.click();
            await waitForDemoCondition(() => safeGet("step4")?.classList.contains("active"));

            const generateButton = safeGet("generateFutures");
            if (!generateButton) throw new Error("Generate Futures is unavailable.");
            generateButton.click();
            await waitForDemoCondition(() => !generateButton.disabled, 30000);
            if (!window.futureLensScenarios?.length) throw new Error("The simulation did not return modeled paths.");

            if (demoModeBanner) demoModeBanner.hidden = false;
            if (demoStageCopy) demoStageCopy.textContent = "Context and Scenario agents have run through the normal workflow. Explore the modeled paths, then change hours, consistency, or projects below.";
            if (whatIfHours) whatIfHours.value = "12";
            if (whatIfConsistency) whatIfConsistency.value = "85";
            if (whatIfProjects) whatIfProjects.value = "3";
            updateWhatIfLabels();
            await runWhatIfSimulation();
            if (whatIfStatus?.dataset.state === "error") {
                setDemoLaunchStatus("Your futures are ready, but What-If could not refresh. Retry the demo to try again.", { error: true, retry: true });
                demoLaunchStatus?.scrollIntoView({ behavior: "smooth", block: "center" });
            } else if (!window.futureLensBackendResult?.result?.workflow) {
                setDemoLaunchStatus("The agent service is unavailable. These deterministic local futures are ready; retry to run the full workflow.", { error: true, retry: true });
                demoLaunchStatus?.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                clearDemoLaunchStatus();
            }
            safeGet("whatIfPanel")?.classList.add("demo-what-if-highlight");
            safeGet("whatIfPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
            if (demoStageCopy) demoStageCopy.textContent = "The 8 → 12 hour, 2 → 3 project, and 72% → 85% what-if is ready. The personalized 7-day experiment follows below.";
            if (startDemoBtn) {
                startDemoBtn.disabled = false;
                startDemoBtn.innerHTML = '<i class="ri-refresh-line"></i> Run Demo Again';
            }
        } catch (error) {
            console.error("FutureLens judge demo could not complete:", error);
            closeModal();
            setDemoLaunchStatus("We couldn't prepare the demo future. Retry to start a fresh sample profile.", { error: true, retry: true });
            if (startDemoBtn) {
                startDemoBtn.disabled = false;
                startDemoBtn.innerHTML = '<i class="ri-refresh-line"></i> Run Demo Again';
            }
            demoLaunchStatus?.scrollIntoView({ behavior: "smooth", block: "center" });
        } finally {
            demoRunInProgress = false;
        }
    }

    startDemoBtn?.addEventListener("click", () => runJudgeDemo({ resetFirst: isDemoMode }));
    resetDemoBtn?.addEventListener("click", () => runJudgeDemo({ resetFirst: true }));
    retryDemoBtn?.addEventListener("click", () => runJudgeDemo({ resetFirst: true }));
    exitDemoBtn?.addEventListener("click", resetDemoToBlank);

    if (seeDemoBtn) {
        seeDemoBtn.addEventListener("click", () => {
            safeGet("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    /* =====================================================

       WHAT-IF SIMULATOR

    ===================================================== */


    const dsaSlider =

        safeGet("dsaSlider");


    const simulatorDsaValue =

        safeGet("dsaSkillValue");


    const simulatorMlValue =

        safeGet("mlSkillValue");


    const projectValue =

        safeGet("projectValue");


    const readinessScore =

        safeGet("readinessScore");


    const ringText =

        safeGet("ringText");


    const scoreRing =

        safeGet("scoreRing");


    const dsaMetric =

        safeGet("dsaMetric");


    const mlMetric =

        safeGet("mlMetric");


    const projectMetric =

        safeGet("projectMetric");


    const dsaProgress =

        safeGet("dsaProgress");


    const mlProgress =

        safeGet("mlProgress");


    const projectProgress =

        safeGet("projectProgress");


    const resultTitle =

        safeGet("resultTitle");


    const insightText =

        safeGet("insightText");



    /* =====================================================

       SLIDER BACKGROUND

    ===================================================== */


    function updateSliderBackground(

        value

    ) {


        if (!dsaSlider) {


            return;


        }



        const min =

            Number(

                dsaSlider.min

            );


        const max =

            Number(

                dsaSlider.max

            );



        const percentage =

            (

                (

                    value -

                    min

                ) /

                (

                    max -

                    min

                )

            ) *

            100;



        dsaSlider.style.background =

            `linear-gradient(

                90deg,

                #8b5cf6 ${percentage}%,

                rgba(255,255,255,.08) ${percentage}%

            )`;


    }



    /* =====================================================

       WHAT-IF CALCULATION

    ===================================================== */


    function updateSimulation() {


        if (!dsaSlider) {


            return;


        }



        const dsa =

            Number(

                dsaSlider.value

            );



        /*

            As DSA allocation increases,

            available ML and project allocation

            decreases.

        */


        let ml =

            40 -

            (

                (

                    dsa -

                    10

                ) *

                0.42

            );



        let projects =

            50 -

            (

                (

                    dsa -

                    10

                ) *

                0.40

            );



        ml =

            Math.round(

                Math.max(

                    18,

                    Math.min(

                        45,

                        ml

                    )

                )

            );



        projects =

            Math.round(

                Math.max(

                    18,

                    Math.min(

                        45,

                        projects

                    )

                )

            );



        /*

            Normalize allocation.

        */


        const total =

            dsa +

            ml +

            projects;



        let normalizedML =

            Math.round(

                (

                    ml /

                    total

                ) *

                100

            );



        let normalizedProjects =

            100 -

            dsa -

            normalizedML;



        if (

            normalizedProjects <

            10

        ) {


            normalizedProjects =

                10;


        }



        /*

            -------------------------------

            OUTCOME SCORES

            -------------------------------

        */


        const dsaScore =

            Math.min(

                96,

                Math.round(

                    58 +

                    dsa *

                    0.65

                )

            );



        const mlScore =

            Math.min(

                94,

                Math.round(

                    56 +

                    normalizedML *

                    0.62

                )

            );



        const projectScore =

            Math.min(

                95,

                Math.round(

                    55 +

                    normalizedProjects *

                    0.62

                )

            );



        /*

            -------------------------------

            OVERALL READINESS

            -------------------------------

        */


        const readiness =

            Math.round(

                (

                    dsaScore *

                    0.34

                ) +

                (

                    mlScore *

                    0.28

                ) +

                (

                    projectScore *

                    0.38

                )

            );



        /*

            -------------------------------

            ALLOCATION VALUES

            -------------------------------

        */


        if (simulatorDsaValue) {


            simulatorDsaValue.textContent =

                `${dsa}%`;


        }



        if (simulatorMlValue) {


            simulatorMlValue.textContent =

                `${normalizedML}%`;


        }



        if (projectValue) {


            projectValue.textContent =

                `${normalizedProjects}%`;


        }



        /*

            -------------------------------

            SCORE VALUES

            -------------------------------

        */


        if (dsaMetric) {


            dsaMetric.textContent =

                `${dsaScore}%`;


        }



        if (mlMetric) {


            mlMetric.textContent =

                `${mlScore}%`;


        }



        if (projectMetric) {


            projectMetric.textContent =

                `${projectScore}%`;


        }



        /*

            -------------------------------

            PROGRESS BARS

            -------------------------------

        */


        if (dsaProgress) {


            dsaProgress.style.width =

                `${dsaScore}%`;


        }



        if (mlProgress) {


            mlProgress.style.width =

                `${mlScore}%`;


        }



        if (projectProgress) {


            projectProgress.style.width =

                `${projectScore}%`;


        }



        /*

            -------------------------------

            READINESS

            -------------------------------

        */


        if (readinessScore) {


            readinessScore.textContent =

                readiness;


        }



        if (ringText) {


            ringText.textContent =

                `${readiness}%`;


        }



        /*

            -------------------------------

            SVG RING

            -------------------------------

        */


        if (scoreRing) {


            const circumference =

                264;



            const offset =

                circumference -

                (

                    readiness /

                    100

                ) *

                circumference;



            scoreRing.style.strokeDashoffset =

                offset;


        }



        updateSliderBackground(

            dsa

        );



        /*

            -------------------------------

            DYNAMIC TITLE

            -------------------------------

        */


        if (resultTitle) {


            if (

                dsa >= 50

            ) {


                resultTitle.textContent =

                    "Interview-focused future";


            }


            else if (

                dsa <= 25

            ) {


                resultTitle.textContent =

                    "Project & ML-focused future";


            }


            else {


                resultTitle.textContent =

                    "Balanced preparation";


            }


        }



        /*

            -------------------------------

            DYNAMIC INSIGHT

            -------------------------------

        */


        if (insightText) {


            if (

                dsa >= 50

            ) {


                insightText.textContent =

                    "A stronger DSA allocation increases interview preparation and coding readiness, but reduces the time available for ML depth and portfolio development.";


            }


            else if (

                dsa <= 25

            ) {


                insightText.textContent =

                    "Lower DSA allocation creates more room for ML learning and practical projects, which can strengthen specialization and portfolio depth.";


            }


            else {


                insightText.textContent =

                    "A balanced allocation keeps your technical preparation diversified while maintaining steady progress across projects, ML and interview skills.";


            }


        }


    }



    /*

        Listen for slider changes.

    */


    if (dsaSlider) {


        dsaSlider.addEventListener(

            "input",

            updateSimulation

        );


    }



    /* =====================================================

       RESET WHAT-IF SIMULATOR

    ===================================================== */


    const resetSimulator =

        safeGet(

            "resetSimulator"

        );



    if (resetSimulator) {


        resetSimulator.addEventListener(

            "click",

            () => {


                if (dsaSlider) {


                    dsaSlider.value =

                        40;



                    updateSimulation();


                }


            }

        );


    }



    /*

        Initial simulator state.

    */


    updateSimulation();



    /* =====================================================

       SCENARIO EXPLORER DATA

    ===================================================== */


    const scenarios =

        {


            balanced: {


                title:

                    "Balanced Path",


                description:

                    "A moderate allocation across DSA, ML and practical project work.",


                score:

                    88,


                values:

                    [

                        42,

                        51,

                        58,

                        67,

                        76,

                        84,

                        88

                    ],


                insight:

                    "Balanced preparation reduces dependency on one skill while creating consistent progress across multiple career dimensions."


            },



            dsa: {


                title:

                    "DSA Focus",


                description:

                    "A coding-heavy strategy optimized around interview preparation and problem solving.",


                score:

                    91,


                values:

                    [

                        42,

                        55,

                        63,

                        72,

                        81,

                        87,

                        91

                    ],


                insight:

                    "A stronger DSA allocation accelerates coding and interview readiness, but leaves less time for specialization and portfolio depth."


            },



            ml: {


                title:

                    "ML Focus",


                description:

                    "A specialization-heavy strategy focused on machine learning depth and AI projects.",


                score:

                    86,


                values:

                    [

                        42,

                        50,

                        59,

                        69,

                        76,

                        82,

                        86

                    ],


                insight:

                    "A stronger ML focus increases specialization depth and can strengthen AI-oriented projects, while interview preparation progresses more gradually."


            }


        };



    /* =====================================================

       CHART

    ===================================================== */


    const chartPath =

        safeGet("chartPath");


    const chartFill =

        safeGet("chartFill");


    const chartPoints =

        safeGet("chartPoints");



    function generateChart(

        values

    ) {


        if (

            !chartPath ||

            !chartFill ||

            !chartPoints

        ) {


            return;


        }



        const width =

            700;


        const height =

            250;



        const points =

            [];



        values.forEach(

            (

                value,

                index

            ) => {


                const x =

                    (

                        index /

                        (

                            values.length -

                            1

                        )

                    ) *

                    width;



                const y =

                    height -

                    (

                        value /

                        100

                    ) *

                    height;



                points.push({

                    x,

                    y,

                    value

                });


            }

        );



        let path =

            "";



        points.forEach(

            (

                point,

                index

            ) => {


                if (

                    index === 0

                ) {


                    path +=

                        `M ${point.x} ${point.y}`;


                }


                else {


                    const previous =

                        points[

                            index -

                            1

                        ];



                    const controlX =

                        (

                            previous.x +

                            point.x

                        ) /

                        2;



                    path +=

                        ` C ${controlX} ${previous.y},

                        ${controlX} ${point.y},

                        ${point.x} ${point.y}`;


                }


            }

        );



        const fillPath =

            `${path}

            L ${width} ${height}

            L 0 ${height}

            Z`;



        chartPath.setAttribute(

            "d",

            path

        );



        chartFill.setAttribute(

            "d",

            fillPath

        );



        chartPoints.innerHTML =

            "";



        points.forEach(

            point => {


                const element =

                    document.createElement(

                        "span"

                    );



                element.className =

                    "chart-point";



                element.style.left =

                    `${(

                        point.x /

                        width

                    ) * 100}%`;



                element.style.top =

                    `${(

                        point.y /

                        height

                    ) * 100}%`;



                element.title =

                    `${point.value}%`;



                chartPoints.appendChild(

                    element

                );


            }

        );


    }



    /* =====================================================

       SCENARIO SWITCHING

    ===================================================== */


    const scenarioTabs =

        document.querySelectorAll(

            ".scenario-tab"

        );



    const scenarioTitle =

        safeGet(

            "scenarioTitle"

        );


    const scenarioDescription =

        safeGet(

            "scenarioDescription"

        );


    const scenarioScore =

        safeGet(

            "scenarioScore"

        );


    const scenarioInsight =

        safeGet(

            "scenarioInsight"

        );



    function loadScenario(

        name

    ) {


        const data =

            scenarios[name];



        if (!data) {


            return;


        }



        if (scenarioTitle) {


            scenarioTitle.textContent =

                data.title;


        }



        if (scenarioDescription) {


            scenarioDescription.textContent =

                data.description;


        }



        if (scenarioScore) {


            scenarioScore.textContent =

                data.score;


        }



        if (scenarioInsight) {


            scenarioInsight.textContent =

                data.insight;


        }



        generateChart(

            data.values

        );


    }



    scenarioTabs.forEach(

        tab => {


            tab.addEventListener(

                "click",

                () => {


                    scenarioTabs.forEach(

                        item => {


                            item.classList.remove(

                                "active"

                            );


                        }

                    );



                    tab.classList.add(

                        "active"

                    );



                    loadScenario(

                        tab.dataset.scenario

                    );


                }

            );


        }

    );



    /*

        Load Balanced scenario by default.

    */


    loadScenario(

        "balanced"

    );



    /* =====================================================

       SCROLL REVEAL

    ===================================================== */


    const revealElements =

        document.querySelectorAll(

            ".reveal"

        );



    if (

        "IntersectionObserver"

        in window

    ) {


        const revealObserver =

            new IntersectionObserver(

                entries => {


                    entries.forEach(

                        entry => {


                            if (

                                entry.isIntersecting

                            ) {


                                entry.target.classList.add(

                                    "visible"

                                );



                                revealObserver.unobserve(

                                    entry.target

                                );


                            }


                        }

                    );


                },

                {

                    threshold:

                        0.12

                }

            );



        revealElements.forEach(

            element => {


                revealObserver.observe(

                    element

                );


            }

        );


    }


    else {


        revealElements.forEach(

            element => {


                element.classList.add(

                    "visible"

                );


            }

        );


    }



    /* =====================================================

       SMOOTH NAVIGATION

    ===================================================== */


    document

        .querySelectorAll(

            'a[href^="#"]'

        )

        .forEach(

            link => {


                link.addEventListener(

                    "click",

                    event => {


                        const targetId =

                            link.getAttribute(

                                "href"

                            );



                        if (

                            targetId === "#" ||

                            !document.querySelector(

                                targetId

                            )

                        ) {


                            return;


                        }



                        event.preventDefault();



                        document

                            .querySelector(

                                targetId

                            )

                            .scrollIntoView({

                                behavior:

                                    "smooth"

                            });


                    }

                );


            }

        );



    /* =====================================================

       BUTTON RIPPLE EFFECT

    ===================================================== */


    document

        .querySelectorAll(

            ".primary-btn, .nav-cta"

        )

        .forEach(

            button => {


                button.addEventListener(

                    "click",

                    event => {


                        const ripple =

                            document.createElement(

                                "span"

                            );



                        ripple.style.position =

                            "absolute";


                        ripple.style.width =

                            "10px";


                        ripple.style.height =

                            "10px";


                        ripple.style.borderRadius =

                            "50%";


                        ripple.style.background =

                            "rgba(255,255,255,.35)";


                        ripple.style.left =

                            `${event.offsetX}px`;


                        ripple.style.top =

                            `${event.offsetY}px`;


                        ripple.style.transform =

                            "translate(-50%, -50%) scale(0)";


                        ripple.style.pointerEvents =

                            "none";


                        ripple.style.animation =

                            "ripple .5s ease-out";



                        button.style.position =

                            "relative";


                        button.style.overflow =

                            "hidden";



                        button.appendChild(

                            ripple

                        );



                        setTimeout(

                            () => {


                                ripple.remove();


                            },

                            500

                        );


                    }

                );


            }

        );



    /* =====================================================

       FINAL INITIALIZATION

    ===================================================== */


    /*

        Keep onboarding sections hidden until

        the user starts the journey.

    */


    document

        .querySelectorAll(

            ".onboarding-section"

        )

        .forEach(

            section => {


                section.classList.remove(

                    "active",

                    "visible"

                );


            }

        );

});

