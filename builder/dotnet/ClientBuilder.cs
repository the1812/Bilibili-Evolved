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
            var source = File.ReadAllText("client/bilibili-evolved.js");
            var importRegex = new Regex(@"import (.*) from [""'](.*)[""'];", RegexOptions.Compiled | RegexOptions.IgnoreCase);
            while (true)
            {
                var match = importRegex.Match(source);
                if (!match.Success)
                {
                    break;
                }
                var module = File.ReadAllText("client/" + match.Groups[2].Value.Replace("./", "") + ".js").Replace("export ", "");
                source = source.Replace(match.Value, module);
            }
            File.WriteAllText(SourcePath, source);
            Source = File.ReadAllText(SourcePath);
            WriteSuccess("Client Build complete.");
            return this;
        }
    }
}