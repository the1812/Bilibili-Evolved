(async () => {
    const url = document.URL.replace(window.location.search, '');
    if (url !== 'https://live.bilibili.com/' && url !== 'https://live.bilibili.com/index.html') {
        return;
    }
    SpinQuery.condition(() => document.querySelector('.component-ctnr video'), (video) => !video.paused, () => {
        const button = document.querySelector('.bilibili-live-player-video-controller-start-btn>button');
        button.click();
    });
    const styleID = 'hide-home-live-style';
    addSettingsListener('hideHomeLive', value => {
        if (value === true) {
            const style = document.createElement('style');
            style.innerText = `#player-header { display: none !important }`;
            style.id = styleID;
            document.body.append(style);
        }
        else {
            const style = document.getElementById(styleID);
            style && style.remove();
        }
    }, true);
})();
