using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace BilibiliEvolved.Build
{
    abstract class NodeInteract
    {
        public static readonly string LocalBinPath = @"node_modules/.bin/";
        public static readonly string GlobalBinPath = Environment.GetEnvironmentVariable("AppData") + @"/npm/";
        protected abstract string BinaryPath { get; }
        protected abstract string Arguments { get; }
        public string Run(string input)
        {
            var filename = "";
            if (File.Exists(LocalBinPath + BinaryPath))
            {
                filename = LocalBinPath + BinaryPath;
            }
            else if (File.Exists(GlobalBinPath + BinaryPath))
            {
                filename = GlobalBinPath + BinaryPath;
            }
            else
            {
                throw new FileNotFoundException($"Binary file not found: {BinaryPath}");
            }
            var processInfo = new ProcessStartInfo
            {
                FileName = "node",
                Arguments = filename + " " + Arguments,
                UseShellExecute = false,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
            };
            var process = Process.Start(processInfo);
            using (var writer = new StreamWriter(process.StandardInput.BaseStream, Encoding.UTF8))
            {
                writer.Write(input);
                writer.Flush();
                writer.Close();
                using (var reader = new StreamReader(process.StandardOutput.BaseStream, Encoding.UTF8))
                {
                    return reader.ReadToEnd().Trim();
                }
            }
        }
    }
    sealed class UglifyJs : NodeInteract
    {
        protected override string BinaryPath => "node_modules/uglify-es/bin/uglifyjs";
        protected override string Arguments => "-m";
    }
}
