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
    public ProjectBuilder BuildBundle()
    {
      using (var cache = new BuildCache())
      {
        var files = ResourceMinifier.GetFiles(file =>
          file.FullName.Contains("src" + Path.DirectorySeparatorChar) &&
          !file.FullName.Contains("client" + Path.DirectorySeparatorChar)
        );
        var changedFiles = files.Where(file => !cache.Contains(file)).ToArray();
        if (changedFiles.Any()) {
          var urlList = from file in Directory.GetFiles("min")
                        where !file.Contains("dark-slice") && !Path.GetFileName(file).StartsWith("bundle.")
                        select file.Replace(@"\", "/");
          var hashDict = new Dictionary<string, string>();
          var zipName = "min/bundle.zip";
          if (File.Exists(zipName))
          {
            File.Delete(zipName);
          }
          using (var sha256 = new SHA256Managed())
          using (var zip = ZipFile.Open(zipName, ZipArchiveMode.Update))
          {
            foreach (var url in urlList)
            {
              var filename = Path.GetFileName(url);
              var hash = string.Join("", sha256.ComputeHash(File.OpenRead(url)).Select(b => b.ToString("X2")).ToArray());
              zip.CreateEntryFromFile(url, filename);
              hashDict.Add(filename, hash);
            }
          }
          File.WriteAllText("min/bundle.json", JsonConvert.SerializeObject(hashDict, Formatting.Indented));
        }
      }
      WriteSuccess("Bundle build complete.");
      return this;
    }
  }
}