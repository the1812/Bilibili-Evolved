using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace BilibiliEvolved.Build
{
  public partial class ProjectBuilder
  {
    public static ProjectBuilder CreateBuilder() {
      var configFile = new ConfigurationBuilder()
        .AddJsonFile(
          Path.Combine(Environment.CurrentDirectory, "builder/builder-config.json"),
          optional: false,
          reloadOnChange: false)
        .Build();
      var config = new BuilderConfig();
      configFile.Bind(config);

      return new ProjectBuilder(config);
    }
    public ProjectBuilder(BuilderConfig config)
    {
      this.config = config;
      SourcePath = config.Preview;
      // Source = File.ReadAllText(SourcePath);
      WriteInfo("[Bilibili Evolved] Project builder started.");
      WriteInfo($"Working directory: {Environment.CurrentDirectory}");
      WriteInfo();
    }
    private BuilderConfig config;
    // public double MinimizedResourceLength { get; set; }
    // public double OriginalResourceLength { get; set; }
    public string Source { get; private set; }
    public string Output { get; private set; }
    public string SourcePath { get; private set; }
    public string OutputPath { get; set; } = "bilibili-evolved.user.js";
    public void BuildFinalOutput()
    {
      // var ratio = 100.0 * MinimizedResourceLength / OriginalResourceLength;
      File.WriteAllText(OutputPath, Output.Replace(@"// [Offline build placeholder]", compileOnlineData().Replace("Bilibili-Evolved/preview/", "Bilibili-Evolved/master/")));
      WriteInfo();
      // WriteHint($"External resource size -{(100.0 - ratio):0.##}%");
      WriteInfo("Build complete.", ConsoleColor.Green);

      if (config.CopyOnBuild)
      {
        var text = File.ReadAllText(config.PreviewOffline);
        TextCopy.Clipboard.SetText(text);
        WriteHint($"Copied {text.Length} characters");
      }
    }
    public void WriteInfo(string message = "", ConsoleColor color = ConsoleColor.Gray)
    {
      lock (this)
      {
        Console.ForegroundColor = color;
        Console.WriteLine(message);
      }
    }
    public void WriteSuccess(string message) => WriteInfo(message, ConsoleColor.Blue);
    public void WriteError(string message) => WriteInfo(message, ConsoleColor.Red);
    public void WriteHint(string message) => WriteInfo(message, ConsoleColor.DarkGray);

    private ConcurrentDictionary<string, string> cachedMinFiles = new ConcurrentDictionary<string, string>();
    public ConcurrentDictionary<string, string> GetCachedMinFiles() {
      if (cachedMinFiles.Count == 0) {
        var urlList = from file in Directory.GetFiles("min")
                      where !file.Contains("dark-slice") && !Path.GetFileName(file).StartsWith("bundle.")
                      select file.Replace(@"\", "/");
        Parallel.ForEach(urlList, url =>
        {
          cachedMinFiles[url] = File.ReadAllText(url);
        });
      }
      return cachedMinFiles;
    }
    public void UpdateCachedMinFile(string url) {
      cachedMinFiles[url] = File.ReadAllText(url);
    }
  }
}
