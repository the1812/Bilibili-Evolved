import { toolTips } from "./tooltip/settings-tooltip";
export class SettingsSearch
{
    constructor()
    {
        this.input = document.querySelector(".gui-settings-search");
        const items = [...document.querySelectorAll(".gui-settings-content>ul>li")];
        const ifCategory = condition => item => item.classList.contains("category") === condition;
        this.categories = items.filter(ifCategory(true));
        this.items = items.filter(ifCategory(false));
        this.input.addEventListener("input", () => this.keywordChange());
    }
    keywordChange()
    {
        const value = this.input.value.trim();
        if (!value)
        {
            this.categories.concat(this.items).forEach(it => it.classList.add("folded"));
            return;
        }
        this.items.forEach(item =>
        {
            const key = $(item).find("input").attr("key");
            const texts = Resource.displayNames[key] + toolTips[key].replace(/<span>|<\/span>/g, "");
            if (texts.includes(value))
            {
                item.classList.remove("folded");
            }
            else
            {
                item.classList.add("folded");
            }
        });
        this.foldCategories();
    }
    foldCategories()
    {
        for (const category of this.categories)
        {
            function fold()
            {
                let item = category.nextElementSibling;
                while (item !== null && !item.classList.contains("category"))
                {
                    if (!item.classList.contains("folded"))
                    {
                        return "remove";
                    }
                    item = item.nextElementSibling;
                }
                return "add";
            }
            category.classList[fold()]("folded");
        }
    }
}
export default {
    export: { SettingsSearch },
};