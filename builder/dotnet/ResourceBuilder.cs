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
        protected string GetMinimizedFileName(string path)
        {
            var fileInfo = new FileInfo(path);
            return "min/" + fileInfo.Name.Insert(fileInfo.Name.LastIndexOf("."), ".min");
        }
        public static IEnumerable<string> GetFiles(Predicate<FileInfo> filter)
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
                    .Where(file =>
                    {
                        var fullName = file.FullName;
                        return predicate(file)
                        && !fullName.Contains(@".vs\")
                        && !fullName.Contains(@".vscode\")
                        && !fullName.Contains(@"build-scripts\")
                        && !fullName.Contains(@"node_modules\")
                        && !fullName.Contains(@".backup.")
                        && !fullName.Contains(@"extras");
                    })
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
            var files = GetFiles(FileFilter);
            using (var cache = new BuildCache())
            {
                var changedFiles = files.Where(file => !cache.Contains(file));
                Parallel.ForEach(changedFiles, path =>
                {
                    builder.WriteInfo($"{ResourceType} minify: {path}");

                    var text = File.ReadAllText(path);
                    var result = Minify(text);

                    var outputPath = GetMinimizedFileName(path);
                    File.WriteAllText(outputPath, result);
                    cache.AddCache(path);

                    builder.WriteHint($"\t=> {outputPath}");
                    // builder.WriteHint($"\t=> {outputPath.PadRight(48)}{(100.0 * result.Length / text.Length):0.##}%");
                });
                cache.SaveCache();
            }
            files.ForEach(file =>
            {
                builder.OriginalResourceLength += new FileInfo(file).Length;
                builder.MinimizedResourceLength += new FileInfo(GetMinimizedFileName(file)).Length;
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
                && file.Name != "dark.css"
                && file.Name != "dark-template.css"
                && (file.Extension == ".css");
        };

        public override string ResourceType { get; } = "CSS";

        public override string Minify(string input)
        {
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
            return (file.FullName.Contains(@"style\")
                || file.FullName.Contains(@"touch\")
                || file.FullName.Contains(@"utils\")
                || file.FullName.Contains(@"video\"))
                && file.Extension == ".js";
        };

        public override string ResourceType { get; } = "JavaScript";

        public override string Minify(string input)
        {
            if (!input.StartsWith("(() =>"))
            {
                Func<string, string> convertToRuntimeSource = source =>
                {
                    var index = source.LastIndexOf("/");
                    if (index != -1)
                    {
                        source = source.Remove(1, index);
                    }
                    return source;
                };
                input = RegexReplacer.Replace(input, @"import (.*) from (.*)", match =>
                {
                    var imported = match.Groups[1].Value.Replace(" as ", ":");
                    var source = convertToRuntimeSource(match.Groups[2].Value);
                    return $"const {imported} = resources.import({source})";
                });
                input = RegexReplacer.Replace(input, @" import\((.*)\)", match =>
                {
                    var source = convertToRuntimeSource(match.Groups[1].Value);
                    return $" resources.importAsync({source})";
                });
                input = @"(() =>
{
    return (settings, resources) =>
    {
        " + input.Replace("export default ", "return ").Replace("export ", "") + @"
    };
})();";
            }
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
        static HtmlMinifier()
        {
            var patterns = new string[] {
                @"<category\s*?icon=""?(.+?)""?>([^\0]*?)<\/category>",
                @"<checkbox\s*?indent=""?(.+?)""?\s*?key=""?(.+?)""?\s*?dependencies=""?(.*?)""?>([^\0]*?)<\/checkbox>",
                @"<dropdown\s*?indent=""?(.+?)""?\s*?key=""?(.+?)""?\s*?dependencies=""?(.*?)""?>([^\0]*?)<\/dropdown>",
                @"<textbox\s*?indent=""?(.+?)""?\s*key=""?(.+?)""?\s*?dependencies=""?(.*?)""?>([^\0]*?)<\/textbox>",
            };
            var replacements = new string[] {
                @"<li class='indent-center category folded'>
                    <i class='icon-$1' style='margin-right:8px'></i>
                    <span class='settings-category'>$2</span>
                    <i class='icon-arrow' style='margin-left:8px'></i>
                </li>",
                @"<li class='indent-$1 folded'>
                    <label class='gui-settings-checkbox-container'>
                        <input key='$2' type='checkbox' dependencies='$3' checked/>
                        <div class='gui-settings-checkbox'></div>
                        <span>$4</span>
                    </label>
                </li>",
                @"<li class='indent-$1 folded'>
                    <label class='gui-settings-dropdown-container'>
                        <span class='gui-settings-dropdown-span'>$4</span>
                        <div class='gui-settings-dropdown popup'>
                            <input readonly type='text' spellcheck='false' key='$2' dependencies='$3'>
                            <ul></ul>
                            <i class='icon-arrow'></i>
                        </div>
                    </label>
                </li>",
                @"<li class='indent-$1 folded'>
                    <label class='gui-settings-textbox-container'>
                        <span>$4</span>
                        <input key='$2' dependencies='$3' spellcheck='false' type='text' />
                    </label>
                </li>",
            };
            regices = patterns.Zip(replacements, (pattern, replacement) =>
            {
                return (new Regex(pattern, RegexOptions.Compiled | RegexOptions.IgnoreCase), replacement);
            });
        }
        private static readonly IEnumerable<(Regex, string)> regices;
        public override string Minify(string input)
        {
            foreach (var (regex, replacement) in regices)
            {
                input = regex.Replace(input, replacement);
            }
            return new UglifyHtml().Run(input);
        }
    }
}
