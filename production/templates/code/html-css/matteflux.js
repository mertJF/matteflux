/* Matteflux video backgrounds — v1.0 (no dependencies)
 *
 * Reads data attributes on each .mf-bg__video:
 *   data-mf-desktop   path without extension, e.g. "hero/ember-aurora-hero-desktop"
 *   data-mf-mobile    path without extension for small screens
 *   data-mf-load      "eager" (hero) or "lazy" (footer, default)
 * and on <html>/any ancestor, optionally:
 *   data-mf-breakpoint="767"   max width in px that counts as mobile
 *
 * Behaviour:
 *   - picks the desktop or mobile composition, WebM first, MP4 fallback
 *   - lazy videos only load when they come near the viewport
 *   - videos pause while off screen
 *   - no video at all for prefers-reduced-motion or Save-Data
 *   - swaps compositions if the viewport crosses the breakpoint
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (reduceMotion || saveData) return; // the poster stays; nothing to download

  function mobileQuery(video) {
    var host = video.closest("[data-mf-breakpoint]");
    var bp = host ? parseInt(host.getAttribute("data-mf-breakpoint"), 10) : 767;
    return window.matchMedia("(max-width: " + bp + "px)");
  }

  function setSources(video, mq) {
    var base = mq.matches
      ? video.getAttribute("data-mf-mobile") || video.getAttribute("data-mf-desktop")
      : video.getAttribute("data-mf-desktop");
    if (!base || video.getAttribute("data-mf-current") === base) return;
    video.setAttribute("data-mf-current", base);
    video.innerHTML =
      '<source src="' + base + '.webm" type="video/webm">' +
      '<source src="' + base + '.mp4" type="video/mp4">';
    video.load();
  }

  function play(video) {
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: poster stays */ });
  }

  function init(video) {
    var layer = video.closest(".mf-bg") || video.parentNode;
    var mq = mobileQuery(video);
    var eager = video.getAttribute("data-mf-load") === "eager";
    var started = false;
    var visible = false;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    video.addEventListener("playing", function () { layer.classList.add("is-playing"); });

    function start() {
      if (started) return;
      started = true;
      setSources(video, mq);
      if (visible || eager) play(video);
    }

    var onChange = function () { if (started) { setSources(video, mq); if (visible) play(video); } };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);

    if (!("IntersectionObserver" in window)) { visible = true; start(); return; }

    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible) { start(); play(video); }
        else if (started) video.pause();
      });
    }, { rootMargin: "300px 0px" }).observe(layer);

    if (eager) start();
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll(".mf-bg__video:not([data-mf-ready])"), function (v) {
      v.setAttribute("data-mf-ready", "");
      init(v);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.Matteflux = { refresh: boot }; // call after injecting new markup
})();
