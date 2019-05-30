using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VideoLinkDownloader.Core;

namespace VideoLinkDownloader
{
    class VideoTask : NotificationObject
    {
        public VideoTask(Video video)
        {
            Downloader = new VideoDownloader(video);
            Downloader.ProgressUpdate.Add(progress =>
            {
                Progress = progress;
            });
        }
        public VideoDownloader Downloader { get; private set; }

        private double progress = 0;
        public double Progress
        {
            get => progress;
            set
            {
                progress = value;
                OnPropertyChanged(nameof(Progress));
                OnPropertyChanged(nameof(SizeProgress));
            }
        }
        public string Title => Downloader.Video.Title;
        public string PercentProgress => $"{Math.Floor(Progress * 1000) / 10}%";
        public string SizeProgress => $"{Downloader.DownloadedBytes.ToFileSize()} / {Downloader.Video.TotalSize.ToFileSize()}";
        public async Task Download()
        {
            await Downloader.Download();
        }
    }
}
