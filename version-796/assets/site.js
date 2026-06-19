(function () {
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (prev && next && slides.length) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.dataset.heroDot || 0));
          restart();
        });
      });
      start();
    }
  }

  const panels = document.querySelectorAll('.filter-panel');
  panels.forEach(function (panel) {
    const root = panel.parentElement || document;
    const cards = Array.from(root.querySelectorAll('.movie-card'));
    const keyword = panel.querySelector('[data-filter="keyword"]');
    const year = panel.querySelector('[data-filter="year"]');
    const type = panel.querySelector('[data-filter="type"]');
    const category = panel.querySelector('[data-filter="category"]');
    const count = panel.querySelector('[data-filter-count]');
    const reset = panel.querySelector('[data-filter-reset]');

    function getQueryValue() {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }

    function update() {
      const q = (keyword ? keyword.value : '').trim().toLowerCase();
      const y = year ? year.value : '';
      const t = type ? type.value : '';
      const c = category ? category.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.genre || '',
          card.dataset.type || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        const matchKeyword = !q || haystack.includes(q);
        const matchYear = !y || card.dataset.year === y;
        const matchType = !t || (card.dataset.type || '').includes(t);
        const matchCategory = !c || (card.textContent || '').includes(c);
        const ok = matchKeyword && matchYear && matchType && matchCategory;
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    if (keyword) {
      const initial = getQueryValue();
      if (initial) {
        keyword.value = initial;
      }
    }

    [keyword, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', update);
        control.addEventListener('change', update);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        [keyword, year, type, category].forEach(function (control) {
          if (control) {
            control.value = '';
          }
        });
        update();
      });
    }

    update();
  });
})();
