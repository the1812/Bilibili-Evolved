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
  public class ClientWatcher : Watcher
  {
    public ClientWatcher() : base($"src{Path.DirectorySeparatorChar}client")
    {
      GenericFilter = "*.js";
    }

    protected override void OnFileChanged(FileSystemEventArgs e)
    {
      builder.WriteInfo($"[Client] {e.Name} changed.");
      builder
        .BuildClient()
        .BuildPreview()
        .BuildMaster();
    }
  }
}
