(() => {
  const toggle = document.querySelector(".menu-toggle");
  const header = toggle?.closest(".topbar");
  const navigation = document.getElementById(toggle?.getAttribute("aria-controls") || "");
  if (!toggle || !header || !navigation) return;

  const setOpen = (open) => {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    const label = toggle.querySelector(".menu-toggle-label");
    if (label) label.textContent = open ? "Close" : "Menu";
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });
  window.matchMedia("(min-width: 701px)").addEventListener("change", () => setOpen(false));
})();
