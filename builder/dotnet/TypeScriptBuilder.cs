using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace BilibiliEvolved.Build
{
  partial class ProjectBuilder
  {
    public ProjectBuilder BuildTypeScripts()
    {
      var tsc = new TypeScriptCompiler();
      var uglifyJs = new JavascriptMinifier();
      var files = ResourceMinifier.GetFiles(file =>
        file.FullName.Contains($"src{Path.DirectorySeparatorChar}") &&
        file.Extension == ".ts" &&
        !file.Name.EndsWith(".d.ts")
      );
      using (var cache = new BuildCache())
      {
        var changedFiles = files.Where(file => !cache.Contains(file)).ToArray();
        if (changedFiles.Any())
        {
          changedFiles.Where(f => !f.EndsWith(".vue.ts")).ForEach(file =>
          {
            cache.AddCache(file);
            WriteInfo($"TypeScript build: {file}");
          });
          tsc.Run();
          Parallel.ForEach(changedFiles.Where(f => !f.EndsWith(".vue.ts")).Select(f => ".ts-output/" + f.Replace(".ts", ".js").Replace($"src{Path.DirectorySeparatorChar}", "")), file => {
            var text = RegexReplacer.Replace(File.ReadAllText(file), @"import\(\(\(\)\s*=>\s*(.*)\)\(\)\)", match => {
              return $"import({match.Groups[1].Value})";
            });
            var min = uglifyJs.Minify(text);
            var minFile = ResourceMinifier.GetMinimizedFileName(file);
            File.WriteAllText(minFile, min);
            WriteHint($"\t=> {minFile}");
          });
        }
        cache.SaveCache();
      }
      WriteSuccess("TypeScript build complete.");
      return this;
    }
  }
}
