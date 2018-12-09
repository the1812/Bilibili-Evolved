(() =>
{
    return (settings, resources) =>
    {
        let trigger = false;
        async function delay(time)
        {
            return new Promise(resolve =>
            {
                setTimeout(() => resolve(), time);
            });
        }
        async function like()
        {
            const [likeButton] = await SpinQuery.any(() => document.querySelectorAll("div.ops>span.like"));
            if (!likeButton.classList.contains("on"))
            {
                trigger = true;
                likeButton.click();
            }
        }
        async function coin()
        {
            const [coinButton] = await SpinQuery.any(() => document.querySelectorAll("div.ops>span.coin"));
            if (!coinButton.classList.contains("on"))
            {
                coinButton.click();
                const dialog = await SpinQuery.any(() => $(".mc-box"));
                const coinsSpan = await SpinQuery.any(() => $(".coin-operated-m"));
                const supportDoubleCoins = coinsSpan.children().filter((_, it) => it.innerText.indexOf("2硬币")).length !== 0;
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
                const coinSpan = dialog.filter((_, it) => it.innerText.indexOf(coins) !== -1)[0];
                coinSpan.click();
                const okButton = $(".bi-btn").filter((_, it) => it.innerText === "确定")[0];
                okButton.click();
                await SpinQuery.condition(
                    () => $(".bili-dialog-m"),
                    it => it.length === 0 && coinButton.classList.contains("on")
                        || $(".bili-msg").text().indexOf("硬币不足") !== -1,
                );
                const closeButton = document.querySelector(".bili-dialog-m i.icon.close");
                if (closeButton)
                {
                    closeButton.click();
                    await SpinQuery.condition(
                        () => $(".bili-dialog-m"),
                        it => it.length === 0,
                    );
                }
            }
        }
        async function favorite()
        {
            const [favoriteButton] = await SpinQuery.any(() => document.querySelectorAll("div.ops>span.collect"));
            if (!favoriteButton.classList.contains("on"))
            {
                favoriteButton.click();
                const dialog = await SpinQuery.any(() => $(".group-list label:has(input)"));
                const defaultInput = dialog.filter((_, it) => it.innerText.indexOf("默认收藏夹") !== -1).find("input")[0];
                if (!defaultInput.checked)
                {
                    const event = document.createEvent("HTMLEvents");
                    event.initEvent("change", true, true);
                    defaultInput.checked = true;
                    defaultInput.dispatchEvent(event);
                    const okButton = $(".btn.submit-move")[0];
                    okButton.disabled = false;
                    okButton.click();
                }
                else
                {
                    const okButton = $("i.close")[0];
                    okButton.click();
                }
                await SpinQuery.condition(
                    () => $(".bili-dialog-m"),
                    it => it.length === 0 && favoriteButton.classList.contains("on"),
                );
            }

        }
        async function comboLike()
        {
            // resources.applyImportantStyleFromText(`<style id="combo-like-temp-style">
            //     .bili-dialog-m
            //     {
            //         display: none !important;
            //     }
            // </style>`);
            console.log("combo start");
            await like();
            await favorite();
            await coin();
            console.log("combo end");

            //$("#combo-like-temp-style").remove();
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
                if (trigger === false && e.cancelable)
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
                        $(".gui-settings-mask").click();
                    });
                },
            },
        };
    };
})();