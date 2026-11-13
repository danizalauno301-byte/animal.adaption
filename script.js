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
        "assets/images/dog-1.jpg",

    cat:
        "assets/images/cat-1.jpg",

    default:
        "assets/images/dog-2.jpg"
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

function animalKey(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
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
    return window.databaseFlush ? window.databaseFlush() : Promise.resolve();
}


/* =========================================================
   ANIMAL PHOTO UPLOAD
   ========================================================= */

async function uploadAnimalPhoto(file) {
    if (!file) {
        return "";
    }
    if (file.size > 2 * 1024 * 1024) {
        throw new Error("The selected photo is larger than 2 MB.");
    }

    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch("api.php?action=upload-image", {
        method: "POST",
        body: formData,
        credentials: "same-origin"
    });
    const result = await response.json().catch(function () {
        return { success: false, message: "The photo upload returned an invalid response." };
    });
    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to upload the animal photo.");
    }
    return result.path || "";
}


/* =========================================================
   ANIMAL MANAGEMENT
   ========================================================= */

async function initializeAnimalManagement() {

    const animalForm = getElement("animalForm");
    const showAddAnimalForm = getElement("showAddAnimalForm");
    const cancelAnimalForm = getElement("cancelAnimalForm");

    if (!animalForm) {
        return;
    }

    if (!window.animalCatalogInitialized && getAnimalRecords().length === 0) {
        const defaultRecords = Object.values(animalDetails).map(function (animal, index) {
            return Object.assign({ id: index + 1 }, animal);
        });
        await saveAnimalRecords(defaultRecords);
    }


    /* -------------------------
       SHOW ADD FORM
       ------------------------- */

    const animalFormSection = getElement("animalFormSection");
    const animalFormTitle = getElement("animalFormTitle");

    function showAnimalForm(title) {
        if (animalFormSection) {
            animalFormSection.style.display = "block";
        }
        animalForm.style.display = "block";
        if (animalFormTitle) {
            animalFormTitle.textContent = title;
        }
        (animalFormSection || animalForm).scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function hideAnimalForm() {
        animalForm.style.display = "none";
        if (animalFormSection) {
            animalFormSection.style.display = "none";
        }
    }

    const photoField = getElement("animalPhoto");
    if (photoField) {
        photoField.addEventListener("change", function () {
            const preview = getElement("animalImagePreview");
            const file = photoField.files && photoField.files[0];
            if (!preview || !file) {
                if (preview) {
                    preview.style.display = "none";
                }
                return;
            }
            const reader = new FileReader();
            reader.onload = function () {
                preview.src = reader.result;
                preview.style.display = "block";
            };
            reader.readAsDataURL(file);
        });
    }

    if (showAddAnimalForm) {
        showAddAnimalForm.addEventListener("click", function () {

            animalForm.reset();

            const editAnimalId = getElement("editAnimalId");

            if (editAnimalId) {
                editAnimalId.value = "";
            }

            const imagePreview = getElement("animalImagePreview");
            if (imagePreview) {
                imagePreview.style.display = "none";
                imagePreview.removeAttribute("src");
            }

            const imageValue = getElement("animalImage");
            if (imageValue) {
                imageValue.value = "";
            }

            showAnimalForm("Add New Animal");
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

            hideAnimalForm();
        });
    }


    /* -------------------------
       SAVE ANIMAL
       ------------------------- */

    animalForm.addEventListener("submit", async function (event) {

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


        let image = getElement("animalImage")?.value.trim() || "";
        const photoInput = getElement("animalPhoto");

        if (photoInput && photoInput.files && photoInput.files[0]) {
            try {
                image = await uploadAnimalPhoto(photoInput.files[0]);
            } catch (error) {
                alert(error.message);
                return;
            }
        }

        const imageValue = getElement("animalImage");
        if (imageValue) {
            imageValue.value = image;
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
                    description: description,
                    image: image
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
                description: description,
                image: image
            };

            records.push(newAnimal);
        }


        await saveAnimalRecords(records);

        animalForm.reset();

        if (editAnimalId) {
            editAnimalId.value = "";
        }

        const imagePreview = getElement("animalImagePreview");
        if (imagePreview) {
            imagePreview.style.display = "none";
            imagePreview.removeAttribute("src");
        }

        hideAnimalForm();

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
            animal.image ||
            animalRecordImages[animalType] ||
            animalRecordImages.default;


        const card = document.createElement("div");

        card.className = "animal-record-card";

        const recordStatusClass = String(animal.status || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");

        const recordHealthClass = String(animal.health || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");


        card.innerHTML = `
            <div class="animal-record-layout">

                <img
                    src="${image}"
                    alt="${escapeHTML(animal.name)}"
                    class="animal-record-image"
                    loading="lazy"
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

                        <span class="animal-record-status status-${recordStatusClass}">
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
                            <span class="health-pill health-${recordHealthClass}">${escapeHTML(animal.health)}</span>
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

                        <a
                            class="view-animal-btn admin-view-btn"
                            href="animal-detail.html?animal=${encodeURIComponent(animal.id)}"
                            target="_blank"
                            rel="noopener"
                        >
                            View
                        </a>

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

    const imageInput = getElement("animalImage");
    if (imageInput) {
        imageInput.value = animal.image || "";
    }

    const preview = getElement("animalImagePreview");
    if (preview) {
        if (animal.image) {
            preview.src = animal.image;
            preview.style.display = "block";
        } else {
            preview.style.display = "none";
            preview.removeAttribute("src");
        }
    }

    const photoInput = getElement("animalPhoto");
    if (photoInput) {
        photoInput.value = "";
    }

    animalForm.style.display = "block";

    const section = getElement("animalFormSection");
    if (section) {
        section.style.display = "block";
    }

    const title = getElement("animalFormTitle");
    if (title) {
        title.textContent = "Edit Animal Record";
    }

    (section || animalForm).scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   DELETE ANIMAL
   ========================================================= */

async function deleteAnimal(id) {

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

    await saveAnimalRecords(records);

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

    const container = getElement("animalList");
    const noResults = getElement("noResults");

    if (window.animalCatalogInitialized && container) {
        function renderDatabaseAnimals() {
            const searchValue = search ? search.value.toLowerCase().trim() : "";
            const typeValue = typeFilter ? typeFilter.value.toLowerCase() : "all";
            const availableRecords = getAnimalRecords();
            const recordsById = new Map(availableRecords.map(function (animal) {
                return [String(animal.id), animal];
            }));
            const recordsByName = new Map();

            (window.animalCatalogMetadata || []).forEach(function (metadata) {
                const key = animalKey(metadata.name);
                if (String(metadata.status || "").trim().toLowerCase() !== "available") {
                    recordsByName.delete(key);
                    return;
                }

                const record = recordsById.get(String(metadata.id));
                if (record) {
                    recordsByName.set(key, record);
                }
            });

            availableRecords.forEach(function (animal) {
                if (String(animal.status || "").trim().toLowerCase() === "available") {
                    recordsByName.set(animalKey(animal.name), animal);
                }
            });

            const records = Array.from(recordsByName.values()).filter(function (animal) {
                const name = String(animal.name || "").toLowerCase();
                const type = String(animal.type || "").toLowerCase();
                const isAvailable = String(animal.status || "").trim().toLowerCase() === "available";
                return isAvailable && name.includes(searchValue) &&
                    (typeValue === "all" || type === typeValue);
            });

            container.innerHTML = records.map(function (animal) {
                const type = String(animal.type || "");
                const emoji = type.toLowerCase() === "cat" ? "🐱" :
                    type.toLowerCase() === "dog" ? "🐶" : "🐾";
                const detailUrl = "animal-detail.html?animal=" +
                    encodeURIComponent(animal.id);
                const fallbackPhoto = animalRecordImages[type.toLowerCase()] || animalRecordImages.default;
                const photo = animal.image
                    ? `<img src="${escapeHTML(animal.image)}" alt="${escapeHTML(animal.name)}" class="public-animal-image" loading="lazy">`
                    : `<img src="${fallbackPhoto}" alt="${escapeHTML(animal.name)}" class="public-animal-image" loading="lazy">`;

                const statusClass = String(animal.status || "")
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-");

                return `
                    <article class="animal-item" data-name="${escapeHTML(animal.name)}" data-type="${escapeHTML(type.toLowerCase())}">
                        <div class="animal-image">${photo}</div>
                        <div class="animal-card-content">
                            <div class="animal-card-top">
                                <h3>${escapeHTML(animal.name)}</h3>
                                <span class="animal-status status-${statusClass}">${escapeHTML(animal.status)}</span>
                            </div>
                            <p class="animal-type">${escapeHTML(type)} &bull; ${escapeHTML(animal.age)} &bull; ${escapeHTML(animal.gender)}</p>
                            <p class="animal-description">${escapeHTML(animal.description)}</p>
                            <div class="animal-info">
                                <span>Health: ${escapeHTML(animal.health)}</span>
                                <span>Vaccination: ${escapeHTML(animal.vaccination)}</span>
                            </div>
                            <a href="${detailUrl}" class="view-animal-btn">View Details</a>
                        </div>
                    </article>
                `;
            }).join("");

            if (noResults) {
                noResults.style.display = records.length === 0 ? "block" : "none";
            }
        }

        search?.addEventListener("input", renderDatabaseAnimals);
        typeFilter?.addEventListener("change", renderDatabaseAnimals);
        renderDatabaseAnimals();
        return;
    }

    const animals = document.querySelectorAll(".animal-item");


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

    const requestedAnimalKey =
        (params.get("animal") || params.get("recordId") || "").toLowerCase();


    const animal = getAnimalRecords().find(function (record) {
        return String(record.id).toLowerCase() === requestedAnimalKey ||
            record.id == params.get("recordId") ||
            animalKey(record.name) === requestedAnimalKey;
    }) || animalDetails[requestedAnimalKey];


    if (!animal) {
        return;
    }

    const emoji = animal.emoji || (String(animal.type).toLowerCase() === "cat" ? "🐱" : "🐶");


    const fields = {

        detailAnimalEmoji: emoji,

        detailStatus: animal.status,

        detailAnimalName: animal.name,

        detailAnimalType: [animal.type, animal.age].filter(Boolean).join(" • "),

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

    const detailStatusElement = getElement("detailStatus");
    if (detailStatusElement) {
        const detailStatusClass = String(animal.status || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
        detailStatusElement.className = "animal-details-status status-" + detailStatusClass;
    }

    const imageContainer = getElement("detailAnimalEmoji");
    const animalType = String(animal.type || "").toLowerCase();
    const detailPhoto = animal.image ||
        animalRecordImages[animalType] ||
        animalRecordImages.default;

    if (imageContainer && detailPhoto) {
        imageContainer.innerHTML = "";
        const imageElement = document.createElement("img");
        imageElement.src = detailPhoto;
        imageElement.alt = animal.name;
        imageElement.className = "animal-detail-photo";
        imageContainer.appendChild(imageElement);
    }


    if (String(animal.status || "").trim().toLowerCase() !== "available") {
        adoptButton.textContent = "Not Available for Adoption";
        adoptButton.removeAttribute("href");
        adoptButton.classList.add("disabled");
        adoptButton.addEventListener("click", function (event) {
            event.preventDefault();
        });
        return;
    }

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

    try {
        const applications = JSON.parse(
            localStorage.getItem(
                "adoptionApplications"
            ) || "[]"
        );

        return Array.isArray(applications) ? applications : [];
    } catch (error) {
        console.error("Unable to read adoption applications:", error);
        return [];
    }
}

function refreshAdoptionApplications() {

    if (!window.databaseRequest) {
        return Promise.resolve(getApplications());
    }

    return window.databaseRequest("api.php?action=state-load")
        .then(function (result) {
            const applications = Array.isArray(result && result.state && result.state.adoptionApplications)
                ? result.state.adoptionApplications
                : [];

            if (result && result.role === "staff") {
                if (window.setLocalCacheJSON) {
                    window.setLocalCacheJSON("adoptionApplications", applications);
                } else {
                    window.setLocalCache("adoptionApplications", JSON.stringify(applications));
                }
            }

            return applications;
        })
        .catch(function () {
            return getApplications();
        });
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

    if (selectedAnimal && window.animalCatalogInitialized) {
        const availableAnimals = getAnimalRecords().filter(function (animal) {
            return String(animal.status || "").trim().toLowerCase() === "available";
        });

        selectedAnimal.innerHTML = "";

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = availableAnimals.length
            ? "-- Select an Animal --"
            : "No animals currently available";
        selectedAnimal.appendChild(placeholder);

        availableAnimals.forEach(function (animal) {
            const option = document.createElement("option");
            option.value = animal.name;
            option.textContent = animal.name + " — " + animal.type;
            selectedAnimal.appendChild(option);
        });
    }


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
        async function (event) {

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
                !reason
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


            const success =
                getElement("applicationSuccess");

            try {
                const result = await window.databaseRequest("api.php", {
                    method: "POST",
                    body: JSON.stringify({
                        action: "application-submit",
                        application: application
                    })
                });

                form.reset();

                if (selectedAnimal && animalName) {
                    selectedAnimal.value = animalName;
                }

                if (success) {
                    success.textContent = result.message;
                    success.style.display = "block";
                    success.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                } else {
                    alert(result.message);
                }
            } catch (error) {
                if (success) {
                    success.textContent = error.message;
                    success.style.display = "block";
                } else {
                    alert(error.message);
                }
            }
        }
    );

    prefillAdoptionForm(form);
}


/* =========================================================
   USER MANAGEMENT
   ========================================================= */

function getUsers() {
    try {
        const users = JSON.parse(
            localStorage.getItem("animalCareUsers") || "[]"
        );

        return Array.isArray(users) ? users : [];

    } catch (error) {
        console.error("Unable to read administrator accounts:", error);
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(
        "animalCareUsers",
        JSON.stringify(users)
    );
    return window.databaseFlush ? window.databaseFlush() : Promise.resolve();
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
        async function (event) {

            event.preventDefault();


            const username =
                getElement("username")?.value.trim();

            const password =
                getElement("password")?.value;


            const message =
                getElement("loginMessage");

            try {
                const result = await window.databaseRequest("api.php", {
                    method: "POST",
                    body: JSON.stringify({
                        action: "staff-login",
                        username: username,
                        password: password
                    })
                });

                localStorage.setItem("animalCareLoggedIn", "true");
                localStorage.setItem("animalCareUser", JSON.stringify(result.user));
                try {
                    await window.importLegacyData();
                } catch (importError) {
                    console.error("Could not import legacy browser records:", importError);
                }
                window.location.href = "dashboard.html";
            } catch (error) {
                if (message) {
                    message.textContent = error.message;
                    message.style.display = "block";
                }
            }
        }
    );
}


/* =========================================================
   PROTECT DASHBOARD
   ========================================================= */

async function protectDashboard() {

    if (!document.body.classList.contains("dashboard-page")) {
        return true;
    }


    try {
        const result = await window.databaseRequest("api.php?action=auth-status");
        if (result.role !== "staff") {
            window.location.href = "login.html";
            return false;
        }
        localStorage.setItem("animalCareLoggedIn", "true");
        localStorage.setItem("animalCareUser", JSON.stringify(result.user));
        return true;
    } catch (error) {
        console.error("Unable to verify staff session:", error);
        window.location.href =
            "login.html";
        return false;
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

function initializeLogout() {

    const logoutButtons = document.querySelectorAll(
        "#logoutButton, #logoutLink, .logout-link, [data-logout]"
    );

    if (logoutButtons.length === 0) {
        return;
    }


    logoutButtons.forEach(function (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function (event) {
                event.preventDefault();
                try {
                    await window.databaseRequest("api.php", {
                        method: "POST",
                        body: JSON.stringify({ action: "logout" })
                    });
                } catch (error) {
                    console.error("Staff logout failed:", error);
                }
                localStorage.removeItem("animalCareLoggedIn");
                localStorage.removeItem("animalCareUser");
                if (window.clearPrivateAppState) {
                    window.clearPrivateAppState();
                }
                window.location.href = "login.html";
            }
        );
    });
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function startDashboardAutoRefresh() {

    if (window.__danizaDashboardRefreshTimer) {
        return;
    }

    window.__danizaDashboardRefreshTimer = window.setInterval(async function () {
        if (!document.body || !document.body.classList.contains("dashboard-page")) {
            return;
        }

        try {
            await refreshAdoptionApplications();
            initializeDashboard();
        } catch (error) {
            console.warn("Unable to refresh dashboard adoption data:", error);
        }
    }, 10000);
}

async function initializeDashboard() {

    if (
        !document.body.classList.contains(
            "dashboard-page"
        )
    ) {
        return;
    }

    const welcome = getElement("dashboardWelcome");
    if (welcome) {
        try {
            const staffUser = JSON.parse(localStorage.getItem("animalCareUser") || "null");
            if (staffUser && (staffUser.fullName || staffUser.username)) {
                welcome.textContent = "Welcome, " + (staffUser.fullName || staffUser.username) + "!";
            }
        } catch (error) {
            // Keep the default welcome text.
        }
    }

    const applications = await refreshAdoptionApplications();
    const animals =
        getAnimalRecords();
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


    let appointments = [];
    let adopters = [];

    try {
        const appointmentResult = await window.databaseRequest("api.php", {
            method: "POST",
            body: JSON.stringify({ action: "appointments-list" })
        });
        appointments = Array.isArray(appointmentResult.appointments)
            ? appointmentResult.appointments
            : [];
    } catch (error) {
        console.error("Unable to load appointment requests:", error);
    }

    try {
        const adopterResult = await window.databaseRequest("api.php", {
            method: "POST",
            body: JSON.stringify({ action: "adopters-list" })
        });
        adopters = Array.isArray(adopterResult.adopters)
            ? adopterResult.adopters
            : [];
    } catch (error) {
        console.error("Unable to load registered adopters:", error);
    }

    const pendingAppointments = appointments.filter(function (appointment) {
        return String(appointment.status || "").toLowerCase() === "pending";
    });

    if (getElement("pendingAppointments")) {
        getElement("pendingAppointments").textContent = pendingAppointments.length;
    }

    if (getElement("totalAdopters")) {
        getElement("totalAdopters").textContent = adopters.length;
    }

    const appointmentReport = {
        reportAppointments: appointments.length,
        reportPendingAppointments: pendingAppointments.length,
        reportApprovedAppointments: appointments.filter(function (item) {
            return String(item.status || "").toLowerCase() === "approved";
        }).length,
        reportCompletedAppointments: appointments.filter(function (item) {
            return String(item.status || "").toLowerCase() === "completed";
        }).length
    };

    Object.keys(appointmentReport).forEach(function (id) {
        const element = getElement(id);
        if (element) {
            element.textContent = appointmentReport[id];
        }
    });

    renderApplications();
    renderAppointments(appointments);
    renderAdopters(adopters);
    renderReports();
    renderUsers();
}


/* =========================================================
   APPLICATIONS
   ========================================================= */

async function renderApplications() {

    const container =
        getElement("applicationList");


    if (!container) {
        return;
    }


    const applications = await refreshAdoptionApplications();


    const noApplications = getElement("noApplications");

    container.innerHTML = "";


    if (applications.length === 0) {

        if (noApplications) {
            noApplications.style.display = "block";
        }

        return;
    }

    if (noApplications) {
        noApplications.style.display = "none";
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
                    (String(application.status || "").trim().toLowerCase() === "pending")
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

                ${
                    (String(application.status || "").trim().toLowerCase() === "approved")
                        ? `
                            <button
                                class="print-certificate-btn"
                                data-id="${application.id}"
                            >
                                Print Certificate
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
                async function () {

                    await updateApplicationStatus(
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
                async function () {

                    await updateApplicationStatus(
                        button.dataset.id,
                        "Rejected"
                    );
                }
            );
        });

    container
        .querySelectorAll(".print-certificate-btn")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const application = applications.find(
                    item => item.id == button.dataset.id
                );

                if (application) {
                    printAdoptionCertificate(application);
                }
            });
        });

    initializeAppointmentEmail();
}


/* =========================================================
   APPOINTMENTS (STAFF)
   ========================================================= */

function renderAppointments(appointments) {

    const container = getElement("appointmentList");
    const empty = getElement("noAppointments");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (appointments.length === 0) {
        if (empty) {
            empty.style.display = "block";
        }
        return;
    }

    if (empty) {
        empty.style.display = "none";
    }

    appointments.forEach(function (appointment) {

        const card = document.createElement("div");
        const status = String(appointment.status || "Pending");
        const statusClass = status.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        card.className = "application-card";

        card.innerHTML = `
            <div class="application-info">
                <h3>${escapeHTML(appointment.fullName)}</h3>
                <p><strong>Animal:</strong> ${escapeHTML(appointment.animal)}</p>
                <p><strong>Email:</strong> ${escapeHTML(appointment.email)}</p>
                <p><strong>Phone:</strong> ${escapeHTML(appointment.phone)}</p>
                <p><strong>Date:</strong> ${escapeHTML(appointment.date)}</p>
                <p><strong>Time:</strong> ${escapeHTML(appointment.time)}</p>
                ${appointment.notes ? `<p><strong>Notes:</strong> ${escapeHTML(appointment.notes)}</p>` : ""}
            </div>

            <div class="application-status">
                <span class="status-${statusClass}">${escapeHTML(status)}</span>
            </div>

            <div class="application-actions">
                ${
                    status.toLowerCase() === "pending"
                        ? `
                            <button class="approve-appointment-btn" data-id="${appointment.id}">Approve</button>
                            <button class="reject-appointment-btn" data-id="${appointment.id}">Reject</button>
                        `
                        : ""
                }
                ${
                    status.toLowerCase() === "approved"
                        ? `<button class="complete-appointment-btn" data-id="${appointment.id}">Mark Completed</button>`
                        : ""
                }
            </div>
        `;

        container.appendChild(card);
    });

    function setStatus(button, status) {
        updateAppointmentStatus(button.dataset.id, status);
    }

    container.querySelectorAll(".approve-appointment-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            setStatus(button, "Approved");
        });
    });

    container.querySelectorAll(".reject-appointment-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            setStatus(button, "Rejected");
        });
    });

    container.querySelectorAll(".complete-appointment-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            setStatus(button, "Completed");
        });
    });
}

async function updateAppointmentStatus(id, status) {

    try {
        await window.databaseRequest("api.php", {
            method: "POST",
            body: JSON.stringify({
                action: "appointment-status-update",
                id: Number(id),
                status: status
            })
        });
        await initializeDashboard();
    } catch (error) {
        console.error("Unable to update appointment status:", error);
        alert(error.message || "Unable to update appointment status.");
    }
}


/* =========================================================
   REGISTERED ADOPTERS (STAFF)
   ========================================================= */

function renderAdopters(adopters) {

    const container = getElement("adopterList");
    const empty = getElement("noAdopters");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (adopters.length === 0) {
        if (empty) {
            empty.style.display = "block";
        }
        return;
    }

    if (empty) {
        empty.style.display = "none";
    }

    adopters.forEach(function (adopter) {

        const card = document.createElement("div");
        card.className = "application-card";

        card.innerHTML = `
            <div class="application-info">
                <h3>${escapeHTML(adopter.fullName)}</h3>
                <p><strong>Username:</strong> ${escapeHTML(adopter.username)}</p>
                <p><strong>Email:</strong> ${escapeHTML(adopter.email)}</p>
                <p><strong>Phone:</strong> ${escapeHTML(adopter.phone)}</p>
                <p><strong>Applications:</strong> ${escapeHTML(adopter.applicationCount)}</p>
                <p><strong>Registered:</strong> ${escapeHTML(adopter.createdAt)}</p>
            </div>

            <div class="application-actions">
                <a class="email-adopter-btn" href="mailto:${escapeHTML(adopter.email)}">Send Email</a>
                <button class="delete-adopter-btn" data-id="${adopter.id}" type="button">Delete</button>
            </div>
        `;

        container.appendChild(card);
    });

    container.querySelectorAll(".delete-adopter-btn").forEach(function (button) {
        button.addEventListener("click", async function () {
            if (!confirm("Delete this adopter account? Their submitted applications will remain in the system.")) {
                return;
            }
            try {
                await window.databaseRequest("api.php", {
                    method: "POST",
                    body: JSON.stringify({
                        action: "adopter-delete",
                        id: Number(button.dataset.id)
                    })
                });
                await initializeDashboard();
            } catch (error) {
                alert(error.message || "Unable to delete the adopter account.");
            }
        });
    });
}


/* =========================================================
   ADOPTION CERTIFICATE
   ========================================================= */

function printAdoptionCertificate(application) {

    const certificateWindow = window.open("", "_blank", "width=900,height=650");

    if (!certificateWindow) {
        alert("Please allow pop-ups for this site to print the adoption certificate.");
        return;
    }

    const applicant = escapeHTML(application.applicantName || "Adopter");
    const animal = escapeHTML(application.animal || "Animal");
    const date = escapeHTML(application.date || new Date().toLocaleDateString());

    certificateWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Adoption Certificate - ${animal}</title>
            <style>
                body { font-family: Georgia, "Times New Roman", serif; margin: 0; padding: 40px; background: #f4f8f3; color: #163832; }
                .certificate { background: #ffffff; border: 10px solid #235347; padding: 55px; max-width: 760px; margin: 0 auto; text-align: center; }
                .paw { font-size: 52px; margin-bottom: 10px; }
                h1 { margin: 0 0 8px; font-size: 36px; letter-spacing: 2px; }
                h2 { margin: 20px 0; font-size: 26px; color: #477023; }
                p { font-size: 17px; line-height: 1.8; margin: 8px 0; }
                .name { font-size: 30px; font-weight: bold; border-bottom: 2px solid #b7d5bd; display: inline-block; padding: 0 24px 4px; }
                .footer { margin-top: 45px; display: flex; justify-content: space-between; gap: 30px; font-size: 15px; }
                .line { border-top: 1px solid #52685b; padding-top: 8px; min-width: 220px; }
                @media print { body { background: #fff; padding: 0; } .certificate { border-width: 8px; } }
            </style>
        </head>
        <body>
            <div class="certificate">
                <div class="paw">🐾</div>
                <h1>Certificate of Adoption</h1>
                <p>This certificate is proudly presented to</p>
                <div class="name">${applicant}</div>
                <p>for providing a loving and responsible home to</p>
                <h2>${animal}</h2>
                <p>Approved on ${date} by the Animal Adoption and Care System.</p>
                <div class="footer">
                    <div class="line">Adopter Signature</div>
                    <div class="line">Authorized Staff Signature</div>
                </div>
            </div>
            <script>
                window.addEventListener("load", function () { window.print(); });
            <\/script>
        </body>
        </html>
    `);

    certificateWindow.document.close();
}


/* =========================================================
   UPDATE APPLICATION STATUS
   ========================================================= */

async function updateApplicationStatus(
    id,
    status
) {

    try {
        const result = await window.databaseRequest("api.php", {
            method: "POST",
            body: JSON.stringify({
                action: "application-status-update",
                id: Number(id),
                status: status
            })
        });

        if (status === "Approved") {
            const applications = getApplications();
            const application = applications.find(function (item) {
                return item.id == id;
            });
            if (application && window.setLocalCacheJSON) {
                const animals = getAnimalRecords();
                let changed = false;
                animals.forEach(function (animal) {
                    if (String(animal.name).toLowerCase() === String(application.animal).toLowerCase()) {
                        animal.status = "Adopted";
                        changed = true;
                    }
                });
                if (changed) {
                    window.setLocalCacheJSON("animalRecords", animals);
                }
            }
        }

        await refreshAdoptionApplications();
        if (result && result.message) {
            console.info(result.message);
        }
        await initializeDashboard();
    } catch (error) {
        console.error("Unable to update application status:", error);
        alert(error.message || "Unable to update application status.");
    }
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

    if (!document.body.classList.contains("dashboard-page")) {
        return;
    }

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

    if (!document.body.classList.contains("dashboard-page")) {
        return;
    }

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


    const pendingAnimals =
        animals.filter(
            animal =>
                (animal.status || "")
                    .toLowerCase() ===
                "pending"
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
            pendingAnimals.length,

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
        async function (event) {

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
                )?.value || "Staff";


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

                fullName: username,

                username,

                password,

                role
            });


            try {
                await saveUsers(users);
            } catch (error) {
                alert(error.message || "Unable to save the staff account.");
                return;
            }


            form.reset();

            form.style.display =
                "none";


            renderUsers();

            const success = getElement("userSuccess");

            if (success) {
                success.textContent = "User account added successfully.";
                success.style.display = "block";
                setTimeout(function () {
                    success.style.display = "none";
                }, 4000);
            }
        }
    );


    renderUsers();
}


/* =========================================================
   DELETE USER
   ========================================================= */

async function deleteUser(id) {

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


    try {
        await saveUsers(updatedUsers);
    } catch (error) {
        alert(error.message || "Unable to delete the staff account.");
        return;
    }


    renderUsers();
}



/* =========================================================
   HOMEPAGE SHOWCASE
   ========================================================= */

function renderHomepageShowcase() {
    const animals = getAnimalRecords();
    const availableAnimals = animals.filter(function (animal) {
        return String(animal.status || "").trim().toLowerCase() === "available";
    });

    const animalCount = getElement("homeAnimalCount");
    const availableCount = getElement("homeAvailableCount");
    const careCount = getElement("homeCareCount");

    if (animalCount) {
        animalCount.textContent = animals.length;
    }
    if (availableCount) {
        availableCount.textContent = availableAnimals.length;
    }
    if (careCount) {
        careCount.textContent = getMedicalRecords().length;
    }

    const container = getElement("featuredAnimalList");

    if (!container || !availableAnimals.length) {
        return;
    }

    const featuredCards = availableAnimals.slice(0, 3).map(function (animal) {
        const type = String(animal.type || "");
        const typeKey = type.toLowerCase();
        const photo = animal.image ||
            animalRecordImages[typeKey] ||
            animalRecordImages.default;
        const detailUrl = "animal-detail.html?animal=" +
            encodeURIComponent(animal.id);
        const statusClass = String(animal.status || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");

        return `
            <article class="animal-item featured-animal-card">
                <div class="animal-image">
                    <img src="${escapeHTML(photo)}" alt="${escapeHTML(animal.name)}" class="public-animal-image" loading="lazy">
                    <span class="animal-status status-${statusClass}">${escapeHTML(animal.status)}</span>
                </div>
                <div class="animal-card-content">
                    <div class="animal-card-top">
                        <h3>${escapeHTML(animal.name)}</h3>
                    </div>
                    <p class="animal-type">${escapeHTML(type)} &bull; ${escapeHTML(animal.age)} &bull; ${escapeHTML(animal.gender)}</p>
                    <p class="animal-description">${escapeHTML(animal.description)}</p>
                    <div class="animal-info">
                        <span>${escapeHTML(animal.health)}</span>
                        <span>${escapeHTML(animal.vaccination)}</span>
                    </div>
                    <a href="${detailUrl}" class="view-animal-btn">Meet ${escapeHTML(animal.name)}</a>
                </div>
            </article>
        `;
    }).join("");

    container.innerHTML = featuredCards + `
        <a class="featured-cta-card" href="animals.html">
            <span class="featured-cta-icon">🐾</span>
            <strong>There are more friends waiting.</strong>
            <span>Browse every animal looking for a loving home.</span>
            <em>View all animals →</em>
        </a>
    `;
}


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {
        try {
            await window.databaseReady;
        } catch (error) {
            return;
        }

        /* Security */
        if (!await protectDashboard()) {
            return;
        }


        /* Animal pages */
        await initializeAnimalManagement();
        initializeAnimalRecordSearch();
        initializeAvailableAnimals();
        initializeAnimalDetail();
        renderHomepageShowcase();


        /* Adoption */
        initializeAdoptionForm();


        /* Login */
        initializeLoginPage();


        /* Logout */
        initializeLogout();


        /* Dashboard */
        initializeDashboard();
        startDashboardAutoRefresh();


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

    form.addEventListener("submit", async function (event) {

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

        try {
            const result = await window.databaseRequest("api.php", {
                method: "POST",
                body: JSON.stringify({
                    action: "adopter-register",
                    fullName: fullName,
                    email: email,
                    phone: phone,
                    username: username,
                    password: password
                })
            });
            showMessage(result.message, true);
            form.reset();
            setTimeout(function () {
                window.location.href = "adopter-login.html";
            }, 1200);
        } catch (error) {
            showMessage(error.message);
        }
    });
}


/* =========================================================
   ADOPTER LOGIN
   ========================================================= */

function initializeAdopterLogin() {

    const form = document.getElementById("adopterLoginForm");

    if (!form) return;

    form.addEventListener("submit", async function (event) {

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

        try {
            await window.databaseRequest("api.php", {
                method: "POST",
                body: JSON.stringify({
                    action: "adopter-login",
                    username: username,
                    password: password
                })
            });
            window.location.href = "profile.html";
        } catch (error) {
            showMessage(error.message);
        }
    });
}


/* =========================================================
   INITIALIZE ADOPTER PAGES
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", async function () {
        try {
            await window.databaseReady;
        } catch (error) {
            return;
        }
        initializeAdopterRegistration();
        initializeAdopterLogin();
    });

} else {

    window.databaseReady.then(function () {
        initializeAdopterRegistration();
        initializeAdopterLogin();
    }).catch(function (error) {
        console.error("Could not initialize adopter account pages:", error);
    });

}
function initializeAppointmentEmail() {
    document.querySelectorAll(".application-card").forEach(card => {
        if (card.querySelector(".appointment-email-form")) return;

        const status = card.querySelector(".application-status span")?.textContent.trim();
        if (!status || status.toLowerCase() === "rejected" || status.toLowerCase() === "pending") {
            return;
        }

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
                const button = form.querySelector(".send-appointment-btn");

                if (!date || !time) {
                    message.textContent = "Please select a date and time.";
                    return;
                }

                button.disabled = true;
                message.textContent = "Sending appointment email...";
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
                    if (!response.ok) {
                        message.setAttribute("role", "alert");
                    } else {
                        message.setAttribute("role", "status");
                    }
                } catch (error) {
                    console.error("Appointment email request failed:", error);
                    message.textContent = "Unable to reach the email service. Check Apache and try again.";
                    message.setAttribute("role", "alert");
                } finally {
                    button.disabled = false;
                }
            });
    });
}

/* =========================================
   ADOPTER PROFILE EXTRAS
   Applications, appointments, notifications
========================================= */

function statusBadgeClass(status) {
    return "status-" + String(status || "pending")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
}

function renderProfileApplications(applications) {

    const container = document.getElementById("profileApplicationList");

    if (!container) {
        return;
    }

    if (!applications.length) {
        container.innerHTML = '<p class="profile-empty">You have not submitted an adoption application yet.</p>';
        return;
    }

    container.innerHTML = applications.map(function (application) {
        return `
            <article class="profile-record">
                <div class="profile-record-head">
                    <h3>${escapeHTML(application.animal)}</h3>
                    <span class="status-badge ${statusBadgeClass(application.status)}">${escapeHTML(application.status)}</span>
                </div>
                <p><strong>Applicant:</strong> ${escapeHTML(application.applicantName)}</p>
                <p><strong>Submitted:</strong> ${escapeHTML(application.date)}</p>
                <p><strong>Housing:</strong> ${escapeHTML(application.housing)}</p>
                <p><strong>Reason:</strong> ${escapeHTML(application.reason)}</p>
            </article>
        `;
    }).join("");
}

function renderProfileAppointments(appointments) {

    const container = document.getElementById("profileAppointmentList");

    if (!container) {
        return;
    }

    if (!appointments.length) {
        container.innerHTML = '<p class="profile-empty">No appointment requests yet.</p>';
        return;
    }

    container.innerHTML = appointments.map(function (appointment) {
        return `
            <article class="profile-record">
                <div class="profile-record-head">
                    <h3>${escapeHTML(appointment.animal)}</h3>
                    <span class="status-badge ${statusBadgeClass(appointment.status)}">${escapeHTML(appointment.status)}</span>
                </div>
                <p><strong>Date:</strong> ${escapeHTML(appointment.date)}</p>
                <p><strong>Time:</strong> ${escapeHTML(appointment.time)}</p>
                ${appointment.notes ? `<p><strong>Notes:</strong> ${escapeHTML(appointment.notes)}</p>` : ""}
            </article>
        `;
    }).join("");
}

function renderProfileNotifications(applications, appointments) {

    const container = document.getElementById("profileNotifications");

    if (!container) {
        return;
    }

    const notifications = [];

    applications.forEach(function (application) {
        if (String(application.status).toLowerCase() !== "pending") {
            notifications.push({
                title: "Adoption application " + String(application.status).toLowerCase(),
                text: "Your application for " + application.animal + " was " + String(application.status).toLowerCase() + ".",
                status: application.status
            });
        } else {
            notifications.push({
                title: "Application under review",
                text: "Your application for " + application.animal + " is being reviewed by the staff.",
                status: application.status
            });
        }
    });

    appointments.forEach(function (appointment) {
        if (String(appointment.status).toLowerCase() !== "pending") {
            notifications.push({
                title: "Appointment " + String(appointment.status).toLowerCase(),
                text: "Your " + appointment.date + " " + appointment.time + " appointment for " + appointment.animal + " is " + String(appointment.status).toLowerCase() + ".",
                status: appointment.status
            });
        } else {
            notifications.push({
                title: "Appointment request received",
                text: "Your appointment request for " + appointment.animal + " is waiting for staff confirmation.",
                status: appointment.status
            });
        }
    });

    if (!notifications.length) {
        container.innerHTML = '<p class="profile-empty">No new notifications.</p>';
        return;
    }

    container.innerHTML = notifications.map(function (notification) {
        return `
            <article class="profile-record profile-notification">
                <div class="profile-record-head">
                    <h3>${escapeHTML(notification.title)}</h3>
                    <span class="status-badge ${statusBadgeClass(notification.status)}">${escapeHTML(notification.status)}</span>
                </div>
                <p>${escapeHTML(notification.text)}</p>
            </article>
        `;
    }).join("");
}

async function loadAdopterAppointments() {

    const result = await window.databaseRequest("api.php", {
        method: "POST",
        body: JSON.stringify({ action: "my-appointments" })
    });

    return Array.isArray(result.appointments) ? result.appointments : [];
}

async function initializeAdopterExtras() {

    const hasProfileExtras = document.getElementById("profileApplicationList") ||
        document.getElementById("appointmentRequestForm");

    if (!hasProfileExtras) {
        return;
    }

    let applications = [];
    let appointments = [];

    try {
        const result = await window.databaseRequest("api.php", {
            method: "POST",
            body: JSON.stringify({ action: "adopter-applications" })
        });
        applications = Array.isArray(result.applications) ? result.applications : [];
    } catch (error) {
        console.error("Unable to load adopter applications:", error);
    }

    try {
        appointments = await loadAdopterAppointments();
    } catch (error) {
        console.error("Unable to load adopter appointments:", error);
    }

    renderProfileApplications(applications);
    renderProfileAppointments(appointments);
    renderProfileNotifications(applications, appointments);

    const animalSelect = document.getElementById("appointmentAnimal");

    if (animalSelect) {
        const names = new Set();
        getAnimalRecords().forEach(function (animal) {
            if (String(animal.status || "").toLowerCase() === "available") {
                names.add(animal.name);
            }
        });
        applications.forEach(function (application) {
            if (application.animal) {
                names.add(application.animal);
            }
        });

        animalSelect.innerHTML = '<option value="">Select an animal</option>' +
            Array.from(names).map(function (name) {
                return `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`;
            }).join("");
    }

    const appointmentForm = document.getElementById("appointmentRequestForm");

    if (appointmentForm && !appointmentForm.dataset.bound) {
        appointmentForm.dataset.bound = "true";

        appointmentForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const message = document.getElementById("appointmentMessage");
            const animal = document.getElementById("appointmentAnimal").value;
            const date = document.getElementById("appointmentDate").value;
            const time = document.getElementById("appointmentTime").value;
            const notes = document.getElementById("appointmentNotes").value.trim();

            if (!animal || !date || !time) {
                if (message) {
                    message.textContent = "Please select an animal, date, and time.";
                }
                return;
            }

            try {
                const result = await window.databaseRequest("api.php", {
                    method: "POST",
                    body: JSON.stringify({
                        action: "appointment-request",
                        animal: animal,
                        date: date,
                        time: time,
                        notes: notes
                    })
                });

                appointmentForm.reset();

                if (message) {
                    message.textContent = result.message;
                }

                appointments = await loadAdopterAppointments();
                renderProfileAppointments(appointments);
                renderProfileNotifications(applications, appointments);
            } catch (error) {
                if (message) {
                    message.textContent = error.message;
                }
            }
        });
    }
}

/* =========================================
   ADOPTION FORM PREFILL
========================================= */

async function prefillAdoptionForm(form) {

    if (!form) {
        return;
    }

    try {
        const session = await window.databaseRequest("api.php?action=auth-status");

        if (session.role !== "adopter" || !session.user) {
            return;
        }

        const user = session.user;
        const nameParts = String(user.fullName || "").trim().split(/\s+/);

        const firstName = document.getElementById("firstName");
        const lastName = document.getElementById("lastName");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");

        if (firstName && !firstName.value) {
            firstName.value = nameParts.shift() || "";
        }
        if (lastName && !lastName.value) {
            lastName.value = nameParts.join(" ");
        }
        if (email && !email.value) {
            email.value = user.email || "";
        }
        if (phone && !phone.value) {
            phone.value = user.phone || "";
        }
    } catch (error) {
        console.error("Unable to prefill the adoption form:", error);
    }
}


/* =========================================
   ADOPTER NAVIGATION
========================================= */

function appendAdopterNavigationLink(navigation, href, label, id) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    if (id) {
        link.id = id;
    }

    if (navigation.tagName === "UL" || navigation.tagName === "OL") {
        const item = document.createElement("li");
        item.appendChild(link);
        navigation.appendChild(item);
        return link;
    }

    navigation.appendChild(link);
    return link;
}

function initializeAdopterNavigation() {
    const navigation = document.querySelector(".navbar .nav-links") ||
        document.querySelector(".navbar nav");
    if (!navigation) {
        return;
    }

    navigation.querySelectorAll('a[href="login.html"], a[href="adopter-login.html"]')
        .forEach(link => link.remove());

    if (!navigation.querySelector('a[href="profile.html"]')) {
        appendAdopterNavigationLink(navigation, "profile.html", "My Profile");
    }

    let logoutLink = navigation.querySelector("#adopterLogoutLink");
    if (!logoutLink) {
        logoutLink = appendAdopterNavigationLink(
            navigation,
            "#",
            "Log Out",
            "adopterLogoutLink"
        );
    }

    logoutLink.addEventListener("click", async function (event) {
        event.preventDefault();
        try {
            await window.databaseRequest("api.php", {
                method: "POST",
                body: JSON.stringify({ action: "logout" })
            });
        } catch (error) {
            console.error("Adopter logout failed:", error);
        }
        window.location.href = "adopter-login.html";
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await window.databaseReady;
        const session = await window.databaseRequest("api.php?action=auth-status");
        const currentPage = window.location.pathname.split("/").pop();

        if (session.role !== "adopter") {
            if (currentPage === "profile.html") {
                window.location.href = "adopter-login.html";
            }
            return;
        }

        if (currentPage === "adopter-login.html" || currentPage === "register.html") {
            window.location.href = "profile.html";
            return;
        }

        initializeAdopterNavigation();
        await initializeAdopterExtras();
    } catch (error) {
        console.error("Unable to check adopter session:", error);
    }
});

/* =====================================
   PUBLIC NAVIGATION - ADMIN ACCESS
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    // Remove Admin Login from public navigation
    document.querySelectorAll('.nav-links a[href="login.html"]').forEach(function (link) {
        link.remove();
    });

    // Add Admin Access to the public website footer
    const footer = document.querySelector("footer");
    const footerContent = footer?.querySelector(".footer-content");

    if (footer && footerContent && !footer.querySelector(".admin-access-link")) {

        const adminLink = document.createElement("a");

        adminLink.href = "login.html";
        adminLink.textContent = "Admin Access";
        adminLink.className = "admin-access-link";

        adminLink.style.display = "inline-block";
        adminLink.style.marginTop = "10px";
        adminLink.style.color = "inherit";
        adminLink.style.textDecoration = "none";
        adminLink.style.fontWeight = "600";

        footerContent.appendChild(adminLink);
    }

});
