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
      var uglifyJs = new JavascriptMinifier();
      var files = ResourceMinifier.GetFiles(file =>
        (file.FullName.Contains(@"style\")
        || file.FullName.Contains(@"touch\")
        || file.FullName.Contains(@"utils\")
        || file.FullName.Contains(@"video\")) &&
        file.Extension == ".ts" &&
        !file.Name.EndsWith(".d.ts")
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
            file = file.Replace(".ts", ".js");
            var min = uglifyJs.Minify(File.ReadAllText(file));
            var minFile = ResourceMinifier.GetMinimizedFileName(file);
            File.WriteAllText(minFile, min);
            File.Delete(file);
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
