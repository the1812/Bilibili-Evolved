class Toast
{
    constructor(message = "", title = "", type = "default")
    {
        this.type = type;
        this.message = message;
        this.title = title;
        this.duration = 3000;
        this.element = $(this.cardHtml)[0];
        document.querySelector(".toast-card-container").insertAdjacentElement("beforeend", this.element);
    }
    show()
    {
        this.element.classList.add("visible");
        this.element.querySelector(".toast-card-dismiss").addEventListener("click", () => this.dismiss());
        if (this.duration)
        {
            setTimeout(() => this.dismiss(), this.duration);
        }
    }
    dismiss()
    {
        if (this.element.classList.contains("visible"))
        {
            this.element.addEventListener("transitionend", () => this.element.remove());
            this.element.classList.remove("visible");
        }
    }
    get cardHtml()
    {
        return /*html*/`
            <div class="toast-card icons-enabled toast-${this.type}">
                <div class="toast-card-header">
                    <h1 class="toast-card-title">${this.title}</h1>
                    <div class="toast-card-dismiss">
                        <svg style="width:22px;height:22px" viewBox="0 0 24 24">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                    </div>
                </div>
                <div class="toast-card-message">${this.message}</div>
            </div>
            `;
    }
    static get container()
    {
        return document.querySelector(".toast-card-container");
    }
    static createToastContainer()
    {
        if (!document.querySelector(".toast-card-container"))
        {
            document.body.insertAdjacentHTML("beforeend", /*html*/`<div class="toast-card-container"></div>`);
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

export default {
    export: Toast
};