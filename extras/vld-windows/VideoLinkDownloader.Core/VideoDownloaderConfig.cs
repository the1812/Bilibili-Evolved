using System;
using System.Collections.Generic;
using System.Text;

namespace VideoLinkDownloader.Core
{
    public class VideoDownloaderConfig
    {
        public bool Danmaku { get; set; }
        public int Parts { get; set; }
        public string OutputFolder { get; set; }

        public static VideoDownloaderConfig Default { get; } = new VideoDownloaderConfig
        {
            Danmaku = false,
            Parts = 12,
            OutputFolder = ".",
        };
    }
}
