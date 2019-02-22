unsafeWindow.Element.ALLOW_KEYBOARD_INPUT = {};
const originalRequestFullscreen = unsafeWindow.Element.prototype.requestFullscreen;
unsafeWindow.Element.prototype.requestFullscreen = function ()
{
    originalRequestFullscreen.call(this);
};