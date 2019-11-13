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
  public abstract class PreprocessorWatcher : Watcher
  {
    private Process externalWatcherProcess;
    private string originalExtension;
    protected abstract ResourceMinifier Minifier { get; }
    protected abstract NodeInteract WatcherComplier { get; }
    protected abstract string Name { get; }
    protected abstract string PostBuild(string content);
    private string GetOriginalFilePath(string path)
    {
      return Path.ChangeExtension(path, originalExtension).Replace(WatcherPath, "src");
    }
    public PreprocessorWatcher(string originalExtension, string compliedExtension, string watcherPath) : base(watcherPath)
    {
      this.originalExtension = originalExtension;
      externalWatcherProcess = WatcherComplier.Run();
      GenericFilter = $"*{compliedExtension}";
      FileFilter = file =>
      {
        var originalFile = GetOriginalFilePath(file);
        return !cache.Contains(originalFile);
      };
    }
    public override void Stop()
    {
      externalWatcherProcess.Kill();
      base.Stop();
    }
    protected override sealed void OnFileChanged(FileSystemEventArgs e)
    {
      var originalFile = GetOriginalFilePath(e.FullPath);
      builder.WriteInfo($"[{Name}] {Path.GetFileName(originalFile)} changed.");
      var content = File.ReadAllText(e.FullPath);
      cache.AddCache(originalFile);
      cache.SaveCache();
      if (!Path.GetFileNameWithoutExtension(e.FullPath).EndsWith(".vue"))
      {
        File.WriteAllText(ResourceMinifier.GetMinimizedFileName(e.FullPath), Minifier.Minify(PostBuild(content)));
      }
    }
    protected override void OnFileDeleted(FileSystemEventArgs e)
    {
      if (!Path.GetFileNameWithoutExtension(e.FullPath).EndsWith(".vue"))
      {
        base.OnFileDeleted(e);
      }
    }
  }
}
