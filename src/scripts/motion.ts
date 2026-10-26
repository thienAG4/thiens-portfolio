// Motion - scroll reveals, count-up numbers, nav state, mobile menu, card spotlight, copy e-mail
// and the local clock. Everything respects prefers-reduced-motion.

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== Reveal on scroll =====
function initReveal() {
  const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (reducedMotion) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    // Threshold 0: a ratio would never be reached by blocks taller than the screen (case study prose).
    { rootMargin: "0px 0px -8% 0px", threshold: 0 },
  );
  items.forEach((item) => observer.observe(item));
}

// ===== Count-up numbers =====
function initCounters() {
  if (reducedMotion) return;
  const run = (element: HTMLElement) => {
    const target = Number(element.dataset.count);
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 4))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        run(entry.target as HTMLElement);
      }
    },
    { threshold: 0.6 },
  );
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((counter) => {
    counter.textContent = "0";
    observer.observe(counter);
  });
}

// ===== Nav: scrolled state, active section, mobile menu =====
function initNav() {
  const nav = document.querySelector<HTMLElement>("[data-nav] nav");
  const onScroll = () => nav?.toggleAttribute("data-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const links = new Map(
    [...document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]")].map((link) => [link.dataset.navLink!, link]),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((link, id) => link.toggleAttribute("data-active", id === entry.target.id));
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  const button = document.querySelector<HTMLButtonElement>("[data-menu-button]");
  const menu = document.querySelector<HTMLElement>("[data-menu]");
  const setOpen = (open: boolean) => {
    menu?.classList.toggle("hidden", !open);
    button?.setAttribute("aria-expanded", String(open));
  };
  button?.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
}

// ===== Card spotlight follows the cursor =====
function initSpotlight() {
  if (reducedMotion || !window.matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll<HTMLElement>("[data-spotlight]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

// ===== Copy e-mail and local time =====
function initContact() {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    const label = button.querySelector<HTMLElement>("[data-copy-label]");
    const text = button.dataset.copy!;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return;
      }
      if (label) label.textContent = "Copied to clipboard";
      window.setTimeout(() => {
        if (label) label.textContent = text;
      }, 1800);
    });
  });

  document.querySelectorAll<HTMLElement>("[data-local-time]").forEach((element) => {
    const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: element.dataset.localTime });
    const update = () => (element.textContent = format.format(new Date()));
    update();
    window.setInterval(update, 30_000);
  });
}

initReveal();
initCounters();
initNav();
initSpotlight();
initContact();
