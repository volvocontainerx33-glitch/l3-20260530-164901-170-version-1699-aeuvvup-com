(function () {
  const toggle = document.querySelector('[data-mobile-menu]');
  const panel = document.querySelector('[data-nav-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  const filterInput = document.querySelector('[data-card-filter]');
  const yearSelect = document.querySelector('[data-year-filter]');
  const cards = Array.from(document.querySelectorAll('[data-search-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    const keyword = normalize(filterInput ? filterInput.value : '');
    const year = yearSelect ? yearSelect.value : '';
    let visibleCount = 0;

    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.category,
        card.textContent
      ].join(' '));
      const matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchesYear = !year || card.dataset.year === year;
      const shouldShow = matchesKeyword && matchesYear;
      card.hidden = !shouldShow;
      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query && filterInput) {
    filterInput.value = query;
    applyFilters();
  }
})();
