/* ==========================================================
   CSC441 Team Project - shared JavaScript
   Sections:
     1. Shared features (every page)
     2. DOM modification demos
     3. Form validation
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 1. Shared features ---------- */

  // Footer year (DOM: change text)
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Dark mode toggle (DOM: change CSS via a class) + remember choice
  const themeBtn = document.getElementById("themeBtn");
  if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");
  const updateThemeLabel = () => {
    if (themeBtn) themeBtn.textContent = document.body.classList.contains("dark") ? "Light mode" : "Dark mode";
  };
  updateThemeLabel();
  themeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    updateThemeLabel();
  });

  // Mobile menu toggle (DOM: change class + attribute)
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("mainNav");
  menuBtn?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });

  /* ---------- 2. DOM modification demos ---------- */

  // Home page: greeting based on time of day
  const greeting = document.getElementById("greeting");
  if (greeting) {
    const h = new Date().getHours();
    greeting.textContent = h < 12 ? "Good morning!" : h < 18 ? "Good afternoon!" : "Good evening!";
  }

  // Catalog page: build cards from data, then filter with search
  // TODO: replace sampleItems with data from MySQL (via Node.js) later
  const sampleItems = [
    { name: "Item One", description: "Placeholder description.", price: 19.99 },
    { name: "Item Two", description: "Placeholder description.", price: 29.99 },
    { name: "Item Three", description: "Placeholder description.", price: 9.99 },
    { name: "Item Four", description: "Placeholder description.", price: 49.99 },
    { name: "Item Five", description: "Placeholder description.", price: 14.99 },
    { name: "Item Six", description: "Placeholder description.", price: 39.99 }
  ];

  const itemGrid = document.getElementById("itemGrid");
  const searchBox = document.getElementById("searchBox");
  const noResults = document.getElementById("noResults");

  function renderItems(items) {
    itemGrid.innerHTML = "";                       // clear old cards
    items.forEach(item => {
      const card = document.createElement("article"); // create new element
      card.className = "card";
      const h3 = document.createElement("h3");
      h3.textContent = item.name;
      const p = document.createElement("p");
      p.textContent = item.description;
      const price = document.createElement("p");
      price.className = "price";
      price.textContent = "$" + item.price.toFixed(2);
      card.append(h3, p, price);
      itemGrid.appendChild(card);                  // add it to the page
    });
    noResults.classList.toggle("hidden", items.length > 0);
  }

  if (itemGrid) {
    renderItems(sampleItems);
    searchBox.addEventListener("input", () => {
      const q = searchBox.value.trim().toLowerCase();
      renderItems(sampleItems.filter(i => i.name.toLowerCase().includes(q)));
    });
  }

  /* ---------- 3. Form validation ---------- */

  // Helpers: show / clear an error under a field
  function setError(input, message) {
    const msg = input.parentElement.querySelector(".error-msg");
    if (msg) msg.textContent = message;
    input.classList.add("invalid");
    input.classList.remove("valid");
  }
  function setValid(input) {
    const msg = input.parentElement.querySelector(".error-msg");
    if (msg) msg.textContent = "";
    input.classList.remove("invalid");
    input.classList.add("valid");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\d{3}-?\d{3}-?\d{4}$/;

  // Contact form
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const message = document.getElementById("message");
    const charCount = document.getElementById("charCount");
    const status = document.getElementById("formStatus");

    // Live character counter (DOM: update text as user types)
    message.addEventListener("input", () => {
      charCount.textContent = `${message.value.length} / 500`;
      charCount.style.color = message.value.length > 500 ? "var(--color-error)" : "";
    });

    contactForm.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      const name = document.getElementById("name");
      const email = document.getElementById("email");
      const phone = document.getElementById("phone");
      const topic = document.getElementById("topic");

      if (name.value.trim().length < 2) { setError(name, "Please enter your name."); ok = false; } else setValid(name);
      if (!emailPattern.test(email.value.trim())) { setError(email, "Please enter a valid email."); ok = false; } else setValid(email);
      if (phone.value.trim() && !phonePattern.test(phone.value.trim())) { setError(phone, "Use format 555-555-5555."); ok = false; } else setValid(phone);
      if (!topic.value) { setError(topic, "Please choose a topic."); ok = false; } else setValid(topic);
      if (message.value.trim().length < 10 || message.value.length > 500) { setError(message, "Message must be 10-500 characters."); ok = false; } else setValid(message);

      if (ok) {
        // TODO (later module): send data to Node.js server -> MongoDB
        status.textContent = `Thanks, ${name.value.trim()}! Your message was received.`;
        status.className = "success";
        contactForm.reset();
        charCount.textContent = "0 / 500";
        contactForm.querySelectorAll(".valid").forEach(el => el.classList.remove("valid"));
      } else {
        status.textContent = "Please fix the errors above.";
        status.className = "error";
      }
    });
  }

  // Review form: validate, then add the review to the page
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      const name = document.getElementById("reviewName");
      const rating = document.getElementById("rating");
      const text = document.getElementById("reviewText");

      if (name.value.trim().length < 2) { setError(name, "Please enter your name."); ok = false; } else setValid(name);
      if (!rating.value) { setError(rating, "Please choose a rating."); ok = false; } else setValid(rating);
      if (text.value.trim().length < 5) { setError(text, "Review must be at least 5 characters."); ok = false; } else setValid(text);

      if (ok) {
        // DOM: create a new list item and put it at the top of the list
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = name.value.trim();
        li.append(strong, ` \u2013 ${rating.value}/5`, document.createElement("br"), text.value.trim());
        document.getElementById("reviewList").prepend(li);
        // TODO (later module): POST review to Node.js server -> MongoDB
        reviewForm.reset();
        reviewForm.querySelectorAll(".valid").forEach(el => el.classList.remove("valid"));
      }
    });
  }
});
