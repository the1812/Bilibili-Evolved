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
const hasNewVersion = latestVersion.greaterThan(currentVersion);
if (hasNewVersion)
{
    const message = `新版本${latestVersion.versionString}已发布.  <a id="new-version-link" class="link" href="${settings.latestVersionLink}">安装</a><a class="link" target="_blank"   href="https://github.com/the1812/Bilibili-Evolved/releases">查看</a>`;
    const toast = Toast.info(message, "检查更新");
    $("#new-version-link").on("click", () => toast && toast.dismiss());
}
export default {
    widget:
    {
        content: /*html*/`
            <button
                class="gui-settings-flat-button"
                id="new-version-update">
                <a href="${settings.latestVersionLink}" style="display:none"></a>
                <i class="icon-update"></i>
                <span>安装更新</span>
            </button>
            <button
                class="gui-settings-flat-button"
                id="new-version-info">
                <a target="blank" style="display:none" href="https://github.com/the1812/Bilibili-Evolved/releases"></a>
                <i class="icon-info"></i>
                <span>查看更新</span>
            </button>
        `,
        condition: () => hasNewVersion,
        success: () =>
        {
            $("#new-version-update").on("click",
                () => document.querySelector("#new-version-update a").click());
            $("#new-version-info").on("click",
                () => document.querySelector("#new-version-info a").click());
        },
    },
};