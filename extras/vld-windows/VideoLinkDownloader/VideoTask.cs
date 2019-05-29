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
            }
        }
        public async Task Download()
        {
            await Downloader.Download();
        }
    }
}
