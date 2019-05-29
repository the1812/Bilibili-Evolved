using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using System.IO;
using System.Net;

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
        public ICollection<Action<double>> ProgressUpdate { get; } = new List<Action<double>>();
        public VideoDownloader(Video video)
        {
            Video = video;
        }
        public async Task<IEnumerable<VideoDownloadResult>> Download()
        {
            var results = await Task.WhenAll(from fragment in Video.Fragments select downloadFragment(fragment));
            await Task.WhenAll(from fragment in Video.Fragments select mergeParts(fragment));
            return results;
        }
        private string getTitle(VideoFragment fragment)
        {
            return Video.Fragments.Length == 1 ? Video.Title : $"{Video.Title} - {Array.IndexOf(Video.Fragments, fragment) + 1}";
        }
        private Dictionary<Task, double> taskMap = new Dictionary<Task, double>();
        private void updateProgress()
        {

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
            taskMap = new Dictionary<Task, double>();
            while (startByte < fragment.Size)
            {
                var partFilename = $"{title}.part{part}";
                if (!File.Exists(partFilename))
                {
                    var endByte = Math.Min(fragment.Size, startByte + partialLength) - 1;
                    var range = $"bytes={startByte}-{endByte}";
                    using (var webclient = new WebClient())
                    {
                        webclient.Headers[HttpRequestHeader.Range] = range;
                        webclient.Headers[HttpRequestHeader.Referer] = "https://www.bilibili.com";
                        webclient.Headers[HttpRequestHeader.UserAgent] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36";
                        webclient.Headers["Origin"] = "https://www.bilibili.com";
                        Task task = null;
                        try
                        {
                            task = webclient.DownloadFileTaskAsync(fragment.Url, partFilename);
                            webclient.DownloadProgressChanged += (s, e) =>
                            {
                                taskMap[task] = e.BytesReceived;
                            };
                            taskMap.Add(task, 0.0);
                        }
                        catch (Exception ex)
                        when (ex is WebException || ex is InvalidOperationException)
                        {
                            // TODO: handle web errors
                            return VideoDownloadResult.Failed;
                        }
                    }
                }
                part++;
                startByte = startByte + partialLength;
            }
            await Task.WhenAll(taskMap.Select(it => it.Key));
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
