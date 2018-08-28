// 运行后可使b站采用新版播放器(对番剧/稍后再看页面无效)
function setCookie(key, value, expireDays)
{
    const date = new Date();
    date.setTime(date.getTime() + expireDays * 24 * 60 * 60 * 1000);
    document.cookie = `${key}=${value};expires=${date.toUTCString()};path=/`;
}
setCookie("stardustplayer", "1", 90000);
