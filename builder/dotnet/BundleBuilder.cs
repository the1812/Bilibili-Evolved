using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.IO.Compression;

namespace BilibiliEvolved.Build
{
  partial class ProjectBuilder
  {
    private IEnumerable<string> changedBundleFiles;
    public ProjectBuilder GetBundleFiles() {
      using (var cache = new BuildCache())
      {
        var extensions = new string[] {
          ".ts", ".js", ".css", ".scss", ".sass", ".vue", ".html", ".htm"
        };
        var files = ResourceMinifier.GetFiles(file =>
          file.FullName.Contains("src" + Path.DirectorySeparatorChar) &&
          extensions.Contains(file.Extension) &&
          !file.Name.EndsWith(".d.ts") &&
          !file.FullName.Contains("client" + Path.DirectorySeparatorChar)
        );
        changedBundleFiles = files.Where(file => !cache.Contains(file)).ToArray();
      }
      return this;
    }
    public ProjectBuilder BuildBundle()
    {
      if (changedBundleFiles.Any())
      {
        // var urlList = from file in Directory.GetFiles("min")
        //               where !file.Contains("dark-slice") && !Path.GetFileName(file).StartsWith("bundle.")
        //               select file.Replace(@"\", "/");
        var hashDict = new Dictionary<string, string>();
        var zipName = "min/bundle.zip";
        if (File.Exists(zipName))
        {
          File.Delete(zipName);
        }
        using (var sha256 = new SHA256Managed())
        using (var zip = ZipFile.Open(zipName, ZipArchiveMode.Update))
        {
          foreach (var (url, text) in GetCachedMinFiles())
          {
            var filename = Path.GetFileName(url);
            var hash = string.Join("", sha256.ComputeHash(Encoding.UTF8.GetBytes(text)).Select(b => b.ToString("X2")).ToArray());
            zip.CreateEntryFromFile(url, filename, CompressionLevel.NoCompression);
            hashDict.Add(filename, hash);
          }
        }
        File.WriteAllText("min/bundle.json", JsonConvert.SerializeObject(hashDict, Formatting.Indented));
        WriteSuccess("Bundle build complete.");
      }
      else
      {
        WriteSuccess("Skipped bundle build.");
      }
      return this;
    }
  }
}