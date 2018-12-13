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
        const reloadColor = (() =>
        {
            const html = document.querySelector("html");
            return function (newColor)
            {
                const color = new ColorProcessor(newColor);
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
        const textValidate = {
            forceWideMinWidth: text => text, /* How to validate CSS unit ?? */
            customStyleColor: text =>
            {
                const match = text.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
                if (match)
                {
                    if (text.length < 7)
                    {
                        return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`;
                    }
                    else
                    {
                        return text;
                    }
                }
                else
                {
                    return settings.customStyleColor;
                }
            },
            blurBackgroundOpacity: text =>
            {
                const match = text.match(/^([-\+]?\d+)(\.\d+)?$/);
                if (match)
                {
                    const value = parseFloat(text);
                    if (value >= 0 && value <= 1)
                    {
                        return text;
                    }
                }
                return settings.blurBackgroundOpacity;
            },
            defaultPlayerMode: text =>
            {
                if (Resource.manifest.useDefaultPlayerMode.dropdown.items.indexOf(text) !== -1)
                {
                    return text;
                }
                return settings.defaultPlayerMode;
            },
            defaultVideoQuality: text =>
            {
                if (Resource.manifest.useDefaultVideoQuality.dropdown.items.indexOf(text) !== -1)
                {
                    return text;
                }
                return settings.defaultVideoQuality;
            }
        };
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
        function darkScheduleValidate(text, defaultValue)
        {
            const match = text.match(/^([\d]{1,2}):([\d]{1,2})$/);
            if (match && match.length >= 3)
            {
                const time = { hour: parseInt(match[1]), minute: parseInt(match[2]) };
                (function ()
                {
                    while (this.minute < 0)
                    {
                        this.minute += 60;
                        this.hour -= 1;
                    }
                    while (this.minute >= 60)
                    {
                        this.minute -= 60;
                        this.hour += 1;
                    }
                    while (this.hour < 0)
                    {
                        this.hour += 24;
                    }
                    while (this.hour >= 24)
                    {
                        this.hour -= 24;
                    }
                }).call(time);
                return `${time.hour}:${(time.minute < 10 ? "0" + time.minute : time.minute)}`;
            }
            else
            {
                return defaultValue;
            }
        }
        textValidate.darkScheduleStart = text => darkScheduleValidate(text, settings.darkScheduleStart);
        textValidate.darkScheduleEnd = text => darkScheduleValidate(text, settings.darkScheduleEnd);
        function opacityValidate(text, defaultValue)
        {
            const match = text.match(/^([-\+]?\d+)(\.\d+)?$/);
            if (match)
            {
                const value = parseFloat(text);
                if (value >= 0 && value <= 1)
                {
                    return text;
                }
            }
            return defaultValue;
        }
        textValidate.blurBackgroundOpacity = text => opacityValidate(text, settings.blurBackgroundOpacity);
        textValidate.customControlBackgroundOpacity = text => opacityValidate(text, settings.customControlBackgroundOpacity);

        function settingsChange(key, _, newValue)
        {
            $(`input[type='checkbox'][key='${key}']`)
                .prop("checked", newValue)
                .change();
            $(`input[type='text'][key='${key}']`).val(newValue);
            if (key === "customStyleColor")
            {
                reloadColor(newValue);
            }
        }
        function syncGui()
        {
            for (const key in settings)
            {
                settingsChange(key, undefined, settings[key]);
            }
        }
        function setupEvents()
        {
            $(".gui-settings-mask").on("click", () =>
            {
                $(".gui-settings-widgets-box,.gui-settings-box,.gui-settings-mask").removeClass("opened");
            });
            $("input[key='customStyleColor']").on("input", () =>
            {
                const color = textValidate.customStyleColor($("input[key='customStyleColor']").val());
                const shadowColor = resources.color.hexToRgba(color + "70");
                $("div.custom-color-preview")
                    .css("background", color)
                    .css("box-shadow", `0px 2px 8px 1px rgba(${shadowColor.r},${shadowColor.g},${shadowColor.b},${shadowColor.a})`);
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
            onSettingsChange(settingsChange);
        }
        function listenSettingsChange()
        {
            const saveChanges = () =>
            {
                $("input[type='checkbox'][key]")
                    .each((_, element) =>
                    {
                        settings[$(element).attr("key")] = $(element).prop("checked");
                    });
                $("input[type='text'][key]")
                    .each((_, element) =>
                    {
                        const $element = $(element);
                        const key = $element.attr("key");
                        const value = textValidate[key]($element.val());
                        settings[key] = value;
                        $element.val(value);
                    });
                saveSettings(settings);
                // syncGui();
                // console.log("settings saved");
            };
            $("input[type='checkbox'][key]").on("change", () => saveChanges());
            $("input[type='text'][key]").on("change", () => saveChanges());
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
        function addSettingsIcon(body)
        {
            if ($(".gui-settings").length === 0)
            {
                body.append(`<div class='gui-settings-icon-panel icons-enabled'>
                    <div class='gui-settings-widgets' title='附加功能'>
                        <i class="icon-widgets"></i>
                    </div>
                    <div class='gui-settings' title='设置'>
                        <i class="icon-settings"></i>
                    </div>
                </div>`);
                $(".gui-settings").on("click", () =>
                {
                    $(".gui-settings-box,.gui-settings-mask").addClass("opened");
                });
                $(".gui-settings-widgets").on("click", () =>
                {
                    $(".gui-settings-widgets-box,.gui-settings-mask").addClass("opened");
                });
            }
            resources.applyStyle("guiSettingsStyle");
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

        addSettingsIcon($("body"));
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