using System;
using System.Linq;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using System.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace BilibiliEvolved.Build
{
    class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                var configFile = new ConfigurationBuilder()
                    .AddJsonFile(
                        Path.Combine(Environment.CurrentDirectory, "builder/builder-config.json"),
                        optional: false,
                        reloadOnChange: false)
                    .Build();
                var config = new BuilderConfig();
                configFile.Bind(config);

                var builder = new ProjectBuilder(config);
                builder
                    .BuildPreview()
                    .BuildMaster()
                    .BuildResources()
                    .BuildPreviewOffline()
                    .BuildOffline()
                    .BuildFinalOutput();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.Error.WriteLine($"Unexcepted Error: {ex.Message}");
            }
        }
    }
}