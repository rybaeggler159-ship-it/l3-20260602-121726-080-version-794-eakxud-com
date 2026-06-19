(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        startTimer();
      });
    });

    show(0);
    startTimer();
  }

  var cardList = document.querySelector('[data-card-list]');
  var filterInput = document.querySelector('[data-filter-input]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var emptyState = document.querySelector('[data-empty-state]');

  if (cardList) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' '));
    }

    function applyFilter() {
      var keyword = normalize(filterInput ? filterInput.value : '');
      var shown = 0;
      cards.forEach(function (card) {
        var matched = !keyword || cardText(card).indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', shown === 0);
      }
    }

    function applySort() {
      var value = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();
      if (value === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }
      if (value === 'title-asc') {
        sorted.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
        });
      }
      sorted.forEach(function (card) {
        cardList.appendChild(card);
      });
      cards = sorted;
      applyFilter();
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchEmpty = document.querySelector('[data-search-empty]');
  var searchInput = document.querySelector('[data-search-page-input]');

  if (searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (searchInput) {
      searchInput.value = q;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function makeCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-cover" href="./' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-badge">▶</span>',
        '  </a>',
        '  <div class="movie-info">',
        '    <a class="movie-title" href="./' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-meta">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <a class="movie-category" href="./category-' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.category) + '</a>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function runSearch() {
      var keyword = String(q || '').trim().toLowerCase();
      if (!keyword) {
        searchResults.innerHTML = '';
        if (searchEmpty) {
          searchEmpty.textContent = '输入关键词后查看匹配影片';
          searchEmpty.classList.add('is-visible');
        }
        return;
      }

      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        return [movie.title, movie.year, movie.region, movie.type, movie.category, movie.tags, movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) !== -1;
      }).slice(0, 80);

      searchResults.innerHTML = matches.map(makeCard).join('');
      if (searchEmpty) {
        searchEmpty.textContent = '没有匹配的影片';
        searchEmpty.classList.toggle('is-visible', matches.length === 0);
      }
    }

    runSearch();
  }
}());
