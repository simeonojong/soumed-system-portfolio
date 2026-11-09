(() => {
  const search = document.querySelector("#module-search");
  const filters = document.querySelector("#module-filters");
  const results = document.querySelector("#module-results");
  const count = document.querySelector("#module-count");
  const catalogue = search?.closest(".catalogue");

  if (!search || !filters || !results || !count) {
    return;
  }

  let modules = [];
  let selectedCategory = "all";
  const catalogueUrl = catalogue?.dataset.catalogueUrl ?? "modules.json";
  const moduleBase = catalogue?.dataset.moduleBase ?? "modules/";

  const normalized = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  function updateAddressBar() {
    const url = new URL(window.location.href);
    const query = search.value.trim();

    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }

    if (selectedCategory !== "all") {
      url.searchParams.set("category", selectedCategory);
    } else {
      url.searchParams.delete("category");
    }

    window.history.replaceState(null, "", url);
  }

  function makeFilter(category, label) {
    const button = document.createElement("button");
    button.className = "filter-chip";
    button.type = "button";
    button.dataset.category = category;
    button.textContent = label;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      selectedCategory = category;
      render();
      updateAddressBar();
    });
    filters.append(button);
  }

  function createTile(module) {
    const link = document.createElement("a");
    link.className = "module-tile";
    link.href = `${moduleBase}${encodeURIComponent(module.slug)}/`;

    const category = document.createElement("span");
    category.className = "module-tile-category";
    category.textContent = module.category;

    const title = document.createElement("h3");
    title.className = "module-tile-title";
    title.textContent = module.title;

    const summary = document.createElement("p");
    summary.className = "module-tile-summary";
    summary.textContent = module.summary;

    const arrow = document.createElement("span");
    arrow.className = "module-tile-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";

    link.append(category, title, summary, arrow);
    return link;
  }

  function render() {
    const query = normalized(search.value);
    const matchingModules = modules.filter((module) => {
      const matchesCategory = selectedCategory === "all"
        || module.category === selectedCategory;
      const haystack = normalized([
        module.title,
        module.category,
        module.summary,
        module.description,
        ...module.features,
        ...module.keywords
      ].join(" "));
      return matchesCategory && (!query || haystack.includes(query));
    });

    filters.querySelectorAll(".filter-chip").forEach((button) => {
      const active = button.dataset.category === selectedCategory;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    count.textContent = `${matchingModules.length} of ${modules.length} modules`;
    results.replaceChildren();

    if (matchingModules.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "catalogue-message";
      emptyState.textContent = "No matching modules. Try another search or choose a different category.";
      results.append(emptyState);
      return;
    }

    matchingModules.forEach((module) => results.append(createTile(module)));
  }

  async function loadModules() {
    results.setAttribute("aria-busy", "true");

    try {
      const response = await fetch(catalogueUrl, {
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Module catalogue request failed with HTTP ${response.status}.`);
      }

      const catalogue = await response.json();

      if (!Array.isArray(catalogue) || catalogue.length === 0) {
        throw new Error("The module catalogue is empty or has an invalid format.");
      }

      modules = catalogue;
      selectedCategory = new URLSearchParams(window.location.search)
        .get("category") || "all";
      const availableCategories = new Set(modules.map((module) => module.category));
      if (selectedCategory !== "all" && !availableCategories.has(selectedCategory)) {
        selectedCategory = "all";
      }

      search.value = new URLSearchParams(window.location.search).get("q") || "";
      [...availableCategories].forEach((category) => makeFilter(category, category));
      render();
    } catch (error) {
      count.textContent = "Module directory unavailable";
      results.replaceChildren();
      const message = document.createElement("p");
      message.className = "catalogue-message";
      message.setAttribute("role", "alert");
      message.textContent = "We couldn't load the module directory. Please refresh the page or try again later.";
      results.append(message);
      console.error("Could not load the SouMed module catalogue.", error);
    } finally {
      results.setAttribute("aria-busy", "false");
    }
  }

  search.addEventListener("input", () => {
    render();
    updateAddressBar();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const target = event.target;
      if (!(target instanceof HTMLElement)
        || target.isContentEditable
        || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) {
        return;
      }
      event.preventDefault();
      search.focus();
    }

    if (event.key === "Escape" && document.activeElement === search) {
      search.blur();
    }
  });

  loadModules();
})();
