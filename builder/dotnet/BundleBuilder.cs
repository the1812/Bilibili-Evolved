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
      var urlList = from file in Directory.GetFiles("min")
                    where !file.Contains("dark-slice")
                    select file.Replace(@"\", "/");
      var hashDict = new Dictionary<string, string>();
      using (var sha1 = new SHA1Managed())
      using (var zip = ZipFile.Open("min/bundle.zip", ZipArchiveMode.Update))
      {
        foreach (var url in urlList)
        {
          var filename = Path.GetFileName(url);
          var hash = string.Join("", sha1.ComputeHash(File.OpenRead(url)).Select(b => b.ToString("X2")).ToArray());
          zip.CreateEntryFromFile(url, filename);
          hashDict.Add(filename, hash);
        }
      }
      File.WriteAllText("min/bundle.json", JsonConvert.SerializeObject(hashDict, Formatting.Indented));
      WriteSuccess("Bundle build complete.");
      return this;
    }
  }
}