(() =>
{
    return (settings, resources) =>
    {
        class Toast
        {
            constructor(type = "info", message = "", title = "")
            {
                this.type = type;
                this.message = message;
                this.title = title;
            }
        }


        return {
            ajaxReload: false
        };
    };
})();