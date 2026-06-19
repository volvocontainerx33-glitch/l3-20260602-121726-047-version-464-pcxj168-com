(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var empty = document.querySelector('[data-empty]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runFilter() {
    if (!cards.length) {
      return;
    }

    var key = normalize(searchInput && searchInput.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matched = (!key || haystack.indexOf(key) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  [searchInput, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', runFilter);
      control.addEventListener('change', runFilter);
    }
  });

  var navSearch = document.querySelector('[data-nav-search]');

  if (navSearch) {
    navSearch.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        var prefix = navSearch.getAttribute('data-search-prefix') || '';
        var target = prefix + 'search.html?q=' + encodeURIComponent(navSearch.value.trim());
        window.location.href = target;
      }
    });
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
      runFilter();
    }
  }

  var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play]'));

  function attachStream(video) {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }

    var src = video.getAttribute('data-stream');

    if (!src) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 36,
        enableWorker: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = src;
    }

    video.setAttribute('data-ready', '1');
  }

  playButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var shell = button.closest('.player-shell');
      var video = shell && shell.querySelector('video');

      attachStream(video);

      if (shell) {
        shell.classList.add('is-playing');
      }

      if (video) {
        video.play().catch(function () {});
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });
})();
