(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initCardFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-card-list]"));
        lists.forEach(function (list) {
            var section = list.closest(".content-section") || document;
            var input = section.querySelector("[data-card-search]");
            var buttons = Array.prototype.slice.call(section.querySelectorAll("[data-filter]"));
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var activeFilter = "全部";
            function apply() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var passQuery = !query || haystack.indexOf(query) !== -1;
                    var passFilter = activeFilter === "全部" || haystack.indexOf(normalize(activeFilter)) !== -1;
                    card.classList.toggle("is-hidden-card", !(passQuery && passFilter));
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter") || "全部";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
        });
    }

    function renderSearchResult(movie) {
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + movie.url + '">',
            '<img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
            '<span class="poster-badge">' + movie.year + '</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="card-meta"><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
            '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
            '<p>' + movie.desc + '</p>',
            '<div class="card-tags"><span class="chip">' + movie.genre + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function initGlobalSearch() {
        var input = document.querySelector("[data-global-search]");
        var output = document.querySelector("[data-search-results]");
        var source = window.SEARCH_MOVIES || [];
        if (!input || !output || !source.length) {
            return;
        }
        function search() {
            var query = normalize(input.value);
            var results = source.filter(function (movie) {
                if (!query) {
                    return movie.featured;
                }
                return normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.tags).indexOf(query) !== -1;
            }).slice(0, 80);
            if (!results.length) {
                output.innerHTML = '<div class="search-empty">未找到匹配内容，请尝试其他关键词。</div>';
                return;
            }
            output.innerHTML = results.map(renderSearchResult).join("");
        }
        input.addEventListener("input", search);
        search();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector(".movie-video");
        var layer = document.querySelector(".play-layer");
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play]"));
        var hlsInstance = null;
        if (!video || !streamUrl) {
            return;
        }
        function prepare() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            video.setAttribute("data-ready", "1");
        }
        function play() {
            prepare();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", play);
        });
        if (layer) {
            layer.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });
        video.addEventListener("emptied", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            video.removeAttribute("data-ready");
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initCardFilters();
        initGlobalSearch();
    });
})();
