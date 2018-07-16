const waitForQuery = settings =>
{
    const MaxRetry = settings.maxQueryRetry;
    let retry = 0;
    const tryQuery = (query, condition, action, failed) =>
    {
        if (retry >= MaxRetry)
        {
            if (failed)
            {
                failed();
            }
        }
        else
        {
            const result = query();
            if (condition(result))
            {
                action(result);
            }
            else
            {
                retry++;
                setTimeout(() => tryQuery(query, condition, action, failed), settings.queryInterval);
            }
        }
    };
    return tryQuery;
};
