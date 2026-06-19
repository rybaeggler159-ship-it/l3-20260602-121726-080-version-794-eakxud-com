import { H as Hls } from './hls-dru42stk.js';

function setupPlayer(shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-button]');
  var status = shell.parentElement.querySelector('[data-player-status]');
  var source = shell.getAttribute('data-src');
  var loaded = false;

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function loadAndPlay() {
    if (!source || !video) {
      setStatus('当前影片播放源暂未配置。');
      return;
    }

    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请刷新页面或更换网络后重试。');
          }
        });
      } else {
        video.src = source;
      }
      loaded = true;
    }

    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {
        setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
      });
    }
    if (button) {
      button.style.display = 'none';
    }
    setStatus('正在加载影片播放源。');
  }

  if (button) {
    button.addEventListener('click', loadAndPlay);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        loadAndPlay();
      }
    });
  }
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
