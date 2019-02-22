import { ThemeColors } from "./theme-colors";
import { SettingsSearch } from "./settings-search";
import { Validator } from "./text-validate";
function getCategoryItems(category)
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
    $(".gui-settings-content ul li.category").on("click", e =>
    {
        const searchBox = document.querySelector(".gui-settings-search");
        if (searchBox.value !== "")
        {
            searchBox.value = "";
            raiseEvent(searchBox, "input");
        }
        e.currentTarget.classList.toggle("folded");
        getCategoryItems(e.currentTarget).forEach(it => it.classList.toggle("folded"));
    });
    $(".gui-settings-dropdown>input").on("click", e =>
    {
        $(e.currentTarget).parent().toggleClass("opened");
    });
    onSettingsChange((key, _, value) =>
    {
        if (settings[key] !== value)
        {
            settings[key] = value;
            $(`input[type='checkbox'][key='${key}']`)
                .prop("checked", value).change();
            $(`input[type='text'][key='${key}']`).val(value).change();
        }
    });
}
function listenSettingsChange()
{
    const reloadChanges = (key) =>
    {
        // const reloadableKey = Resource.reloadables[key];
        // if (reloadableKey)
        // {
        //     resources.fetchByKey(reloadableKey);
        // }
    };
    $("input[type='checkbox'][key]").each((_, element) =>
    {
        $(element).on("change", () =>
        {
            const key = element.getAttribute("key");
            const value = element.checked;
            settings[key] = value;
            reloadChanges(key);
            saveSettings(settings);
        });
    });
    $("input[type='text'][key]").each((_, element) =>
    {
        $(element).on("change", () =>
        {
            const key = element.getAttribute("key");
            const value = Validator.getValidator(key).validate(element.value);
            settings[key] = value;
            element.value = value;
            reloadChanges(key);
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
    if (window.devicePixelRatio === 1)
    {
        $("input[key=harunaScale]").prop("disabled", true);
        settings.harunaScale = false;
        saveSettings(settings);
    }
    if (settings.defaultPlayerLayout === "旧版")
    {
        const navbarOption = $("input[key=overrideNavBar]");
        navbarOption.prop("disabled", true).change();
        if (settings.overrideNavBar)
        {
            navbarOption.prop("checked", false).change();
            settings.overrideNavBar = false;
            saveSettings(settings);
        }
    }
}
function setDisplayNames()
{
    for (const [key, name] of Object.entries(Resource.displayNames))
    {
        const input = document.querySelector(`input[key=${key}]`);
        if (!input)
        {
            continue;
        }
        switch (input.type)
        {
            case "checkbox":
                input.nextElementSibling.nextElementSibling.innerHTML = name;
                break;
            case "text":
                const parent = input.parentElement;
                if (parent.classList.contains("gui-settings-textbox-container"))
                {
                    input.previousElementSibling.innerHTML = name;
                }
                else if (parent.classList.contains("gui-settings-dropdown"))
                {
                    parent.previousElementSibling.innerHTML = name;
                }
                break;
            default:
                break;
        }
    }
}

(async () =>
{
    resources.applyStyle("guiSettingsStyle");
    const settingsBox = (resources.data.guiSettingsDom || resources.data.guiSettingsHtml).text;
    $("body").append(settingsBox);
    new SpinQuery(
        () => $("body"),
        it => it.length > 0 && !(unsafeWindow.parent.window === unsafeWindow),
        _ => $(".gui-settings-icon-panel").css("display", "none")
    ).start();

    setupEvents();
    checkOfflineData();
    syncGui();
    listenDependencies();
    listenSettingsChange();
    foldAllCategories();
    checkCompatibility();
    setDisplayNames();

    new ThemeColors().setupDom();
    new SettingsSearch();
})();