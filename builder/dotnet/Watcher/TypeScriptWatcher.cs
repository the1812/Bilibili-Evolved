using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Linq;
using System.Threading.Tasks;
using System.Diagnostics;

namespace BilibiliEvolved.Build.Watcher
{
  public class TypeScriptWatcher : Watcher
  {
    private Process tsc;
    private JavascriptMinifier minifier = new JavascriptMinifier();
    private string GetOriginalFilePath(string path) {
      return Path.ChangeExtension(path, ".ts").Replace(WatcherPath, "src");
    }
    public TypeScriptWatcher() : base($".ts-output")
    {
      tsc = new TypeScriptWatchCompiler().Run();
      GenericFilter = "*.js";
      FileFilter = file => {
        var originalFile = GetOriginalFilePath(file);
        return !cache.Contains(originalFile);
      };
    }
    public override void Stop() {
      tsc.Kill();
      base.Stop();
    }
    protected override void OnFileChanged(FileSystemEventArgs e)
    {
      var originalFile = GetOriginalFilePath(e.FullPath);
      builder.WriteInfo($"[TypeScript] {Path.GetFileName(originalFile)} changed.");
      var content = File.ReadAllText(e.FullPath);
      var importOptimized = RegexReplacer.Replace(content, @"import\(\(\(\)\s*=>\s*(.*)\)\(\)\)", match =>
      {
        return $"import({match.Groups[1].Value})";
      });
      cache.AddCache(originalFile);
      cache.SaveCache();
      File.WriteAllText(ResourceMinifier.GetMinimizedFileName(e.FullPath), minifier.Minify(importOptimized));
    }
  }
}
