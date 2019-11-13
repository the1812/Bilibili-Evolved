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
  public class JavaScriptWatcher : Watcher
  {
    private JavascriptMinifier minifier = new JavascriptMinifier();
    public JavaScriptWatcher() : base($"src{Path.DirectorySeparatorChar}")
    {
      GenericFilter = "*.js";
      FileFilter = path => !path.EndsWith(".vue.js") && !path.Contains($"src{Path.DirectorySeparatorChar}client");
    }

    protected override void OnFileChanged(FileSystemEventArgs e)
    {
      builder.WriteInfo($"[JavaScript] {e.Name} changed.");
      File.WriteAllText(ResourceMinifier.GetMinimizedFileName(e.FullPath), minifier.Minify(File.ReadAllText(e.FullPath)));
      RebuildBundle();
      RebuildOutputs();
    }
  }
}
