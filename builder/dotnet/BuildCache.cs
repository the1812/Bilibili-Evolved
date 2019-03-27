using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Linq;

namespace BilibiliEvolved.Build
{
    class BuildCache : IDisposable
    {
        private readonly string fileName;
        private readonly ConcurrentDictionary<string, string> sha1Cache = new ConcurrentDictionary<string, string>();
        private readonly DirectoryInfo cacheDirectory;
        private readonly SHA1Managed sha1;

        public BuildCache() : this(Environment.CurrentDirectory) { }
        public BuildCache(string path) : this(new DirectoryInfo(path)) { }
        public BuildCache(DirectoryInfo path)
        {
            cacheDirectory = path;
            fileName = Path.Combine(cacheDirectory.FullName, "build.cache");
            sha1 = new SHA1Managed();
            LoadCache();
        }

        private string hashToString(byte[] hash)
        {
            return string.Join("", hash.Select(b => b.ToString("X2")).ToArray());
        }
        private string getFileHashString(string path)
        {
            var bytes = File.ReadAllBytes(path);
            return hashToString(sha1.ComputeHash(bytes));
        }

        public void LoadCache()
        {
            if (File.Exists(fileName))
            {
                var lines = File.ReadAllText(fileName)
                    .Split(Environment.NewLine)
                    .Where(l => !string.IsNullOrWhiteSpace(l));
                lines.ForEach(line =>
                {
                    var data = line.Split("|");
                    var fileName = data[0];
                    var sha1Text = data[1];
                    sha1Cache.TryAdd(fileName, sha1Text);
                });
            }
        }
        public void SaveCache()
        {
            var builder = new StringBuilder();
            sha1Cache.OrderBy(pair => pair.Key).ForEach(pair =>
            {
                builder
                    .Append(pair.Key)
                    .Append("|")
                    .Append(pair.Value)
                    .Append(Environment.NewLine);
            });
            File.WriteAllText(fileName, builder.ToString().Trim());
        }

        public void AddCache(string file)
        {
            var hashText = getFileHashString(file);
            sha1Cache.AddOrUpdate(file, hashText, (k, v) => hashText);
        }
        public bool Contains(string file)
        {
            var hashText = getFileHashString(file);
            if (sha1Cache.ContainsKey(file))
            {
                return sha1Cache[file] == hashText;
            }
            else
            {
                return false;
            }
        }

        public void Dispose()
        {
            sha1?.Dispose();
        }
    }
}
