/* =========================================================
   SINTÉTICA ARENA — Lógica de la página
   ========================================================= */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "573014734171"; // Cambia este número por el tuyo

  /* ---------- Utilidades ---------- */
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $all(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* ---------- Año del footer ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header con sombra al hacer scroll ---------- */
  var header = $("#header");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var navToggle = $("#navToggle");
  var navMenu = $("#navMenu");
  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-active");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle.addEventListener("click", function () {
    var open = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-active", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $all(".nav__link, .nav__cta", navMenu).forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
  document.addEventListener("click", function (e) {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
  });

  /* ---------- Animaciones de aparición ---------- */
  var revealEls = $all(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Contadores animados ---------- */
  var counters = $all("[data-count]");
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value.toLocaleString("es-CO") + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("es-CO") + suffix;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterIO.observe(el); });
  }

  /* ---------- Galería / Lightbox ---------- */
  var lightbox = $("#lightbox");
  var lightboxImg = $("#lightboxImg");
  var lightboxClose = $("#lightboxClose");

  $all(".gallery__item").forEach(function (item) {
    item.addEventListener("click", function () {
      var src = item.getAttribute("data-img");
      lightboxImg.src = src;
      lightbox.classList.add("show");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });
  function closeLightbox() {
    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lightboxImg.src = "";
  }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- Formulario de reserva ---------- */
  var form = $("#bookingForm");
  var dateInput = $("#date");
  var timeSelect = $("#time");
  var feedback = $("#bookingFeedback");

  /* Fecha mínima = hoy */
  if (dateInput) {
    var today = new Date();
    var iso = today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");
    dateInput.min = iso;
  }

  /* Generar franjas horarias (6:00 a 22:00) */
  if (timeSelect) {
    for (var h = 6; h <= 22; h++) {
      var opt = document.createElement("option");
      var hh = String(h).padStart(2, "0");
      opt.value = hh + ":00";
      opt.textContent = hh + ":00" + (h < 12 ? " am" : h === 12 ? " pm" : " pm");
      timeSelect.appendChild(opt);
    }
  }

  /* Formato legible de fecha */
  function formatDate(value) {
    if (!value) return "";
    var parts = value.split("-");
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString("es-CO", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  }

  function showFeedback(type, html) {
    feedback.className = "booking__feedback show " + type;
    feedback.innerHTML = html;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var court = $("#court");
    var duration = $("#duration");
    var name = $("#name");
    var phone = $("#phone");

    var fields = [court, dateInput, timeSelect, duration, name, phone];
    var valid = true;

    fields.forEach(function (field) {
      field.classList.remove("is-invalid");
      if (!field.value || (field.value.trim && !field.value.trim())) {
        field.classList.add("is-invalid");
        valid = false;
      }
    });

    if (phone.value && phone.value.replace(/\D/g, "").length < 7) {
      phone.classList.add("is-invalid");
      valid = false;
    }

    if (!valid) {
      showFeedback("error", "<strong>Revisa los datos</strong> Completa todos los campos para continuar con la reserva.");
      return;
    }

    var booking = {
      court: court.value,
      date: dateInput.value,
      time: timeSelect.value,
      duration: duration.value,
      name: name.value.trim(),
      phone: phone.value.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      var stored = JSON.parse(localStorage.getItem("reservas") || "[]");
      stored.push(booking);
      localStorage.setItem("reservas", JSON.stringify(stored));
    } catch (err) {
      /* localStorage no disponible: seguimos igual */
    }

    var resumen =
      "<strong><i class='fa-solid fa-circle-check'></i> ¡Reserva registrada!</strong>" +
      "<div style='margin-top:.4rem;line-height:1.6'>" +
      "<b>" + booking.court + "</b><br>" +
      "📅 " + formatDate(booking.date) + "<br>" +
      "⏰ " + booking.time + " · " + booking.duration + " hora(s)<br>" +
      "👤 " + booking.name + "<br><br>" +
      "Te contactaremos por WhatsApp para confirmar. " +
      "<a href='" + buildWhatsappLink(booking) + "' target='_blank' rel='noopener' style='color:inherit;text-decoration:underline;font-weight:600'>Abrir WhatsApp</a>" +
      "</div>";

    showFeedback("success", resumen);
    form.reset();

    /* Abrir WhatsApp automáticamente con el resumen */
    window.open(buildWhatsappLink(booking), "_blank");
  });

  function buildWhatsappLink(b) {
    var text = "¡Hola! Quiero confirmar esta reserva:\n" +
      "• Cancha: " + b.court + "\n" +
      "• Fecha: " + formatDate(b.date) + "\n" +
      "• Hora: " + b.time + "\n" +
      "• Duración: " + b.duration + " hora(s)\n" +
      "• Nombre: " + b.name + "\n" +
      "• Teléfono: " + b.phone;
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  }
})();
