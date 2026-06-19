(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-empty");
      });
    });
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupSearch() {
    document.querySelectorAll("[data-search-input]").forEach(function (input) {
      var target = input.getAttribute("data-search-target");
      var scope = target ? document.querySelector(target) : document;
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));
      var empty = scope.querySelector("[data-empty]");
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
          var matched = !query || text.indexOf(query) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        play();
      });
    });
    play();
  }

  function setupPlayer() {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var url = box.getAttribute("data-url");
      var instance = null;
      if (!video || !cover || !url) {
        return;
      }
      function attach() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        video.setAttribute("data-ready", "1");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          instance.loadSource(url);
          instance.attachMedia(video);
        } else {
          video.src = url;
        }
      }
      function start(event) {
        if (event) {
          event.preventDefault();
        }
        attach();
        box.classList.add("is-playing");
        video.controls = true;
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {});
        }
      }
      cover.addEventListener("click", start);
      video.addEventListener("click", function (event) {
        if (video.getAttribute("data-ready") !== "1") {
          start(event);
        }
      });
      window.addEventListener("pagehide", function () {
        if (instance) {
          instance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupImages();
    setupMenu();
    setupSearch();
    setupHero();
    setupPlayer();
  });
})();
