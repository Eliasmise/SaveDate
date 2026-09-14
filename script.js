const weddingDate = new Date("2027-08-07T00:00:00-06:00");

const backgroundMusic = document.querySelector("[data-background-music]");
backgroundMusic.volume = 0.55;
backgroundMusic.play().catch(() => {});

const opening = document.querySelector("[data-opening]");
const openingStage = document.querySelector("[data-opening-stage]");
const openingCta = document.querySelector("[data-opening-cta]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (from, to, progress) => from + (to - from) * progress;
const phase = (progress, start, end) => clamp((progress - start) / (end - start));
const smoothstep = (progress) => progress * progress * (3 - 2 * progress);
const easeOutCubic = (progress) => 1 - (1 - progress) ** 3;

let openingFrame = 0;
let openingCtaReady;

function setOpeningCtaReady(ready) {
  if (ready === openingCtaReady) return;
  openingCtaReady = ready;
  opening.classList.toggle("is-card-ready", ready);

  if (ready) {
    openingCta.removeAttribute("tabindex");
    openingCta.removeAttribute("aria-hidden");
  } else {
    openingCta.setAttribute("tabindex", "-1");
    openingCta.setAttribute("aria-hidden", "true");
  }
}

function setReducedOpening() {
  opening.classList.add("is-reduced-motion", "is-flap-behind");
  openingStage.removeAttribute("style");
  opening.style.removeProperty("--prompt-opacity");
  setOpeningCtaReady(true);
}

function renderOpening() {
  openingFrame = 0;

  if (reducedMotion.matches) {
    setReducedOpening();
    return;
  }

  opening.classList.remove("is-reduced-motion");

  const viewportHeight = window.innerHeight;
  const bounds = opening.getBoundingClientRect();
  const scrollDistance = Math.max(1, bounds.height - viewportHeight);
  const progress = clamp(-bounds.top / scrollDistance);

  const flapProgress = smoothstep(phase(progress, 0.08, 0.31));
  const cardProgress = easeOutCubic(phase(progress, 0.25, 0.64));
  const settleProgress = smoothstep(phase(progress, 0.58, 0.88));
  const copyProgress = smoothstep(phase(progress, 0.58, 0.82));
  const envelopeFade = smoothstep(phase(progress, 0.74, 0.96));
  const promptFade = smoothstep(phase(progress, 0.03, 0.18));

  const extractedCardY = mix(viewportHeight * 0.015, -viewportHeight * 0.22, cardProgress);
  const cardY = mix(extractedCardY, -viewportHeight * 0.042, settleProgress);
  const extractedScale = mix(0.58, 0.85, cardProgress);
  const cardScale = mix(extractedScale, 0.98, settleProgress);
  const extractedRotation = mix(-0.4, -1.15, cardProgress);
  const cardRotation = mix(extractedRotation, 0.55, settleProgress);

  openingStage.style.setProperty("--flap-angle", `${mix(0, 178, flapProgress).toFixed(3)}deg`);
  openingStage.style.setProperty("--card-opacity", smoothstep(phase(progress, 0.17, 0.28)).toFixed(4));
  openingStage.style.setProperty("--card-y", `${cardY.toFixed(2)}px`);
  openingStage.style.setProperty("--card-scale", cardScale.toFixed(4));
  openingStage.style.setProperty("--card-rotate", `${cardRotation.toFixed(3)}deg`);
  openingStage.style.setProperty("--copy-opacity", copyProgress.toFixed(4));
  openingStage.style.setProperty("--envelope-y", `${mix(0, viewportHeight * 0.34, settleProgress).toFixed(2)}px`);
  openingStage.style.setProperty("--envelope-opacity", mix(1, 0.28, envelopeFade).toFixed(4));
  opening.style.setProperty("--prompt-opacity", (1 - promptFade).toFixed(4));

  opening.classList.toggle("is-flap-behind", flapProgress >= 0.5);
  setOpeningCtaReady(progress >= 0.8);
}

function queueOpeningRender() {
  if (openingFrame) return;
  openingFrame = window.requestAnimationFrame(renderOpening);
}

function handleMotionPreference() {
  if (reducedMotion.matches) {
    setReducedOpening();
  } else {
    opening.classList.remove("is-reduced-motion");
    queueOpeningRender();
  }
}

setOpeningCtaReady(false);
renderOpening();
window.addEventListener("scroll", queueOpeningRender, { passive: true });
window.addEventListener("resize", queueOpeningRender, { passive: true });
reducedMotion.addEventListener("change", handleMotionPreference);

if ("IntersectionObserver" in window) {
  const openingObserver = new IntersectionObserver(
    ([entry]) => {
      opening.classList.toggle("is-motion-active", entry.isIntersecting);
      document.body.classList.toggle("opening-active", entry.isIntersecting);
      if (entry.isIntersecting) queueOpeningRender();
    },
    { rootMargin: "80% 0px" },
  );

  openingObserver.observe(opening);
} else {
  opening.classList.add("is-motion-active");
  document.body.classList.add("opening-active");
}

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
