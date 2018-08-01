(() =>
{
    return () =>
    {
        const hide = it => { it.css("display", "none"); console.log(it); };
        [
            "#slide_ad",
            "#home_popularize",
            ".gg-floor-module"
        ].forEach(value =>
        {
            SpinQuery.any(
                () => $(value),
                hide
            );
        });
        $("body").after(`<style>.home-app-download{display:none!important;}</style>`);
    };
})();
