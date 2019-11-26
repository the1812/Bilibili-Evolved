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
  public class SassWatcher : PreprocessorWatcher
  {
    public SassWatcher() : base(".scss", ".css", $".sass-output") { }
    protected override ResourceMinifier Minifier { get; } = new CssMinifier();
    protected override NodeInteract WatcherComplier { get; } = new SassWatchCompiler();
    protected override string Name { get; } = "Sass";
    protected override string PostBuild(string content) => content.Replace("@charset \"UTF-8\";", "");
  }
}
