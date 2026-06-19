import { H as Hls } from './hls-dru42stk.js';

function setupPlayer(shell) {
  const video = shell.querySelector('video');
  const button = shell.querySelector('[data-player-start]');
  const message = shell.querySelector('[data-player-message]');
  const source = shell.dataset.src;
  let hlsInstance = null;
  let attached = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function attachSource() {
    if (!source) {
      setMessage('当前影片暂未配置播放源。');
      return Promise.reject(new Error('missing source'));
    }

    if (attached) {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      attached = true;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          setMessage('播放源加载失败，请稍后重试。');
          hlsInstance.destroy();
          hlsInstance = null;
          attached = false;
        }
      });
      attached = true;
      return Promise.resolve();
    }

    setMessage('当前浏览器不支持 HLS 播放。');
    return Promise.reject(new Error('unsupported hls'));
  }

  function play() {
    attachSource()
      .then(function () {
        shell.classList.add('playing');
        setMessage('');
        return video.play();
      })
      .catch(function () {
        shell.classList.remove('playing');
      });
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    shell.classList.add('playing');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      shell.classList.remove('playing');
    }
  });
}

Array.from(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
