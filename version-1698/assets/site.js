(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initImageFallbacks() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.style.opacity = '0';
                image.setAttribute('aria-hidden', 'true');
            }, { once: true });
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initCategoryFilter() {
        var panel = document.querySelector('[data-filter-panel]');
        if (!panel) {
            return;
        }
        var input = panel.querySelector('[data-filter-input]');
        var sort = panel.querySelector('[data-sort-select]');
        var count = panel.querySelector('[data-filter-count]');
        var clear = panel.querySelector('[data-filter-clear]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var activeToken = '';

        function textFor(card) {
            return normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.type,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.tags
            ].join(' '));
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = textFor(card);
                var matchQuery = !query || haystack.indexOf(query) >= 0;
                var matchToken = !activeToken || haystack.indexOf(normalize(activeToken)) >= 0;
                var isVisible = matchQuery && matchToken;
                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部';
            }
        }

        function sortCards() {
            var grid = document.querySelector('.movie-grid');
            if (!grid || !sort) {
                return;
            }
            var value = sort.value;
            var sorted = cards.slice().sort(function (a, b) {
                if (value === 'year-asc') {
                    return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                }
                if (value === 'title-asc') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                }
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
            cards = sorted;
            apply();
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (sort) {
            sort.addEventListener('change', sortCards);
        }
        panel.querySelectorAll('[data-filter-token]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeToken = button.getAttribute('data-filter-token') || '';
                if (input) {
                    input.value = activeToken;
                }
                apply();
            });
        });
        if (clear) {
            clear.addEventListener('click', function () {
                activeToken = '';
                if (input) {
                    input.value = '';
                }
                apply();
            });
        }
        apply();
    }

    function initPlayer() {
        document.querySelectorAll('.js-player').forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('[data-player-start]');
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-src');
            var hlsInstance = null;

            function attachSource() {
                if (video.dataset.ready === '1') {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                video.dataset.ready = '1';
            }

            function play() {
                attachSource();
                button.classList.add('is-hidden');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            }

            button.addEventListener('click', play);
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    button.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function cardTemplate(movie) {
        return [
            '<article class="movie-card">',
            '  <a class="movie-card-link" href="' + movie.url + '">',
            '    <div class="poster-wrap">',
            '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '      <div class="poster-shade"></div>',
            '      <div class="score"><span>★</span>' + movie.rating + '</div>',
            '      <div class="card-category">' + escapeHtml(movie.category) + '</div>',
            '    </div>',
            '    <div class="movie-card-body">',
            '      <h3>' + escapeHtml(movie.title) + '</h3>',
            '      <div class="movie-meta-line"><span>' + movie.year + '</span><span>' + escapeHtml(movie.duration) + '</span></div>',
            '      <div class="tag-row"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '      <p class="movie-card-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '    </div>',
            '  </a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var input = page.querySelector('[data-search-input]');
        var category = page.querySelector('[data-search-category]');
        var type = page.querySelector('[data-search-type]');
        var clear = page.querySelector('[data-search-clear]');
        var results = page.querySelector('[data-search-results]');
        var count = page.querySelector('[data-search-count]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function searchable(movie) {
            return normalize([
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.tags,
                movie.oneLine
            ].join(' '));
        }

        function render() {
            var query = normalize(input ? input.value : '');
            var selectedCategory = category ? category.value : '';
            var selectedType = type ? type.value : '';
            var list = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                var matchQuery = !query || searchable(movie).indexOf(query) >= 0;
                var matchCategory = !selectedCategory || movie.category === selectedCategory;
                var matchType = !selectedType || movie.type === selectedType;
                return matchQuery && matchCategory && matchType;
            }).slice(0, 120);
            if (!list.length) {
                results.innerHTML = '<div class="empty-state">未找到匹配影片，请更换关键词或清空筛选。</div>';
            } else {
                results.innerHTML = list.map(cardTemplate).join('');
                initImageFallbacks();
            }
            if (count) {
                count.textContent = '当前显示 ' + list.length + ' 部，最多展示前 120 条匹配结果';
            }
        }

        [input, category, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });
        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (category) {
                    category.value = '';
                }
                if (type) {
                    type.value = '';
                }
                render();
            });
        }
        render();
    }

    ready(function () {
        initMenu();
        initImageFallbacks();
        initHero();
        initCategoryFilter();
        initPlayer();
        initSearchPage();
    });
}());
