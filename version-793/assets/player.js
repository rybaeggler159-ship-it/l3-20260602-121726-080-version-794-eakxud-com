import { H as Hls } from './hls-dru42stk.js';

function setNote(player, message) {
    const note = player.querySelector('[data-player-note]');
    if (note) {
        note.textContent = message;
    }
}

function initializePlayer(player) {
    const video = player.querySelector('video');
    const trigger = player.querySelector('[data-play-trigger]');
    const source = player.getAttribute('data-video-src');

    if (!video || !source) {
        setNote(player, '当前影片播放源暂不可用。');
        return;
    }

    if (trigger) {
        trigger.classList.add('hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {
            setNote(player, '浏览器阻止了自动播放，请再次点击播放器。');
        });
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
                setNote(player, '播放源已加载，请点击播放器继续播放。');
            });
        });

        hls.on(Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
                setNote(player, '播放加载失败，请刷新页面或稍后重试。');
            }
        });
        return;
    }

    video.src = source;
    setNote(player, '当前浏览器可能不支持 HLS 播放，请更换浏览器访问。');
}

document.querySelectorAll('[data-player]').forEach(function (player) {
    const trigger = player.querySelector('[data-play-trigger]');

    if (trigger) {
        trigger.addEventListener('click', function () {
            initializePlayer(player);
        }, { once: true });
    }
});
