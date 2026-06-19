(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;

        function activate(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                activate(dotIndex);
            });
        });

        activate(0);
        window.setInterval(function () {
            activate(index + 1);
        }, 5200);
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
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

    var playButton = document.querySelector('[data-play-video]');
    if (playButton) {
        playButton.addEventListener('click', function () {
            var shell = document.querySelector('[data-video-shell]');
            var video = document.querySelector('[data-video]');
            var overlay = document.querySelector('[data-player-overlay]');
            var message = document.querySelector('[data-player-message]');
            var source = playButton.getAttribute('data-video-src');

            if (!video || !source) {
                if (message) {
                    message.textContent = '当前页面没有找到可播放地址。';
                }
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function playNative() {
                video.src = source;
                video.controls = true;
                video.play().catch(function () {
                    setMessage('播放器已加载，请再次点击视频播放。');
                });
            }

            if (overlay) {
                overlay.classList.add('hidden');
            }
            if (shell) {
                shell.classList.add('playing');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                playNative();
                setMessage('正在使用浏览器原生 HLS 播放。');
                return;
            }

            loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js')
                .then(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls();
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.controls = true;
                            video.play().catch(function () {
                                setMessage('播放器已就绪，请再次点击视频播放。');
                            });
                        });
                        hls.on(window.Hls.Events.ERROR, function () {
                            setMessage('播放源暂时无法加载，请稍后重试或更换网络环境。');
                        });
                    } else {
                        playNative();
                    }
                })
                .catch(function () {
                    playNative();
                    setMessage('HLS 组件加载失败，已尝试使用浏览器原生播放能力。');
                });
        });
    }

    var searchApp = document.querySelector('[data-search-app]');
    if (searchApp) {
        var input = searchApp.querySelector('[data-search-input]');
        var regionSelect = searchApp.querySelector('[data-region-select]');
        var yearSelect = searchApp.querySelector('[data-year-select]');
        var results = searchApp.querySelector('[data-search-results]');
        var status = searchApp.querySelector('[data-search-status]');
        var dataUrl = searchApp.getAttribute('data-source');
        var allMovies = [];

        function getQueryParam(name) {
            var params = new URLSearchParams(window.location.search);
            return params.get(name) || '';
        }

        function card(movie) {
            var image = './' + movie.cover + '.jpg';
            return [
                '<article>',
                '    <a href="' + movie.url + '"><img src="' + image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"></a>',
                '    <div>',
                '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</p>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(text) {
            return String(text).replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        function runSearch() {
            var keyword = (input.value || '').trim().toLowerCase();
            var region = regionSelect.value;
            var year = yearSelect.value;
            var filtered = allMovies.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var regionMatch = !region || movie.region.indexOf(region) !== -1;
                var yearMatch = !year || String(movie.year) === year;
                return keywordMatch && regionMatch && yearMatch;
            }).slice(0, 120);

            results.innerHTML = filtered.map(card).join('') || '<p>没有找到匹配影片，请调整关键词或筛选条件。</p>';
            status.textContent = '当前显示 ' + filtered.length + ' 条结果，最多展示前 120 条。';
        }

        function initSearch(payload) {
            allMovies = payload.movies || [];
            var regions = Array.from(new Set(allMovies.map(function (movie) { return movie.region; }))).slice(0, 60);
            var years = Array.from(new Set(allMovies.map(function (movie) { return movie.year; }))).sort(function (a, b) { return b - a; });

            regionSelect.innerHTML = '<option value="">全部地区</option>' + regions.map(function (region) {
                return '<option value="' + escapeHtml(region) + '">' + escapeHtml(region) + '</option>';
            }).join('');

            yearSelect.innerHTML = '<option value="">全部年份</option>' + years.map(function (year) {
                return '<option value="' + year + '">' + year + '</option>';
            }).join('');

            input.value = getQueryParam('q');
            runSearch();
        }

        if (window.__MOVIE_SEARCH_DATA__) {
            initSearch(window.__MOVIE_SEARCH_DATA__);
        } else {
            fetch(dataUrl)
                .then(function (response) {
                    return response.json();
                })
                .then(initSearch)
                .catch(function () {
                    status.textContent = '影片数据加载失败，请通过网页服务器访问本站或稍后重试。';
                });
        }

        searchApp.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });
    }
}());
