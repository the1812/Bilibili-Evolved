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
                    this.$element.on("transitionend", () => this.$element.remove());
                    this.element.classList.remove("visible");
                }
            }
            get cardHtml()
            {
                return `
                <div class="toast-card icons-enabled toast-${this.type}">
                <div class="toast-card-header">
                    <h1 class="toast-card-title">${this.title}</h1>
                    <div class="toast-card-dismiss">
                        <i class="icon-cancel"></i>
                    </div>
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
            static internalShow(message, title, duration, type)
            {
                const toast = new Toast(message, title, type);
                toast.duration = duration;
                toast.show();
                return toast;
            }
            static show(message, title, duration)
            {
                return this.internalShow(message, title, duration, "default");
            }
            static info(message, title, duration)
            {
                return this.internalShow(message, title, duration, "info");
            }
            static success(message, title, duration)
            {
                return this.internalShow(message, title, duration, "success");
            }
            static error(message, title, duration)
            {
                return this.internalShow(message, title, duration, "error");
            }
        }

        resources.applyStyle("toastStyle");
        Toast.createToastContainer();

        return {
            export: Toast
        };
    };
})();