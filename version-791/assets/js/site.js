(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var heroIndex = 0;
    var showSlide = function (index) {
      heroIndex = index % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === heroIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === heroIndex);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5200);
  }

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      filterForm.elements.q.value = params.get('q');
    }
    var applyFilter = function () {
      var q = (filterForm.elements.q.value || '').trim().toLowerCase();
      var type = filterForm.elements.type ? filterForm.elements.type.value : '';
      var year = filterForm.elements.year ? filterForm.elements.year.value : '';
      cards.forEach(function (card) {
        var hay = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre].join(' ').toLowerCase();
        var passQ = !q || hay.indexOf(q) !== -1;
        var passType = !type || card.dataset.type === type;
        var passYear = !year || card.dataset.year === year;
        card.classList.toggle('is-hidden-by-filter', !(passQ && passType && passYear));
      });
    };
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    Array.prototype.forEach.call(filterForm.querySelectorAll('input, select'), function (field) {
      field.addEventListener('input', applyFilter);
      field.addEventListener('change', applyFilter);
    });
    applyFilter();
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play]');
    var layer = player.querySelector('.play-layer');
    var stream = video ? video.getAttribute('data-stream') : '';
    var ready = false;
    var boot = function () {
      if (!video || !stream) {
        return;
      }
      if (!ready) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        ready = true;
      }
      var playPromise = video.play();
      if (playPromise && playPromise.then) {
        playPromise.then(function () {
          if (layer) {
            layer.classList.add('is-hidden');
          }
        }).catch(function () {});
      } else if (layer) {
        layer.classList.add('is-hidden');
      }
    };
    if (button) {
      button.addEventListener('click', boot);
    }
    player.addEventListener('click', function (event) {
      if (event.target === video || event.target === player) {
        boot();
      }
    });
    if (video) {
      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('is-hidden');
        }
      });
    }
  }
})();
