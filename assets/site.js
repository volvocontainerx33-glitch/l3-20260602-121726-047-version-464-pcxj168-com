(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    let current = 0;
    const showSlide = function (index) {
      slides[current].classList.remove('active');
      slides[current].setAttribute('aria-hidden', 'true');
      dots[current].classList.remove('active');
      current = index;
      slides[current].classList.add('active');
      slides[current].setAttribute('aria-hidden', 'false');
      dots[current].classList.add('active');
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    setInterval(function () {
      showSlide((current + 1) % slides.length);
    }, 5200);
  }

  const grid = document.querySelector('[data-filter-grid]');
  if (grid) {
    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const keyword = document.querySelector('[data-filter-keyword]');
    const year = document.querySelector('[data-filter-year]');
    const type = document.querySelector('[data-filter-type]');
    const empty = document.querySelector('.empty-result');
    const params = new URLSearchParams(location.search);
    const initial = params.get('q');
    if (initial && keyword) {
      keyword.value = initial;
    }
    const applyFilter = function () {
      const key = (keyword && keyword.value || '').trim().toLowerCase();
      const y = year && year.value || '';
      const tp = type && type.value || '';
      let shown = 0;
      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(' ').toLowerCase();
        const okKey = !key || text.indexOf(key) !== -1;
        const okYear = !y || card.dataset.year === y;
        const okType = !tp || card.dataset.type === tp;
        const ok = okKey && okYear && okType;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    };
    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
    applyFilter();
  }
})();
