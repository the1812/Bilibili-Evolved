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
  sealed class VueBuildException : Exception
  {
    public VueBuildException(string message) : base(message) {}
  }
  partial class ProjectBuilder
  {
    public ProjectBuilder BuildVue()
    {
      var files = ResourceMinifier.GetFiles(file =>
        file.FullName.Contains(@"src\") &&
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
            var compiledText = new StringBuilder("");
            {
              var regex = @"<template\s*(lang=""(.+)"")?\s*>([^\0]*)</template>";
              var match = new Regex(regex).Match(source);
              if (match is null)
              {
                throw new VueBuildException($"Missing <template> in {file}.");
              }
              if (match.Groups.Count >= 4 && match.Groups[2].Value.ToLowerInvariant() != "html")
              {
                throw new VueBuildException($"{file}: Unsupported template lang: {match.Groups[2].Value.ToLowerInvariant()}");
              }
              var index = match.Groups.Count >= 4 ? 4 : 1;
              compiledText.AppendLine($"const template = /*html*/`{match.Groups[index].Value}`");
            }
            {
              var regex = @"<script\s*(lang=""(.+)"")?\s*>([^\0]*)</script>";
              var match = new Regex(regex).Match(source);
              if (match is null)
              {
                throw new VueBuildException($"Missing <script> in {file}.");
              }
              var contentIndex = match.Groups.Count >= 4 ? 4 : 1;
              var content = match.Groups[contentIndex].Value;
              var lang = match.Groups.Count >= 4 ? match.Groups[2].Value.ToLowerInvariant() : "js";
              if (lang == "js" || lang == "javascript")
              {
                var jsc = new UglifyJs();
                var result = jsc.Run(content);

              }
              else if (lang == "ts" || lang == "typescript")
              {

              }
              else
              {
                throw new VueBuildException($"{file}: Unsupported script lang: {lang}");
              }
            }
            {
              var regex = @"<style\s*(lang=""(.+)"")?\s*>([^\0]*)</style>";
              var match = new Regex(regex).Match(source);
              if (match != null)
              {
                var contentIndex = match.Groups.Count >= 4 ? 4 : 1;
                var content = match.Groups[contentIndex].Value;
                var lang = match.Groups.Count >= 4 ? match.Groups[2].Value.ToLowerInvariant() : "css";
                if (lang == "css")
                {

                }
                else if (lang == "scss")
                {

                }
                else
                {
                  throw new VueBuildException($"{file}: Unsupported style lang: {lang}");
                }
              }
            }
          });
        }
        cache.SaveCache();
      }
      WriteSuccess("Vue build complete.");
      return this;
    }
  }
}
