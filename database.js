(function () {
    const dataKeys = [
        "animalRecords",
        "adoptionApplications",
        "medicalRecords",
        "careRecords",
        "animalCareUsers"
    ];
    const legacyKeys = [
        "animalRecords",
        "adoptionApplications",
        "medicalRecords",
        "careRecords",
        "animalCareAdopters",
        "animalCareUsers"
    ];
    const legacyState = {};
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    let databaseLoaded = false;
    let writeQueue = Promise.resolve();

    legacyKeys.forEach(function (key) {
        const value = localStorage.getItem(key);
        if (value !== null) {
            try {
                legacyState[key] = JSON.parse(value);
            } catch (error) {
                console.error("Could not read legacy browser data for " + key, error);
            }
        }
    });

    function showDatabaseError(message) {
        let banner = document.getElementById("databaseStatus");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "databaseStatus";
            banner.setAttribute("role", "alert");
            banner.style.cssText =
                "position:fixed;z-index:99999;left:0;right:0;bottom:0;padding:12px 18px;" +
                "background:#8b1e1e;color:#fff;font:14px Arial,sans-serif;text-align:center";
            document.body.appendChild(banner);
        }
        banner.textContent = message;
        banner.style.display = "block";
    }

    function clearDatabaseError() {
        const banner = document.getElementById("databaseStatus");
        if (banner) {
            banner.style.display = "none";
        }
    }

    async function request(url, options) {
        const response = await fetch(url, Object.assign({
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" }
        }, options || {}));
        const result = await response.json();
        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Database request failed.");
        }
        return result;
    }

    function saveToDatabase(key, value) {
        writeQueue = writeQueue
            .then(function () {
                return request("api.php", {
                    method: "POST",
                    body: JSON.stringify({
                        action: "state-save",
                        key: key,
                        value: JSON.parse(value)
                    })
                });
            })
            .then(clearDatabaseError)
            .catch(function (error) {
                console.error("Database save failed for " + key + ":", error);
                showDatabaseError(
                    "Database save failed: " + error.message +
                    " Your changes have not been confirmed as saved."
                );
            });
        return writeQueue;
    }

    Storage.prototype.setItem = function (key, value) {
        const rawValue = String(value);
        let cachedValue = rawValue;
        if (this === localStorage && key === "animalCareUsers") {
            try {
                cachedValue = JSON.stringify(JSON.parse(rawValue).map(function (user) {
                    const safeUser = Object.assign({}, user);
                    delete safeUser.password;
                    return safeUser;
                }));
            } catch (error) {
                console.error("Could not safely cache staff accounts:", error);
                throw error;
            }
        }
        originalSetItem.call(this, key, cachedValue);
        if (this === localStorage && dataKeys.indexOf(key) !== -1) {
            if (databaseLoaded) {
                saveToDatabase(key, rawValue);
            }
        }
    };

    Storage.prototype.removeItem = function (key) {
        originalRemoveItem.call(this, key);
        if (this === localStorage && dataKeys.indexOf(key) !== -1 && databaseLoaded) {
            saveToDatabase(key, "[]");
        }
    };

    window.databaseRequest = request;
    window.setLocalCache = function (key, value) {
        originalSetItem.call(localStorage, key, value);
    };
    window.setLocalCacheJSON = function (key, value) {
        originalSetItem.call(localStorage, key, JSON.stringify(value));
    };
    window.animalCatalogInitialized = false;
    window.animalCatalogMetadata = [];
    window.databaseReady = request("api.php?action=state-load")
        .then(function (result) {
            window.animalCatalogInitialized = result.hasAnimalRecords === true;
            window.animalCatalogMetadata = Array.isArray(result.animalCatalog)
                ? result.animalCatalog
                : [];
            dataKeys.forEach(function (key) {
                const value = result.state[key];
                if (!Array.isArray(value)) {
                    throw new Error("The database returned invalid data for " + key + ".");
                }
                if (
                    (key === "adoptionApplications" || key === "animalCareUsers") &&
                    result.role !== "staff"
                ) {
                    originalSetItem.call(localStorage, key, "[]");
                    return;
                }
                const hadLegacyData = Array.isArray(legacyState[key]) && legacyState[key].length > 0;
                if (
                    (key === "animalRecords" && result.hasAnimalRecords === true) ||
                    value.length > 0 ||
                    !hadLegacyData
                ) {
                    originalSetItem.call(localStorage, key, JSON.stringify(value));
                }
            });
            databaseLoaded = true;
            clearDatabaseError();
        })
        .catch(function (error) {
            showDatabaseError(
                "Cannot connect to the XAMPP database: " + error.message +
                " Start Apache and MySQL, then refresh."
            );
            throw error;
        });
    window.databaseReady.catch(function () {});

    window.importLegacyData = async function () {
        const state = {};
        legacyKeys.forEach(function (key) {
            if (Array.isArray(legacyState[key]) && legacyState[key].length > 0) {
                state[key] = legacyState[key];
            }
        });
        if (Object.keys(state).length === 0) {
            return;
        }
        await request("api.php", {
            method: "POST",
            body: JSON.stringify({ action: "legacy-import", state: state })
        });
        originalRemoveItem.call(localStorage, "animalCareAdopters");
        originalRemoveItem.call(localStorage, "animalCareAdopter");
        originalRemoveItem.call(localStorage, "animalCareAdopterLoggedIn");
        const refreshed = await request("api.php?action=state-load");
        dataKeys.forEach(function (key) {
            originalSetItem.call(localStorage, key, JSON.stringify(refreshed.state[key] || []));
        });
        legacyKeys.forEach(function (key) {
            delete legacyState[key];
        });
        databaseLoaded = true;
        clearDatabaseError();
    };

    window.clearPrivateAppState = function () {
        originalRemoveItem.call(localStorage, "adoptionApplications");
        originalRemoveItem.call(localStorage, "animalCareUsers");
    };

    window.databaseFlush = function () {
        return writeQueue;
    };
})();
