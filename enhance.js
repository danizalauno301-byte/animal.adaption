/* =========================================================
   PAWS & HEARTS — PROGRESSIVE UI ENHANCEMENTS
   Navigation, reveal motion, counters, decorations.
   All features degrade gracefully without this file.
   ========================================================= */

(function () {
    "use strict";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDashboard = document.body.classList.contains("dashboard-page");

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
        } else {
            callback();
        }
    }

    function makeButton(className, label, text) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.setAttribute("aria-label", label);
        button.innerHTML = text;
        return button;
    }

    function setupPublicNavigation() {
        if (isDashboard) {
            return;
        }

        const navbar = document.querySelector(".navbar");
        const container = navbar && navbar.querySelector(".nav-container");

        if (!navbar || !container) {
            return;
        }

        if (!container.querySelector(".nav-toggle")) {
            const toggle = makeButton("nav-toggle", "Open navigation menu", "☰");
            toggle.setAttribute("aria-expanded", "false");
            toggle.addEventListener("click", function () {
                const open = document.body.classList.toggle("nav-open");
                toggle.setAttribute("aria-expanded", String(open));
                toggle.innerHTML = open ? "✕" : "☰";
            });
            container.appendChild(toggle);
        }

        navbar.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("nav-open");
                const toggle = container.querySelector(".nav-toggle");
                if (toggle) {
                    toggle.setAttribute("aria-expanded", "false");
                    toggle.innerHTML = "☰";
                }
            });
        });

        document.addEventListener("click", function (event) {
            if (!document.body.classList.contains("nav-open")) {
                return;
            }
            if (!navbar.contains(event.target)) {
                document.body.classList.remove("nav-open");
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                document.body.classList.remove("nav-open");
            }
        });

        if (document.body.classList.contains("home-page")) {
            const onScroll = function () {
                navbar.classList.toggle("is-scrolled", window.scrollY > 16);
            };
            onScroll();
            window.addEventListener("scroll", onScroll, { passive: true });
        }
    }

    function setupAdminSidebar() {
        if (!isDashboard) {
            return;
        }

        const navbar = document.querySelector(".navbar");
        if (!navbar) {
            return;
        }

        if (!document.querySelector(".sidebar-toggle")) {
            const toggle = makeButton("sidebar-toggle", "Open dashboard menu", "☰");
            toggle.setAttribute("aria-expanded", "false");
            document.body.appendChild(toggle);

            const overlay = document.createElement("div");
            overlay.className = "sidebar-overlay";
            document.body.appendChild(overlay);

            function closeSidebar() {
                document.body.classList.remove("sidebar-open");
                toggle.setAttribute("aria-expanded", "false");
                toggle.innerHTML = "☰";
            }

            toggle.addEventListener("click", function () {
                const open = document.body.classList.toggle("sidebar-open");
                toggle.setAttribute("aria-expanded", String(open));
                toggle.innerHTML = open ? "✕" : "☰";
            });

            overlay.addEventListener("click", closeSidebar);
            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape") {
                    closeSidebar();
                }
            });

            navbar.querySelectorAll("a").forEach(function (link) {
                link.addEventListener("click", closeSidebar);
            });
        }

        if (!navbar.querySelector(".sidebar-note")) {
            const note = document.createElement("div");
            note.className = "sidebar-note";
            note.innerHTML =
                "<span>🐾</span>" +
                "<strong>Every paw deserves a home.</strong>" +
                "<small>Thank you for caring for the animals today.</small>";
            navbar.appendChild(note);
        }
    }

    function setupPawDecorations() {
        if (reducedMotion || isDashboard) {
            return;
        }

        if (document.querySelector(".paw-float")) {
            return;
        }

        const positions = [
            { left: "3%", top: "24%", size: "42px", delay: "0s" },
            { left: "92%", top: "36%", size: "34px", delay: "-4s" },
            { left: "7%", top: "72%", size: "30px", delay: "-8s" },
            { left: "86%", top: "78%", size: "48px", delay: "-11s" },
            { left: "48%", top: "12%", size: "26px", delay: "-6s" }
        ];

        positions.forEach(function (position) {
            const paw = document.createElement("span");
            paw.className = "paw-float";
            paw.textContent = "🐾";
            paw.setAttribute("aria-hidden", "true");
            paw.style.left = position.left;
            paw.style.top = position.top;
            paw.style.fontSize = position.size;
            paw.style.animationDelay = position.delay;
            document.body.appendChild(paw);
        });
    }

    function setupRevealMotion() {
        const selectors = [
            "main section",
            ".home-stat",
            ".animal-item",
            ".feature-card",
            ".how-card",
            ".tip-home",
            ".tip-card",
            ".about-card",
            ".dashboard-stat-card",
            ".dashboard-module-card",
            ".application-card",
            ".report-box",
            ".profile-section",
            ".home-about-points > div",
            ".recent-animal-row",
            ".featured-cta-card"
        ];

        if (reducedMotion || !("IntersectionObserver" in window)) {
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: "0px 0px -40px 0px",
            threshold: 0.06
        });

        function scan() {
            document.querySelectorAll(selectors.join(",")).forEach(function (element, index) {
                if (element.classList.contains("reveal") || element.classList.contains("is-visible")) {
                    return;
                }

                if (element.closest(".navbar") || element.closest("footer") || element.closest(".footer")) {
                    return;
                }

                element.classList.add("reveal");
                element.style.setProperty("--reveal-delay", Math.min(index * 45, 220) + "ms");
                observer.observe(element);
            });
        }

        scan();
        window.setTimeout(scan, 700);
        window.setTimeout(scan, 1700);

        if ("MutationObserver" in window) {
            let timer = null;
            new MutationObserver(function () {
                window.clearTimeout(timer);
                timer = window.setTimeout(scan, 160);
            }).observe(document.body, { childList: true, subtree: true });
        }
    }

    function animateNumber(element, target) {
        if (reducedMotion) {
            element.textContent = String(target);
            return;
        }

        const start = 0;
        const duration = 700;
        const startedAt = performance.now();

        function tick(now) {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = String(Math.round(start + (target - start) * eased));
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    function setupStatCounters() {
        if (!isDashboard) {
            return;
        }

        const targets = document.querySelectorAll(
            ".dashboard-stat-card h3, .home-stat strong"
        );

        targets.forEach(function (element) {
            let animating = false;
            let lastValue = null;

            function checkValue() {
                const text = String(element.textContent || "").trim();
                const value = Number(text);

                if (!Number.isFinite(value) || text === "" || text === lastValue) {
                    return;
                }

                lastValue = text;

                if (animating) {
                    return;
                }

                animating = true;
                animateNumber(element, value);
                window.setTimeout(function () {
                    animating = false;
                    element.textContent = String(value);
                }, 760);
            }

            checkValue();

            if ("MutationObserver" in window) {
                new MutationObserver(checkValue).observe(element, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
        });
    }

    ready(function () {
        document.body.classList.add("ui-enhanced");
        setupPublicNavigation();
        setupAdminSidebar();
        setupPawDecorations();
        setupRevealMotion();
        setupStatCounters();

        requestAnimationFrame(function () {
            document.body.classList.add("page-ready");
        });
    });
})();
