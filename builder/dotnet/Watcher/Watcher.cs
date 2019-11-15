using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Linq;
using System.Threading.Tasks;

namespace BilibiliEvolved.Build.Watcher
{
  public abstract class Watcher : IDisposable
  {
    public Watcher(string path)
    {
      WatcherPath = path;
    }
    public string WatcherPath { get; private set; }
    public string GenericFilter { get; set; } = "";
    public Predicate<string> FileFilter { get; set; } = s => true;
    public ConcurrentBag<string> ChangedFilesHistory { get; } = new ConcurrentBag<string>();
    public event Action<FileSystemEventArgs> FileChanged;
    public event Action<FileSystemEventArgs> FileDeleted;
    protected abstract void OnFileChanged(FileSystemEventArgs e);
    protected virtual void OnFileDeleted(FileSystemEventArgs e)
    {
      var minimizedFilename = ResourceMinifier.GetMinimizedFileName(e.FullPath);
      if (File.Exists(minimizedFilename))
      {
        File.Delete(minimizedFilename);
      }
      builder.GetBundleFiles();
      // builder
      //   .GetBundleFiles()
      //   .BuildBundle();
      // RebuildOutputs();
    }
    // protected void RebuildBundle()
    // {
    //   builder
    //     .GetBundleFiles()
    //     .BuildBundle();
    // }
    protected void RebuildOutputs()
    {
      builder
        .BuildPreviewOffline()
        .BuildOffline()
        .BuildPreviewData()
        .BuildFinalOutput();
    }

    protected BuildCache cache = new BuildCache();
    protected ProjectBuilder builder;
    private FileSystemWatcher watcher;
    private bool started = false;
    // https://github.com/dotnet/corefx/issues/25117
    private ConcurrentBag<FileSystemEventArgs> changedFiles = new ConcurrentBag<FileSystemEventArgs>();
    public const int HandleFileChangesPeriod = 200;
    private void HandleFileChange(FileSystemEventArgs e)
    {
      switch (e.ChangeType)
      {
        case WatcherChangeTypes.Changed:
        case WatcherChangeTypes.Created:
          // Console.WriteLine($"OnChange {e.Name}");
          OnFileChanged(e);
          FileChanged?.Invoke(e);
          break;
        case WatcherChangeTypes.Deleted:
          // Console.WriteLine($"delete {e.Name} {e.ChangeType}");
          OnFileDeleted(e);
          FileDeleted?.Invoke(e);
          break;
        default:
          break;
      }
    }
    // private string GetRelativePath(string fullPath)
    // {
    //   var cwd = Environment.CurrentDirectory;
    //   if (!cwd.EndsWith(Path.DirectorySeparatorChar))
    //   {
    //     cwd += Path.DirectorySeparatorChar;
    //   }
    //   if (fullPath.StartsWith(cwd))
    //   {
    //     return fullPath.Substring(0, cwd.Length);
    //   }
    //   else
    //   {
    //     throw new ArgumentException($"The path is not relative to cwd. {nameof(fullPath)}={fullPath}, {nameof(cwd)}={cwd}", nameof(fullPath));
    //   }
    // }
    public void Start(ProjectBuilder builder)
    {
      if (started)
      {
        return;
      }
      started = true;
      this.builder = builder;
      if (watcher == null)
      {
        watcher = new FileSystemWatcher();
        FileSystemEventHandler handler = (s, e) =>
        {
          if (!FileFilter(e.FullPath))
          {
            return;
          }
          changedFiles.Add(e);
        };
        watcher.Changed += handler;
        // watcher.Created += handler;
        watcher.Deleted += handler;
        watcher.IncludeSubdirectories = true;
      }
      watcher.Path = WatcherPath;
      watcher.Filter = GenericFilter;
      watcher.EnableRaisingEvents = true;
      Task.Run(async () =>
      {
        while (watcher.EnableRaisingEvents)
        {
          // watcher.WaitForChanged(WatcherChangeTypes.All);
          await Task.Delay(HandleFileChangesPeriod);
          if (changedFiles.IsEmpty)
          {
            continue;
          }
          lock (changedFiles)
          {
            builder.GetBundleFiles();
            var distinctChanges = changedFiles
              .GroupBy(e => e.FullPath)
              .Select(g => g.First())
              .ToArray();
            distinctChanges.ForEach(e =>
            {
              HandleFileChange(e);
              builder.UpdateCachedMinFile(e.FullPath);
              ChangedFilesHistory.Add(e.FullPath);
            });
            changedFiles.Clear();
            // builder.BuildBundle();
            // RebuildOutputs();
          }
        }
      });

    }
    public virtual void Stop()
    {
      watcher.EnableRaisingEvents = false;
      started = false;
    }

    public virtual void Dispose()
    {
      cache?.Dispose();
      watcher?.Dispose();
    }
  }
}
