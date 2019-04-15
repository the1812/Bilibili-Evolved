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
        public ProjectBuilder BuildTypeScripts()
        {
            var tsc = new TypeScriptCompiler();
            var files = ResourceMinifier.GetFiles(file =>
                file.Extension == ".ts" && !file.Name.EndsWith("d.ts")
            );
            using (var cache = new BuildCache())
            {
                var changedFiles = files.Where(file => !cache.Contains(file)).ToArray();
                if (changedFiles.Any())
                {
                    changedFiles.ForEach(file =>
                    {
                        cache.AddCache(file);
                        WriteInfo($"TypeScript build: {file}");
                    });
                    Console.Write(tsc.Run().Trim());
                    changedFiles.ForEach(file =>
                    {
                        WriteHint($"\t=> {file.Replace(".ts", ".js")}");
                    });
                }
                cache.SaveCache();
            }
            WriteSuccess("TypeScript build complete.");
            return this;
        }
    }
}
