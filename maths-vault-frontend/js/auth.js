/* =========================================
   ENGGITEA AUTHENTICATION
========================================= */


/* =========================================
   LOGIN PAGE
========================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("loginMessage");

        const submitButton =
            loginForm.querySelector(".auth-submit-btn");


        message.textContent = "";
        message.className = "form-message";


        if (!email || !password) {

            message.textContent =
                "Please enter email and password.";

            message.classList.add("error-message");

            return;
        }


        submitButton.disabled = true;
        submitButton.textContent = "Logging in...";


        try {

            const data =
                await loginUser(email, password);


            const user =
                data?.user;

            const session =
                data?.session;


            if (!user) {

                throw new Error(
                    "Unable to sign in."
                );

            }


            /*
             * Save basic user information
             * for displaying in the frontend.
             */
            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            /*
             * Check whether email is verified.
             */
            if (!user.email_confirmed_at) {

                localStorage.setItem(
                    "pendingVerificationEmail",
                    email
                );


                message.textContent =
                    "Please verify your email before logging in.";

                message.classList.add(
                    "error-message"
                );


                setTimeout(() => {

                    window.location.href =
                        "verify-email.html";

                }, 1000);


                return;
            }


            /*
             * A valid Supabase session
             * must exist for a successful login.
             */
            if (!session) {

                throw new Error(
                    "Login session was not created."
                );

            }


            message.textContent =
                "Login successful! Redirecting...";

            message.classList.add(
                "success-message"
            );


            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 700);


        } catch (error) {

            console.error(
                "Login failed:",
                error
            );


            message.textContent =
                error.message ||
                "Login failed.";

            message.classList.add(
                "error-message"
            );


        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Login";

        }

    });

}

/* =========================================
   REGISTER PAGE
========================================= */

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("registerEmail")
                .value.trim();

        const password =
            document.getElementById("registerPassword")
                .value;

        const confirmPassword =
            document.getElementById("confirmPassword")
                .value;

        const terms =
            document.getElementById("terms").checked;

        const message =
            document.getElementById("registerMessage");

        const submitButton =
            registerForm.querySelector(".auth-submit-btn");


        message.textContent = "";
        message.className = "form-message";


        if (!name || !email || !password || !confirmPassword) {

            message.textContent =
                "Please fill in all required fields.";

            message.classList.add("error-message");

            return;
        }


        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            message.classList.add("error-message");

            return;
        }


        if (password.length < 6) {

            message.textContent =
                "Password must contain at least 6 characters.";

            message.classList.add("error-message");

            return;
        }


        if (!terms) {

            message.textContent =
                "Please accept the terms to continue.";

            message.classList.add("error-message");

            return;
        }


        submitButton.disabled = true;
        submitButton.textContent = "Creating account...";


        try {

            const data = await registerUser(
    name,
    email,
    password
);

            const token =
                data?.token ||
                data?.access_token ||
                data?.data?.token;


            const userEmail = email;

localStorage.setItem(
    "pendingVerificationEmail",
    userEmail
);

message.textContent =
    "Account created! Please check your email to verify your account.";

message.classList.add(
    "success-message"
);

setTimeout(() => {

    window.location.href =
        "verify-email.html";

}, 700);

        } catch (error) {

            message.textContent =
                error.message || "Registration failed.";

            message.classList.add("error-message");

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Create Account";

        }

    });

}


/* =========================================
   GET CURRENT USER
========================================= */

async function loadCurrentUser() {

    const token = getAuthToken();

    if (!token) {
        return null;
    }


    try {

        const user = await getCurrentUser();


        const currentUser =
            user?.user ||
            user?.data ||
            user;


        if (currentUser) {

            localStorage.setItem(
                "user",
                JSON.stringify(currentUser)
            );

        }


        return currentUser;


    } catch (error) {

        console.error(
            "Unable to load current user:",
            error
        );

        return null;

    }

}


/* =========================================
   LOGOUT
========================================= */

function logoutUser() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}


/* =========================================
   LOGOUT BUTTONS
========================================= */

const logoutButton =
    document.getElementById("logoutBtn");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logoutUser
    );

}


const mobileLogoutButton =
    document.getElementById("mobileLogoutBtn");

if (mobileLogoutButton) {

    mobileLogoutButton.addEventListener(
        "click",
        logoutUser
    );

}


const profileLogoutButton =
    document.getElementById("profileLogoutBtn");

if (profileLogoutButton) {

    profileLogoutButton.addEventListener(
        "click",
        logoutUser
    );

}


