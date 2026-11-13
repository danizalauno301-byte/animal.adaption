document.querySelectorAll(".password-toggle").forEach(function(button) {
    button.addEventListener("click", function() {
        const passwordInput = document.getElementById(
            button.getAttribute("aria-controls")
        );
        const isVisible = passwordInput.type === "text";

        passwordInput.type = isVisible ? "password" : "text";
        button.textContent = isVisible ? "Show" : "Hide";
        button.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
        button.setAttribute("aria-pressed", String(!isVisible));
    });
});