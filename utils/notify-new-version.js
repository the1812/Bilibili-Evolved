(() =>
{
    return (settings, resources) =>
    {
        const CompareResult = {
            less: -1,
            equal: 0,
            greater: 1,
            incomparable: NaN
        };
        // Based on http://jsfiddle.net/ripper234/Xv9WL/28/
        class Version
        {
            constructor(versionString)
            {
                this.parts = versionString.split('.');
                this.versionString = versionString;
            }
            isPositiveInteger(x)
            {
                // http://stackoverflow.com/a/1019526/11236
                return /^\d+$/.test(x);
            }
            validateParts()
            {
                for (var i = 0; i < this.parts.length; ++i)
                {
                    if (!this.isPositiveInteger(this.parts[i]))
                    {
                        return false;
                    }
                }
                return true;
            }
            compareTo(other)
            {
                if (!this.validateParts() || !other.validateParts())
                {
                    return CompareResult.incomparable;
                }
                for (let i = 0; i < this.parts.length; ++i)
                {
                    if (other.parts.length === i)
                    {
                        return CompareResult.greater;
                    }
                    if (this.parts[i] === other.parts[i])
                    {
                        continue;
                    }
                    if (this.parts[i] > other.parts[i])
                    {
                        return CompareResult.greater;
                    }
                    return CompareResult.less;
                }
                if (this.parts.length !== other.parts.length)
                {
                    return CompareResult.less;
                }
                return CompareResult.equal;
            }
            greaterThan(other)
            {
                return this.compareTo(other) === CompareResult.greater;
            }
            lessThan(other)
            {
                return this.compareTo(other) === CompareResult.less;
            }
            equals(other)
            {
                return this.compareTo(other) === CompareResult.equal;
            }
        }

        const latestVersion = new Version(resources.data.latestVersion.text);
        const currentVersion = new Version(settings.currentVersion);
        if (latestVersion.greaterThan(currentVersion))
        {
            SpinQuery.any(() => $(".gui-settings"), it =>
            {
                it.addClass("gui-settings-notification");
                const footer = $(".gui-settings-footer");
                const message = `新版本${latestVersion.versionString}已发布.`;
                footer.after(`
                <div class="gui-settings-footer">
                    <span class="gui-settings-label">${message}</span>
                    <a>
                        <button
                            class="gui-settings-button"
                            id="new-version-update">
                            更新
                        </button>
                    </a>
                </div>`);
                $("#new-version-update").parent().attr("href", settings.latestVersionLink);
                Toast.show(message, "检查更新", 5000);
            });
        }

        return {
            ajaxReload: false
        };
    };
})();
