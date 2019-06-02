using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VideoLinkDownloader
{
    static class Extensions
    {
        public static string ToFileSize(this long size)
        {
            string[] units = { "B", "KB", "MB", "GB", "TB", "PB", "EB" };
            if (size == 0)
            {
                return "0" + units[0];
            }

            var bytes = Math.Abs(size);
            var place = Convert.ToInt32(Math.Floor(Math.Log(bytes, 1024)));
            var num = Math.Round(bytes / Math.Pow(1024, place), 1);
            return (Math.Sign(size) * num).ToString() + units[place];
        }
        public static void ForEach<T>(this IEnumerable<T> collection, Action<T> action)
        {
            foreach (var item in collection)
            {
                action(item);
            }
        }
    }
}
