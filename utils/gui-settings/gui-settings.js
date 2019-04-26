import { ThemeColors } from "./theme-colors";
import { SettingsSearch } from "./settings-search";
import { Validator } from "./text-validate";

let inputs = [];
let checkBoxes = [];
let textBoxes = [];
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
// function settingsChange(key, value)
// {
//     const checkbox = document.querySelector(`input[type='checkbox'][key='${key}']`);
//     if (checkbox)
//     {
//         checkbox.checked = value;
//         return;
//     }
//     const textbox = document.querySelector(`input[type='text'][key='${key}']`);
//     if (textbox)
//     {
//         textbox.value = value;
//         return;
//     }
// }
function syncGui()
{
    textBoxes.forEach(it => it.value = settings[it.getAttribute("key")]);
    checkBoxes.forEach(it => it.checked = settings[it.getAttribute("key")]);
    // for (const [key, value] of Object.entries(settings))
    // {
    //     settingsChange(key, value);
    // }
}
function setupEvents()
{
    document.querySelector(".gui-settings-mask").addEventListener("click", () =>
    {
        document.querySelectorAll(".gui-settings-widgets-box,.gui-settings-box,.gui-settings-mask")
            .forEach(it => it.classList.remove("opened"));
    });
    textBoxes.forEach(element =>
    {
        element.setAttribute("placeholder", settings[element.getAttribute("key")]);
    });
    document.querySelectorAll(".gui-settings-content ul li.category").forEach(it =>
    {
        it.addEventListener("click", e =>
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
    });
    document.querySelectorAll(".gui-settings-dropdown>input").forEach(it =>
    {
        it.addEventListener("click", e =>
        {
            e.currentTarget.parentElement.classList.toggle("opened");
        });
    });
    // onSettingsChange((key, _, value) =>
    // {
    //     if (settings[key] !== value)
    //     {
    //         settings[key] = value;
    //         const checkbox = document.querySelector(`input[type='checkbox'][key='${key}']`);
    //         if (checkbox)
    //         {
    //             checkbox.checked = value;
    //             raiseEvent(checkbox, "change");
    //             return;
    //         }
    //         const textbox = document.querySelector(`input[type='text'][key='${key}']`);
    //         if (textbox)
    //         {
    //             textbox.value = value;
    //             raiseEvent(textbox, "change");
    //             return;
    //         }
    //     }
    // });
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
    checkBoxes.forEach(element =>
    {
        element.addEventListener("change", () =>
        {
            const key = element.getAttribute("key");
            const value = element.checked;
            settings[key] = value;
            reloadChanges(key);
            saveSettings(settings);
        });
    });
    textBoxes.forEach(element =>
    {
        element.addEventListener("change", () =>
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
    const deps = inputs.map(it => [it.getAttribute("dependencies").split(" ").map(dep => inputs.find(input => input.getAttribute("key") === dep)), it]);
    const li = element => element.nodeName.toUpperCase() === "LI" ? element : li(element.parentElement);
    deps.forEach(([parents, child]) =>
    {
        if (parents[0] === undefined)
        {
            return;
        }
        const change = () =>
        {
            if (parents.every(p => p.checked))
            {
                li(child).classList.remove("disabled");
            }
            else
            {
                li(child).classList.add("disabled");
            }
        };
        parents.forEach(it => it.addEventListener("change", change));
        change();
    });

    // const dependencies = {};
    // document.querySelectorAll(`input[dependencies]`).forEach(element =>
    // {
    //     const dep = element.getAttribute("dependencies");
    //     if (dep)
    //     {
    //         dependencies[element.getAttribute("key")] = dep;
    //     }
    // });
    // const checkBoxChange = element =>
    // {
    //     const checked = element.checked;
    //     for (const key in dependencies)
    //     {
    //         const dependency = dependencies[key].split(" ");
    //         if (dependency.indexOf(element.getAttribute("key")) !== -1)
    //         {
    //             let disable = true;
    //             if (checked && dependency.every(k => document.querySelector(`input[key='${k}']`).checked))
    //             {
    //                 disable = false;
    //             }
    //             let li = document.querySelector(`input[key='${key}']`);
    //             while (li.nodeName.toLowerCase() !== "li")
    //             {
    //                 li = li.parentElement;
    //             }
    //             const action = disable ? "add" : "remove";
    //             li.classList[action]("disabled");
    //             const text = document.querySelector(`input[key='${key}'][type='text']`);
    //             text && text.parentElement.classList[action]("disabled");
    //         }
    //     }
    // };
    // document.querySelectorAll(`input[type='checkbox'][key]`).forEach(element =>
    // {
    //     element.addEventListener("change", e => checkBoxChange(e.target));
    //     checkBoxChange(element);
    // });
}
function checkOfflineData()
{
    if (typeof offlineData !== "undefined")
    {
        document.querySelector(".gui-settings-checkbox-container>input[key=useCache]").parentElement.parentElement.classList.add("disabled");
        document.querySelector("input[key=useCache]").disabled = true;
    }
}
function foldAllCategories()
{
    document.querySelectorAll(".gui-settings-content ul li.category").forEach(e =>
    {
        e.click();
    });
}
function checkCompatibility()
{
    if (!CSS.supports("backdrop-filter", "blur(24px)")
        && !CSS.supports("-webkit-backdrop-filter", "blur(24px)"))
    {
        inputs.find(it => it.getAttribute("key") === "blurVideoControl").disabled = true;
        settings.blurVideoControl = false;
        saveSettings(settings);
    }
    if (window.devicePixelRatio === 1)
    {
        inputs.find(it => it.getAttribute("key") === "harunaScale").disabled = true;
        inputs.find(it => it.getAttribute("key") === "imageResolution").disabled = true;
        settings.harunaScale = false;
        settings.imageResolution = false;
        saveSettings(settings);
    }
    if (settings.defaultPlayerLayout === "旧版")
    {
        const navbarOption = inputs.find(it => it.getAttribute("key") === "overrideNavBar");
        navbarOption.disabled = true;
        raiseEvent(navbarOption, "change");
        if (settings.overrideNavBar)
        {
            navbarOption.checked = false;
            raiseEvent(navbarOption, "change");
            settings.overrideNavBar = false;
            saveSettings(settings);
        }
    }
}
function setDisplayNames()
{
    for (const [key, name] of Object.entries(Resource.displayNames))
    {
        const input = inputs.find(it => it.getAttribute("key") === key);
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
    document.body.insertAdjacentHTML("afterbegin", `<link rel="stylesheet" href="//cdn.materialdesignicons.com/3.5.95/css/materialdesignicons.min.css">`);

    const isIframe = document.body && unsafeWindow.parent.window !== unsafeWindow;
    if (isIframe)
    {
        document.querySelector(".gui-settings-icon-panel").style.display = "none";
        // return;
    }

    const settingsBox = (resources.data.guiSettingsDom || resources.data.guiSettingsHtml).text;
    document.body.insertAdjacentHTML("beforeend", settingsBox);

    const widgetsContainer = document.querySelector(".widgets-container");
    const emptyTip = widgetsContainer.querySelector(".empty-tip");
    Observer.childList(widgetsContainer, () =>
    {
        if (widgetsContainer.childElementCount <= 1)
        {
            emptyTip.classList.add("show");
        }
        else
        {
            emptyTip.classList.remove("show");
        }
    });

    inputs = [...document.querySelectorAll("input[key]")];
    checkBoxes = inputs.filter(it => it.type === "checkbox");
    textBoxes = inputs.filter(it => it.type === "text");
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

    const boxes = document.querySelectorAll(".gui-settings-widgets-box,.gui-settings-box");
    document.querySelector(".gui-settings-icon-panel").addEventListener("pointerover", () =>
    {
        boxes.forEach(it => it.classList.add("loaded"));
    });
})();