const target = document.URL.includes("bangumi") ? "#bofqi" : ".video-info .video-title .tit";
SpinQuery.count(".nav-con,#bofqi", 3).then(() =>
{
    document.querySelector(target).scrollIntoView();
    if (settings.playerFocusOffset !== 0)
    {
        window.scrollBy(0, settings.playerFocusOffset);
    }
});