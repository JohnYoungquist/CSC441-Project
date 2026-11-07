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

  /* ---------- Home greeting ---------- */

  // Home page: greeting based on time of day
  const greeting = document.getElementById("greeting");
  if (greeting) {
    const h = new Date().getHours();
    greeting.textContent = h < 12 ? "Good morning!" : h < 18 ? "Good afternoon!" : "Good evening!";
  }
});
