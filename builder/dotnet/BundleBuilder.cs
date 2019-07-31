using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;

namespace BilibiliEvolved.Build
{
  partial class ProjectBuilder
  {
    public ProjectBuilder BuildBundle()
    {
      // var urlList = from file in Directory.GetFiles("min")
      //               where !file.Contains("dark-slice")
      //               select file.Replace(@"\", "/");
      // var hashDict = new Dictionary<string, string>();
      // foreach (var url in urlList)
      // {

      // }
      return this;
    }
  }
}