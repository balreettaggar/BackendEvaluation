document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector(".registeration .form");
    const loginForm = document.querySelector(".login .form");

    // Register User
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const fullname = document.getElementById("Fullname").value.trim();
            const username = document.getElementById("Username").value.trim();
            const email = document.getElementById("Email").value.trim();
            const password = document.getElementById("Password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            try {
                const response = await fetch("http://localhost:3000/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fullname, username, email, password, confirmPassword }),
                });

                const result = await response.json();
                alert(result.message || result.error);

                if (response.ok) {
                    window.location.href = "login.html";
                }
            } catch (error) {
                console.error("Error registering:", error);
            }
        });
    }

    // Login User
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const username = document.getElementById("Username").value.trim();
            const password = document.getElementById("Password").value.trim();

            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const result = await response.json();
                alert(result.message || result.error);

                if (response.ok) {
                    localStorage.setItem("token", result.token);
                    window.location.href = "dashboard.html"; // Redirect to user dashboard
                }
            } catch (error) {
                console.error("Error logging in:", error);
            }
        });
    }
});
