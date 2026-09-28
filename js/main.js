/* =========================================================
   Little Sprouts Daycare — main JavaScript
   ---------------------------------------------------------
   This one file is shared by every page. It does three jobs:
     1. Opens and closes the mobile (hamburger) menu
     2. Highlights the current page in the navigation
     3. Checks the contact form before it is sent
   ========================================================= */


/* ---------- 1. Mobile menu ----------
   On small screens the navigation is hidden. Clicking the
   hamburger button adds or removes the "is-open" class,
   and the CSS shows the menu while that class is there. */
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

menuToggle.addEventListener("click", function () {
    // toggle() adds the class if it's missing or removes it if it's there,
    // then tells us (true or false) whether the menu is now open.
    const isOpen = siteNav.classList.toggle("is-open");

    // Let screen readers know whether the menu is open or closed.
    menuToggle.setAttribute("aria-expanded", isOpen);
});


/* ---------- 2. Highlight the current page ----------
   Works out the file name of the page we're on
   (for example "about.html") and marks the matching
   navigation link as active. */
let currentPage = window.location.pathname.split("/").pop();

// An address ending in "/" (like the Netlify home page) means index.html.
if (currentPage === "") {
    currentPage = "index.html";
}

// Netlify can show addresses without ".html" (like "/about"),
// so we add it back to match the links in our menu.
if (!currentPage.endsWith(".html")) {
    currentPage = currentPage + ".html";
}

document.querySelectorAll(".nav-link").forEach(function (link) {
    if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
        // Tells screen-reader users "this is the page you're on".
        link.setAttribute("aria-current", "page");
    }
});


/* ---------- 3. Contact form validation ----------
   Before the form is sent, check that the required fields
   are filled in and the email looks real. If something is
   wrong, show a friendly message under that field and
   don't send the form yet. */
const contactForm = document.querySelector(".contact-form");

// A simple email check: some text, an @, some text, a dot, some text.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checks one field, shows or clears its message,
// and returns true if the field is OK.
function validateField(field) {
    const errorMessage = document.getElementById(field.id + "-error");
    const value = field.value.trim();
    let message = "";

    if (value === "") {
        // Each field's friendly message lives in its data-error attribute in the HTML.
        message = field.dataset.error;
    } else if (field.type === "email" && !emailPattern.test(value)) {
        message = "That email doesn't look quite right. Please check it (for example: name@example.com).";
    }

    errorMessage.textContent = message;
    field.setAttribute("aria-invalid", message !== "");
    return message === "";
}

// Only the contact page has the form, so skip this on other pages.
if (contactForm) {
    const requiredFields = contactForm.querySelectorAll("[required]");

    // Switch off the browser's own pop-up messages so ours show instead.
    // (If JavaScript is turned off, the browser's built-in checks still work.)
    contactForm.noValidate = true;

    contactForm.addEventListener("submit", function (event) {
        let firstProblemField = null;

        requiredFields.forEach(function (field) {
            const isValid = validateField(field);
            if (!isValid && firstProblemField === null) {
                firstProblemField = field;
            }
        });

        // Something needs fixing: stop the form sending
        // and move the cursor to the first problem.
        if (firstProblemField !== null) {
            event.preventDefault();
            firstProblemField.focus();
        }
    });

    // Once a field is showing a message, re-check it as the parent types
    // so the message disappears as soon as it's fixed.
    requiredFields.forEach(function (field) {
        field.addEventListener("input", function () {
            if (field.getAttribute("aria-invalid") === "true") {
                validateField(field);
            }
        });
    });
}
