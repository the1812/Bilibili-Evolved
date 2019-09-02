using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace BilibiliEvolved.Build
{
  partial class ProjectBuilder
  {
    private string offlineText;
    private string offlineVersion;

    private string readAsBase64Image(string path)
    {
      var bytes = File.ReadAllBytes(path);
      return $"data:image/png;base64,{Convert.ToBase64String(bytes)}";
    }
    private void replaceInfo(Dictionary<string, string> map)
    {
      map.ForEach(item => offlineText = offlineText.Replace(item.Key, item.Value));
      offlineText = ownerRegex.Replace(offlineText, "${1}" + config.Owner + "${3}");

      offlineText = offlineText.Replace(
        $"@icon         https://raw.githubusercontent.com/{config.Owner}/Bilibili-Evolved/master/{config.SmallLogoPath}",
        $"@icon         {readAsBase64Image(config.SmallLogoPath)}");
      offlineText = offlineText.Replace(
        $"@icon64       https://raw.githubusercontent.com/{config.Owner}/Bilibili-Evolved/master/{config.LogoPath}",
        $"@icon64       {readAsBase64Image(config.LogoPath)}");
    }
    private void generateVersion()
    {
      var startDate = new DateTime(2018, 7, 16, 15, 46, 53);
      var versionRegex = new Regex(@"(@version[ ]*)[\d\.]*");
      var version = DateTime.Now.ToOADate() - startDate.ToOADate();
      offlineVersion = version.ToString("0.00");
      offlineText = versionRegex.Replace(offlineText, "${1}" + offlineVersion);
    }
    private void compileOfflineData()
    {
      var onlineRoot = $"https://raw.githubusercontent.com/{config.Owner}/Bilibili-Evolved/master/";
      // var urlList = (from match in new Regex(@"path:\s*""(.*)""").Matches(offlineText)
      //                as IEnumerable<Match>
      //                select "min/" + match.Groups[1].Value.Trim()
      //               ).ToList();
      var urlList = from file in Directory.GetFiles("min")
                    where !file.Contains("dark-slice")
                    select file.Replace(@"\", "/");

      var downloadCodeStart = @"// \+#Offline build placeholder";
      var downloadCodeEnd = @"// \-#Offline build placeholder";
      var downloadCodes = new Regex($"({downloadCodeStart}([^\0]*){downloadCodeEnd})").Match(offlineText).Groups[0].Value;

      var offlineData = "const offlineData = {};" + Environment.NewLine;
      foreach (var url in urlList)
      {
        var text = File.ReadAllText(url);
        if (url.EndsWith(".js"))
        {
          offlineData = offlineData + $"offlineData[\"{onlineRoot + url}\"] = {text}" + Environment.NewLine;
        }
        else
        {
          offlineData = offlineData + $"offlineData[\"{onlineRoot + url}\"] = `{text.Replace("\\", "\\\\")}`;" + Environment.NewLine;
        }
      }
      offlineText = offlineText
        .Replace(@"// [Offline build placeholder]", offlineData)
        .Replace(downloadCodes, "this.text=this.type.preprocessor(offlineData[this.url]);resolve(this.text);");
    }
    private void buildFile(string path)
    {
      if (File.Exists(path))
      {
        var offlineFileText = File.ReadAllText(path);

        var noVersion = new Regex(@"// @version[ ]*(.*)" + Environment.NewLine);
        var originalOffline = noVersion.Replace(offlineFileText, "");
        var currentOffline = noVersion.Replace(offlineText, "");

        if (currentOffline == originalOffline)
        {
          offlineVersion = noVersion.Match(offlineFileText).Groups[1].Value.Trim();
          return;
        }
      }

      File.WriteAllText(path, offlineText);
    }
    private ProjectBuilder build(Dictionary<string, string> replaceMap, string outputPath, string successMessage)
    {
      offlineText = Output;
      replaceInfo(replaceMap);
      generateVersion();
      compileOfflineData();
      buildFile(outputPath);

      WriteSuccess(successMessage);
      return this;
    }

    public ProjectBuilder BuildOffline()
    {
      var replaceMap = new Dictionary<string, string>
        {
          { "Bilibili Evolved", "Bilibili Evolved (Offline)" },
          { Description.Master, Description.Offline },
          { $"master/{config.Master}", $"master/{config.Offline}" },
          { $"// ==/UserScript==", $"// ==/UserScript=={Environment.NewLine}/* eslint-disable */ /* spell-checker: disable */"},
        };
      return build(replaceMap, config.Offline, "Offline build complete.");
    }
    public ProjectBuilder BuildPreviewOffline()
    {
      var replaceMap = new Dictionary<string, string>
        {
          { "Bilibili Evolved", "Bilibili Evolved (Preview Offline)" },
          { Description.Master, Description.PreviewOffline },
          { $"master/{config.Master}", $"preview/{config.PreviewOffline}" },
          { $"// ==/UserScript==", $"// ==/UserScript=={Environment.NewLine}/* eslint-disable */ /* spell-checker: disable */"},
        };
      return build(replaceMap, config.PreviewOffline, "Preview Offline build complete.");
    }
  }
}
