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
    protected abstract void OnFileChanged(FileSystemEventArgs e);
    protected abstract void OnFileDeleted(FileSystemEventArgs e);

    protected ProjectBuilder builder;
    private FileSystemWatcher watcher;
    private bool started = false;
    // https://github.com/dotnet/corefx/issues/25117
    private ConcurrentBag<FileSystemEventArgs> changeFiles = new ConcurrentBag<FileSystemEventArgs>();
    private const int HandleFileChangesPeriod = 200;
    private void HandleFileChange(FileSystemEventArgs e)
    {
      switch (e.ChangeType)
      {
        case WatcherChangeTypes.Changed:
        case WatcherChangeTypes.Created:
          // Console.WriteLine($"change {e.Name} {e.ChangeType}");
          OnFileChanged(e);
          break;
        case WatcherChangeTypes.Deleted:
          Console.WriteLine($"delete {e.Name} {e.ChangeType}");
          OnFileDeleted(e);
          break;
        default:
          break;
      }
    }
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
          changeFiles.Add(e);
        };
        watcher.Changed += handler;
        // watcher.Created += handler;
        watcher.Deleted += handler;
      }
      watcher.Path = WatcherPath;
      watcher.Filter = GenericFilter;
      watcher.EnableRaisingEvents = true;
      Task.Run(async () =>
      {
        while (watcher.EnableRaisingEvents)
        {
          await Task.Delay(HandleFileChangesPeriod);
          lock (changeFiles)
          {
            changeFiles
              .GroupBy(e => e.FullPath)
              .Select(g => g.First())
              .ToArray()
              .ForEach(e => HandleFileChange(e));
            changeFiles.Clear();
          }
        }
      });
    }
    public void Stop()
    {
      watcher.EnableRaisingEvents = false;
      started = false;
    }

    public void Dispose()
    {
      watcher?.Dispose();
    }
  }
}
