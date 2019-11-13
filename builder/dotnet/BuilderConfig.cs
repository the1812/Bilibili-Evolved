using System;
using System.Collections.Generic;
using System.Text;

namespace BilibiliEvolved.Build
{
    public class BuilderConfig
    {
        public string Master { get; set; }
        public string Preview { get; set; }
        public string Offline { get; set; }
        public string PreviewOffline { get; set; }
        public string LogoPath { get; set; }
        public string SmallLogoPath { get; set; }
        public string Owner { get; set; }
        public bool CopyOnBuild { get; set; }
        public string Bundle { get; set; }
    }
}
