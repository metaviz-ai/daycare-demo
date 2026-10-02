/* =========================================================
   Little Sprouts Daycare — main JavaScript
   ---------------------------------------------------------
   This one file is shared by every page. It does four jobs:
     1. Opens and closes the mobile (hamburger) menu
     2. Highlights the current page in the navigation
     3. Checks the contact form before it is sent
     4. Shows parent testimonials one at a time (home page)
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


/* ---------- 4. Testimonials, one at a time ----------
   On the home page, show one parent quote at a time with
   a row of dots underneath to pick a different one. The
   quotes also change by themselves every 8 seconds, but
   stop while you're pointing at or tabbed into them, and
   don't move at all if your device is set to reduce motion.
   Without JavaScript, all the quotes simply show in a list. */
const testimonialList = document.querySelector(".testimonials");

if (testimonialList) {
    const testimonials = testimonialList.querySelectorAll(".testimonial");
    const dotsRow = document.createElement("div");
    const dots = [];
    let current = 0;
    let isPaused = false;

    // Shows the quote at position "index" and lights up its dot.
    function showTestimonial(index) {
        testimonials[current].classList.remove("is-current");
        dots[current].removeAttribute("aria-current");
        current = index;
        testimonials[current].classList.add("is-current");
        dots[current].setAttribute("aria-current", "true");
    }

    // Make one dot button for each quote.
    dotsRow.className = "testimonial-dots";
    testimonials.forEach(function (testimonial, index) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "testimonial-dot";
        dot.setAttribute("aria-label", "Show testimonial " + (index + 1) + " of " + testimonials.length);
        dot.addEventListener("click", function () {
            showTestimonial(index);
        });
        dots.push(dot);
        dotsRow.appendChild(dot);
    });

    // Only rotate if there's more than one quote to show.
    if (testimonials.length > 1) {
        testimonialList.after(dotsRow);
        testimonialList.classList.add("is-rotating");
        testimonials[0].classList.add("is-current");
        dots[0].setAttribute("aria-current", "true");

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const testimonialArea = testimonialList.parentElement;

        // Pause while the visitor is reading (mouse over) or using the dots (keyboard focus).
        testimonialArea.addEventListener("mouseenter", function () { isPaused = true; });
        testimonialArea.addEventListener("mouseleave", function () { isPaused = false; });
        testimonialArea.addEventListener("focusin", function () { isPaused = true; });
        testimonialArea.addEventListener("focusout", function () { isPaused = false; });

        if (!reduceMotion) {
            setInterval(function () {
                if (!isPaused) {
                    showTestimonial((current + 1) % testimonials.length);
                }
            }, 8000);
        }
    }
}
