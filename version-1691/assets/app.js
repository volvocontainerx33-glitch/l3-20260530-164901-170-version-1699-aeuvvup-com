(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-site-nav]");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  var clearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-clear-search]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
  var activeFilter = "";

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applySearch() {
    var keyword = normalize(inputs.map(function (input) {
      return input.value;
    }).join(" "));

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year")
      ].join(" "));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchFilter = !activeFilter || text.indexOf(normalize(activeFilter)) !== -1;
      card.classList.toggle("is-hidden", !(matchKeyword && matchFilter));
    });
  }

  inputs.forEach(function (input) {
    input.addEventListener("input", applySearch);
  });

  clearButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      inputs.forEach(function (input) {
        input.value = "";
      });
      activeFilter = "";
      filterButtons.forEach(function (chip) {
        chip.classList.remove("is-active");
      });
      applySearch();
    });
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-filter-value") || "";
      activeFilter = activeFilter === value ? "" : value;
      filterButtons.forEach(function (chip) {
        chip.classList.toggle("is-active", chip === button && activeFilter);
      });
      applySearch();
    });
  });
})();
