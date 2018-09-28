(() =>
{
    return (settings) =>
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
                let inRange = this.greaterThan(start) && this.lessThan(end);
                if (start.greaterThan(end))
                {
                    inRange = this.greaterThan(start) || this.lessThan(end);
                }
                const result = inRange ||
                    this.equals(start) ||
                    this.equals(end);
                return result;
            }
        }
        const start = new ScheduleTime(settings.darkScheduleStart);
        const end = new ScheduleTime(settings.darkScheduleEnd);
        const now = new ScheduleTime();
        const darkMode = now.isInRange(start, end);
        if (settings.useDarkStyle !== darkMode)
        {
            settings.useDarkStyle = darkMode;
            saveSettings(settings);
        }
        return {
            ajaxReload: false,
            export: ScheduleTime
        };
    };
})();