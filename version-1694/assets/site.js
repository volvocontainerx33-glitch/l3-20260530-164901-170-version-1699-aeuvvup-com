(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;

  function setHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  if (slides.length) {
    setHeroSlide(0);

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        setHeroSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      setHeroSlide(heroIndex + 1);
    }, 5200);
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const yearSelect = document.querySelector('[data-year-select]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    const keyword = normalize(filterInput ? filterInput.value : '');
    const selectedYear = yearSelect ? yearSelect.value : '';

    cards.forEach(function (card) {
      const text = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.year,
        card.textContent
      ].join(' '));
      const yearMatch = !selectedYear || card.dataset.year === selectedYear;
      const keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !(yearMatch && keywordMatch));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', filterCards);
  }

  const player = document.getElementById('moviePlayer');
  const cover = document.getElementById('playerCover');
  const playButton = document.getElementById('playButton');
  let playerStarted = false;
  let hlsInstance = null;

  function hideCover() {
    if (cover) {
      cover.classList.add('hidden');
    }
  }

  function playWhenReady() {
    const playResult = player.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  function startPlayer() {
    if (!player || typeof pageVideoSource !== 'string' || !pageVideoSource) {
      return;
    }

    hideCover();

    if (playerStarted) {
      playWhenReady();
      return;
    }

    playerStarted = true;

    if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = pageVideoSource;
      player.addEventListener('loadedmetadata', playWhenReady, { once: true });
      player.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(pageVideoSource);
      hlsInstance.attachMedia(player);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playWhenReady);
      return;
    }

    player.src = pageVideoSource;
    player.addEventListener('loadedmetadata', playWhenReady, { once: true });
    player.load();
  }

  if (cover) {
    cover.addEventListener('click', startPlayer);
  }

  if (playButton) {
    playButton.addEventListener('click', startPlayer);
  }

  if (player) {
    player.addEventListener('click', function () {
      if (!playerStarted) {
        startPlayer();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
