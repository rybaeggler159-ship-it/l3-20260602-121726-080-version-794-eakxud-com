(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (menuButton && nav) {
      menuButton.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = setInterval(function () {
          showSlide(active + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startHero();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(active - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startHero();
      });
    }

    showSlide(0);
    startHero();

    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './search.html' + (value ? '?q=' + encodeURIComponent(value) : '');
        window.location.href = target;
      });
    });

    var filterInput = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var genreSelect = document.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('.empty-state');

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var genre = genreSelect ? genreSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.textContent].join(' ').toLowerCase();
        var cardYear = card.dataset.year || '';
        var cardGenre = card.dataset.genre || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || cardYear === year;
        var matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
        var show = matchKeyword && matchYear && matchGenre;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? 'none' : 'block';
      }
    }

    [filterInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        filterInput.value = query;
      }
      applyFilter();
    }

    var player = document.querySelector('[data-player]');
    if (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.play-cover');
      var button = player.querySelector('.play-button');
      var source = player.getAttribute('data-video');
      var started = false;

      function beginPlay() {
        if (!video || !source || started) {
          return;
        }
        started = true;
        if (cover) {
          cover.classList.add('hidden');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', beginPlay);
      }
      if (cover) {
        cover.addEventListener('click', beginPlay);
      }
      video.addEventListener('click', function () {
        if (!started) {
          beginPlay();
        }
      });
    }
  });
})();
