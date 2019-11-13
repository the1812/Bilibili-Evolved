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
  public abstract class ResourceWatcher : Watcher
  {
    public ResourceWatcher(string genericFilter, Predicate<string> fileFilter = null) : base($"src{Path.DirectorySeparatorChar}")
    {
      GenericFilter = genericFilter;
      FileFilter = path => (fileFilter?.Invoke(path) ?? true) && !path.Contains($"src{Path.DirectorySeparatorChar}client");
    }
    protected abstract ResourceMinifier Minifier { get; }
    protected abstract string Name { get; }
    protected override sealed void OnFileChanged(FileSystemEventArgs e)
    {
      builder.WriteInfo($"[{Name}] {e.Name} changed.");
      File.WriteAllText(ResourceMinifier.GetMinimizedFileName(e.FullPath), Minifier.Minify(File.ReadAllText(e.FullPath)));
      RebuildBundle();
      RebuildOutputs();
    }
  }
  public class JavaScriptWatcher : ResourceWatcher
  {
    public JavaScriptWatcher() : base("*.js", path => !path.EndsWith(".vue.js")) { }
    protected override ResourceMinifier Minifier { get; } = new JavascriptMinifier();
    protected override string Name { get; } = "JavaScript";
  }
  public class HtmlWatcher : ResourceWatcher
  {
    public HtmlWatcher() : base("*.html") { }
    protected override ResourceMinifier Minifier { get; } = new HtmlMinifier();
    protected override string Name { get; } = "HTML";
  }
  public class CssWatcher : ResourceWatcher
  {
    public CssWatcher() : base("*.css", file =>
    {
      return Path.GetFileName(file) != "dark.css"
        && Path.GetFileName(file) != "dark-template.css"
        && Path.GetExtension(file) == ".css"
        && !file.EndsWith(".p.css");
    })
    { }
    protected override ResourceMinifier Minifier { get; } = new CssMinifier();
    protected override string Name { get; } = "CSS";
  }
}
