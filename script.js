const weddingDate = new Date("2027-08-07T00:00:00-06:00");

const units = {
  days: document.querySelector("[data-days]"),
  hours: document.querySelector("[data-hours]"),
  minutes: document.querySelector("[data-minutes]"),
  seconds: document.querySelector("[data-seconds]"),
};

function updateCountdown() {
  const remaining = Math.max(0, weddingDate.getTime() - Date.now());
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);

  units.days.textContent = String(days);
  units.hours.textContent = String(hours).padStart(2, "0");
  units.minutes.textContent = String(minutes).padStart(2, "0");
  units.seconds.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
window.setInterval(updateCountdown, 1_000);

const header = document.querySelector("[data-header]");
const setHeaderState = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

function setMenu(open) {
  menu.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("nav-open", open);
  menuButton.querySelector(".menu-toggle__label").textContent = open ? "Close" : "Menu";
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

const copyButton = document.querySelector("[data-copy-date]");
const copyLabel = document.querySelector("[data-copy-label]");
const copyStatus = document.querySelector("[data-copy-status]");

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("Saturday, August 7, 2027");
    copyLabel.textContent = "Date copied";
    copyStatus.textContent = "Saturday, August 7, 2027 copied to clipboard.";
  } catch {
    copyLabel.textContent = "August 7, 2027";
    copyStatus.textContent = "The date is Saturday, August 7, 2027.";
  }

  window.setTimeout(() => {
    copyLabel.textContent = "Copy the date";
    copyStatus.textContent = "";
  }, 2_400);
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6%" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
