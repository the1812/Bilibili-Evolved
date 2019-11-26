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
    public ProjectBuilder BuildSass()
    {
      var sass = new SassCompiler();
      var cleancss = new CssMinifier();
      var files = ResourceMinifier.GetFiles(file =>
        file.Extension == ".scss"
      );
      using (var cache = new BuildCache())
      {
        var changedFiles = files.Where(file => !cache.Contains(file)).ToArray();
        if (changedFiles.Any())
        {
          changedFiles.ForEach(file =>
          {
            cache.AddCache(file);
            WriteInfo($"Sass build: {file}");
          });
          Console.Write(sass.Run("").Trim());
          Parallel.ForEach(changedFiles
            .Where(f => !Path.GetFileName(f).StartsWith("_"))
            .Select(f => ".sass-output/" + f
              .Replace(".scss", ".css")
              .Replace($"src{Path.DirectorySeparatorChar}", "")
            ), file => {
              var min = cleancss.Minify(File.ReadAllText(file).Replace("@charset \"UTF-8\";", ""));
              var minFile = ResourceMinifier.GetMinimizedFileName(file);
              File.WriteAllText(minFile, min);
              // WriteHint($"\t=> {minFile}");
          });
          // var results = ResourceMinifier.GetFiles(f => f.FullName.Contains(".sass-output" + Path.DirectorySeparatorChar));
          // Parallel.ForEach(results, file =>
          // {
          //   var min = cleancss.Minify(File.ReadAllText(file).Replace("@charset \"UTF-8\";", ""));
          //   var minFile = ResourceMinifier.GetMinimizedFileName(file);
          //   File.WriteAllText(minFile, min);
          // });
        }
        cache.SaveCache();
      }
      WriteSuccess("Sass build complete.");
      return this;
    }
  }
}
