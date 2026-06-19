(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play]');
    var stream = player.getAttribute('data-stream');
    var hls = null;

    if (!video || !overlay || !stream) {
      return;
    }

    function attachStream() {
      if (video.dataset.ready === '1') {
        return;
      }

      video.dataset.ready = '1';

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);

        if (window.Hls.Events) {
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              video.src = stream;
            }
          });
        }
        return;
      }

      video.src = stream;
    }

    function playVideo() {
      attachStream();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');

      var result = video.play();

      if (result && result.catch) {
        result.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
  });
})();
