export class DoubleClickEvent
{
    constructor(handler, singleClickHandler = null)
    {
        this.handler = handler;
        this.singleClickHandler = singleClickHandler;
        this.elements = [];
        this.clickedOnce = false;
        this.doubleClickHandler = e =>
        {
            if (!this.clickedOnce)
            {
                this.clickedOnce = true;
                setTimeout(() =>
                {
                    if (this.clickedOnce)
                    {
                        this.clickedOnce = false;
                        this.singleClickHandler && this.singleClickHandler(e);
                    }
                }, 200);
            }
            else
            {
                this.clickedOnce = false;
                this.handler && this.handler(e);
            }
        };
    }
    bind(element)
    {
        if (this.elements.indexOf(element) === -1)
        {
            this.elements.push(element);
            element.addEventListener("click", this.doubleClickHandler);
        }
    }
    unbind(element)
    {
        const index = this.elements.indexOf(element);
        if (index === -1)
        {
            return;
        }
        this.elements.splice(index, 1);
        element.removeEventListener("click", this.doubleClickHandler);
    }
}