(() =>
{
    return (settings, resources) =>
    {
        function comboLike()
        {
            // TODO: combo like logic here
            console.log("combo like");
        }
        (async () =>
        {
            const [likeButton] = await SpinQuery.any(() => document.querySelectorAll("div.ops>span.like"));
            likeButton.style.userSelect = "none";
            const triggerTime = 2000;
            let trigger = false;
            likeButton.addEventListener("pointerdown", e =>
            {
                trigger = true;
                if (e.type === "touch")
                {
                    e.preventDefault();
                }
                setTimeout(() =>
                {
                    if (trigger === true)
                    {
                        trigger = false;
                        comboLike();
                    }
                }, triggerTime);
            });
            likeButton.addEventListener("click", e =>
            {
                if (trigger === false)
                {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
                else
                {
                    trigger = false;
                }
            });
            likeButton.addEventListener("touchend", e =>
            {
                if (trigger === false)
                {
                    e.preventDefault();
                }
            });
        })();
        return {
            widget:
            {
                content: `
                    <button
                        class="gui-settings-flat-button"
                        id="combo-like">
                        <i class="icon-like"></i>
                        <span>素质三连</span>
                    </button>`,
                condition: async () =>
                {
                    const likeButton = await SpinQuery.any(() => document.querySelectorAll("div.ops>span.like"));
                    return likeButton !== undefined;
                },
                success: () =>
                {
                    $("#combo-like").on("click", () =>
                    {
                        comboLike();
                    });
                },
            },
        };
    };
})();