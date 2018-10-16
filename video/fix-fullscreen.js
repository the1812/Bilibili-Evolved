(() =>
{
    return () =>
    {
        unsafeWindow.Element.ALLOW_KEYBOARD_INPUT = {};
        const originalRequsetFullscreen = unsafeWindow.Element.prototype.requestFullscreen;
        unsafeWindow.Element.prototype.requestFullscreen = function ()
        {
            originalRequsetFullscreen.call(this);
        };
    };
})();
