(function () {
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                existing.addEventListener('load', resolve);
                resolve();
                return;
            }
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function playHls(video, url) {
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
        }
    }

    function setupPlayers() {
        var buttons = document.querySelectorAll('[data-play-button]');
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var video = document.getElementById(button.getAttribute('data-video-id'));
                var url = button.getAttribute('data-video-url');
                if (!video || !url) {
                    return;
                }
                button.classList.add('is-hidden');
                loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js')
                    .then(function () {
                        playHls(video, url);
                    })
                    .catch(function () {
                        video.src = url;
                        video.play().catch(function () {});
                    });
            });
        });
    }

    setupPlayers();
})();
