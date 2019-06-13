(async () => {
    const url = document.URL.replace(window.location.search, '');
    if (url !== 'https://live.bilibili.com/' && url !== 'https://live.bilibili.com/index.html') {
        return;
    }
    SpinQuery.condition(() => document.querySelector('.component-ctnr video'), (video) => !video.paused, () => {
        const button = document.querySelector('.bilibili-live-player-video-controller-start-btn>button');
        button.click();
    });
})();
