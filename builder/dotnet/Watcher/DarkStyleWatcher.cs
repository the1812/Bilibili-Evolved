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
  public class DarkStyleWatcher : Watcher
  {
    public DarkStyleWatcher() : base("min")
    {
      GenericFilter = "*.min.css";
      FileFilter = file => {
        return file.Contains("dark-slice");
      };
    }

    protected override void OnFileChanged(FileSystemEventArgs e)
    {
      var sliceID = Convert.ToInt32(Path.GetFileNameWithoutExtension(e.Name).Replace("dark-slice-", "").Replace(".min", ""));
      builder.WriteInfo($"[Dark Style] Slice {sliceID} changed.");
      builder.BuildDarkStyles();
    }
  }
}
