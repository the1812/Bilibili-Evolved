using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace BilibiliEvolved.Build
{
    partial class ProjectBuilder
    {
        public ProjectBuilder BuildPreview()
        {
            var version = new Regex(@"//[ ]*@version[ ]*(.+)")
                .Match(Source).Groups[1].Value.Trim();
            Source = ownerRegex.Replace(Source, "${1}" + config.Owner + "${3}");
            File.WriteAllText(SourcePath, Source);
            File.WriteAllText("version.txt", version);
            return this;
        }
    }
}
