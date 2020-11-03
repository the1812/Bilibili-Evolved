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
      var tsc = new BabelCompiler();
      var uglifyJs = new JavascriptMinifier();
      var files = ResourceMinifier.GetFiles(file =>
        file.Extension == ".ts" &&
        !file.Name.EndsWith(".d.ts")
      );
      using (var cache = new BuildCache())
      {
        var changedFiles = files.Where(file => !cache.Contains(file)).ToArray();
        if (changedFiles.Any())
        {
          string getOutputCacheFilename(string f)
          {
            return ".ts-output/" + f
              .Replace(".ts", ".js")
              .Replace($"src{Path.DirectorySeparatorChar}", "");
          }
          changedFiles.ForEach(file => {
            cache.AddCache(file);
            WriteInfo($"TypeScript build: {file}");
          });
          WriteInfo(tsc.Run("").Trim());
          Parallel.ForEach(changedFiles
            .Where(f => !f.EndsWith(".vue.ts")),
            f => {
              // var tsc = new BabelSingleCompiler(file);
              // var js = tsc.Run(File.ReadAllText(file));
              // File.WriteAllText(getOutputCacheFilename(file), js);
              var file = getOutputCacheFilename(f);
              var text = RegexReplacer.Replace(File.ReadAllText(file), @"import\(\(\(\)\s*=>\s*(.*)\)\(\)\)", match =>
              {
                return $"import({match.Groups[1].Value})";
              });
              var min = uglifyJs.Minify(text);
              var minFile = ResourceMinifier.GetMinimizedFileName(file);
              File.WriteAllText(minFile, min);
              UpdateCachedMinFile(minFile);
              // WriteHint($"\t=> {minFile}");
            });
        }
        cache.SaveCache();
      }
      WriteSuccess("TypeScript build complete.");
      return this;
    }
  }
}
