(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var form = document.querySelector('[data-filter-form]');

  if (form) {
    var keyword = form.querySelector('[data-filter-keyword]');
    var category = form.querySelector('[data-filter-category]');
    var region = form.querySelector('[data-filter-region]');
    var grid = document.querySelector('[data-filter-grid]');
    var status = document.querySelector('[data-filter-status]');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];

    function applyFilter() {
      var word = (keyword.value || '').trim().toLowerCase();
      var cat = category.value || '';
      var area = region.value || '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();
        var matched = true;

        if (word && text.indexOf(word) === -1) {
          matched = false;
        }

        if (cat && card.getAttribute('data-category') !== cat) {
          matched = false;
        }

        if (area && card.getAttribute('data-region') !== area) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = '当前匹配 ' + visible + ' 部影片';
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, applyFilter);
    });

    form.addEventListener('reset', function () {
      window.setTimeout(applyFilter, 0);
    });
  }
})();
