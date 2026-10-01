/* Omer-e-Rawan Foundation — site interactions (no dependencies) */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Sticky header shadow ---------- */
  var header = $(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile navigation ---------- */
  var nav = $("#site-nav");
  var toggle = $(".nav-toggle");
  var backdrop = $(".nav-backdrop");
  var closeBtn = $(".nav-close");
  function setNav(open) {
    if (!nav) return;
    nav.classList.toggle("is-open", open);
    if (backdrop) backdrop.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
    if (open && closeBtn) closeBtn.focus();
    if (!open && toggle && document.activeElement && nav.contains(document.activeElement)) toggle.focus();
  }
  if (toggle) toggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setNav(false); });
  if (backdrop) backdrop.addEventListener("click", function () { setNav(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav && nav.classList.contains("is-open")) setNav(false);
  });

  /* Dropdowns: click to toggle (needed on touch + mobile drawer) */
  $$(".has-dropdown > .nav-link").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.parentElement;
      var open = !li.classList.contains("is-open");
      $$(".has-dropdown.is-open").forEach(function (o) { if (o !== li) { o.classList.remove("is-open"); o.firstElementChild.setAttribute("aria-expanded", "false"); } });
      li.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-dropdown")) {
      $$(".has-dropdown.is-open").forEach(function (o) { o.classList.remove("is-open"); o.firstElementChild.setAttribute("aria-expanded", "false"); });
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = $$("[data-count]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduce) { el.textContent = target.toLocaleString("en-US"); return; }
    var start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Filter chips (gallery + timeline) ---------- */
  $$("[data-filter-group]").forEach(function (group) {
    var target = $(group.getAttribute("data-filter-group"));
    if (!target) return;
    var chips = $$(".chip", group);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var f = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        $$("[data-cat]", target).forEach(function (item) {
          item.hidden = !(f === "all" || item.getAttribute("data-cat").split(" ").indexOf(f) > -1);
        });
        // When filtering a collapsed timeline, expand it so nothing is hidden unexpectedly
        if (target.classList.contains("is-collapsed") && f !== "all") target.classList.remove("is-collapsed");
        $$(".tl-period", target).forEach(function (p) {
          p.hidden = $$("[data-cat]", p).every(function (i) { return i.hidden; });
        });
      });
    });
  });

  /* Timeline expand */
  var tlMore = $("[data-expand]");
  if (tlMore) {
    tlMore.addEventListener("click", function () {
      var t = $(tlMore.getAttribute("data-expand"));
      t.classList.remove("is-collapsed");
      tlMore.parentElement.hidden = true;
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = $("#lightbox");
  if (lb && typeof lb.showModal === "function") {
    var lbImg = $("img", lb), lbCap = $("figcaption", lb), items = [], idx = 0;
    function visibleItems() { return $$("[data-lightbox]").filter(function (b) { return !b.closest("[hidden]") && b.offsetParent !== null; }); }
    function show(i) {
      idx = (i + items.length) % items.length;
      var b = items[idx];
      lbImg.src = b.getAttribute("data-lightbox");
      lbImg.alt = b.getAttribute("data-caption") || "";
      lbCap.textContent = b.getAttribute("data-caption") || "";
    }
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lightbox]");
      if (!b) return;
      e.preventDefault();
      items = visibleItems();
      show(items.indexOf(b));
      lb.showModal();
    });
    $(".lb-close", lb).addEventListener("click", function () { lb.close(); });
    $(".lb-prev", lb).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    /* Swipe left/right on touch screens */
    var touchX = null;
    lb.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(dx < 0 ? idx + 1 : idx - 1);
      touchX = null;
    }, { passive: true });
  }

  /* ---------- Copy to clipboard (bank details) ---------- */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        var label = btn.querySelector("span");
        var old = label.textContent;
        btn.classList.add("copied"); label.textContent = "Copied";
        setTimeout(function () { btn.classList.remove("copied"); label.textContent = old; }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (err) { /* ignore */ }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- Forms ----------
     Static hosting has no server to receive form posts. If a form has a real
     `action` (e.g. a Formspree / backend endpoint) it is submitted normally.
     Otherwise the message is composed into the visitor's email client. */
  $$("form[data-mailto]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (form.getAttribute("action")) return;
      e.preventDefault();
      if (!form.reportValidity()) return;
      var hp = form.querySelector(".hp-field input");
      if (hp && hp.value) return;
      var data = new FormData(form), lines = [];
      data.forEach(function (v, k) {
        if (k === "_subject" || k === "website" || v instanceof File) return;
        if (String(v).trim()) lines.push(k + ": " + v);
      });
      var subject = data.get("_subject") || "Website enquiry";
      window.location.href = "mailto:" + form.getAttribute("data-mailto") +
        "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      var status = form.querySelector(".form-status");
      if (status) { status.hidden = false; }
    });
  });

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
