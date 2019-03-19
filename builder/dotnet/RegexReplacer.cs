using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace BilibiliEvolved.Build
{
    static class RegexReplacer
    {
        public static string Replace(string text, string regexText, Func<Match, string> func)
        {
            var regex = new Regex(regexText, RegexOptions.Compiled | RegexOptions.IgnoreCase);
            while (true)
            {
                var match = regex.Match(text);
                if (!match.Success)
                {
                    break;
                }
                text = text.Replace(match.Value, func(match));
            }
            return text;
        }
    }
}