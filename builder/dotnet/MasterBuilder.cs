using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace BilibiliEvolved.Build
{
  partial class ProjectBuilder
  {
    private readonly Regex ownerRegex = new Regex(@"(github\.com/)(.+)(/Bilibili-Evolved)");
    public ProjectBuilder BuildMaster()
    {
      var master = Source;
      master = ownerRegex.Replace(master, "${1}" + config.Owner + "${3}");
      var replaceMap = new Dictionary<string, string>
        {
          { @"Bilibili-Evolved/preview", @"Bilibili-Evolved/master" },
          { @"Bilibili-Evolved/raw/preview", @"Bilibili-Evolved/raw/master" },
          { @"https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/bilibili-evolved.preview.user.js", @"https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.preview.user.js" },
          { SourcePath, OutputPath },
          { @"Bilibili Evolved (Preview)", @"Bilibili Evolved" },
          { Description.Preview, Description.Master },
        };
      replaceMap.ForEach(item => master = master.Replace(item.Key, item.Value));
      Output = master;
      WriteSuccess("Master build complete.");
      return this;
    }
  }
}
