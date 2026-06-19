(function () {
  var video = document.querySelector('[data-stream]');
  var button = document.querySelector('[data-play-button]');
  var hls = null;
  var ready = false;

  if (!video) {
    return;
  }

  function source() {
    return video.getAttribute('data-stream');
  }

  function bind() {
    if (ready) {
      return;
    }

    var src = source();

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      video.src = src;
    }

    ready = true;
  }

  function hideButton() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function start() {
    bind();
    hideButton();
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      start();
    }
  });

  video.addEventListener('play', hideButton);

  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
})();
