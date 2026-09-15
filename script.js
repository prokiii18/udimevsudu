document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setMenu = (open) => {
    if (!header || !menuToggle || !mobileMenu) return;
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    mobileMenu.setAttribute("aria-hidden", String(!open));
  };

  if (header && menuToggle && mobileMenu) {
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
  }

  const heroCallLink = document.querySelector(".hero .actions .btn.outline");
  if (heroCallLink && /zavolejte/i.test(heroCallLink.textContent)) {
    heroCallLink.setAttribute("href", "tel:+420705358844");
  }

  let scrollAnimation = 0;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      cancelAnimationFrame(scrollAnimation);

      scrollAnimation = requestAnimationFrame(() => {
        const sectionGap = window.matchMedia("(max-width: 900px)").matches ? 24 : 40;
        const headerOffset = (header?.offsetHeight || 0) + sectionGap;
        const targetY = hash === "#top"
          ? 0
          : Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);

        if (reduceMotionQuery.matches) {
          window.scrollTo(0, targetY);
          history.pushState(null, "", hash);
          return;
        }

        const startY = window.scrollY;
        const distance = targetY - startY;
        const duration = Math.min(1050, Math.max(600, Math.abs(distance) * 0.42));
        const startTime = performance.now();
        const easeInOutCubic = (progress) => progress < 0.5
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
  });

  if (header) {
    const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  const revealItems = document.querySelectorAll(".feature-block, .benefit-card, .cards article, .contact-shell");
  revealItems.forEach((item) => item.classList.add("reveal"));

  if (reduceMotionQuery.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const form = document.querySelector(".contact-form");
  if (!form) return;

  const submitButton = form.querySelector(".form-submit .btn");
  const nameField = form.querySelector('[name="name"]');
  const phoneField = form.querySelector('[name="phone"]');
  const emailField = form.querySelector('[name="email"]');
  const productField = form.querySelector('[name="product"]');
  const messageField = form.querySelector('[name="message"]');
  const formNote = form.querySelector(".contact-note");

  if (submitButton) {
    submitButton.type = "submit";
    submitButton.innerHTML = 'Odeslat e-mailem <span aria-hidden="true">→</span>';
  }

  if (nameField) nameField.required = true;

  if (formNote) {
    const dot = formNote.querySelector("span");
    formNote.textContent = "";
    if (dot) formNote.appendChild(dot);
    formNote.append(" Formulář připraví zprávu ve vašem e-mailovém programu");
  }

  const status = document.createElement("div");
  status.className = "contact-form-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.style.minHeight = "1.4em";
  status.style.fontSize = "12px";
  status.style.color = "#c9c5be";
  form.appendChild(status);

  const clearContactValidity = () => {
    phoneField?.setCustomValidity("");
    emailField?.setCustomValidity("");
  };

  phoneField?.addEventListener("input", clearContactValidity);
  emailField?.addEventListener("input", clearContactValidity);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearContactValidity();

    const name = nameField?.value.trim() || "";
    const phone = phoneField?.value.trim() || "";
    const email = emailField?.value.trim() || "";
    const product = productField?.value.trim() || "Ještě nevím, potřebuji poradit";
    const message = messageField?.value.trim() || "Bez doplňující zprávy";

    if (!name) {
      nameField?.setCustomValidity("Vyplňte prosím jméno a příjmení.");
      nameField?.reportValidity();
      nameField?.setCustomValidity("");
      return;
    }

    if (!phone && !email) {
      emailField?.setCustomValidity("Vyplňte prosím e-mail nebo telefon.");
      emailField?.reportValidity();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const subject = `Poptávka z webu – ${product}`;
    const body = [
      `Jméno: ${name}`,
      `Telefon: ${phone || "neuveden"}`,
      `E-mail: ${email || "neuveden"}`,
      `Varianta: ${product}`,
      "",
      "Zpráva:",
      message
    ].join("\n");

    status.textContent = "Otevírám e-mailový program s připravenou poptávkou…";
    window.location.href = `mailto:davo.prokes@seznam.cz?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});
