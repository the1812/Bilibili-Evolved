using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using VideoLinkDownloader.Core;

namespace VideoLinkDownloader.Pages.Main
{
    class MainPageViewModel : NotificationObject
    {
        public MainPageViewModel()
        {
            if (Clipboard.ContainsText())
            {
                var text = Clipboard.GetText();
                var (success, videos) = Video.Parse(text);
                if (success)
                {
                    videos.ForEach(video => VideoTasks.Add(new VideoTask(video)));
                }
            }
            VideoTasks.ForEach(async it => await it.Download());
        }
        public ObservableCollection<VideoTask> VideoTasks { get; } = new ObservableCollection<VideoTask>();
    }
}
