(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var toggle = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function bindHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindFilters() {
    var list = qs('.searchable-list');
    var search = qs('[data-list-search]');
    var yearFilter = qs('[data-year-filter]');
    var categoryFilter = qs('[data-category-filter]');
    if (!list || !search) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial) {
      search.value = initial;
    }

    function update() {
      var keyword = search.value.trim().toLowerCase();
      var year = yearFilter ? yearFilter.value : '';
      var category = categoryFilter ? categoryFilter.value : '';
      qsa('.movie-card', list).forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.category
        ].join(' ').toLowerCase();
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (year && card.dataset.year !== year) {
          ok = false;
        }
        if (category && card.dataset.category !== category) {
          ok = false;
        }
        card.classList.toggle('is-filtered-out', !ok);
      });
    }

    search.addEventListener('input', update);
    if (yearFilter) {
      yearFilter.addEventListener('change', update);
    }
    if (categoryFilter) {
      categoryFilter.addEventListener('change', update);
    }
    update();
  }

  window.initializeVideo = function (streamUrl) {
    var video = document.getElementById('mainVideo');
    var button = document.getElementById('playOverlay');
    if (!video || !button || !streamUrl) {
      return;
    }
    var loaded = false;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      button.classList.add('is-hidden');
      var playAction = video.play();
      if (playAction && typeof playAction.catch === 'function') {
        playAction.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('playing', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindHero();
    bindFilters();
  });
})();
