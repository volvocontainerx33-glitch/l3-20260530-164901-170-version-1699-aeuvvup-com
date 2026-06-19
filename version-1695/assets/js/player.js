function initMoviePlayer(id, streamUrl) {
  var video = document.getElementById(id);
  if (!video) {
    return;
  }
  var shell = video.closest(".player-shell");
  var cover = shell ? shell.querySelector(".play-cover") : null;
  var loaded = false;

  function attachAndPlay() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
    if (!loaded) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        loaded = true;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        loaded = true;
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = streamUrl;
        loaded = true;
        video.play().catch(function () {});
      }
      return;
    }
    video.play().catch(function () {});
  }

  if (cover) {
    cover.addEventListener("click", attachAndPlay);
  }
  video.addEventListener("click", function () {
    if (!loaded) {
      attachAndPlay();
    }
  });
}
