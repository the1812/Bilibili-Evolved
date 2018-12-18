(() =>
{
    return (settings, resources) =>
    {
        const colors = {
            red: "#e57373",
            pink: "#F06292",
            purple: "#BA68C8",
            deepPurple: "#9575CD",
            indigo: "#7986CB",
            blue: "#2196F3",
            lightBlue: "#00A0D8",
            cyan: "#00ACC1",
            teal: "#26A69A",
            green: "#81C784",
            lightGreen: "#9CCC65",
            orange: "#FF9800",
            deepOrange: "#FF7043",
            brown: "#A1887F",
            grey: "#757575",
            blueGrey: "#78909C"
        };
        class ThemeColors
        {
            constructor()
            {
                this.reloadColor = (() =>
                {
                    const html = document.querySelector("html");
                    return function (newColor)
                    {
                        const color = new ColorProcessor(newColor);

                        const shadowColor = color.hexToRgba(newColor + "70");
                        $("div.custom-color-preview")
                            .css("background", newColor)
                            .css("box-shadow", `0px 2px 8px 1px rgba(${shadowColor.r},${shadowColor.g},${shadowColor.b},${shadowColor.a})`);

                        html.style.setProperty("--theme-color", newColor);
                        for (let opacity = 10; opacity <= 90; opacity += 10)
                        {
                            html.style.setProperty(`--theme-color-${opacity}`,
                                color.rgbToString(color.hexToRgba(newColor + opacity)));
                        }
                        html.style.setProperty("--foreground-color", color.foreground);
                        html.style.setProperty("--foreground-color-b",
                            color.rgbToString(color.hexToRgba(color.foreground + "b")));
                        html.style.setProperty("--foreground-color-d",
                            color.rgbToString(color.hexToRgba(color.foreground + "d")));
                        html.style.setProperty("--blue-image-filter", color.blueImageFilter);
                        html.style.setProperty("--pink-image-filter", color.pinkImageFilter);
                        html.style.setProperty("--brightness", color.brightness);
                        html.style.setProperty("--invert-filter", color.filterInvert);
                    };
                })();
            }
            setupDom()
            {
                $(`input[key='customStyleColor']`).on("change", () =>
                {
                    this.reloadColor($(`input[key='customStyleColor']`).val());
                });
                const grid = $(".predefined-colors-grid");
                for (const color of Object.values(colors))
                {
                    $(`<div class='predefined-colors-grid-block'></div>`)
                        .appendTo(grid)
                        .css("background", color)
                        .attr("data-color", color)
                        .on("click", e =>
                        {
                            const newColor = $(e.target).attr("data-color");
                            $(`input[key='customStyleColor']`)
                                .val(newColor)
                                .trigger("input").change();
                            $("div.custom-color-preview").on("click");
                        });
                }
                $("div.custom-color-preview").on("click", () =>
                {
                    const box = $(".predefined-colors");
                    box.toggleClass("opened");
                });
            }
        }
        return {
            export: ThemeColors
        };
    };
})();