/* ============================================================
   LA MESA DORADA — script.js
   ============================================================ */

(function () {
  "use strict";

  /* ──────────────────────────────────────────────────────────
     1. STICKY NAVIGATION
     Adds .site-header--scrolled after the user scrolls 60px.
  ────────────────────────────────────────────────────────── */

  var siteHeader = document.querySelector(".site-header");

  function onScroll() {
    if (window.scrollY > 60) {
      siteHeader.classList.add("site-header--scrolled");
    } else {
      siteHeader.classList.remove("site-header--scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load in case the page is already scrolled

  /* ──────────────────────────────────────────────────────────
     2. MOBILE NAVIGATION TOGGLE
  ────────────────────────────────────────────────────────── */

  var navToggle = document.getElementById("nav-toggle");
  var navMenu = document.getElementById("nav-menu");

  function openNav() {
    navMenu.classList.add("nav__menu--open");
    navToggle.classList.add("nav__toggle--open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  function closeNav() {
    navMenu.classList.remove("nav__menu--open");
    navToggle.classList.remove("nav__toggle--open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  navToggle.addEventListener("click", function () {
    navMenu.classList.contains("nav__menu--open") ? closeNav() : openNav();
  });

  // Close when any nav link is clicked (single-page navigation)
  navMenu.querySelectorAll(".nav__link").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navMenu.classList.contains("nav__menu--open")) {
      closeNav();
      navToggle.focus();
    }
  });

  /* ──────────────────────────────────────────────────────────
     3. MENU TABS
     ARIA-compliant tab panel with arrow-key keyboard support.
  ────────────────────────────────────────────────────────── */

  var tabs = Array.from(document.querySelectorAll(".menu__tab"));
  var panels = Array.from(document.querySelectorAll(".menu__panel"));

  function activateTab(tab) {
    // Deactivate all
    tabs.forEach(function (t) {
      t.classList.remove("menu__tab--active");
      t.setAttribute("aria-selected", "false");
      t.setAttribute("tabindex", "-1");
    });
    panels.forEach(function (p) {
      p.classList.add("menu__panel--hidden");
    });

    // Activate the chosen tab
    tab.classList.add("menu__tab--active");
    tab.setAttribute("aria-selected", "true");
    tab.setAttribute("tabindex", "0");

    var panel = document.getElementById(tab.getAttribute("aria-controls"));
    if (panel) panel.classList.remove("menu__panel--hidden");
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateTab(tab);
    });

    tab.addEventListener("keydown", function (e) {
      var idx = tabs.indexOf(tab);
      var next;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          next = tabs[(idx + 1) % tabs.length];
          next.focus();
          activateTab(next);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          next = tabs[(idx - 1 + tabs.length) % tabs.length];
          next.focus();
          activateTab(next);
          break;
        case "Home":
          e.preventDefault();
          tabs[0].focus();
          activateTab(tabs[0]);
          break;
        case "End":
          e.preventDefault();
          tabs[tabs.length - 1].focus();
          activateTab(tabs[tabs.length - 1]);
          break;
      }
    });
  });

  /* ──────────────────────────────────────────────────────────
     4. GALLERY LIGHTBOX
     Opens on trigger click; supports keyboard prev/next and
     focus trap while the modal is open.
  ────────────────────────────────────────────────────────── */

  var modal = document.getElementById("gallery-modal");
  var modalImage = document.getElementById("modal-image");
  var modalCaption = document.getElementById("modal-caption");
  var modalClose = document.getElementById("modal-close");
  var modalBackdrop = document.getElementById("modal-backdrop");
  var modalPrev = document.getElementById("modal-prev");
  var modalNext = document.getElementById("modal-next");
  var triggers = Array.from(document.querySelectorAll(".gallery__trigger"));

  var currentIdx = 0;
  var lastFocused = null;

  function openModal(index) {
    currentIdx = index;
    lastFocused = document.activeElement;
    loadImage(index);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function loadImage(index) {
    currentIdx = (index + triggers.length) % triggers.length;
    var trigger = triggers[currentIdx];
    modalImage.setAttribute("src", trigger.dataset.imgSrc);
    modalImage.setAttribute(
      "alt",
      trigger.querySelector("img").getAttribute("alt"),
    );
    modalCaption.textContent = trigger.dataset.imgCaption;
  }

  triggers.forEach(function (trigger, i) {
    trigger.addEventListener("click", function () {
      openModal(i);
    });
  });

  modalClose.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);
  modalPrev.addEventListener("click", function () {
    loadImage(currentIdx - 1);
  });
  modalNext.addEventListener("click", function () {
    loadImage(currentIdx + 1);
  });

  modal.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "Escape":
        closeModal();
        break;
      case "ArrowLeft":
        loadImage(currentIdx - 1);
        break;
      case "ArrowRight":
        loadImage(currentIdx + 1);
        break;
      case "Tab":
        trapFocus(e);
        break;
    }
  });

  function trapFocus(e) {
    var focusable = Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])',
      ),
    );
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ──────────────────────────────────────────────────────────
     5. RESERVATION FORM
     Client-side validation with inline error messages.
     Replace the setTimeout block with a real fetch() call
     when you connect a back-end or service such as FormSpree.
  ────────────────────────────────────────────────────────── */

  var form = document.getElementById("reservation-form");
  var successMsg = document.getElementById("reservation-success");

  // Prevent past dates in the date picker
  var dateInput = document.getElementById("res-date");
  var timeSelect = document.getElementById("res-time");

  if (dateInput) {
    dateInput.min = new Date().toISOString().split("T")[0];
  }

  // Hours by day type (last seating = close - 30 min)
  // Mon-Thu: 11am-9pm  → slots 11:00am–8:30pm
  // Fri-Sat: 11am-11pm → slots 11:00am–10:30pm
  // Sun:     12pm-8pm  → slots 12:00pm–7:30pm
  var daySchedules = {
    monThu: { startH: 11, startM: 0, endH: 20, endM: 30 },
    friSat: { startH: 11, startM: 0, endH: 22, endM: 30 },
    sun: { startH: 12, startM: 0, endH: 19, endM: 30 },
  };

  function formatTime(h, m) {
    var period = h < 12 ? "AM" : "PM";
    var display = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return display + ":" + (m === 0 ? "00" : m) + " " + period;
  }

  function populateTimes(schedule) {
    timeSelect.innerHTML = "";
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = "Select time";
    timeSelect.appendChild(placeholder);

    var h = schedule.startH;
    var m = schedule.startM;
    while (h < schedule.endH || (h === schedule.endH && m <= schedule.endM)) {
      var opt = document.createElement("option");
      opt.textContent = formatTime(h, m);
      timeSelect.appendChild(opt);
      m += 30;
      if (m >= 60) {
        m = 0;
        h++;
      }
    }
  }

  if (dateInput && timeSelect) {
    function updateTimesFromDate() {
      if (!dateInput.value) return;
      // Parse date as local (avoid UTC-offset day shift)
      var parts = dateInput.value.split("-");
      if (parts.length !== 3 || parts[2].length !== 2) return; // incomplete date
      var day = new Date(+parts[0], +parts[1] - 1, +parts[2]).getDay();
      // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      var schedule;
      if (day === 0) schedule = daySchedules.sun;
      else if (day === 5 || day === 6) schedule = daySchedules.friSat;
      else schedule = daySchedules.monThu;
      populateTimes(schedule);
      timeSelect.disabled = false;
    }
    dateInput.addEventListener("change", updateTimesFromDate);
    dateInput.addEventListener("input", updateTimesFromDate);
  }

  function getError(input) {
    if (input.required && !input.value.trim()) {
      return "This field is required.";
    }
    if (
      input.type === "email" &&
      input.value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)
    ) {
      return "Please enter a valid email address.";
    }
    return "";
  }

  function validateInput(input) {
    var field = input.closest(".form-field");
    var errorEl = field && field.querySelector(".form-field__error");
    var msg = getError(input);
    if (errorEl) errorEl.textContent = msg;
    input.classList.toggle("form-field__input--invalid", msg !== "");
    return msg === "";
  }

  // Live feedback: validate on blur, clear error as user fixes the value
  form.querySelectorAll(".form-field__input").forEach(function (input) {
    input.addEventListener("blur", function () {
      validateInput(input);
    });
    input.addEventListener("input", function () {
      if (input.classList.contains("form-field__input--invalid"))
        validateInput(input);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;
    form.querySelectorAll("[required]").forEach(function (input) {
      if (!validateInput(input)) valid = false;
    });
    if (!valid) {
      var first = form.querySelector(".form-field__input--invalid");
      if (first) first.focus();
      return;
    }

    var btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Sending\u2026";

    /*
      TODO: replace this timeout with your real API call, e.g.:
      fetch('/api/reservations', { method: 'POST', body: new FormData(form) })
        .then(function (res) { ... })
    */
    setTimeout(function () {
      form.reset();
      btn.disabled = false;
      btn.textContent = "Request Reservation";
      successMsg.hidden = false;
      successMsg.focus();
      setTimeout(function () {
        successMsg.hidden = true;
      }, 8000);
    }, 1200);
  });

  /* ──────────────────────────────────────────────────────────
     6. HERO VIDEO — reduced-motion fallback
     If the user prefers reduced motion, pause the video so it
     shows only the poster frame.
  ────────────────────────────────────────────────────────── */

  var heroVideo = document.querySelector(".hero__video");
  if (heroVideo) {
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReducedMotion.matches) {
      heroVideo.pause();
    }
    prefersReducedMotion.addEventListener("change", function () {
      prefersReducedMotion.matches ? heroVideo.pause() : heroVideo.play();
    });
  }
})();
