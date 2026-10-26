// Live demo - wakes the free API server early, then runs the app in an iframe on /demo/:role.
// The iframe keeps the app's real layout (1280 px desktop, 390 px phone) and is scaled to fit.

const VIRTUAL_WIDTH = { desktop: 1280, phone: 390 } as const;
type Device = keyof typeof VIRTUAL_WIDTH;

function initLiveDemo(root: HTMLElement) {
  const base = root.dataset.base!;
  const tabs = [...root.querySelectorAll<HTMLButtonElement>("[data-demo-tab]")];
  const deviceBox = root.querySelector<HTMLElement>("[data-demo-device]")!;
  const screen = root.querySelector<HTMLElement>("[data-demo-screen]")!;
  const poster = root.querySelector<HTMLImageElement>("[data-demo-poster]")!;
  const overlay = root.querySelector<HTMLElement>("[data-demo-overlay]")!;
  const launch = root.querySelector<HTMLButtonElement>("[data-demo-launch]")!;
  const launchNote = root.querySelector<HTMLElement>("[data-demo-launch-note]")!;
  const blurb = root.querySelector<HTMLElement>("[data-demo-blurb]")!;
  const url = root.querySelector<HTMLElement>("[data-demo-url]")!;
  const open = root.querySelector<HTMLAnchorElement>("[data-demo-open]")!;
  const statusText = root.querySelector<HTMLElement>("[data-demo-status-text]")!;
  const dot = root.querySelector<HTMLElement>("[data-demo-dot]")!;
  let iframe: HTMLIFrameElement | null = null;
  let active = tabs[0]!;

  const setStatus = (text: string, tone: "idle" | "busy" | "ok") => {
    statusText.textContent = text;
    const color = tone === "ok" ? "bg-mint-400" : tone === "busy" ? "bg-amber-300 animate-pulse" : "bg-text-3";
    dot.className = `size-1.5 rounded-full ${color}`;
  };

  // Free hosting sleeps when idle; start waking it while the visitor is still reading.
  let warmed = false;
  const warmUp = () => {
    if (warmed) return;
    warmed = true;
    setStatus("Waking up the server...", "busy");
    fetch(root.dataset.warmup!, { mode: "no-cors", cache: "no-store" })
      .then(() => {
        if (!iframe) setStatus("Server awake, ready to launch", "ok");
      })
      .catch(() => setStatus("Live app, not a video", "idle"));
  };
  const nearby = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      warmUp();
      nearby.disconnect();
    },
    { rootMargin: "400px 0px" },
  );
  nearby.observe(root);

  const fitFrame = () => {
    if (!iframe) return;
    const device = (deviceBox.dataset.demoDevice as Device | undefined) ?? "desktop";
    const scale = screen.clientWidth / VIRTUAL_WIDTH[device];
    iframe.style.width = `${VIRTUAL_WIDTH[device]}px`;
    iframe.style.height = `${screen.clientHeight / scale}px`;
    iframe.style.transform = `scale(${scale})`;
  };
  new ResizeObserver(fitFrame).observe(screen);

  const start = () => {
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.allow = "geolocation; clipboard-write";
      iframe.referrerPolicy = "no-referrer";
      iframe.addEventListener("load", () => setStatus(`Live · ${active.dataset.label}`, "ok"));
      screen.append(iframe);
    }
    iframe.title = `${active.dataset.label} demo`;
    setStatus("Starting the app...", "busy");
    iframe.src = `${base}${active.dataset.path}`;
    overlay.hidden = true;
    poster.hidden = true;
    fitFrame();
  };

  const select = (tab: HTMLButtonElement) => {
    active = tab;
    tabs.forEach((other) => other.setAttribute("aria-selected", String(other === tab)));
    deviceBox.dataset.demoDevice = tab.dataset.device;
    blurb.textContent = tab.dataset.blurb ?? "";
    url.textContent = `${new URL(base).host}${tab.dataset.path}`;
    open.href = `${base}${tab.dataset.path}`;
    launchNote.textContent = `Signs you in as the demo ${tab.dataset.label!.toLowerCase()}. No account needed.`;
    if (iframe) {
      start();
    } else {
      poster.src = tab.dataset.poster!;
      poster.alt = `${tab.dataset.label} screen`;
    }
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length]!;
      next.focus();
      select(next);
    });
  });
  launch.addEventListener("click", () => {
    warmUp();
    start();
  });
}

document.querySelectorAll<HTMLElement>("[data-live-demo]").forEach(initLiveDemo);
