using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Linq;
using System.Threading.Tasks;

namespace BilibiliEvolved.Build
{
  static class Extensions
  {
    public static void ForEach<T>(this IEnumerable<T> collection, Action<T> action)
    {
      foreach (var item in collection)
      {
        action(item);
      }
    }
    public static Action Debounce(Action action, int waitTime)
    {
      var queue = new ConcurrentQueue<Action>();
      return async () =>
      {
        queue.Enqueue(action);
        await Task.Delay(waitTime);
        if (queue.TryDequeue(out var a))
        {
          if (queue.Count == 0)
          {
            a?.Invoke();
          }
        }
      };
    }
  }
}
