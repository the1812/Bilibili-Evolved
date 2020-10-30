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
  public class TypeScriptWatcher : PreprocessorWatcher
  {
    public TypeScriptWatcher() : base(".ts", ".js", $".ts-output") { }
    protected override ResourceMinifier Minifier { get; } = new JavascriptMinifier();
    protected override NodeInteract WatcherComplier { get; } = new BabelWatchCompiler();
    protected override string Name { get; } = "TypeScript";
    protected override string PostBuild(string content) => content;
  }
}
