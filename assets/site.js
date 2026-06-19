(function () {
    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var links = document.querySelector('[data-nav-links]');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;

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

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')));
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupCardSearch() {
        var input = document.querySelector('[data-card-search]');
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
        var counter = document.querySelector('[data-filter-count]');

        function textOf(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year'),
                card.getAttribute('data-category')
            ].join(' ');
        }

        function apply() {
            var keyword = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var matched = !keyword || normalize(textOf(card)).indexOf(keyword) !== -1;
                card.classList.toggle('is-filtered', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (counter) {
                counter.textContent = keyword ? '当前筛选出 ' + visible + ' 条结果' : '当前页面共有 ' + cards.length + ' 条可筛选内容';
            }
        }

        input.addEventListener('input', apply);
        apply();
    }

    function createResultCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a class="poster-link" href="movie/' + movie.id + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '    <span class="cover-fallback">' + escapeHtml(movie.title.slice(0, 2)) + '</span>',
            '    <img class="cover-img" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\'); this.setAttribute(\'aria-hidden\', \'true\');">',
            '    <span class="rating-badge">' + Number(movie.rating).toFixed(1) + '</span>',
            '</a>',
            '<div class="movie-info">',
            '    <h3><a href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
            '    <p class="movie-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span></p>',
            '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
            '    <div class="card-tags">',
            '        <a href="category/' + movie.categorySlug + '.html">' + escapeHtml(movie.category) + '</a>',
            '        <span>' + escapeHtml(movie.genre) + '</span>',
            '    </div>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setupGlobalSearch() {
        var dataElement = document.getElementById('movie-search-data');
        var input = document.querySelector('[data-global-search]');
        var results = document.querySelector('[data-global-results]');
        var categorySelect = document.querySelector('[data-global-category]');
        var yearSelect = document.querySelector('[data-global-year]');
        var counter = document.querySelector('[data-global-count]');
        if (!dataElement || !input || !results) {
            return;
        }

        var movies = [];
        try {
            movies = JSON.parse(dataElement.textContent || '[]');
        } catch (error) {
            movies = [];
        }

        function matches(movie, keyword, category, year) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.genre,
                movie.category,
                movie.year,
                movie.oneLine
            ].join(' '));
            var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
            var categoryMatched = !category || movie.category === category;
            var yearMatched = !year || String(movie.year) === year;
            return keywordMatched && categoryMatched && yearMatched;
        }

        function render() {
            var keyword = normalize(input.value);
            var category = categorySelect ? categorySelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var filtered = movies.filter(function (movie) {
                return matches(movie, keyword, category, year);
            }).slice(0, 120);

            results.innerHTML = '';
            filtered.forEach(function (movie) {
                results.appendChild(createResultCard(movie));
            });
            if (counter) {
                counter.textContent = '显示 ' + filtered.length + ' 条结果，输入更多关键词可继续缩小范围。';
            }
        }

        input.addEventListener('input', render);
        if (categorySelect) {
            categorySelect.addEventListener('change', render);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', render);
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
        }
        render();
    }

    setupNavigation();
    setupHero();
    setupCardSearch();
    setupGlobalSearch();
})();
