(function () {
  function setupPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-overlay');
    var src = video ? video.getAttribute('data-src') : '';
    var hls = null;

    function init() {
      if (!video || !src || video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else {
        video.src = src;
      }
    }

    function playVideo() {
      init();
      if (!video) {
        return;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          box.classList.add('is-ready');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(setupPlayer);
})();
