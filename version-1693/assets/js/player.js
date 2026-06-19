(function () {
  function showMessage(box, text) {
    if (!box) {
      return;
    }
    box.textContent = text;
    box.classList.add('is-visible');
  }

  function prepareVideo(video, source, box) {
    if (video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = 'true';
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else {
            showMessage(box, '播放遇到异常，请稍后重试');
          }
        }
      });
      video.dataset.ready = 'true';
      video._hls = hls;
      return;
    }

    video.src = source;
    video.dataset.ready = 'true';
  }

  window.initPlayer = function (id, source) {
    var root = document.getElementById(id);

    if (!root) {
      return;
    }

    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');
    var box = root.querySelector('.player-message');

    if (!video) {
      return;
    }

    function play() {
      prepareVideo(video, source, box);
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
  };
})();
