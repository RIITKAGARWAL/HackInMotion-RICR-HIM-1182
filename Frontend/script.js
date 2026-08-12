/* =========================
   GET ELEMENTS
========================= */

const loginForm = document.getElementById("loginForm");

const email = document.getElementById("email");
const password = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const togglePassword = document.getElementById("togglePassword");

const loginBtn = document.getElementById("loginBtn");

const forgotPassword = document.getElementById("forgotPassword");

const googleBtn = document.getElementById("googleBtn");

const signupLink = document.getElementById("signupLink");


/* =========================
   SHOW / HIDE PASSWORD
========================= */

togglePassword.addEventListener("click", function () {

    if (password.type === "password") {

        password.type = "text";

        togglePassword.textContent = "🙈";

        togglePassword.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        password.type = "password";

        togglePassword.textContent = "👁";

        togglePassword.setAttribute(
            "aria-label",
            "Show password"
        );

    }

});


/* =========================
   EMAIL VALIDATION
========================= */

function validateEmail(emailValue) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(emailValue);

}


/* =========================
   CLEAR ERRORS
========================= */

function clearErrors() {

    emailError.textContent = "";

    passwordError.textContent = "";

}


/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    clearErrors();

    let isValid = true;

    const emailValue = email.value.trim();

    const passwordValue = password.value.trim();


    /* Email validation */

    if (emailValue === "") {

        emailError.textContent =
            "Please enter your email.";

        isValid = false;

    } else if (!validateEmail(emailValue)) {

        emailError.textContent =
            "Please enter a valid email.";

        isValid = false;

    }


    /* Password validation */

    if (passwordValue === "") {

        passwordError.textContent =
            "Please enter your password.";

        isValid = false;

    } else if (passwordValue.length < 6) {

        passwordError.textContent =
            "Password must be at least 6 characters.";

        isValid = false;

    }


    if (!isValid) {
        return;
    }


    /* Loading state */

    loginBtn.classList.add("loading");

    loginBtn.disabled = true;


    /*
        DEMO LOGIN

        Replace this section later
        with your backend API request.
    */

    setTimeout(function () {

        loginBtn.classList.remove("loading");

        loginBtn.disabled = false;

        alert("Login successful! 🚀");

        // Later:
        // window.location.href = "dashboard.html";

    }, 1500);

});


/* =========================
   FORGOT PASSWORD
========================= */

forgotPassword.addEventListener("click", function (event) {

    event.preventDefault();

    const emailValue = email.value.trim();


    if (emailValue === "") {

        alert(
            "Please enter your email first."
        );

        email.focus();

        return;
    }


    if (!validateEmail(emailValue)) {

        alert(
            "Please enter a valid email."
        );

        email.focus();

        return;
    }


    alert(
        "Password reset link will be sent to " +
        emailValue
    );

});


/* =========================
   GOOGLE LOGIN
========================= */

googleBtn.addEventListener("click", function () {

    alert(
        "Google authentication will be connected here."
    );

});


/* =========================
   SIGN UP
========================= */

signupLink.addEventListener("click", function (event) {

    event.preventDefault();

    // Later:
    // window.location.href = "signup.html";

    alert(
        "Redirecting to account creation..."
    );

});