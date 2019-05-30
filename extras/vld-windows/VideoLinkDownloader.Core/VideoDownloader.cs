using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;

namespace VideoLinkDownloader.Core
{
    public enum VideoDownloadResult
    {
        Success,
        Skipped,
        Failed,
    }
    public class VideoDownloader
    {
        public Video Video { get; private set; }
        public VideoDownloaderConfig Config { get; set; } = VideoDownloaderConfig.Default;
        public List<Action<double>> ProgressUpdate { get; } = new List<Action<double>>();
        public long DownloadedBytes
        {
            get
            {
                var entires = taskMap.ToArray();
                return entires.Select(it => it.Value).Sum();
            }
        }
        public double Progress => (double)DownloadedBytes / Video.TotalSize;
        public bool Downloading { get; private set; } = false;
        public VideoDownloader(Video video)
        {
            Video = video;
        }
        public async Task<IEnumerable<VideoDownloadResult>> Download()
        {
            taskMap = new Dictionary<Task, long>();
            var results = await Task.WhenAll(from fragment in Video.Fragments select downloadFragment(fragment));
            await Task.WhenAll(from fragment in Video.Fragments select mergeParts(fragment));
            return results;
        }
        private string getTitle(VideoFragment fragment)
        {
            return Video.Fragments.Length == 1 ? Video.Title : $"{Video.Title} - {Array.IndexOf(Video.Fragments, fragment) + 1}";
        }
        private Dictionary<Task, long> taskMap = new Dictionary<Task, long>();
        private void updateProgress()
        {
            ProgressUpdate.ForEach(it => it(Progress));
        }
        private async Task<VideoDownloadResult> downloadFragment(VideoFragment fragment)
        {
            var partialLength = fragment.Size / Config.Parts + 1;
            var title = getTitle(fragment);
            var filename = title + fragment.Extension;
            if (File.Exists(filename))
            {
                return VideoDownloadResult.Skipped;
            }
            var startByte = 0;
            var part = 0;
            while (startByte < fragment.Size)
            {
                var partFilename = $"{title}.part{part}";
                if (!File.Exists(partFilename))
                {
                    var endByte = Math.Min(fragment.Size, startByte + partialLength) - 1;
                    var range = $"bytes={startByte}-{endByte}";
                    var client = new HttpClient();
                    client.DefaultRequestHeaders.Range = new RangeHeaderValue(startByte, endByte);
                    client.DefaultRequestHeaders.Referrer = new Uri("https://www.bilibili.com", UriKind.Absolute);
                    client.DefaultRequestHeaders.Add("Origin", "https://www.bilibili.com");
                    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");
                    //client.Headers[HttpRequestHeader.Range] = range;
                    //client.Headers[HttpRequestHeader.Referer] = "https://www.bilibili.com";
                    //client.Headers[HttpRequestHeader.UserAgent] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36";
                    //client.Headers["Origin"] = "https://www.bilibili.com";
                    Task task = null;
                    try
                    {
                        task = Task.Run(async () =>
                        {
                            using (var response = await client.GetStreamAsync(fragment.Url))
                            using (var file = File.OpenWrite(partFilename))
                            {
                                while (response.CanRead)
                                {
                                    file.WriteByte((byte)response.ReadByte());
                                    taskMap[task]++;
                                    updateProgress();
                                }
                            }
                        });
                        //task = client.DownloadFileTaskAsync(fragment.Url, partFilename);
                        //client.DownloadProgressChanged += (s, e) =>
                        //{
                        //    taskMap[task] = e.BytesReceived;
                        //};
                        taskMap.Add(task, 0L);
                    }
                    catch (Exception ex)
                    when (ex is WebException || ex is InvalidOperationException)
                    {
                        // TODO: handle web errors
                        return VideoDownloadResult.Failed;
                    }
                }
                part++;
                startByte = startByte + partialLength;
            }
            Downloading = true;
            await Task.WhenAll(taskMap.Select(it => it.Key));
            Downloading = false;
            return VideoDownloadResult.Success;
        }
        private async Task mergeParts(VideoFragment fragment)
        {
            var title = getTitle(fragment);
            using (var writeStream = File.OpenWrite($"{title}.{fragment.Extension}"))
            {
                for (var part = 0; part < Config.Parts; part++)
                {
                    using (var readStream = File.OpenRead($"{title}.part{part}"))
                    {
                        await readStream.CopyToAsync(writeStream);
                    }
                }
            }
        }
    }
}
