(() =>
{
    return (settings, resources) =>
    {
        let trigger = false;
        async function like()
        {
            const [likeButton] = await SpinQuery.any(() => document.querySelectorAll("div.ops>span.like"));
            trigger = true;
            likeButton.click();
        }
        async function coin()
        {
            const [coinButton] = await SpinQuery.any(() => document.querySelectorAll("div.ops>span.coin"));
            const supportDoubleCoins = $(".coin-operated-m").children().filter((_, it) => it.innerText === "2硬币").length !== 0;
            const coins = (() =>
            {
                if (settings.doubleCoins && supportDoubleCoins)
                {
                    return 2;
                }
                else
                {
                    return 1;
                }
            })();
            coinButton.click();
            const dialog = await SpinQuery.any(() => $(".mc-box"));
            const coinSpan = dialog.filter((_, it) => it.innerText.indexOf(coins) !== -1)[0];
            coinSpan.click();
            const okButton = $(".bi-btn").filter((_, it) => it.innerText === "确定")[0];
            okButton.click();
        }
        async function favorite()
        {
            const [favoriteButton] = await SpinQuery.any(() => document.querySelectorAll("div.ops>span.collect"));
            favoriteButton.click();
            const dialog = await SpinQuery.any(() => $(".group-list label:has(input)"));
            const defaultInput = dialog.filter((_, it) => it.innerText.indexOf("默认收藏夹") !== -1).find("input")[0];
            const event = document.createEvent("HTMLEvents");
            event.initEvent("change", true, true);
            defaultInput.checked = !defaultInput.checked;
            defaultInput.dispatchEvent(event);
            const okButton = $(".btn.submit-move")[0];
            okButton.disabled = false;
            okButton.click();
        }
        async function comboLike()
        {
            // TODO: combo like logic here
            console.log("combo like");
            resources.applyImportantStyleFromText(`<style id="combo-like-temp-style">
                .bili-dialog-m
                {
                    display: none !important;
                }
            </style>`);
            await like();
            await coin();
            await favorite();
            $("#combo-like-temp-style").remove();
        }
        (async () =>
        {
            const [likeButton] = await SpinQuery.any(() => document.querySelectorAll("div.ops>span.like"));
            likeButton.style.userSelect = "none";
            const triggerTime = 2000;
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