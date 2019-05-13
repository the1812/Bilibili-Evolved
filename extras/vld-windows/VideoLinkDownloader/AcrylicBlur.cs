using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Media;

namespace VideoLinkDownloader
{
    [StructLayout(LayoutKind.Sequential)]
    struct AccentPolicy
    {
        public AccentState AccentState;
        public int AccentFlags;
        public int GradientColor;
        public int AnimationId;
    }
    enum AccentState
    {
        Diabled = 0,
        Gradient = 1,
        TransparentGradient = 2,
        BlurBehind = 3,
        AcrylicBlurBehind = 4,
        InvalidState = 5,
    }
    [StructLayout(LayoutKind.Sequential)]
    struct WindowsCompostionAttributeData
    {
        public int Attribute;
        public IntPtr Data;
        public int SizeOfData;
    }
    static class AcrylicBlur
    {
        [DllImport("user32.dll")]
        private static extern int SetWindowCompositionAttribute(IntPtr hWnd, ref WindowsCompostionAttributeData data);
        public static void Apply(Window window, Color backgroundColor, AccentState state = AccentState.AcrylicBlurBehind)
        {
            int getColorCode(Color color)
            {
                return color.A << 24 | // DWM uses ABGR format
                       color.B << 16 |
                       color.G << 8 |
                       color.R;
            }

            var helper = new WindowInteropHelper(window);
            var accent = new AccentPolicy();
            var accentSize = Marshal.SizeOf(accent);
            accent.AccentState = state;
            accent.GradientColor = getColorCode(backgroundColor);
            var accentPointer = Marshal.AllocHGlobal(accentSize);
            Marshal.StructureToPtr(accent, accentPointer, false);
            var data = new WindowsCompostionAttributeData
            {
                Attribute = 19, //WindowCompositionAttribute.AccentPolicy
                SizeOfData = accentSize,
                Data = accentPointer,
            };

            SetWindowCompositionAttribute(helper.Handle, ref data);
            Marshal.FreeHGlobal(accentPointer);
        }
    }
}
