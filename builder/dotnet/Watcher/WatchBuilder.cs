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
  public class WatchBuilder {
    private List<Watcher> watchers = new List<Watcher>{
      new ClientWatcher(),
      new JavaScriptWatcher(),
      new CssWatcher(),
      new HtmlWatcher(),
    };
    private ProjectBuilder builder = ProjectBuilder.CreateBuilder();
    public void StartWatching() {
      builder
        .BuildClient()
        .BuildPreview()
        .BuildMaster();
      watchers.ForEach(w => w.Start(builder));
      builder.WriteInfo("Watcher started, input 'q' or press 'Ctrl + C' to exit.");
      var input = "";
      Console.CancelKeyPress += (s, e) => {
        StopWatching();
      };
      while (input.ToLowerInvariant() != "q") {
        input = Console.ReadLine();
      }
      StopWatching();
    }
    private void StopWatching() {
      watchers.ForEach(w => w.Stop());
      builder.WriteInfo("Watcher stopped.");
    }
  }
}
