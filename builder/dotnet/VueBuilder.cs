using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using System.Threading.Tasks;

namespace BilibiliEvolved.Build
{
  public sealed class VueFile
  {
    public string TamplateLang { get; private set; }
    public string Tamplate { get; private set; }
    public string ScriptLang { get; private set; }
    public string Script { get; private set; }
    public string StyleLang { get; private set; }
    public string Style { get; private set; }

    public VueFile(string text)
    {
      parseTamplate(text);
      parseScript(text);
      parseStyle(text);
    }
    private void parseTamplate(string text)
    {
      var regex = @"<template\s*(lang=""(.+)"")?\s*>([^\0]*)</template>";
      var match = new Regex(regex, RegexOptions.Multiline).Match(text);
      if (!match.Success)
      {
        TamplateLang = null;
        Tamplate = null;
        return;
      }
      Tamplate = match.Groups[3].Value.Trim();
      TamplateLang = match.Groups[2].Value.Trim();
      if (TamplateLang == "")
      {
        TamplateLang = "html";
      }
    }
    private void parseScript(string text)
    {
      var regex = @"<script\s*(lang=""(.+)"")?\s*>([^\0]*)</script>";
      var match = new Regex(regex, RegexOptions.Multiline).Match(text);
      if (!match.Success)
      {
        ScriptLang = null;
        Script = null;
        return;
      }
      Script = match.Groups[3].Value.Trim();
      ScriptLang = match.Groups[2].Value.Trim();
      if (ScriptLang == "")
      {
        ScriptLang = "js";
      }
    }
    private void parseStyle(string text)
    {
      var regex = @"<style\s*(lang=""(.+)"")?\s*>([^\0]*)</style>";
      var match = new Regex(regex, RegexOptions.Multiline).Match(text);
      if (!match.Success)
      {
        StyleLang = null;
        Style = null;
        return;
      }
      Style = match.Groups[3].Value.Trim().Trim('\ufeff');
      StyleLang = match.Groups[2].Value.Trim();
      if (StyleLang == "")
      {
        StyleLang = "css";
      }
    }
  }
  public sealed class VueBuildException : Exception
  {
    public VueBuildException(string message) : base(message) { }
  }
  partial class ProjectBuilder
  {
    public ProjectBuilder PrebuildVue()
    {
      var files = ResourceMinifier.GetFiles(file =>
        file.FullName.Contains($"src{Path.DirectorySeparatorChar}") &&
        file.Extension == ".vue"
      );
      using (var cache = new BuildCache())
      {
        var changedFiles = files.Where(file => !cache.Contains(file)).ToArray();
        if (changedFiles.Any())
        {
          Parallel.ForEach(changedFiles, file =>
          {
            var source = File.ReadAllText(file);
            var vueFile = new VueFile(source);
            if (vueFile.Script is null)
            {
              return;
            }
            if (vueFile.ScriptLang == "ts" || vueFile.ScriptLang == "typescript")
            {
              File.WriteAllText(file + ".ts", vueFile.Script);
            }
          });
        }
      }
      return this;
    }
    public ProjectBuilder BuildVue()
    {
      var files = ResourceMinifier.GetFiles(file =>
        file.FullName.Contains($"src{Path.DirectorySeparatorChar}") &&
        file.Extension == ".vue"
      );
      using (var cache = new BuildCache())
      {
        var changedFiles = files.Where(file => !cache.Contains(file)).ToArray();
        if (changedFiles.Any())
        {
          Parallel.ForEach(changedFiles, file =>
          {
            cache.AddCache(file);
            WriteInfo($"Vue build: {file}");
            var source = File.ReadAllText(file);
            var vueFile = new VueFile(source);
            var compiledText = new StringBuilder("");
            if (vueFile.Tamplate is null)
            {
              throw new VueBuildException($"{file}: Missing <tamplate>");
            }
            else
            {
              var uglifyHtml = new UglifyHtml();
              if (vueFile.TamplateLang == "html")
              {
                compiledText.Append($"const template = /*html*/`{uglifyHtml.Run(vueFile.Tamplate)}`;");
              }
              else
              {
                throw new VueBuildException($"{file}: Unsupported <template> lang '{vueFile.TamplateLang}'");
              }
            }
            if (vueFile.Style != null)
            {
              var styleID = Path.ChangeExtension(Path.GetFileName(file), null).Replace(".", "-") + "-style";
              var uglifyCss = new UglifyCss();
              if (vueFile.StyleLang == "css")
              {
                compiledText.Append($"resources.applyStyleFromText(`{uglifyCss.Run(vueFile.Style)}`,'{styleID}');");
              }
              else if (vueFile.StyleLang == "scss")
              {
                var sass = new SassSingleCompiler();
                var css = uglifyCss.Run(sass.Run(vueFile.Style).Replace("@charset \"UTF-8\";", ""));
                compiledText.Append($"resources.applyStyleFromText(`{css}`,'{styleID}');");
              }
              else
              {
                throw new VueBuildException($"{file}: Unsupported <style> lang '{vueFile.StyleLang}'");
              }
            }
            if (vueFile.Script is null)
            {
              throw new VueBuildException($"{file}: Missing <script>");
            }
            else
            {
              if (vueFile.ScriptLang == "js" || vueFile.ScriptLang == "javascript")
              {
                var script = vueFile.Script.Replace("export default ", "return {export:Object.assign({template},").Trim().TrimEnd(';');
                compiledText.Append($"{script})}}");
              }
              else if (vueFile.ScriptLang == "ts" || vueFile.ScriptLang == "typescript")
              {
                var tsFile = file + ".ts";
                var jsFile = ".ts-output" + Path.DirectorySeparatorChar + file.Replace("src" + Path.DirectorySeparatorChar, "") + ".js";
                var script = File.ReadAllText(jsFile).Replace("export default ", "return {export:Object.assign({template},").Trim().TrimEnd(';');
                compiledText.Append($"{script})}}");
                File.Delete(tsFile);
                // File.Delete(jsFile);
              }
              else
              {
                throw new VueBuildException($"{file}: Unsupported <script> lang '{vueFile.ScriptLang}'");
              }
            }
            // compiledText.Append("}})()");
            var minFile = "min" + Path.DirectorySeparatorChar + Path.GetFileName(file) + ".min.js";
            var jsc = new JavascriptMinifier();
            File.WriteAllText(minFile, jsc.Minify(compiledText.ToString()));
            WriteHint($"\t=> {minFile}");
          });
        }
        cache.SaveCache();
      }
      WriteSuccess("Vue build complete.");
      return this;
    }
  }
}
