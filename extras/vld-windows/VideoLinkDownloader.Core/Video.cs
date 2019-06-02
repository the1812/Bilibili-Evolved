using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace VideoLinkDownloader.Core
{
    public class Video
    {
        public string Title { get; set; }
        public long TotalSize { get; set; }
        public VideoFragment[] Fragments { get; set; }
        public static (bool success, IEnumerable<Video> videos) Parse(string json)
        {
            try
            {
                var videos = JsonConvert.DeserializeObject<Video[]>(json);
                return (true, videos);
            }
            catch
            {
                return (false, null);
            }
        }
    }
}
