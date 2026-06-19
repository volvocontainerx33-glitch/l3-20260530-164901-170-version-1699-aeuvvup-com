(function () {
  function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var overlay = document.getElementById(options.overlayId);
    var source = options.source;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.src !== source) {
          video.src = source;
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        }
      }
    }

    function play() {
      prepare();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      video.controls = true;
      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    prepare();

    if (button) {
      button.addEventListener("click", play);
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
