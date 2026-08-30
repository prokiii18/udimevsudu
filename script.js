document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const revealItems = document.querySelectorAll(".quick-heading, .quick-card, .feature-block, .benefit-card, .cards article, .contact-shell");

  const setMenu = (open) => {
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    mobileMenu.setAttribute("aria-hidden", String(!open));
  };

  menuToggle.addEventListener("click", () => {
    setMenu(!header.classList.contains("menu-open"));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("menu-open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) setMenu(false);
  });

  let scrollAnimation = 0;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      cancelAnimationFrame(scrollAnimation);

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const sectionGap = window.matchMedia("(max-width: 900px)").matches ? 24 : 40;
      const headerOffset = header.offsetHeight + sectionGap;
      const targetY = hash === "#top"
        ? 0
        : Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);

      if (reduceMotion) {
        window.scrollTo(0, targetY);
        history.pushState(null, "", hash);
        return;
      }

      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = Math.min(1050, Math.max(600, Math.abs(distance) * 0.42));
      const startTime = performance.now();
      const easeInOutCubic = (progress) => progress < .5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const animateScroll = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));
        if (progress < 1) {
          scrollAnimation = requestAnimationFrame(animateScroll);
        } else {
          history.pushState(null, "", hash);
        }
      };

      scrollAnimation = requestAnimationFrame(animateScroll);
    });
  });

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  }, { passive: true });

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
