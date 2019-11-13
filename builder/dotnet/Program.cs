using System;
using System.Linq;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using System.Diagnostics;
using Microsoft.Extensions.Configuration;
using BilibiliEvolved.Build.Watcher;

namespace BilibiliEvolved.Build
{
  class Program
  {
    public static void Main(string[] args)
    {
      try
      {
        if (args.Length > 0 && args[0].ToLowerInvariant() == "watch") {
          var watchBuilder = new WatchBuilder();
          watchBuilder.StartWatching();
        } else {
          // RunFullBuild();
        }
      }
      catch (Exception ex)
      {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.Error.WriteLine($"Unexpected Error: {ex.Message}");
        throw;
      }
    }
    public static void RunFullBuild() {
      var builder = ProjectBuilder.CreateBuilder();
      builder
        .BuildClient() // inject client files
        .BuildPreview() // preview file, versions
        .BuildMaster() // stable source code
        .GetBundleFiles() // detect if bundle needs rebuild or can skip
        .PrebuildVue() // generate vue.ts files from vue files
        .BuildTypeScripts() // build ts files
        .BuildSass() // build sass files
        .BuildVue() // build vue files (js, sass, css, html)
        .BuildResources() // build js, css, html files
        .BuildPreviewOffline() // preview-offline file + offline data
        .BuildOffline() // offline file + offline data
        .BuildBundle() // bundle file
        .BuildPreviewData() // preview online data
        .BuildFinalOutput(); // stable file + online data
    }
  }
}