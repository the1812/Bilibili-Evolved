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
    public ProjectBuilder BuildClient()
    {
      var source = File.ReadAllText("src/client/bilibili-evolved.js");
      source = RegexReplacer.Replace(source, @"import (.*) from [""'](.*)[""']", match =>
      {
        var module = File.ReadAllText("src/client/" + match.Groups[2].Value.Replace("./", "") + ".js").Replace("export ", "");
        return module;
      });
      // File.WriteAllText(SourcePath, source);
      Source = source;
      WriteSuccess("Client Build complete.");
      return this;
    }
  }
}