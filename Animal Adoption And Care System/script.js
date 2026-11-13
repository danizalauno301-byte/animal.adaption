/* =========================================================
   ANIMAL ADOPTION AND CARE SYSTEM
   COMPLETE SCRIPT.JS
   ========================================================= */


/* =========================================================
   ANIMAL DETAILS
   ========================================================= */

const animalDetails = {
    buddy: {
        name: "Buddy",
        emoji: "🐶",
        type: "Dog",
        age: "2 years",
        gender: "Male",
        health: "Healthy",
        vaccination: "Up to date",
        care: "Regular care",
        status: "Available",
        description:
            "Buddy is a friendly and playful dog who enjoys spending time with people. He is vaccinated and ready for a loving and responsible home."
    },

    luna: {
        name: "Luna",
        emoji: "🐱",
        type: "Cat",
        age: "1 year",
        gender: "Female",
        health: "Healthy",
        vaccination: "Up to date",
        care: "Regular care",
        status: "Available",
        description:
            "Luna is a gentle and affectionate cat. She enjoys quiet environments and is looking for a caring and responsible family."
    },

    max: {
        name: "Max",
        emoji: "🐕",
        type: "Dog",
        age: "3 years",
        gender: "Male",
        health: "Healthy",
        vaccination: "Up to date",
        care: "Close monitoring",
        status: "Available",
        description:
            "Max is an active and energetic dog who enjoys playing and outdoor activities. He is healthy and ready for adoption."
    },

    bella: {
        name: "Bella",
        emoji: "🐱",
        type: "Cat",
        age: "2 years",
        gender: "Female",
        health: "Under Treatment",
        vaccination: "Up to date",
        care: "Special care",
        status: "Available",
        description:
            "Bella is an affectionate and calm cat. She is currently receiving special care and is being monitored by authorized personnel."
    }
};


/* =========================================================
   ANIMAL RECORD IMAGES
   ========================================================= */

const animalRecordImages = {
    dog:
        "https://images.unsplash.com/photo-1617748418149-1c5f78b8ac6e?auto=format&fit=crop&w=700&q=85",

    cat:
        "https://images.unsplash.com/photo-1730736779543-ee9599c1c949?auto=format&fit=crop&w=700&q=85",

    default:
        "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=700&q=85"
};


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function getElement(id) {
    return document.getElementById(id);
}

function showElement(element) {
    if (element) {
        element.style.display = "";
    }
}

function hideElement(element) {
    if (element) {
        element.style.display = "none";
    }
}

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   ANIMAL RECORD STORAGE
   ========================================================= */

function getAnimalRecords() {
    return JSON.parse(
        localStorage.getItem("animalRecords") || "[]"
    );
}

function saveAnimalRecords(records) {
    localStorage.setItem(
        "animalRecords",
        JSON.stringify(records)
    );
}


/* =========================================================
   ANIMAL MANAGEMENT
   ========================================================= */

function initializeAnimalManagement() {

    const animalForm = getElement("animalForm");
    const showAddAnimalForm = getElement("showAddAnimalForm");
    const cancelAnimalForm = getElement("cancelAnimalForm");

    if (!animalForm) {
        return;
    }


    /* -------------------------
       SHOW ADD FORM
       ------------------------- */

    if (showAddAnimalForm) {
        showAddAnimalForm.addEventListener("click", function () {

            animalForm.reset();

            const editAnimalId = getElement("editAnimalId");

            if (editAnimalId) {
                editAnimalId.value = "";
            }

            animalForm.style.display = "block";

            animalForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }


    /* -------------------------
       CANCEL FORM
       ------------------------- */

    if (cancelAnimalForm) {
        cancelAnimalForm.addEventListener("click", function () {

            animalForm.reset();

            const editAnimalId = getElement("editAnimalId");

            if (editAnimalId) {
                editAnimalId.value = "";
            }

            animalForm.style.display = "none";
        });
    }


    /* -------------------------
       SAVE ANIMAL
       ------------------------- */

    animalForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const editAnimalId = getElement("editAnimalId");

        const name = getElement("animalName")?.value.trim();
        const type = getElement("animalRecordType")?.value;
        const age = getElement("animalAge")?.value.trim();
        const gender = getElement("animalGender")?.value;
        const health = getElement("animalHealth")?.value;
        const vaccination = getElement("animalVaccination")?.value;
        const care = getElement("animalCare")?.value;
        const status = getElement("animalStatus")?.value;
        const description = getElement("animalDescription")?.value.trim();


        if (
            !name ||
            !type ||
            !age ||
            !gender ||
            !health ||
            !vaccination ||
            !care ||
            !status ||
            !description
        ) {
            alert("Please complete all animal information.");
            return;
        }


        let records = getAnimalRecords();


        /* -------------------------
           EDIT EXISTING RECORD
           ------------------------- */

        if (editAnimalId && editAnimalId.value) {

            const index = records.findIndex(
                animal => animal.id == editAnimalId.value
            );

            if (index !== -1) {

                records[index] = {
                    ...records[index],

                    name: name,
                    type: type,
                    age: age,
                    gender: gender,
                    health: health,
                    vaccination: vaccination,
                    care: care,
                    status: status,
                    description: description
                };
            }

        }


        /* -------------------------
           ADD NEW RECORD
           ------------------------- */

        else {

            const newAnimal = {
                id: Date.now(),

                name: name,
                type: type,
                age: age,
                gender: gender,
                health: health,
                vaccination: vaccination,
                care: care,
                status: status,
                description: description
            };

            records.push(newAnimal);
        }


        saveAnimalRecords(records);

        animalForm.reset();

        if (editAnimalId) {
            editAnimalId.value = "";
        }

        animalForm.style.display = "none";

        renderAnimalRecords();

        alert("Animal record saved successfully.");
    });


    renderAnimalRecords();
}


/* =========================================================
   RENDER ANIMAL RECORDS
   ========================================================= */

function renderAnimalRecords() {

    const container = getElement("animalRecordList");

    if (!container) {
        return;
    }

    const noAnimalRecords = getElement("noAnimalRecords");

    const searchInput = getElement("animalRecordSearch");
    const filterInput = getElement("animalRecordFilter");

    const searchValue = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const filterValue = filterInput
        ? filterInput.value.toLowerCase()
        : "all";


    let records = getAnimalRecords();


    /* -------------------------
       SEARCH
       ------------------------- */

    records = records.filter(function (animal) {

        const matchesSearch =
            animal.name.toLowerCase().includes(searchValue) ||
            animal.type.toLowerCase().includes(searchValue);


        const matchesFilter =
            filterValue === "all" ||
            animal.type.toLowerCase() === filterValue;


        return matchesSearch && matchesFilter;
    });


    container.innerHTML = "";


    if (records.length === 0) {

        if (noAnimalRecords) {
            noAnimalRecords.style.display = "block";
        }

        return;
    }


    if (noAnimalRecords) {
        noAnimalRecords.style.display = "none";
    }


    records.forEach(function (animal) {

        const animalType = (animal.type || "").toLowerCase();

        const image =
            animalRecordImages[animalType] ||
            animalRecordImages.default;


        const card = document.createElement("div");

        card.className = "animal-record-card";


        card.innerHTML = `
            <div class="animal-record-layout">

                <img
                    src="${image}"
                    alt="${escapeHTML(animal.name)}"
                    class="animal-record-image"
                >

                <div class="animal-record-content">

                    <div class="animal-record-header">

                        <div>
                            <h3>
                                ${escapeHTML(animal.name)}
                            </h3>

                            <span class="animal-record-type">
                                ${escapeHTML(animal.type)}
                            </span>
                        </div>

                        <span class="animal-record-status">
                            ${escapeHTML(animal.status)}
                        </span>

                    </div>


                    <div class="animal-record-info">

                        <p>
                            <strong>Age:</strong>
                            ${escapeHTML(animal.age)}
                        </p>

                        <p>
                            <strong>Gender:</strong>
                            ${escapeHTML(animal.gender)}
                        </p>

                        <p>
                            <strong>Health:</strong>
                            ${escapeHTML(animal.health)}
                        </p>

                        <p>
                            <strong>Vaccination:</strong>
                            ${escapeHTML(animal.vaccination)}
                        </p>

                        <p>
                            <strong>Care:</strong>
                            ${escapeHTML(animal.care)}
                        </p>

                    </div>


                    <p class="animal-record-description">
                        ${escapeHTML(animal.description)}
                    </p>


                    <div class="animal-record-actions">

                        <button
                            type="button"
                            class="edit-animal-btn"
                            data-id="${animal.id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="delete-animal-btn"
                            data-id="${animal.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </div>
        `;


        container.appendChild(card);
    });


    /* -------------------------
       EDIT BUTTONS
       ------------------------- */

    container
        .querySelectorAll(".edit-animal-btn")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                editAnimal(button.dataset.id);
            });
        });


    /* -------------------------
       DELETE BUTTONS
       ------------------------- */

    container
        .querySelectorAll(".delete-animal-btn")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                deleteAnimal(button.dataset.id);
            });
        });
}


/* =========================================================
   EDIT ANIMAL
   ========================================================= */

function editAnimal(id) {

    const records = getAnimalRecords();

    const animal = records.find(
        record => record.id == id
    );

    if (!animal) {
        return;
    }


    const animalForm = getElement("animalForm");

    if (!animalForm) {
        return;
    }


    getElement("editAnimalId").value = animal.id;

    getElement("animalName").value = animal.name;
    getElement("animalRecordType").value = animal.type;
    getElement("animalAge").value = animal.age;
    getElement("animalGender").value = animal.gender;
    getElement("animalHealth").value = animal.health;
    getElement("animalVaccination").value = animal.vaccination;
    getElement("animalCare").value = animal.care;
    getElement("animalStatus").value = animal.status;
    getElement("animalDescription").value = animal.description;


    animalForm.style.display = "block";

    animalForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   DELETE ANIMAL
   ========================================================= */

function deleteAnimal(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this animal record?"
    );

    if (!confirmed) {
        return;
    }


    let records = getAnimalRecords();

    records = records.filter(
        animal => animal.id != id
    );

    saveAnimalRecords(records);

    renderAnimalRecords();
}


/* =========================================================
   ANIMAL RECORD SEARCH AND FILTER
   ========================================================= */

function initializeAnimalRecordSearch() {

    const search = getElement("animalRecordSearch");
    const filter = getElement("animalRecordFilter");


    if (search) {
        search.addEventListener(
            "input",
            renderAnimalRecords
        );
    }


    if (filter) {
        filter.addEventListener(
            "change",
            renderAnimalRecords
        );
    }
}


/* =========================================================
   AVAILABLE ANIMALS
   ========================================================= */

function initializeAvailableAnimals() {

    const search = getElement("animalSearch");
    const typeFilter = getElement("animalType");

    const animals = document.querySelectorAll(".animal-item");
    const noResults = getElement("noResults");


    if (!search && !typeFilter) {
        return;
    }


    function filterAnimals() {

        const searchValue = search
            ? search.value.toLowerCase().trim()
            : "";

        const typeValue = typeFilter
            ? typeFilter.value.toLowerCase()
            : "all";


        let visibleCount = 0;


        animals.forEach(function (animal) {

            const name =
                (animal.dataset.name || "").toLowerCase();

            const type =
                (animal.dataset.type || "").toLowerCase();


            const matchesSearch =
                name.includes(searchValue);

            const matchesType =
                typeValue === "all" ||
                type === typeValue;


            if (matchesSearch && matchesType) {

                animal.style.display = "";

                visibleCount++;

            } else {

                animal.style.display = "none";
            }
        });


        if (noResults) {

            noResults.style.display =
                visibleCount === 0
                    ? "block"
                    : "none";
        }
    }


    if (search) {
        search.addEventListener(
            "input",
            filterAnimals
        );
    }


    if (typeFilter) {
        typeFilter.addEventListener(
            "change",
            filterAnimals
        );
    }
}


/* =========================================================
   ANIMAL DETAIL PAGE
   ========================================================= */

function initializeAnimalDetail() {

    const adoptButton = getElement("adoptButton");

    if (!adoptButton) {
        return;
    }


    const params =
        new URLSearchParams(window.location.search);

    const animalKey =
        (params.get("animal") || "").toLowerCase();


    const animal =
        animalDetails[animalKey];


    if (!animal) {
        return;
    }


    const fields = {

        detailAnimalEmoji: animal.emoji,

        detailStatus: animal.status,

        detailAnimalName: animal.name,

        detailAnimalType: animal.type,

        detailDescription: animal.description,

        detailType: animal.type,

        detailAge: animal.age,

        detailGender: animal.gender,

        detailHealth: animal.health,

        detailVaccination: animal.vaccination,

        detailCare: animal.care
    };


    Object.keys(fields).forEach(function (id) {

        const element = getElement(id);

        if (element) {
            element.textContent = fields[id];
        }
    });


    adoptButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "adoption.html?animal=" +
                encodeURIComponent(animal.name);
        }
    );
}


/* =========================================================
   ADOPTION APPLICATION
   ========================================================= */

function getApplications() {

    return JSON.parse(
        localStorage.getItem(
            "adoptionApplications"
        ) || "[]"
    );
}

function saveApplications(applications) {

    localStorage.setItem(
        "adoptionApplications",
        JSON.stringify(applications)
    );
}


function initializeAdoptionForm() {

    const form = getElement("adoptionForm");

    if (!form) {
        return;
    }


    const selectedAnimal =
        getElement("selectedAnimal");


    /* -------------------------
       GET ANIMAL FROM URL
       ------------------------- */

    const params =
        new URLSearchParams(window.location.search);

    const animalName =
        params.get("animal");


    if (selectedAnimal && animalName) {

        selectedAnimal.value =
            animalName;
    }


    /* -------------------------
       SUBMIT
       ------------------------- */

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const firstName =
                getElement("firstName").value.trim();

            const lastName =
                getElement("lastName").value.trim();

            const email =
                getElement("email").value.trim();

            const phone =
                getElement("phone").value.trim();

            const address =
                getElement("address").value.trim();

            const animal =
                getElement("selectedAnimal").value;

            const housing =
                getElement("housingType").value;

            const reason =
                getElement("reason").value.trim();

            const experience =
                getElement("experience").value.trim();


            const agreement =
                document.querySelector(
                    "#adoptionForm input[type='checkbox']"
                );


            if (
                !firstName ||
                !lastName ||
                !email ||
                !phone ||
                !address ||
                !animal ||
                !housing ||
                !reason ||
                !experience
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;
            }


            if (agreement && !agreement.checked) {

                alert(
                    "Please confirm the agreement before submitting."
                );

                return;
            }


            const application = {

                id: Date.now(),

                applicantName:
                    firstName + " " + lastName,

                firstName:
                    firstName,

                lastName:
                    lastName,

                email:
                    email,

                phone:
                    phone,

                address:
                    address,

                animal:
                    animal,

                housing:
                    housing,

                reason:
                    reason,

                experience:
                    experience,

                status:
                    "Pending",

                date:
                    new Date().toLocaleDateString()
            };


            const applications =
                getApplications();


            applications.push(application);


            saveApplications(applications);


            form.reset();


            if (selectedAnimal && animalName) {
                selectedAnimal.value =
                    animalName;
            }


            const success =
                getElement("applicationSuccess");


            if (success) {
                success.style.display = "block";

                success.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            } else {

                alert(
                    "Application submitted successfully."
                );
            }
        }
    );
}


/* =========================================================
   USER MANAGEMENT
   ========================================================= */

function getUsers() {

    const users =
        JSON.parse(
            localStorage.getItem(
                "animalCareUsers"
            ) || "null"
        );


    if (users) {
        return users;
    }


    const defaultUsers = [

        {
            id: 1,

            username: "admin",

            password: "admin123",

            role: "Administrator"
        }

    ];


    localStorage.setItem(
        "animalCareUsers",
        JSON.stringify(defaultUsers)
    );


    return defaultUsers;
}


function saveUsers(users) {

    localStorage.setItem(
        "animalCareUsers",
        JSON.stringify(users)
    );
}


/* =========================================================
   LOGIN
   ========================================================= */

function initializeLoginPage() {

    const form =
        getElement("loginForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                getElement("username")?.value.trim();

            const password =
                getElement("password")?.value;


            const users =
                getUsers();


            const user =
                users.find(function (account) {

                    return (
                        account.username === username &&
                        account.password === password
                    );
                });


            const message =
                getElement("loginMessage");


            if (!user) {

                if (message) {

                    message.textContent =
                        "Invalid username or password.";

                    message.style.display =
                        "block";
                }

                return;
            }


            localStorage.setItem(
                "animalCareLoggedIn",
                "true"
            );


            localStorage.setItem(
                "animalCareUser",
                JSON.stringify(user)
            );


            window.location.href =
                "dashboard.html";
        }
    );
}


/* =========================================================
   PROTECT DASHBOARD
   ========================================================= */

function protectDashboard() {

    if (!document.body.classList.contains("dashboard-page")) {
        return;
    }


    const loggedIn =
        localStorage.getItem(
            "animalCareLoggedIn"
        );


    if (loggedIn !== "true") {

        window.location.href =
            "login.html";
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

function initializeLogout() {

    const logoutButton =
        getElement("logoutButton");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "animalCareLoggedIn"
            );

            localStorage.removeItem(
                "animalCareUser"
            );


            window.location.href =
                "login.html";
        }
    );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function initializeDashboard() {

    if (
        !document.body.classList.contains(
            "dashboard-page"
        )
    ) {
        return;
    }


    const animals =
        getAnimalRecords();


    const applications =
        getApplications();


    const medicalRecords =
        getMedicalRecords();


    const availableAnimals =
        animals.filter(function (animal) {

            return (
                (animal.status || "").toLowerCase() ===
                "available"
            );
        });


    const pendingApplications =
        applications.filter(function (application) {

            return (
                (application.status || "").toLowerCase() ===
                "pending"
            );
        });


    if (getElement("totalAnimals")) {

        getElement("totalAnimals").textContent =
            animals.length;
    }


    if (getElement("availableAnimals")) {

        getElement("availableAnimals").textContent =
            availableAnimals.length;
    }


    if (getElement("pendingApplications")) {

        getElement("pendingApplications").textContent =
            pendingApplications.length;
    }


    if (getElement("medicalMonitoring")) {

        getElement("medicalMonitoring").textContent =
            medicalRecords.length;
    }


    renderApplications();
    renderReports();
    renderUsers();
}


/* =========================================================
   APPLICATIONS
   ========================================================= */

function renderApplications() {

    const container =
        getElement("applicationList");


    if (!container) {
        return;
    }


    const applications =
        getApplications();


    container.innerHTML = "";


    if (applications.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>

                <h3>No Applications Yet</h3>

                <p>
                    Adoption applications will appear here.
                </p>
            </div>
        `;

        return;
    }


    applications.forEach(function (application) {

        const card =
            document.createElement("div");


        card.className =
            "application-card";


        card.innerHTML = `

            <div class="application-info">

                <h3>
                    ${escapeHTML(
                        application.applicantName
                    )}
                </h3>

                <p>
                    <strong>Animal:</strong>
                    ${escapeHTML(
                        application.animal
                    )}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(
                        application.email
                    )}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(
                        application.phone
                    )}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${escapeHTML(
                        application.date
                    )}
                </p>

            </div>


            <div class="application-status">

                <span class="status-${application.status.toLowerCase()}">
                    ${escapeHTML(
                        application.status
                    )}
                </span>

            </div>


            <div class="application-actions">

                ${
                    application.status === "Pending"
                        ? `
                            <button
                                class="approve-application-btn"
                                data-id="${application.id}"
                            >
                                Approve
                            </button>

                            <button
                                class="reject-application-btn"
                                data-id="${application.id}"
                            >
                                Reject
                            </button>
                        `
                        : ""
                }

            </div>
        `;


        container.appendChild(card);
    });


    container
        .querySelectorAll(
            ".approve-application-btn"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    updateApplicationStatus(
                        button.dataset.id,
                        "Approved"
                    );
                }
            );
        });


    container
        .querySelectorAll(
            ".reject-application-btn"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    updateApplicationStatus(
                        button.dataset.id,
                        "Rejected"
                    );
                }
            );
        });
}


/* =========================================================
   UPDATE APPLICATION STATUS
   ========================================================= */

function updateApplicationStatus(
    id,
    status
) {

    const applications =
        getApplications();


    const application =
        applications.find(
            item => item.id == id
        );


    if (!application) {
        return;
    }


    application.status =
        status;


    saveApplications(
        applications
    );


    renderApplications();
    renderReports();
    initializeDashboard();
}


/* =========================================================
   MEDICAL RECORDS
   ========================================================= */

function getMedicalRecords() {

    return JSON.parse(
        localStorage.getItem(
            "medicalRecords"
        ) || "[]"
    );
}


function saveMedicalRecords(records) {

    localStorage.setItem(
        "medicalRecords",
        JSON.stringify(records)
    );
}


/* =========================================================
   INITIALIZE MEDICAL RECORDS
   ========================================================= */

function initializeMedicalRecords() {

    const form =
        getElement("medicalForm");


    if (!form) {
        return;
    }


    const showForm =
        getElement("showMedicalForm");


    const cancelForm =
        getElement("cancelMedicalForm");


    const search =
        getElement("medicalSearch");


    const filter =
        getElement("medicalFilter");


    if (showForm) {

        showForm.addEventListener(
            "click",
            function () {

                form.reset();

                getElement(
                    "editMedicalId"
                ).value = "";

                getElement(
                    "medicalFormSection"
                ).style.display = "block";
            }
        );
    }


    if (cancelForm) {

        cancelForm.addEventListener(
            "click",
            function () {

                form.reset();

                getElement(
                    "editMedicalId"
                ).value = "";

                getElement(
                    "medicalFormSection"
                ).style.display = "none";
            }
        );
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const animal =
                getElement(
                    "medicalAnimal"
                ).value.trim();

            const health =
                getElement(
                    "medicalHealth"
                ).value;

            const vaccination =
                getElement(
                    "medicalVaccination"
                ).value.trim();

            const date =
                getElement(
                    "medicalDate"
                ).value;

            const treatment =
                getElement(
                    "medicalTreatment"
                ).value.trim();

            const notes =
                getElement(
                    "medicalNotes"
                ).value.trim();


            if (
                !animal ||
                !health ||
                !vaccination ||
                !date ||
                !treatment ||
                !notes
            ) {

                alert(
                    "Please complete all medical record fields."
                );

                return;
            }


            let records =
                getMedicalRecords();


            const editId =
                getElement(
                    "editMedicalId"
                ).value;


            if (editId) {

                const index =
                    records.findIndex(
                        record =>
                            record.id == editId
                    );


                if (index !== -1) {

                    records[index] = {

                        ...records[index],

                        animal,
                        health,
                        vaccination,
                        date,
                        treatment,
                        notes
                    };
                }

            } else {

                records.push({

                    id: Date.now(),

                    animal,
                    health,
                    vaccination,
                    date,
                    treatment,
                    notes
                });
            }


            saveMedicalRecords(
                records
            );


            form.reset();

            getElement(
                "editMedicalId"
            ).value = "";


            getElement(
                "medicalFormSection"
            ).style.display = "none";


            renderMedicalRecords();
        }
    );


    if (search) {

        search.addEventListener(
            "input",
            renderMedicalRecords
        );
    }


    if (filter) {

        filter.addEventListener(
            "change",
            renderMedicalRecords
        );
    }


    renderMedicalRecords();
}


/* =========================================================
   RENDER MEDICAL RECORDS
   ========================================================= */

function renderMedicalRecords() {

    const container =
        getElement(
            "medicalRecordList"
        );


    if (!container) {
        return;
    }


    const records =
        getMedicalRecords();


    const search =
        getElement(
            "medicalSearch"
        );


    const filter =
        getElement(
            "medicalFilter"
        );


    const searchValue =
        search
            ? search.value.toLowerCase().trim()
            : "";


    const filterValue =
        filter
            ? filter.value.toLowerCase()
            : "all";


    const filtered =
        records.filter(
            function (record) {

                const matchesSearch =
                    record.animal
                        .toLowerCase()
                        .includes(
                            searchValue
                        );


                const matchesFilter =
                    filterValue === "all" ||
                    record.health
                        .toLowerCase()
                        .includes(
                            filterValue
                        );


                return (
                    matchesSearch &&
                    matchesFilter
                );
            }
        );


    container.innerHTML = "";


    const noRecords =
        getElement(
            "noMedicalRecords"
        );


    if (filtered.length === 0) {

        if (noRecords) {
            noRecords.style.display =
                "block";
        }

        return;
    }


    if (noRecords) {
        noRecords.style.display =
            "none";
    }


    filtered.forEach(
        function (record) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "medical-record-card";


            card.innerHTML = `

                <div class="medical-record-header">

                    <div>

                        <h3>
                            ${escapeHTML(
                                record.animal
                            )}
                        </h3>

                        <span>
                            ${escapeHTML(
                                record.health
                            )}
                        </span>

                    </div>

                    <span>
                        ${escapeHTML(
                            record.date
                        )}
                    </span>

                </div>


                <div class="medical-record-info">

                    <p>
                        <strong>
                            Vaccination:
                        </strong>

                        ${escapeHTML(
                            record.vaccination
                        )}
                    </p>

                    <p>
                        <strong>
                            Treatment:
                        </strong>

                        ${escapeHTML(
                            record.treatment
                        )}
                    </p>

                    <p>
                        <strong>
                            Notes:
                        </strong>

                        ${escapeHTML(
                            record.notes
                        )}
                    </p>

                </div>


                <div class="medical-record-actions">

                    <button
                        class="edit-medical-btn"
                        data-id="${record.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-medical-btn"
                        data-id="${record.id}"
                    >
                        Delete
                    </button>

                </div>
            `;


            container.appendChild(
                card
            );
        }
    );


    container
        .querySelectorAll(
            ".edit-medical-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        editMedicalRecord(
                            button.dataset.id
                        );
                    }
                );
            }
        );


    container
        .querySelectorAll(
            ".delete-medical-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteMedicalRecord(
                            button.dataset.id
                        );
                    }
                );
            }
        );
}


/* =========================================================
   EDIT MEDICAL RECORD
   ========================================================= */

function editMedicalRecord(id) {

    const records =
        getMedicalRecords();


    const record =
        records.find(
            item => item.id == id
        );


    if (!record) {
        return;
    }


    getElement(
        "editMedicalId"
    ).value =
        record.id;


    getElement(
        "medicalAnimal"
    ).value =
        record.animal;


    getElement(
        "medicalHealth"
    ).value =
        record.health;


    getElement(
        "medicalVaccination"
    ).value =
        record.vaccination;


    getElement(
        "medicalDate"
    ).value =
        record.date;


    getElement(
        "medicalTreatment"
    ).value =
        record.treatment;


    getElement(
        "medicalNotes"
    ).value =
        record.notes;


    getElement(
        "medicalFormSection"
    ).style.display =
        "block";


    getElement(
        "medicalFormSection"
    ).scrollIntoView({
        behavior: "smooth"
    });
}


/* =========================================================
   DELETE MEDICAL RECORD
   ========================================================= */

function deleteMedicalRecord(id) {

    if (
        !confirm(
            "Are you sure you want to delete this medical record?"
        )
    ) {
        return;
    }


    let records =
        getMedicalRecords();


    records =
        records.filter(
            record => record.id != id
        );


    saveMedicalRecords(
        records
    );


    renderMedicalRecords();
}


/* =========================================================
   CARE RECORDS
   ========================================================= */

function getCareRecords() {

    return JSON.parse(
        localStorage.getItem(
            "careRecords"
        ) || "[]"
    );
}


function saveCareRecords(records) {

    localStorage.setItem(
        "careRecords",
        JSON.stringify(records)
    );
}


/* =========================================================
   INITIALIZE CARE MONITORING
   ========================================================= */

function initializeCareMonitoring() {

    const form =
        getElement("careForm");


    if (!form) {
        return;
    }


    const showForm =
        getElement("showCareForm");


    const cancelForm =
        getElement("cancelCareForm");


    const search =
        getElement("careSearch");


    const filter =
        getElement("careFilter");


    if (showForm) {

        showForm.addEventListener(
            "click",
            function () {

                form.reset();

                getElement(
                    "editCareId"
                ).value = "";

                getElement(
                    "careFormSection"
                ).style.display =
                    "block";
            }
        );
    }


    if (cancelForm) {

        cancelForm.addEventListener(
            "click",
            function () {

                form.reset();

                getElement(
                    "editCareId"
                ).value = "";

                getElement(
                    "careFormSection"
                ).style.display =
                    "none";
            }
        );
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const animal =
                getElement(
                    "careAnimal"
                ).value.trim();

            const type =
                getElement(
                    "careType"
                ).value;

            const date =
                getElement(
                    "careDate"
                ).value;

            const status =
                getElement(
                    "careStatus"
                ).value;

            const notes =
                getElement(
                    "careNotes"
                ).value.trim();


            if (
                !animal ||
                !type ||
                !date ||
                !status ||
                !notes
            ) {

                alert(
                    "Please complete all care monitoring fields."
                );

                return;
            }


            let records =
                getCareRecords();


            const editId =
                getElement(
                    "editCareId"
                ).value;


            if (editId) {

                const index =
                    records.findIndex(
                        record =>
                            record.id == editId
                    );


                if (index !== -1) {

                    records[index] = {

                        ...records[index],

                        animal,
                        type,
                        date,
                        status,
                        notes
                    };
                }

            } else {

                records.push({

                    id: Date.now(),

                    animal,
                    type,
                    date,
                    status,
                    notes
                });
            }


            saveCareRecords(
                records
            );


            form.reset();


            getElement(
                "editCareId"
            ).value = "";


            getElement(
                "careFormSection"
            ).style.display =
                "none";


            renderCareRecords();
        }
    );


    if (search) {

        search.addEventListener(
            "input",
            renderCareRecords
        );
    }


    if (filter) {

        filter.addEventListener(
            "change",
            renderCareRecords
        );
    }


    renderCareRecords();
}


/* =========================================================
   RENDER CARE RECORDS
   ========================================================= */

function renderCareRecords() {

    const container =
        getElement(
            "careRecordList"
        );


    if (!container) {
        return;
    }


    const records =
        getCareRecords();


    const search =
        getElement(
            "careSearch"
        );


    const filter =
        getElement(
            "careFilter"
        );


    const searchValue =
        search
            ? search.value.toLowerCase().trim()
            : "";


    const filterValue =
        filter
            ? filter.value.toLowerCase()
            : "all";


    const filtered =
        records.filter(
            function (record) {

                const matchesSearch =
                    record.animal
                        .toLowerCase()
                        .includes(
                            searchValue
                        );


                const matchesFilter =
                    filterValue === "all" ||
                    record.status
                        .toLowerCase()
                        .includes(
                            filterValue
                        );


                return (
                    matchesSearch &&
                    matchesFilter
                );
            }
        );


    container.innerHTML = "";


    const noRecords =
        getElement(
            "noCareRecords"
        );


    if (filtered.length === 0) {

        if (noRecords) {
            noRecords.style.display =
                "block";
        }

        return;
    }


    if (noRecords) {
        noRecords.style.display =
            "none";
    }


    filtered.forEach(
        function (record) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "care-record-card";


            card.innerHTML = `

                <div class="care-record-header">

                    <div>

                        <h3>
                            ${escapeHTML(
                                record.animal
                            )}
                        </h3>

                        <span>
                            ${escapeHTML(
                                record.type
                            )}
                        </span>

                    </div>

                    <span>
                        ${escapeHTML(
                            record.status
                        )}
                    </span>

                </div>


                <div class="care-record-info">

                    <p>
                        <strong>
                            Date:
                        </strong>

                        ${escapeHTML(
                            record.date
                        )}
                    </p>

                    <p>
                        <strong>
                            Notes:
                        </strong>

                        ${escapeHTML(
                            record.notes
                        )}
                    </p>

                </div>


                <div class="care-record-actions">

                    <button
                        class="edit-care-btn"
                        data-id="${record.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-care-btn"
                        data-id="${record.id}"
                    >
                        Delete
                    </button>

                </div>
            `;


            container.appendChild(
                card
            );
        }
    );


    container
        .querySelectorAll(
            ".edit-care-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        editCareRecord(
                            button.dataset.id
                        );
                    }
                );
            }
        );


    container
        .querySelectorAll(
            ".delete-care-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteCareRecord(
                            button.dataset.id
                        );
                    }
                );
            }
        );
}


/* =========================================================
   EDIT CARE RECORD
   ========================================================= */

function editCareRecord(id) {

    const records =
        getCareRecords();


    const record =
        records.find(
            item => item.id == id
        );


    if (!record) {
        return;
    }


    getElement(
        "editCareId"
    ).value =
        record.id;


    getElement(
        "careAnimal"
    ).value =
        record.animal;


    getElement(
        "careType"
    ).value =
        record.type;


    getElement(
        "careDate"
    ).value =
        record.date;


    getElement(
        "careStatus"
    ).value =
        record.status;


    getElement(
        "careNotes"
    ).value =
        record.notes;


    getElement(
        "careFormSection"
    ).style.display =
        "block";


    getElement(
        "careFormSection"
    ).scrollIntoView({
        behavior: "smooth"
    });
}


/* =========================================================
   DELETE CARE RECORD
   ========================================================= */

function deleteCareRecord(id) {

    if (
        !confirm(
            "Are you sure you want to delete this care record?"
        )
    ) {
        return;
    }


    let records =
        getCareRecords();


    records =
        records.filter(
            record => record.id != id
        );


    saveCareRecords(
        records
    );


    renderCareRecords();
}


/* =========================================================
   REPORTS
   ========================================================= */

function renderReports() {

    const animals =
        getAnimalRecords();


    const applications =
        getApplications();


    const medicalRecords =
        getMedicalRecords();


    const available =
        animals.filter(
            animal =>
                (animal.status || "")
                    .toLowerCase() ===
                "available"
        );


    const adopted =
        animals.filter(
            animal =>
                (animal.status || "")
                    .toLowerCase() ===
                "adopted"
        );


    const pending =
        applications.filter(
            application =>
                (application.status || "")
                    .toLowerCase() ===
                "pending"
        );


    const approved =
        applications.filter(
            application =>
                (application.status || "")
                    .toLowerCase() ===
                "approved"
        );


    const rejected =
        applications.filter(
            application =>
                (application.status || "")
                    .toLowerCase() ===
                "rejected"
        );


    const healthy =
        medicalRecords.filter(
            record =>
                (record.health || "")
                    .toLowerCase() ===
                "healthy"
        );


    const treatment =
        medicalRecords.filter(
            record =>
                (record.health || "")
                    .toLowerCase()
                    .includes(
                        "treatment"
                    )
        );


    const monitoring =
        medicalRecords.filter(
            record =>
                (record.health || "")
                    .toLowerCase()
                    .includes(
                        "monitor"
                    )
        );


    const reportValues = {

        reportTotalAnimals:
            animals.length,

        reportAvailableAnimals:
            available.length,

        reportAdoptedAnimals:
            adopted.length,

        reportPendingAnimals:
            pending.length,

        reportMedicalTotal:
            medicalRecords.length,

        reportHealthy:
            healthy.length,

        reportTreatment:
            treatment.length,

        reportMonitoring:
            monitoring.length,

        reportApplications:
            applications.length,

        reportPendingApplications:
            pending.length,

        reportApprovedApplications:
            approved.length,

        reportRejectedApplications:
            rejected.length
    };


    Object.keys(reportValues)
        .forEach(function (id) {

            const element =
                getElement(id);

            if (element) {

                element.textContent =
                    reportValues[id];
            }
        });
}


/* =========================================================
   PRINT REPORT
   ========================================================= */

function initializePrintReport() {

    const button =
        getElement(
            "printReport"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            window.print();
        }
    );
}


/* =========================================================
   RENDER USERS
   ========================================================= */

function renderUsers() {

    const container =
        getElement(
            "userList"
        );


    if (!container) {
        return;
    }


    const users =
        getUsers();


    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "animalCareUser"
            ) || "null"
        );


    container.innerHTML = "";


    users.forEach(
        function (user) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "user-card";


            const isCurrentUser =
                currentUser &&
                currentUser.username ===
                    user.username;


            card.innerHTML = `

                <div class="user-info">

                    <h3>
                        ${escapeHTML(
                            user.username
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            user.role
                        )}
                    </p>

                </div>


                <div class="user-actions">

                    ${
                        isCurrentUser
                            ? `
                                <span class="current-user">
                                    Current User
                                </span>
                            `
                            : `
                                <button
                                    class="delete-user-btn"
                                    data-id="${user.id}"
                                >
                                    Delete
                                </button>
                            `
                    }

                </div>
            `;


            container.appendChild(
                card
            );
        }
    );


    container
        .querySelectorAll(
            ".delete-user-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteUser(
                            button.dataset.id
                        );
                    }
                );
            }
        );
}


/* =========================================================
   INITIALIZE USER MANAGEMENT
   ========================================================= */

function initializeUserManagement() {

    const form =
        getElement(
            "userForm"
        );


    const addButton =
        getElement(
            "showUserForm"
        );


    const cancelButton =
        getElement(
            "cancelUserForm"
        );


    if (!form) {
        return;
    }


    if (addButton) {

        addButton.addEventListener(
            "click",
            function () {

                form.reset();

                form.style.display =
                    "block";
            }
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                form.reset();

                form.style.display =
                    "none";
            }
        );
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                getElement(
                    "newUsername"
                ).value.trim();


            const password =
                getElement(
                    "newPassword"
                ).value;


            const role =
                getElement(
                    "newUserRole"
                ).value;


            if (
                !username ||
                !password ||
                !role
            ) {

                alert(
                    "Please complete all user fields."
                );

                return;
            }


            const users =
                getUsers();


            const exists =
                users.some(
                    user =>
                        user.username
                            .toLowerCase() ===
                        username.toLowerCase()
                );


            if (exists) {

                alert(
                    "Username already exists."
                );

                return;
            }


            users.push({

                id: Date.now(),

                username,

                password,

                role
            });


            saveUsers(
                users
            );


            form.reset();

            form.style.display =
                "none";


            renderUsers();


            alert(
                "User account added successfully."
            );
        }
    );


    renderUsers();
}


/* =========================================================
   DELETE USER
   ========================================================= */

function deleteUser(id) {

    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "animalCareUser"
            ) || "null"
        );


    const users =
        getUsers();


    const user =
        users.find(
            item => item.id == id
        );


    if (!user) {
        return;
    }


    if (
        currentUser &&
        currentUser.username ===
            user.username
    ) {

        alert(
            "You cannot delete the account currently in use."
        );

        return;
    }


    if (
        !confirm(
            "Are you sure you want to delete this user?"
        )
    ) {
        return;
    }


    const updatedUsers =
        users.filter(
            item => item.id != id
        );


    saveUsers(
        updatedUsers
    );


    renderUsers();
}



/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* Security */
        protectDashboard();


        /* Animal pages */
        initializeAnimalManagement();
        initializeAnimalRecordSearch();
        initializeAvailableAnimals();
        initializeAnimalDetail();


        /* Adoption */
        initializeAdoptionForm();


        /* Login */
        initializeLoginPage();


        /* Logout */
        initializeLogout();


        /* Dashboard */
        initializeDashboard();


        /* Medical */
        initializeMedicalRecords();


        /* Care */
        initializeCareMonitoring();


        /* Reports */
        initializePrintReport();


        /* Users */
        initializeUserManagement();

    }
);
/* =========================================================
   ADOPTER REGISTRATION
   ========================================================= */

function initializeAdopterRegistration() {

    const form = document.getElementById("adopterRegisterForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const fullName = document.getElementById("adopterFullName").value.trim();
        const email = document.getElementById("adopterEmail").value.trim().toLowerCase();
        const phone = document.getElementById("adopterPhone").value.trim();
        const username = document.getElementById("adopterUsername").value.trim();
        const password = document.getElementById("adopterPassword").value;
        const confirmPassword = document.getElementById("adopterConfirmPassword").value;
        const message = document.getElementById("adopterRegisterMessage");

        function showMessage(text, success = false) {
            message.textContent = text;
            message.style.display = "block";
            message.style.background = success ? "#e3f2e1" : "#f4dfd8";
            message.style.color = success ? "#285b2b" : "#7d4031";
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            showMessage("Password must contain at least 6 characters.");
            return;
        }

        let adopters = [];

        try {
            adopters = JSON.parse(
                localStorage.getItem("animalCareAdopters") || "[]"
            );
        } catch (error) {
            showMessage("Unable to read adopter accounts.");
            return;
        }

        const existingAccount = adopters.find(function (adopter) {
            return (
                adopter.username.toLowerCase() === username.toLowerCase() ||
                adopter.email.toLowerCase() === email
            );
        });

        if (existingAccount) {
            showMessage("Username or email is already registered.");
            return;
        }

        adopters.push({
            id: Date.now(),
            fullName: fullName,
            email: email,
            phone: phone,
            username: username,
            password: password
        });

        localStorage.setItem(
            "animalCareAdopters",
            JSON.stringify(adopters)
        );

        showMessage("Registration successful! You can now log in.", true);

        form.reset();

        setTimeout(function () {
            window.location.href = "adopter-login.html";
        }, 1500);
    });
}


/* =========================================================
   ADOPTER LOGIN
   ========================================================= */

function initializeAdopterLogin() {

    const form = document.getElementById("adopterLoginForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const username = document.getElementById("adopterLoginUsername").value.trim();
        const password = document.getElementById("adopterLoginPassword").value;
        const message = document.getElementById("adopterLoginMessage");

        function showMessage(text) {
            message.textContent = text;
            message.style.display = "block";
            message.style.background = "#f4dfd8";
            message.style.color = "#7d4031";
        }

        let adopters = [];

        try {
            adopters = JSON.parse(
                localStorage.getItem("animalCareAdopters") || "[]"
            );
        } catch (error) {
            showMessage("Unable to read adopter accounts.");
            return;
        }

        const adopter = adopters.find(function (account) {
            return (
                account.username.toLowerCase() === username.toLowerCase() &&
                account.password === password
            );
        });

        if (!adopter) {
            showMessage("Invalid username or password.");
            return;
        }

        const loggedInAdopter = {
            id: adopter.id,
            fullName: adopter.fullName,
            email: adopter.email,
            phone: adopter.phone,
            username: adopter.username
        };

        localStorage.setItem("animalCareAdopterLoggedIn", "true");

        localStorage.setItem(
            "animalCareAdopter",
            JSON.stringify(loggedInAdopter)
        );

        window.location.href = "adoption.html";
    });
}


/* =========================================================
   INITIALIZE ADOPTER PAGES
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", function () {
        initializeAdopterRegistration();
        initializeAdopterLogin();
    });

} else {

    initializeAdopterRegistration();
    initializeAdopterLogin();

}
function initializeAppointmentEmail() {
    document.querySelectorAll(".application-card").forEach(card => {
        if (card.querySelector(".appointment-email-form")) return;

        const info = card.querySelector(".application-info");
        if (!info) return;

        const email = info.innerText.match(/Email:\s*([^\s]+)/)?.[1];
        const name = info.querySelector("h3")?.textContent.trim();

        if (!email || !name) return;

        const form = document.createElement("div");
        form.className = "appointment-email-form";

        form.innerHTML = `
            <h4>Schedule Adoption Meeting</h4>

            <label>Meeting Date</label>
            <input type="date" class="meeting-date" required>

            <label>Meeting Time</label>
            <input type="time" class="meeting-time" required>

            <button type="button" class="send-appointment-btn">
                Send Appointment Email
            </button>

            <p class="appointment-message"></p>
        `;

        card.appendChild(form);

        form.querySelector(".send-appointment-btn")
            .addEventListener("click", async () => {
                const date = form.querySelector(".meeting-date").value;
                const time = form.querySelector(".meeting-time").value;
                const message = form.querySelector(".appointment-message");

                if (!date || !time) {
                    message.textContent = "Please select a date and time.";
                    return;
                }

                try {
                    const response = await fetch("send-appointment.php", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: name,
                            email: email,
                            date: date,
                            time: time
                        })
                    });

                    const result = await response.json();
                    message.textContent = result.message;

                } catch (error) {
                    message.textContent = "Unable to send email.";
                }
            });
    });
}

/* =========================================
   KEEP ADOPTER LOGGED IN
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const isLoggedIn =
        localStorage.getItem("animalCareAdopterLoggedIn");

    const adopter =
        localStorage.getItem("animalCareAdopter");

    const currentPage =
        window.location.pathname.split("/").pop();

    if (isLoggedIn === "true" && adopter) {

        if (
            currentPage === "adopter-login.html" ||
            currentPage === "register.html"
        ) {
            window.location.href = "adoption.html";
        }

    }

});
/* =========================================
   REDIRECT ADOPTERS TO HOME PAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const isLoggedIn =
        localStorage.getItem("animalCareAdopterLoggedIn");

    const adopter =
        localStorage.getItem("animalCareAdopter");

    const currentPage =
        window.location.pathname.split("/").pop();

    if (
        isLoggedIn === "true" &&
        adopter &&
        (currentPage === "adopter-login.html" ||
         currentPage === "register.html")
    ) {
        window.location.href = "index.html";
    }

    const loginForm = document.getElementById("adopterLoginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function () {
            setTimeout(function () {
                if (
                    localStorage.getItem("animalCareAdopterLoggedIn") === "true"
                ) {
                    window.location.href = "index.html";
                }
            }, 100);
        });
    }

});

/* =========================================
   SHOW ADOPTER PROFILE LINK ON HOME PAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const isLoggedIn =
        localStorage.getItem("animalCareAdopterLoggedIn");

    const adopter =
        localStorage.getItem("animalCareAdopter");

    const currentPage =
        window.location.pathname.split("/").pop();

    if (
        isLoggedIn !== "true" ||
        !adopter ||
        (currentPage !== "index.html" && currentPage !== "")
    ) {
        return;
    }

    const navigation = document.querySelector(".nav-links");

    if (!navigation || navigation.querySelector(".adopter-profile-link")) {
        return;
    }

    const profileLink = document.createElement("a");

    profileLink.href = "profile.html";
    profileLink.textContent = "My Profile";
    profileLink.className = "adopter-profile-link";

    const loginLink = navigation.querySelector('a[href="login.html"]');

    if (loginLink) {
        navigation.insertBefore(profileLink, loginLink);
    } else {
        navigation.appendChild(profileLink);
    }

});
