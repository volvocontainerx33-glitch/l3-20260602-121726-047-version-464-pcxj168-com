(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var featureTitle = document.querySelector('[data-hero-title]');
  var featureText = document.querySelector('[data-hero-text]');
  var featureLink = document.querySelector('[data-hero-link]');
  var featureImg = document.querySelector('[data-hero-img]');
  var featureMeta = document.querySelector('[data-hero-meta]');
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = index % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
    var slide = slides[active];
    if (featureTitle) {
      featureTitle.textContent = slide.getAttribute('data-title') || '';
    }
    if (featureText) {
      featureText.textContent = slide.getAttribute('data-text') || '';
    }
    if (featureLink) {
      featureLink.href = slide.getAttribute('data-link') || './index.html';
    }
    if (featureImg) {
      featureImg.src = slide.getAttribute('data-cover') || './1.jpg';
      featureImg.alt = slide.getAttribute('data-title') || '';
    }
    if (featureMeta) {
      featureMeta.textContent = slide.getAttribute('data-meta') || '';
    }
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var input = filterForm.querySelector('[name="keyword"]');
    var year = filterForm.querySelector('[name="year"]');
    var region = filterForm.querySelector('[name="region"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchKeyword = !q || text.indexOf(q) !== -1;
        var matchYear = !y || (card.getAttribute('data-year') || '').indexOf(y) === 0;
        var matchRegion = !r || (card.getAttribute('data-region') || '').indexOf(r) !== -1;
        card.classList.toggle('hidden-by-filter', !(matchKeyword && matchYear && matchRegion));
      });
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    ['input', 'change'].forEach(function (type) {
      filterForm.addEventListener(type, applyFilter);
    });

    var params = new URLSearchParams(window.location.search);
    if (params.get('q') && input) {
      input.value = params.get('q');
    }
    applyFilter();
  }
})();
