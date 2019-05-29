using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;

namespace VideoLinkDownloader
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            var registry = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize");
            if (registry is null || (int) registry.GetValue("AppsUseLightTheme", 0) == 1)
            {
                Resources.MergedDictionaries.Remove(new ResourceDictionary
                {
                    Source = new Uri("Theme.Dark.xaml", UriKind.Relative),
                });
                Resources.MergedDictionaries.Add(new ResourceDictionary
                {
                    Source = new Uri("Theme.Light.xaml", UriKind.Relative),
                });
            }
        }
    }
}
