(() =>
{
    return (_, resources) =>
    {
        class Toast
        {
            constructor(message = "", title = "", type = "default")
            {
                this.type = type;
                this.message = message;
                this.title = title;
                this.duration = 3000;
                this.element = $(this.cardHtml)[0];
                this.$element = $(this.element);
                $(".toast-card-container").append(this.$element);
            }
            show()
            {
                this.element.classList.add("visible");
                this.$element.find(".toast-card-dismiss").on("click", () => this.dismiss());
                if (this.duration)
                {
                    setTimeout(() => this.dismiss(), this.duration);
                }
            }
            dismiss()
            {
                if (this.element.classList.contains("visible"))
                {
                    this.$element.on("transitionend", () => element.remove());
                    this.element.classList.remove("visible");
                }
            }
            get cardHtml()
            {
                return `
                <div class="toast-card">
                <div class="toast-card-header toast-${this.type}">
                    <h1 class="toast-card-title">${this.title}</h1>
                    <svg class="toast-card-dismiss" viewbox="0 0 24 24">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z">
                    </path>
                    </svg>
                </div>
                <p class="toast-card-message">${this.message}</p>
                </div>
                `;
            }
            static get container()
            {
                return $(".toast-card-container");
            }
            static createToastContainer()
            {
                if ($(".toast-card-container").length === 0)
                {
                    $("body").append(`<div class="toast-card-container"></div>`);
                }
            }
        }

        resources.applyStyle("toastStyle", "toast-style");
        Toast.createToastContainer();

        const toast = new Toast("Toast feature works!", "Info");
        toast.duration = null;
        toast.show();

        return {
            ajaxReload: false
        };
    };
})();