SpinQuery.any(
    () => document.querySelectorAll(".gg-pic"),
    it =>
    {
        it.forEach(element =>
        {
            const a = element.parentElement;
            a.style.display = "none";
            const index = [...a.parentElement.childNodes].indexOf(a) + 1;
            const picture = a.parentElement.parentElement.querySelector(`.pic li:nth-child(${index})`);
            if (picture)
            {
                picture.style.visibility = "hidden";
            }
        });
    }
);