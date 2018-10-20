(() =>
{
    return (settings, resources) =>
    {
        class ScheduleTime
        {
            constructor(text)
            {
                if (arguments.length === 0)
                {
                    const now = new Date();
                    this.hour = now.getHours();
                    this.minute = now.getMinutes();
                }
                else if (arguments.length === 1)
                {
                    [this.hour, this.minute] = text
                        .split(":")
                        .slice(0, 2)
                        .map(it => this.validatePart(it));
                    this.normalize();
                }
                else if (arguments.length === 2)
                {
                    [this.hour, this.minute] = arguments;
                }
            }
            validatePart(text)
            {
                const number = parseInt(text);
                if (!isNaN(number) && 0 <= number && number <= 59)
                {
                    return number;
                }
                else
                {
                    return null;
                }
            }
            normalize()
            {
                while (this.minute < 0)
                {
                    this.minute += 60;
                    this.hour -= 1;
                }
                while (this.minute >= 60)
                {
                    this.minute -= 60;
                    this.hour += 1;
                }
                while (this.hour < 0)
                {
                    this.hour += 24;
                }
                while (this.hour >= 24)
                {
                    this.hour -= 24;
                }
            }
            lessThan(other)
            {
                if (this.hour < other.hour ||
                    this.hour === other.hour && this.minute < other.minute)
                {
                    return true;
                }
                return false;
            }
            greaterThan(other)
            {
                if (this.hour > other.hour ||
                    this.hour === other.hour && this.minute > other.minute)
                {
                    return true;
                }
                return false;
            }
            equals(other)
            {
                return this.hour === other.hour && this.minute === other.minute;
            }
            isInRange(start, end)
            {
                if (start.equals(end))
                {
                    return false;
                }
                let inRange = this.greaterThan(start) && this.lessThan(end);
                if (start.greaterThan(end))
                {
                    inRange = this.greaterThan(start) || this.lessThan(end);
                }
                const result = inRange ||
                    this.equals(start);
                return result;
            }
            static millisecondsBefore(time)
            {
                const now = new ScheduleTime();
                const nowSeconds = new Date().getSeconds();
                const currentMilliseconds = 1000 * (now.hour * 3600 + now.minute * 60 + nowSeconds);
                const targetMilliseconds = 1000 * (time.hour * 3600 + time.minute * 60);
                let result = targetMilliseconds - currentMilliseconds;
                if (now.greaterThan(time) || now.equals(time) && nowSeconds !== 0)
                {
                    result += 24 * 3600 * 1000;
                }
                return result;
            }
        }
        function checkTime()
        {
            if (settings.darkSchedule)
            {
                const start = new ScheduleTime(settings.darkScheduleStart);
                const end = new ScheduleTime(settings.darkScheduleEnd);
                const now = new ScheduleTime();
                const darkMode = now.isInRange(start, end);
                if (settings.useDarkStyle !== darkMode)
                {
                    settings.useDarkStyle = darkMode;
                    saveSettings(settings);
                    resources.fetchByKey("useDarkStyle");
                }
                let timeout = 0;
                if (darkMode)
                {
                    timeout = ScheduleTime.millisecondsBefore(end);
                }
                else
                {
                    timeout = ScheduleTime.millisecondsBefore(start);
                }
                if (timeout !== 0)
                {
                    setTimeout(() => checkTime(), timeout);
                }
            }
        }
        checkTime();

        return {
            export: ScheduleTime
        };
    };
})();