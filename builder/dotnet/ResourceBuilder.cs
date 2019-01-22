using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace BilibiliEvolved.Build
{
    partial class ProjectBuilder
    {
        public ProjectBuilder BuildResources()
        {
            new CssMinifier().Build(this);
            new HtmlMinifier().Build(this);
            new JavascriptMinifier().Build(this);
            return this;
        }
    }
    abstract class ResourceMinifier
    {
        public abstract Predicate<FileInfo> FileFilter { get; }
        public abstract string ResourceType { get; }
        public abstract string Minify(string input);
        protected string GetMinifiedFileName(string path)
        {
            var fileInfo = new FileInfo(path);
            return "min/" + fileInfo.Name.Insert(fileInfo.Name.LastIndexOf("."), ".min");
        }
        protected IEnumerable<string> GetFiles(Predicate<FileInfo> filter)
        {
            string getRelativePath(string fullPath)
            {
                var currentFolder = Environment.CurrentDirectory;
                var path = fullPath.Replace(currentFolder, "");
                if (path.StartsWith(Path.DirectorySeparatorChar))
                {
                    return path.Remove(path.IndexOf(Path.DirectorySeparatorChar), 1);
                }
                else
                {
                    return path;
                }
            }
            IEnumerable<string> getFiles(Predicate<FileInfo> predicate, string path)
            {
                var list = new List<string>();
                var currentDirectory = new DirectoryInfo(path);
                list.AddRange(currentDirectory.EnumerateFiles()
                    .Where(file => predicate(file))
                    .Select(file => getRelativePath(file.FullName)));
                foreach (var subDir in currentDirectory.EnumerateDirectories())
                {
                    list.AddRange(getFiles(filter, subDir.FullName));
                }
                return list;
            }
            var directory = Environment.CurrentDirectory;
            if (!directory.EndsWith(Path.DirectorySeparatorChar))
            {
                directory = directory + Path.DirectorySeparatorChar;
            }
            return getFiles(filter, directory);
        }
        public virtual ProjectBuilder Build(ProjectBuilder builder)
        {
            var files = GetFiles(file =>
                FileFilter(file)
                && !file.FullName.Contains(@".vs\")
                && !file.FullName.Contains(@".vscode\")
                && !file.FullName.Contains(@"build-scripts\")
                && !file.FullName.Contains(@"node_modules\")
                && !file.FullName.Contains(@".backup.")
                );
            using (var cache = new BuildCache())
            {
                var changedFiles = files.Where(file => !cache.Contains(file));
                Parallel.ForEach(changedFiles, path =>
                {
                    builder.WriteInfo($"{ResourceType} minify: {path}");

                    var text = File.ReadAllText(path);
                    var result = Minify(text);

                    var outputPath = GetMinifiedFileName(path);
                    File.WriteAllText(outputPath, result);
                    cache.AddCache(path);

                    builder.WriteHint($"\t=> {outputPath.PadRight(48)}{(100.0 * result.Length / text.Length):0.##}%");
                });
                cache.SaveCache();
            }
            files.ForEach(file =>
            {
                builder.OriginalResourceLength += new FileInfo(file).Length;
                builder.MinifiedResourceLength += new FileInfo(GetMinifiedFileName(file)).Length;
            });
            builder.WriteSuccess($"{ResourceType} minify complete.");
            return builder;
        }
    }
    sealed class CssMinifier : ResourceMinifier
    {
        public override Predicate<FileInfo> FileFilter { get; } = file =>
        {
            return !file.FullName.Contains(".min")
                && !file.FullName.Contains("dark.css")
                && !file.FullName.Contains("dark-template")
                && (file.Extension == ".css");
        };

        public override string ResourceType { get; } = "CSS";

        public override string Minify(string input)
        {
            // var commentRegex = new Regex(@"/\*[^\0]*?\*/|^\s*//.*$", RegexOptions.Multiline);
            // input = commentRegex.Replace(input, "");

            // var selectorRegex = new Regex(@"[\s]*([^\0,}]+?)[\s]*({)|[\s]*([^\0}]+?)(,)" + Environment.NewLine);
            // input = selectorRegex.Replace(input, "$1$2$3$4");

            // var ruleRegex = new Regex(@"[\s]*([a-z\-]+:)[ ]*(.*?)[ ]*(!important)?;[\s]*");
            // input = ruleRegex.Replace(input, "$1$2$3;");

            // return input
            //     .Replace(Environment.NewLine, "")
            //     .Replace("\n", "")
            //     .Replace("\r", "")
            //     .Replace(", ", ",");
            return new UglifyCss().Run(input);
        }

        public override ProjectBuilder Build(ProjectBuilder builder)
        {
            base.Build(builder);
            return builder.BuildDarkStyles();
        }
    }
    sealed class JavascriptMinifier : ResourceMinifier
    {
        public override Predicate<FileInfo> FileFilter { get; } = file =>
        {
            return !file.FullName.Contains(".min")
                && !file.FullName.Contains(@"builder\")
                && !file.FullName.Contains("bilibili-evolved.")
                && file.Extension == ".js";
        };

        public override string ResourceType { get; } = "JavaScript";

        public override string Minify(string input)
        {
            return new UglifyJs().Run(input);
        }
    }
    sealed class HtmlMinifier : ResourceMinifier
    {
        public override Predicate<FileInfo> FileFilter { get; } = file =>
        {
            return !file.FullName.Contains(".min") && file.Extension == ".html";
        };

        public override string ResourceType { get; } = "HTML";

        public override string Minify(string input)
        {
            // var commentRegex = new Regex(@"<!--[^\0]*?-->", RegexOptions.Multiline);
            // input = commentRegex.Replace(input, "");

            // var blankRegex = new Regex(@"(?<=>)[\s]*([^\s]*)[\s]*(?=<)|[\s]*(?=/>)", RegexOptions.Multiline);
            // input = blankRegex.Replace(input, "$1");

            // return input
            //     .Replace(Environment.NewLine, "")
            //     .Replace("\n", "")
            //     .Replace("\r", "");
            return new UglifyHtml().Run(input);
        }
    }
}
