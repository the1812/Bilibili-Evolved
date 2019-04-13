const target = document.URL.includes("bangumi") ? "#bofqi" : ".video-info .video-title .tit";
SpinQuery.count(".nav-con,#bofqi", 3).then(() =>
{
    const element = document.querySelector(target);
    if (element === null)
    {
        return;
    }
    element.scrollIntoView();
    if (settings.playerFocusOffset !== 0)
    {
        window.scrollBy(0, settings.playerFocusOffset);
    }
});