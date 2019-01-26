(() =>
{
    return (settings, resources) =>
    {
        (async () =>
        {
            const likeButton = await SpinQuery.select(() => document.querySelector(".ops span.like"));
            if (!likeButton)
            {
                return;
            }
            likeButton.style.userSelect = "none";
            function mountEvent(name, args)
            {
                const event = new CustomEvent(name, args);
                likeButton.dispatchEvent(event);
            }

            const clickInterval = 200;
            let click = true;
            likeButton.addEventListener("touchstart", e =>
            {
                e.preventDefault();
                click = true;
                setTimeout(() => click = false, clickInterval);
                mountEvent("mousedown", e);
            });
            likeButton.addEventListener("touchend", e =>
            {
                e.preventDefault();
                mountEvent("mouseup", e);
                if (click === true)
                {
                    mountEvent("click", e);
                }
            });
        })();
    };
})();