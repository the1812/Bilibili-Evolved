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
                { SourcePath, OutputPath },
                { @"// settings.guiSettings = true;", @"settings.guiSettings = true;" },
                { @"Bilibili Evolved (Preview)", @"Bilibili Evolved" },
                { @"增强哔哩哔哩Web端体验(预览版分支):", @"增强哔哩哔哩Web端体验:" },
                { @"settings.debug = true;", @"settings.debug = false;" },
            };
            replaceMap.ForEach(item => master = master.Replace(item.Key, item.Value));
            Output = master;
            WriteSuccess("Master build complete.");
            return this;
        }
    }
}
