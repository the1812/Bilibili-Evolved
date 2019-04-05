// if (typeof GM_addValueChangeListener === "undefined")
// {
//     GM_addValueChangeListener = function () { };
// }
export function logError(message)
{
    if (settings.toastInternalError)
    {
        Toast.error(typeof message === "object" && "stack" in message
            ? message.stack
            : message, "错误");
    }
    console.error(message);
}
export function raiseEvent(element, eventName)
{
    const event = document.createEvent("HTMLEvents");
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
}
export async function loadLazyPanel(selector)
{
    await SpinQuery.unsafeJquery();
    const panel = await SpinQuery.any(() => unsafeWindow.$(selector));
    if (!panel)
    {
        throw new Error(`Panel not found: ${selector}`);
    }
    panel.mouseover().mouseout();
}
export function contentLoaded(callback)
{
    if (/complete|interactive|loaded/.test(document.readyState))
    {
        callback();
    }
    else
    {
        document.addEventListener("DOMContentLoaded", () => callback());
    }
}
export function fixed(number, precision = 1)
{
    const str = number.toString();
    const index = str.indexOf(".");
    if (index !== -1)
    {
        if (str.length - index > precision + 1)
        {
            return str.substring(0, index + precision + 1);
        }
        else
        {
            return str;
        }
    }
    else
    {
        return str + ".0";
    }
}
export function isEmbeddedPlayer()
{
    return location.host === "player.bilibili.com";
}
export function isIframe()
{
    return document.body && unsafeWindow.parent.window !== unsafeWindow;
}