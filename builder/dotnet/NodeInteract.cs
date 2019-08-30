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
    public static readonly string LocalModulePath = @"node_modules/";
    public static readonly string GlobalModulePath = Environment.GetEnvironmentVariable("AppData") + @"/npm/node_modules/";
    protected abstract string ExecutablePath { get; }
    protected abstract string Arguments { get; }
    public string Run(string input = "")
    {
      var filename = "";
      if (File.Exists(LocalModulePath + ExecutablePath))
      {
        filename = LocalModulePath + ExecutablePath;
      }
      else if (File.Exists(GlobalModulePath + ExecutablePath))
      {
        filename = GlobalModulePath + ExecutablePath;
      }
      else
      {
        throw new FileNotFoundException($"Binary file not found: {ExecutablePath}");
      }
      var processInfo = new ProcessStartInfo
      {
        FileName = "node",
        Arguments = filename + " " + Arguments,
        UseShellExecute = false,
        RedirectStandardInput = true,
        RedirectStandardError = true,
        RedirectStandardOutput = true,
      };
      var process = Process.Start(processInfo);
      using (var writer = new StreamWriter(process.StandardInput.BaseStream, Encoding.UTF8))
      {
        writer.Write(input);
        writer.Flush();
        writer.Close();
        using (var outputReader = new StreamReader(process.StandardOutput.BaseStream, Encoding.UTF8))
        using (var errorReader = new StreamReader(process.StandardError.BaseStream, Encoding.UTF8))
        {
          return outputReader.ReadToEnd().Trim() + errorReader.ReadToEnd().Trim();
        }
      }
    }
  }
  sealed class UglifyJs : NodeInteract
  {
    protected override string ExecutablePath => "uglify-es/bin/uglifyjs";
    protected override string Arguments => "-m";
  }
  sealed class UglifyCss : NodeInteract
  {
    protected override string ExecutablePath => "clean-css-cli/bin/cleancss";
    protected override string Arguments => "-O2";
  }
  sealed class UglifyHtml : NodeInteract
  {
    protected override string ExecutablePath => "html-minifier/cli.js";
    protected override string Arguments => "--collapse-whitespace --collapse-inline-tag-whitespace --remove-comments --remove-attribute-quotes --remove-tag-whitespace --use-short-doctype";
  }
  sealed class TypeScriptCompiler : NodeInteract
  {
    protected override string ExecutablePath => "typescript/bin/tsc";
    protected override string Arguments => "";
  }
  sealed class SassCompiler : NodeInteract
  {
    protected override string ExecutablePath => "sass/sass.js";
    protected override string Arguments => "--quiet --no-source-map src:.sass-output";
  }
  sealed class SassSingleCompiler : NodeInteract
  {
    protected override string ExecutablePath => "sass/sass.js";
    protected override string Arguments => "--quiet --no-source-map --stdin";
  }
}
