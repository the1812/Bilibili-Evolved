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
            var files = new DirectoryInfo("min").EnumerateFiles().Where(f => f.FullName.Contains("dark-slice"));
            var fullStyle = files.Select(f => File.ReadAllText(f.FullName))
                .Aggregate((acc, s) => acc + s);
            File.WriteAllText("min/dark.min.scss", fullStyle);
            WriteSuccess("Dark style build complete.");
            return this;
        }
    }
}
