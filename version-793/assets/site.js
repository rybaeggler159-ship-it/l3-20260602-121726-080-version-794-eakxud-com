(function () {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5000);
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot')));
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                restartTimer();
            });
        }

        setSlide(0);
        startTimer();
    }

    const filterScope = document.querySelector('[data-filter-scope]');
    const movieList = document.querySelector('[data-movie-list]');

    if (filterScope && movieList) {
        const searchInput = filterScope.querySelector('[data-local-search]');
        const regionButtons = Array.from(filterScope.querySelectorAll('[data-filter-region]'));
        const cards = Array.from(movieList.querySelectorAll('.movie-card'));
        let activeRegion = '';

        function applyLocalFilter() {
            const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' ').toLowerCase();
                const matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchesRegion = !activeRegion || card.getAttribute('data-region') === activeRegion;

                card.classList.toggle('hidden-card', !(matchesKeyword && matchesRegion));
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyLocalFilter);
        }

        regionButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeRegion = button.getAttribute('data-filter-region') || '';
                regionButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyLocalFilter();
            });
        });
    }
}());
