(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5500);
  }

  function setupGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var button = document.querySelector("[data-global-search-button]");
    var box = document.querySelector("[data-global-search-results]");
    if (!input || !box || !window.SEARCH_DATA) {
      return;
    }
    function render() {
      var term = input.value.trim().toLowerCase();
      if (!term) {
        box.innerHTML = "";
        return;
      }
      var results = window.SEARCH_DATA.filter(function (item) {
        return [item.title, item.region, item.type, item.year, item.category, item.tags, item.oneLine].join(" ").toLowerCase().indexOf(term) !== -1;
      }).slice(0, 36);
      if (!results.length) {
        box.innerHTML = '<div class="empty-result">没有匹配结果</div>';
        return;
      }
      box.innerHTML = results.map(function (item) {
        return '<a class="search-result-card" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
          '<div><h3>' + escapeHtml(item.title) + '</h3>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span></div></a>';
      }).join("");
    }
    input.addEventListener("input", render);
    if (button) {
      button.addEventListener("click", render);
    }
  }

  function setupLocalFilters() {
    var keyword = document.querySelector("[data-filter-keyword]");
    var year = document.querySelector("[data-filter-year]");
    var region = document.querySelector("[data-filter-region]");
    var category = document.querySelector("[data-filter-category]");
    var items = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .movie-card-row"));
    if (!items.length || (!keyword && !year && !region && !category)) {
      return;
    }
    function apply() {
      var key = keyword ? keyword.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value : "";
      var selectedCategory = category ? category.value : "";
      items.forEach(function (item) {
        var text = [item.dataset.title, item.dataset.region, item.dataset.type, item.dataset.year].join(" ").toLowerCase();
        var pass = true;
        if (key && text.indexOf(key) === -1) {
          pass = false;
        }
        if (selectedYear && item.dataset.year !== selectedYear) {
          pass = false;
        }
        if (selectedRegion && item.dataset.region !== selectedRegion) {
          pass = false;
        }
        if (selectedCategory && item.dataset.category !== selectedCategory) {
          pass = false;
        }
        item.classList.toggle("hidden-card", !pass);
      });
    }
    [keyword, year, region, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function setupPlayer() {
    var video = document.querySelector("[data-movie-player]");
    var mask = document.querySelector("[data-player-mask]");
    if (!video) {
      return;
    }
    var url = video.getAttribute("data-play");
    var started = false;
    var hls = null;
    function attach() {
      if (started || !url) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    function play() {
      attach();
      if (mask) {
        mask.classList.add("hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    if (mask) {
      mask.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!started) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (mask) {
        mask.classList.add("hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilters();
    setupPlayer();
  });
})();
