(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    var search = document.querySelector(".nav-search");

    if (!toggle || !links || !search) {
      return;
    }

    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
      search.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    document.querySelectorAll("[data-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var prev = slider.querySelector(".hero-prev");
      var next = slider.querySelector(".hero-next");
      var index = 0;
      var timer;

      if (slides.length <= 1) {
        return;
      }

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
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
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      start();
    });
  }

  function initLocalFilter() {
    document.querySelectorAll(".local-filter").forEach(function (input) {
      var targetSelector = input.getAttribute("data-filter-target");
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      var empty = target ? target.parentElement.querySelector(".filter-empty") : null;

      if (!target) {
        return;
      }

      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(target.querySelectorAll("[data-filter-text]"));
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute("data-filter-text") || "";
          var matched = !query || text.indexOf(query) !== -1;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      });
    });
  }

  function cardHtml(item) {
    return [
      '<article class="movie-card normal">',
      '<a class="card-link" href="' + escapeHtml(item.url) + '">',
      '<div class="poster-wrap">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(item.year) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<span class="card-kicker">' + escapeHtml(item.category) + '</span>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml(item.region) + '</span>',
      '<span>' + escapeHtml(item.genre) + '</span>',
      '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    var input = document.getElementById("search-input");
    var empty = document.getElementById("search-empty");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-search-category]"));

    if (!results || !input || !window.MOVIE_CATALOG) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var currentCategory = "";
    input.value = params.get("q") || "";

    function render() {
      var query = input.value.trim().toLowerCase();
      var items = window.MOVIE_CATALOG.filter(function (item) {
        var text = [item.title, item.region, item.year, item.genre, item.tags, item.category, item.oneLine].join(" ").toLowerCase();
        var categoryMatched = !currentCategory || item.category === currentCategory;
        var queryMatched = !query || text.indexOf(query) !== -1;
        return categoryMatched && queryMatched;
      }).slice(0, 96);

      results.innerHTML = items.map(cardHtml).join("");
      if (empty) {
        empty.classList.toggle("is-visible", items.length === 0);
      }
    }

    input.addEventListener("input", render);
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentCategory = button.getAttribute("data-search-category") || "";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        render();
      });
    });

    render();
  }

  function initMoviePlayer(videoId, coverId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hlsInstance = null;
    var prepared = false;

    if (!video || !sourceUrl) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else {
        video.src = sourceUrl;
      }
    }

    function begin() {
      prepare();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    initNavigation();
    initHeroSlider();
    initLocalFilter();
    initSearchPage();
  });
})();
