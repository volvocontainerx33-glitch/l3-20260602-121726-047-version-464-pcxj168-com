function initMoviePlayer(source) {
  const video = document.querySelector('[data-player-video]');
  const cover = document.querySelector('[data-player-cover]');
  const button = document.querySelector('[data-player-button]');
  if (!video || !source) {
    return;
  }

  const start = function () {
    if (cover) {
      cover.classList.add('hidden');
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      return;
    }
    video.src = source;
    video.play();
  };

  if (button) {
    button.addEventListener('click', start);
  }
  if (cover) {
    cover.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
}
