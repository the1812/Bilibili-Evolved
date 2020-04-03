using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Linq;

namespace BilibiliEvolved.Build
{
  partial class ProjectBuilder
  {
    public ProjectBuilder BuildDarkStyles()
    {
      var files = new DirectoryInfo("min")
        .EnumerateFiles()
        .Where(f => f.FullName.Contains("dark-slice"));
      var fullStyle = files
        .Select(f => File.ReadAllText(f.FullName))
        .Aggregate((acc, s) => acc + s);
      var filename = "min/dark.min.css";
      File.WriteAllText(filename, fullStyle);
      var otherStyle = File.ReadAllText("min/dark-important.min.css") + File.ReadAllText("min/dark-navbar.min.css") + File.ReadAllText("min/scrollbar.min.css");
      if (string.IsNullOrWhiteSpace(offlineVersion)) {
        generateVersion();
      }
      File.WriteAllText("min/dark.user.css", $@"
/* ==UserStyle==
@name         Bilibili Evolved - 夜间模式
@namespace    Bilibili-Evolved
@homepageURL  https://github.com/the1812/Bilibili-Evolved
@updateURL    https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/min/dark.user.css
@version      {offlineVersion}
@license      MIT
@author       Grant Howard (https://github.com/the1812), Coulomb-G (https://github.com/Coulomb-G)
==/UserStyle== */
@-moz-document domain(""bilibili.com"") {{
  {fullStyle}
  {otherStyle}
}}
".Trim());
      UpdateCachedMinFile(filename);
      WriteSuccess("Dark style build complete.");
      return this;
    }
  }
}
