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
        const svgData = {
            settings: "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",
            close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
            ok: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
        };
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

        function settingsChange(key, _, newValue)
        {
            $(`input[type='checkbox'][key='${key}']`)
                .prop("checked", newValue);
            $(`input[type='text'][key='${key}']`).val(newValue);
        }
        function syncGui()
        {
            for (const key in settings)
            {
                settingsChange(key, undefined, settings[key]);
            }
            $(".gui-settings-content ul li.category").each((_, e) =>
            {
                const items = getCategoriyItems(e);
                if (items
                    .filter(it => !it.classList.contains("disabled"))
                    .every(it => $(it).has("input:checked").length === 0))
                {
                    $(e).click();
                }
            });
        }
        function setupEvents()
        {
            $(".gui-settings-header .gui-settings-close").on("click", () =>
            {
                $(".gui-settings-panel").removeClass("opened");
            });
            $("input[key='customStyleColor']").on("input", () =>
            {
                const color = textValidate.customStyleColor($("input[key='customStyleColor']").val());
                $("div.custom-color-preview").css("background", color);
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
                        const key = $(element).attr("key");
                        const value = $(element).val();
                        settings[key] = textValidate[key](value);
                    });
                saveSettings(settings);
                // syncGui();
                // console.log("settings saved");
            };
            $("input[type='checkbox'][key]").on("change", () => saveChanges());
            $("input[type='text'][key]").on("change", () => saveChanges());
        }
        function fillSvgData()
        {
            $(".gui-settings-close path").attr("d", svgData.close);
            $(".gui-settings-ok path").attr("d", svgData.ok);
            $(".gui-settings svg path").attr("d", svgData.settings);
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
                $(".download-video-panel,.predefined-colors").removeClass("opened");
            };
            $(`input[type='checkbox'][key]`)
                .on("change", e => checkBoxChange($(e.target)))
                .each((_, e) => checkBoxChange($(e)));
        }
        function addSettingsIcon(body)
        {
            if ($(".gui-settings").length === 0)
            {
                body.append(`<div class='gui-settings-icon-panel'><div class='gui-settings'>
                    <svg style='width:24px;height:24px' viewBox='0 0 24 24'>
                        <path/>
                    </svg>
                </div></div>`);
                $(".gui-settings").on("click", () =>
                {
                    $(".gui-settings-panel").addClass("opened");
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

        addSettingsIcon($("body"));
        const settingsBox = resources.data.guiSettingsDom.text;
        if (settingsBox)
        {
            $("body").append(settingsBox);
            setupEvents();
            fillSvgData();
            if (typeof offlineData !== "undefined")
            {
                $("li:has(input[key=useCache])").addClass("disabled");
                $("input[key=useCache]").prop("disabled", true);
            }
            syncGui();
            listenDependencies();
            addPredefinedColors();
            listenSettingsChange();
            if (settings.blurSettingsPanel)
            {
                $(".gui-settings-box").addClass("blur");
            }
            else
            {
                $(".gui-settings-panel").addClass("animation");
            }
        }

        new SpinQuery(
            () => $("body"),
            it => it.length > 0 && !(unsafeWindow.parent.window === unsafeWindow),
            _ => $(".gui-settings-icon-panel").css("display", "none")
        ).start();
    };
})();
