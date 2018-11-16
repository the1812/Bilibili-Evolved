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
                this.parts = versionString.split('.').map(it => parseInt(it));
                this.versionString = versionString;
            }
            compareTo(other)
            {
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
            if (currentVersion.lessThan(new Version("1.4.2")))
            {
                SpinQuery.any(() => $(".gui-settings"), it =>
                {
                    it.addClass("gui-settings-notification");
                    const footer = $(".gui-settings-footer");
                    footer.after(`
                        <div class="gui-settings-footer">
                            <span class="gui-settings-label">新版本${latestVersion.versionString}已发布.</span>
                            <a>
                                <button
                                    class="gui-settings-button"
                                    id="new-version-update">
                                    更新
                                </button>
                            </a>
                        </div>`);
                    $("#new-version-update").parent().attr("href", settings.latestVersionLink);
                });
                const message = `新版本${latestVersion.versionString}已发布.  <a class="link" href="${settings.latestVersionLink}">更新</a>`;
                Toast.show(message, "检查更新", 10000);
            }
            else
            {
                return {
                    settingsWidget: {
                        after: () => $(".gui-settings-content"),
                        content: `<div class="gui-settings-footer${(settings.blurSettingsPanel ? " blur" : "")}">
                                    <span class="gui-settings-label">新版本${latestVersion.versionString}已发布.</span>
                                    <a href="${settings.latestVersionLink}">
                                        <button
                                            class="gui-settings-button"
                                            id="new-version-update">
                                            更新
                                        </button>
                                    </a>
                                    <a target="blank"  href="https://github.com/the1812/Bilibili-Evolved/releases">
                                        <button
                                            class="gui-settings-button">
                                            详细信息
                                        </button>
                                    </a>
                                </div>`,
                        success: () =>
                        {
                            SpinQuery.any(() => $(".gui-settings"), it =>
                            {
                                it.addClass("gui-settings-notification");
                            });
                            const message = `新版本${latestVersion.versionString}已发布.  <a class="link" href="${settings.latestVersionLink}">更新</a><a class="link" target="_blank"   href="https://github.com/the1812/Bilibili-Evolved/releases">详细信息</a>`;
                            Toast.show(message, "检查更新");
                        }
                    }
                };
            }
        }
    };
})();
