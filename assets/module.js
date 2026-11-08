(() => {
  const dialog = document.querySelector(".lightbox");
  if (!dialog) return;

  const image = dialog.querySelector(".lightbox-image");
  const title = dialog.querySelector(".lightbox-title");
  const closeButton = dialog.querySelector(".lightbox-close");
  let trigger;

  function openLightbox(element) {
    trigger = element;
    image.src = element.dataset.enlarge;
    image.alt = element.alt;
    title.textContent = element.dataset.title;
    dialog.showModal();
    closeButton.focus();
  }

  function closeLightbox() {
    dialog.close();
  }

  document.querySelectorAll("[data-enlarge]").forEach((element) => {
    element.addEventListener("click", () => openLightbox(element));
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(element);
      }
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeLightbox();
  });
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    trigger?.focus();
  });
})();
