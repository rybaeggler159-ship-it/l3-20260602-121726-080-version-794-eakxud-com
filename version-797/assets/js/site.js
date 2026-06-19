(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === index);
      });
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var filterInput = document.querySelector('[data-card-filter]');
    if (filterInput) {
      filterInput.addEventListener('input', function () {
        var term = filterInput.value.trim().toLowerCase();
        Array.prototype.slice.call(document.querySelectorAll('[data-card]')).forEach(function (card) {
          var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-year')).toLowerCase();
          card.classList.toggle('hidden-card', term && haystack.indexOf(term) === -1);
        });
      });
    }

    var searchForm = document.querySelector('[data-site-search-form]');
    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = searchForm.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (value) {
          window.location.href = searchForm.getAttribute('data-search-url') + '?q=' + encodeURIComponent(value);
        }
      });
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage && window.MOVIES_SEARCH) {
      var qInput = document.querySelector('[data-search-input]');
      var typeSelect = document.querySelector('[data-search-type]');
      var yearSelect = document.querySelector('[data-search-year]');
      var results = document.querySelector('[data-search-results]');
      var params = new URLSearchParams(window.location.search);
      var initialQ = params.get('q') || '';
      if (qInput) {
        qInput.value = initialQ;
      }

      function renderSearch() {
        var q = qInput.value.trim().toLowerCase();
        var type = typeSelect.value;
        var year = yearSelect.value;
        var found = window.MOVIES_SEARCH.filter(function (movie) {
          var text = (movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.tags).toLowerCase();
          return (!q || text.indexOf(q) !== -1) && (!type || movie.type === type) && (!year || String(movie.year) === year);
        }).slice(0, 240);

        results.innerHTML = found.map(function (movie) {
          return '<article class="movie-card" data-card>' +
            '<a href="movie/' + movie.id + '.html">' +
              '<div class="poster-wrap">' +
                '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.opacity=0.12">' +
                '<span class="badge">' + escapeHtml(movie.type) + '</span>' +
                '<span class="score">热度 ' + movie.score + '</span>' +
              '</div>' +
              '<div class="movie-card-body">' +
                '<h3>' + escapeHtml(movie.title) + '</h3>' +
                '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="meta-row"><span class="meta-pill">' + movie.year + '</span><span class="meta-pill">' + escapeHtml(movie.region) + '</span></div>' +
              '</div>' +
            '</a>' +
          '</article>';
        }).join('');
      }

      function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (ch) {
          return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch];
        });
      }

      [qInput, typeSelect, yearSelect].forEach(function (el) {
        if (el) {
          el.addEventListener('input', renderSearch);
          el.addEventListener('change', renderSearch);
        }
      });
      renderSearch();
    }
  });
})();
