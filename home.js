const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const yearTarget = document.getElementById("home-year");

if (yearTarget) {
  yearTarget.textContent = "© " + new Date().getFullYear() + " Footprints to Feel Better";
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.classList.toggle("is-open", !isOpen);
    mobileMenu.hidden = isOpen;
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.classList.remove("is-open");
      mobileMenu.hidden = true;
    });
  });
}
