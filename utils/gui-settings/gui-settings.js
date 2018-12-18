(() =>
{
    return (settings, resources) =>
    {
        const Validator = resources.attributes.textValidate.export.Validator;
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
        const reloadColor = (() =>
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
                html.style.setProperty("--blue-image-filter", color.blueImageFilter);
                html.style.setProperty("--pink-image-filter", color.pinkImageFilter);
                html.style.setProperty("--brightness", color.brightness);
                html.style.setProperty("--invert-filter", color.filterInvert);
            };
        })();

        function getCategoriyItems(category)
        {
            let element = category.nextElementSibling;
            const elements = [];
            while (element !== null && !element.classList.contains("category"))
            {
                elements.push(element);
                element = element.nextElementSibling;
            }
            return elements;
        }

        function settingsChange(key, value)
        {
            // const reloadable = Resource.reloadables[key];
            // if (reloadable)
            // {
            //     settings[key] = value;
            //     resources.fetchByKey(reloadable);
            // }
            $(`input[type='checkbox'][key='${key}']`)
                .prop("checked", value);
            $(`input[type='text'][key='${key}']`).val(value);
        }
        function syncGui()
        {
            for (const [key, value] of Object.entries(settings))
            {
                settingsChange(key, value);
            }
        }
        function setupEvents()
        {
            $(".gui-settings-mask").on("click", () =>
            {
                $(".gui-settings-widgets-box,.gui-settings-box,.gui-settings-mask").removeClass("opened");
            });
            $("input[type='text'][key]").each((_, element) =>
            {
                $(element).attr("placeholder", settings[$(element).attr("key")]);
            });
            $("div.custom-color-preview").on("click", () =>
            {
                const box = $(".predefined-colors");
                box.toggleClass("opened");
            });
            $(".gui-settings-content ul li.category").on("click", e =>
            {
                e.currentTarget.classList.toggle("folded");
                getCategoriyItems(e.currentTarget).forEach(it => it.classList.toggle("folded"));
            });
            $(".gui-settings-dropdown>input").on("click", e =>
            {
                $(e.currentTarget).parent().toggleClass("opened");
            });
            onSettingsChange((key, _, value) =>
            {
                settingsChange(key, value);
                syncGui();
            });
        }
        function listenSettingsChange()
        {
            $("input[type='checkbox'][key]").each((_, element) =>
            {
                $(element).on("change", () =>
                {
                    const key = element.getAttribute("key");
                    const value = element.checked;
                    settings[key] = value;
                    saveSettings(settings);
                });
            });
            $("input[type='text'][key]").each((_, element) =>
            {
                $(element).on("change", () =>
                {
                    const key = element.getAttribute("key");
                    const value = Validator.getValidator(key).validate(element.value);
                    if (key === "customStyleColor")
                    {
                        reloadColor(value);
                    }
                    settings[key] = value;
                    element.value = value;
                    saveSettings(settings);
                });
            });
        }
        function listenDependencies()
        {
            const dependencies = {};
            $(`input[dependencies]`).each((_, element) =>
            {
                const dep = $(element).attr("dependencies");
                if (dep)
                {
                    dependencies[$(element).attr("key")] = dep;
                }
            });
            const checkBoxChange = element =>
            {
                const checked = element.prop("checked");
                for (const key in dependencies)
                {
                    const dependency = dependencies[key].split(" ");
                    if (dependency.indexOf(element.attr("key")) !== -1)
                    {
                        let disable = true;
                        if (checked && dependency.every(k => $(`input[key='${k}']`).prop("checked")))
                        {
                            disable = false;
                        }
                        const li = $(`li:has(input[key='${key}'])`);
                        const action = disable ? "addClass" : "removeClass";
                        li[action]("disabled");
                        $(`input[key='${key}'][type='text']`).parent()[action]("disabled");
                    }
                }
            };
            $(`input[type='checkbox'][key]`)
                .on("change", e => checkBoxChange($(e.target)))
                .each((_, e) => checkBoxChange($(e)));
        }
        function addPredefinedColors()
        {
            const grid = $(".predefined-colors-grid");
            for (const color of Object.values(colors))
            {
                $(`<div class='predefined-colors-grid-block'></div>`)
                    .appendTo(grid)
                    .css("background", color)
                    .attr("data-color", color)
                    .on("click", e =>
                    {
                        $(`input[key='customStyleColor']`)
                            .val($(e.target).attr("data-color"))
                            .trigger("input").change();
                        $("div.custom-color-preview").on("click");
                    });
            }
        }
        function applyBlurEffect()
        {
            if (settings.blurSettingsPanel)
            {
                $(".gui-settings-box").addClass("blur");
            }
        }
        function checkOfflineData()
        {
            if (typeof offlineData !== "undefined")
            {
                $("li:has(input[key=useCache])").addClass("disabled");
                $("input[key=useCache]").prop("disabled", true);
            }
        }
        function foldAllCategories()
        {
            $(".gui-settings-content ul li.category").each((_, e) =>
            {
                $(e).click();
            });
        }
        function checkCompatibility()
        {
            if (!CSS.supports("backdrop-filter", "blur(24px)")
                && !CSS.supports("-webkit-backdrop-filter", "blur(24px)"))
            {
                $("input[key=blurVideoControl]").prop("disabled", true);
                settings.blurVideoControl = false;
                saveSettings(settings);
            }
        }

        resources.applyStyle("guiSettingsStyle");
        const settingsBox = resources.data.guiSettingsDom.text;
        if (settingsBox)
        {
            $("body").append(settingsBox);
            setupEvents();
            checkOfflineData();
            syncGui();
            listenDependencies();
            addPredefinedColors();
            listenSettingsChange();
            // applyBlurEffect();
            foldAllCategories();
            checkCompatibility();
        }

        new SpinQuery(
            () => $("body"),
            it => it.length > 0 && !(unsafeWindow.parent.window === unsafeWindow),
            _ => $(".gui-settings-icon-panel").css("display", "none")
        ).start();
    };
})();