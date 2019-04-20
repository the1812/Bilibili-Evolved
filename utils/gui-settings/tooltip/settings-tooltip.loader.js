function extractKey(listItem) {
    const input = listItem.querySelector("input");
    if (input) {
        return input.getAttribute("key");
    }
    return null;
}
(async () => {
    resources.applyStyle("settingsTooltipStyle");
    const { toolTips } = await import(`settings-tooltip.${getI18nKey()}`);
    const tooltip = await SpinQuery.select(".gui-settings-tooltip");
    if (!tooltip) {
        return;
    }
    document.querySelectorAll(".gui-settings-content>ul>li").forEach(element => {
        element.addEventListener("mouseover", () => {
            const key = extractKey(element);
            if (key === null || toolTips === null) {
                return;
            }
            const tipText = toolTips.get(key);
            if (tipText !== undefined) {
                tooltip.innerHTML = tipText;
                tooltip.classList.add("show");
            }
        });
        element.addEventListener("mouseout", () => {
            tooltip.classList.remove("show");
        });
    });
})();
