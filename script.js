document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const revealItems = document.querySelectorAll(".stat-item, .benefit-card, .cards article, .contact-shell");

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  });

  revealItems.forEach((item) => item.classList.add("reveal"));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));

});
