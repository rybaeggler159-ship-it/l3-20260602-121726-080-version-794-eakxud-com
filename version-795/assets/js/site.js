(function() {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function() {
            panel.classList.toggle("is-open");
        });
    }

    function setupImages() {
        Array.prototype.forEach.call(document.querySelectorAll("img"), function(image) {
            image.addEventListener("error", function() {
                image.classList.add("is-missing");
            }, { once: true });
        });
    }

    function setupSlider() {
        var slider = document.querySelector("[data-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-dot]"));
        var prev = slider.querySelector("[data-prev]");
        var next = slider.querySelector("[data-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, position) {
                slide.classList.toggle("is-active", position === current);
            });
            dots.forEach(function(dot, position) {
                dot.classList.toggle("is-active", position === current);
            });
        }

        function goNext() {
            show(current + 1);
        }

        function start() {
            stop();
            timer = window.setInterval(goNext, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-dot")) || 0);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var scope = document.querySelector("[data-filter-scope]");
        if (!scope) {
            return;
        }
        var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-year]"));
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        buttons.forEach(function(button) {
            button.addEventListener("click", function() {
                var year = button.getAttribute("data-filter-year");
                buttons.forEach(function(item) {
                    item.classList.toggle("is-active", item === button);
                });
                cards.forEach(function(card) {
                    var matches = year === "all" || card.getAttribute("data-year") === year;
                    card.classList.toggle("is-hidden", !matches);
                });
            });
        });
    }

    function setupPlayer() {
        var stage = document.querySelector("[data-player]");
        if (!stage) {
            return;
        }
        var video = stage.querySelector("video");
        var button = stage.querySelector("[data-play-button]");
        if (!video || !button) {
            return;
        }
        var hls = null;

        function startPlayback() {
            var url = video.getAttribute("data-hls-url");
            if (!url) {
                return;
            }
            stage.classList.add("is-playing");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", url);
                }
                video.play().catch(function() {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                }
                video.play().catch(function() {});
                return;
            }
            if (!video.getAttribute("src")) {
                video.setAttribute("src", url);
            }
            video.play().catch(function() {});
        }

        button.addEventListener("click", startPlayback);
        video.addEventListener("click", function() {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    function setupSearchPage() {
        var input = document.getElementById("search-input");
        var results = document.getElementById("search-results");
        if (!input || !results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render(query) {
            var keyword = String(query || "").trim().toLowerCase();
            var list = window.MOVIE_SEARCH_INDEX.filter(function(item) {
                if (!keyword) {
                    return item.hot;
                }
                var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" ").toLowerCase();
                return text.indexOf(keyword) !== -1;
            }).slice(0, keyword ? 120 : 48);
            if (!list.length) {
                results.innerHTML = "<p class=\"empty-text\">没有找到匹配内容。</p>";
                return;
            }
            results.innerHTML = list.map(function(item) {
                return "<article class=\"search-card\">" +
                    "<a href=\"movies/" + escapeHtml(item.file) + "\"><img src=\"./" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"></a>" +
                    "<div><h2><a href=\"movies/" + escapeHtml(item.file) + "\">" + escapeHtml(item.title) + "</a></h2>" +
                    "<p>" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.genre) + "</p>" +
                    "<p>" + escapeHtml(item.oneLine) + "</p></div>" +
                    "</article>";
            }).join("");
            setupImages();
        }

        render(initial);
        input.addEventListener("input", function() {
            render(input.value);
        });
    }

    onReady(function() {
        setupMenu();
        setupImages();
        setupSlider();
        setupFilters();
        setupPlayer();
        setupSearchPage();
    });
})();
