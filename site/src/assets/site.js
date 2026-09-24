/* matteflux.com — site interactions. The page's own hero/footer videos are
   run by the product script (matteflux.js); this file handles everything
   around them: the live set switcher, preview frames, card previews,
   catalog filters, license toggles, the menu and the free-set form. */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var noVideo = reduceMotion || saveData;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var SETS = {};
  try {
    JSON.parse($("#mf-sets").textContent).forEach(function (s) { SETS[s.slug] = s; });
  } catch (e) { /* no data: interactive parts stay static */ }

  function setSources(video, base) {
    if (video.getAttribute("data-base") === base) return false;
    video.setAttribute("data-base", base);
    video.innerHTML = '<source src="' + base + '.webm" type="video/webm"><source src="' + base + '.mp4" type="video/mp4">';
    video.load();
    return true;
  }
  function play(video) {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }
  function markPlaying(video, holder) {
    if (video._mfBound) return;
    video._mfBound = true;
    video.muted = true;
    video.addEventListener("playing", function () { holder.classList.add("is-playing"); });
  }

  // ------------------------------------------------------------ menu
  var toggle = $(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$(".site-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) toggle.click();
    });
  }

  // --------------------------------------------------- preview frames
  var frames = {};

  function Frame(el) {
    this.el = el;
    this.set = SETS[el.getAttribute("data-set")];
    this.visible = false;
    var self = this;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
        self.sync();
      }, { rootMargin: "200px 0px" }).observe(el);
    } else {
      this.visible = true;
    }
    this.sync();
  }
  Frame.prototype.device = function () { return this.el.getAttribute("data-device"); };
  Frame.prototype.setDevice = function (d) { this.el.setAttribute("data-device", d); this.sync(); };
  Frame.prototype.setSet = function (set) {
    this.set = set;
    this.el.setAttribute("data-set", set.slug);
    $$(".pv-media", this.el).forEach(function (m) {
      var kind = m.getAttribute("data-pv-kind");
      var dev = m.getAttribute("data-pv-device") === "mobile" ? "m" : "d";
      m.classList.remove("is-playing");
      $(".pv-poster", m).src = set.posters[kind][dev];
    });
    this.sync();
  };
  Frame.prototype.setOverlay = function (hero, footer) {
    $$('.pv-media[data-pv-kind="hero"]', this.el).forEach(function (m) { m.style.setProperty("--mf-overlay", hero); });
    $$('.pv-media[data-pv-kind="footer"]', this.el).forEach(function (m) { m.style.setProperty("--mf-overlay", footer); });
  };
  Frame.prototype.sync = function () {
    var dev = this.device();
    var set = this.set;
    var visible = this.visible;
    $$(".pv-media", this.el).forEach(function (m) {
      var v = $(".pv-video", m);
      var mine = m.getAttribute("data-pv-device") === dev;
      if (!mine || !visible || noVideo) { v.pause(); return; }
      var kind = m.getAttribute("data-pv-kind");
      markPlaying(v, m);
      setSources(v, set[kind][dev === "mobile" ? "m" : "d"]);
      play(v);
    });
  };

  $$(".pv").forEach(function (el) { frames[el.id] = new Frame(el); });

  // ------------------------------------------ page hero/footer swapping
  function swapPageLayer(section, set) {
    var layer = $(".mf-bg", section);
    if (!layer) return;
    var kind = layer.getAttribute("data-mf-kind");
    var p = set.posters[kind];
    var srcs = $$("picture source", layer);
    if (srcs[0]) srcs[0].srcset = p.m;
    if (srcs[1]) srcs[1].srcset = p.mj;
    if (srcs[2]) srcs[2].srcset = p.d;
    var img = $("picture img", layer);
    if (img) img.src = p.dj;
    layer.classList.remove("is-playing");

    var old = $(".mf-bg__video", layer);
    if (!old) return;
    var fresh = old.cloneNode(false);
    fresh.removeAttribute("data-mf-ready");
    fresh.removeAttribute("data-mf-current");
    fresh.setAttribute("data-mf-desktop", set[kind].d);
    fresh.setAttribute("data-mf-mobile", set[kind].m);
    // A footer that is already on screen should start right away.
    fresh.setAttribute("data-mf-load", kind === "hero" ? "eager" : old.getAttribute("data-mf-load") || "lazy");
    // Empty the old element so the product script's observer can't restart it.
    old.pause();
    old.innerHTML = "";
    old.removeAttribute("src");
    old.load();
    old.parentNode.replaceChild(fresh, old);
  }

  function applyPageOverlay(hero, footer) {
    $$('[data-mf-slot="hero"] .mf-bg').forEach(function (l) { l.style.setProperty("--mf-overlay", hero); });
    $$('[data-mf-slot="footer"] .mf-bg').forEach(function (l) { l.style.setProperty("--mf-overlay", footer); });
  }

  function updateLabels(set) {
    $$("[data-mf-name]").forEach(function (n) { n.textContent = set.name; });
    $$("[data-mf-rec-hero]").forEach(function (n) { n.textContent = Math.round(set.rec.hero * 100); });
    $$("[data-mf-rec-footer]").forEach(function (n) { n.textContent = Math.round(set.rec.footer * 100); });
    $$("[data-mf-link]").forEach(function (a) { a.href = "/sets/" + set.slug + "/"; });
  }

  // ------------------------------------------------- overlay controls
  $$(".pv-controls").forEach(function (ctrl) {
    var frame = frames[ctrl.getAttribute("data-pv-target")];
    var page = ctrl.hasAttribute("data-pv-page");
    var range = $("[data-pv-overlay]", ctrl);
    var out = $("[data-pv-out]", ctrl);

    function apply() {
      if (!frame) return;
      var set = frame.set;
      var hero = parseInt(range.value, 10) / 100;
      // The footer keeps its own recommended offset from the hero value.
      var footer = Math.max(0, Math.min(0.9, hero + (set.rec.footer - set.rec.hero)));
      out.textContent = range.value + "%";
      frame.setOverlay(hero, footer);
      if (page) applyPageOverlay(hero, footer);
    }
    ctrl._reset = function (set) { range.value = Math.round(set.rec.hero * 100); apply(); };
    range.addEventListener("input", apply);

    $$(".seg__btn[data-device]", ctrl).forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".seg__btn[data-device]", ctrl).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        if (frame) frame.setDevice(b.getAttribute("data-device"));
      });
    });
  });

  // --------------------------------------------------- set switcher
  $$("[data-pick]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var set = SETS[btn.getAttribute("data-pick")];
      if (!set) return;
      $$("[data-pick]").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      $$("[data-mf-slot]").forEach(function (s) { swapPageLayer(s, set); });
      Object.keys(frames).forEach(function (id) { frames[id].setSet(set); });
      updateLabels(set);
      $$(".pv-controls").forEach(function (c) { if (c._reset) c._reset(set); });
      applyPageOverlay(set.rec.hero, set.rec.footer);
      if (window.Matteflux) window.Matteflux.refresh();
    });
  });

  // ------------------------------------------------- card previews
  $$(".set-card").forEach(function (card) {
    var link = $(".set-card__link", card);
    function start() {
      if (noVideo) return;
      $$("[data-card-src]", card).forEach(function (v) {
        if (v.parentNode.offsetParent === null) return; // hidden by view filter
        markPlaying(v, v.parentNode);
        setSources(v, v.getAttribute("data-card-src"));
        play(v);
      });
    }
    function stop() { $$("[data-card-src]", card).forEach(function (v) { v.pause(); }); }
    if (canHover) {
      link.addEventListener("mouseenter", start);
      link.addEventListener("mouseleave", stop);
    }
    link.addEventListener("focus", start);
    link.addEventListener("blur", stop);
  });

  // ------------------------------------------------ catalog filters
  var catalog = $("[data-catalog]");
  if (catalog) {
    var state = { tone: "all", motion: "all" };
    var grid = $(".grid-cards", catalog);
    var cards = $$(".set-card", catalog);
    var count = $("[data-catalog-count]", catalog);
    var empty = $("[data-catalog-empty]", catalog);
    function run() {
      var n = 0;
      cards.forEach(function (c) {
        var ok = (state.tone === "all" || c.getAttribute("data-tone") === state.tone) &&
                 (state.motion === "all" || c.getAttribute("data-motion") === state.motion);
        c.hidden = !ok;
        if (ok) n++;
      });
      count.textContent = n + (n === 1 ? " set" : " sets");
      empty.hidden = n !== 0;
    }
    $$("[data-filter]", catalog).forEach(function (b) {
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-filter");
        state[key] = b.getAttribute("data-value");
        $$('[data-filter="' + key + '"]', catalog).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        run();
      });
    });
    $$("[data-view]", catalog).forEach(function (b) {
      if (b.tagName !== "BUTTON") return;
      b.addEventListener("click", function () {
        grid.setAttribute("data-view", b.getAttribute("data-view"));
        $$("button[data-view]", catalog).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
  }

  // ------------------------------------------------ license toggles
  $$("[data-license-scope]").forEach(function (scope) {
    $$("[data-license]", scope).forEach(function (b) {
      b.addEventListener("click", function () {
        var lic = b.getAttribute("data-license");
        $$("[data-license]", scope).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        $$("[data-href-" + lic + "]", scope).forEach(function (a) { a.href = a.getAttribute("data-href-" + lic); });
        $$("[data-license-text]", scope).forEach(function (t) {
          t.textContent = lic === "personal" ? "Personal license · one website" : "Commercial license · unlimited projects, client work included";
        });
      });
    });
  });

  // ---------------------------------------------------- free-set form
  $$("[data-free-form]").forEach(function (form) {
    var status = $("[data-free-status]", form);
    var input = $("input[type=email]", form);
    form.addEventListener("submit", function (e) {
      status.classList.remove("is-error");
      if (!input.value || !input.checkValidity()) {
        e.preventDefault();
        status.textContent = "Enter an email address like you@studio.com.";
        status.classList.add("is-error");
        input.focus();
        return;
      }
      if (form.getAttribute("action").indexOf("[") === 0) {
        // Not connected to an email service yet (Phase 4).
        e.preventDefault();
        status.textContent = "Signup isn’t connected yet. Please check back soon.";
        status.classList.add("is-error");
      }
    });
  });
})();
