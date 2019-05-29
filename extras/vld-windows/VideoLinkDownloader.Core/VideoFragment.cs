using System;
using System.Collections.Generic;
using System.Text;

namespace VideoLinkDownloader.Core
{
    public class VideoFragment
    {
        public int Length { get; set; }
        public int Size { get; set; }
        public string Url { get; set; }
        public string[] BackupUrls { get; set; }
        public string Extension => Url.Contains(".flv") ? ".flv" : ".mp4";
    }
}
