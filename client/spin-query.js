export class SpinQuery
{
    constructor(query, condition, action, failed)
    {
        this.maxRetry = 15;
        this.retry = 0;
        this.queryInterval = 1000;
        this.query = query;
        this.condition = condition;
        this.action = action;
        this.failed = failed;
    }
    start()
    {
        this.tryQuery(this.query, this.condition, this.action, this.failed);
    }
    tryQuery(query, condition, action, failed)
    {
        if (this.retry < this.maxRetry)
        {
            const result = query();
            if (condition(result))
            {
                action(result);
            }
            else
            {
                if (document.hasFocus())
                {
                    this.retry++;
                }
                setTimeout(() => this.tryQuery(query, condition, action, failed), this.queryInterval);
            }
        }
        else
        {
            typeof failed === "function" && failed();
        }
    }
    static condition(query, condition, action, failed)
    {
        if (action !== undefined)
        {
            new SpinQuery(query, condition, action, failed).start();
        }
        else
        {
            return new Promise((resolve) =>
            {
                new SpinQuery(query, condition, it => resolve(it), () => resolve(null)).start();
            });
        }
    }
    static select(query, action, failed)
    {
        if (typeof query === "string")
        {
            const selector = query;
            query = () => document.querySelector(selector);
        }
        return SpinQuery.condition(query, it => it !== null && it !== undefined, action, failed);
    }
    static any(query, action, failed)
    {
        if (typeof query === "string")
        {
            const selector = query;
            query = () => $(selector);
        }
        return SpinQuery.condition(query, it => it.length > 0, action, failed);
    }
    static count(query, count, action, failed)
    {
        return SpinQuery.condition(query, it => it.length === count, action, failed);
    }
    static unsafeJquery(action, failed)
    {
        return SpinQuery.condition(() => unsafeWindow.$, jquery => jquery !== undefined, action, failed);
    }
}