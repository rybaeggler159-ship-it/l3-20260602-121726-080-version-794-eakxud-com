(function () {
    const app = document.querySelector('[data-search-page]');
    const data = Array.isArray(window.MOVIE_DATA) ? window.MOVIE_DATA : [];

    if (!app) {
        return;
    }

    const form = app.querySelector('[data-search-form]');
    const input = app.querySelector('[data-search-input]');
    const regionSelect = app.querySelector('[data-region-select]');
    const yearSelect = app.querySelector('[data-year-select]');
    const categorySelect = app.querySelector('[data-category-select]');
    const resultBox = app.querySelector('[data-search-results]');
    const countBox = app.querySelector('[data-search-count]');

    function uniqueValues(key) {
        return Array.from(new Set(data.map(function (item) {
            return item[key];
        }).filter(Boolean))).sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-Hans-CN');
        });
    }

    function addOptions(select, values) {
        values.forEach(function (value) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function cardTemplate(item) {
        const tags = (item.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '    <a class="poster" href="' + escapeHtml(item.detailUrl) + '">',
            '        <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.style.display=\'none\';">',
            '        <span class="poster-glow"></span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <a class="movie-title" href="' + escapeHtml(item.detailUrl) + '">' + escapeHtml(item.title) + '</a>',
            '        <p class="movie-line">' + escapeHtml(item.oneLine || '') + '</p>',
            '        <div class="movie-meta">',
            '            <span>' + escapeHtml(item.year || '年份未详') + '</span>',
            '            <span>' + escapeHtml(item.region || '') + '</span>',
            '            <span>' + escapeHtml(item.type || '') + '</span>',
            '        </div>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function currentKeyword() {
        const params = new URLSearchParams(window.location.search);
        return (input && input.value.trim()) || params.get('q') || '';
    }

    function applySearch() {
        const keyword = currentKeyword().trim().toLowerCase();
        const region = regionSelect.value;
        const year = yearSelect.value;
        const category = categorySelect.value;

        if (input && !input.value && keyword) {
            input.value = keyword;
        }

        const results = data.filter(function (item) {
            const haystack = [
                item.title,
                item.year,
                item.region,
                item.type,
                item.genre,
                item.categoryName,
                (item.tags || []).join(' '),
                item.oneLine
            ].join(' ').toLowerCase();

            return (!keyword || haystack.indexOf(keyword) !== -1)
                && (!region || item.region === region)
                && (!year || String(item.year) === year)
                && (!category || item.categorySlug === category);
        }).sort(function (a, b) {
            return (b.hotScore - a.hotScore) || (b.year - a.year);
        });

        const top = results.slice(0, 80);
        resultBox.innerHTML = top.map(cardTemplate).join('');
        countBox.textContent = '找到 ' + results.length + ' 部影片，当前展示前 ' + top.length + ' 部。';
    }

    addOptions(regionSelect, uniqueValues('region'));
    addOptions(yearSelect, uniqueValues('year'));

    const categories = Array.from(new Map(data.map(function (item) {
        return [item.categorySlug, item.categoryName];
    })).entries());

    categories.forEach(function (pair) {
        const option = document.createElement('option');
        option.value = pair[0];
        option.textContent = pair[1];
        categorySelect.appendChild(option);
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const params = new URLSearchParams(window.location.search);
        params.set('q', input.value.trim());
        history.replaceState(null, '', window.location.pathname + '?' + params.toString());
        applySearch();
    });

    [input, regionSelect, yearSelect, categorySelect].forEach(function (field) {
        field.addEventListener('input', applySearch);
        field.addEventListener('change', applySearch);
    });

    applySearch();
}());
