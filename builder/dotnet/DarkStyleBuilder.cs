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
      UpdateCachedMinFile(filename);
      WriteSuccess("Dark style build complete.");
      return this;
    }
  }
}
