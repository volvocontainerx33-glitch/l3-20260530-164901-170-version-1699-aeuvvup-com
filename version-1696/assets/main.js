(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    startHero();
  }

  var list = document.querySelector('[data-card-list]');

  if (list) {
    var cards = Array.prototype.slice.call(list.children);
    var searchInput = document.querySelector('[data-card-search]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function matchCard(card) {
      var keyword = normalize(searchInput && searchInput.value);
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' '));

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (region && card.getAttribute('data-region') !== region) {
        return false;
      }
      if (year && card.getAttribute('data-year') !== year) {
        return false;
      }
      if (type && card.getAttribute('data-type') !== type) {
        return false;
      }
      return true;
    }

    function applyFilters() {
      cards.forEach(function (card) {
        card.classList.toggle('is-filtered-out', !matchCard(card));
      });
    }

    [searchInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var tabs = document.querySelector('[data-tabs]');

  if (tabs) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-tab-target]'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-tab-panel]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var target = button.getAttribute('data-tab-target');
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('active', panel.getAttribute('data-tab-panel') === target);
        });
      });
    });
  }
})();
