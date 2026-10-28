using System.Collections.Generic;
using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Net;
using System.Net.WebSockets;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Win32;

namespace AntigravityHansManager
{
    internal static class Program
    {
        [STAThread]
        private static void Main(string[] args)
        {
            Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
            Application.ThreadException += (s, e) => {
                MessageBox.Show("程序发生异常: " + (e.Exception != null ? e.Exception.Message : "未知错误"), "提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
            };
            AppDomain.CurrentDomain.UnhandledException += (s, e) => {
                MessageBox.Show("程序发生异常: " + (e.ExceptionObject != null ? e.ExceptionObject.ToString() : "未知错误"), "提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
            };
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            if (args != null && args.Length > 0 && string.Equals(args[0], "/auto-heal", StringComparison.OrdinalIgnoreCase))
            {
                MainForm.RunSilentHeal();
                return;
            }
            try
            {
                Application.Run(new MainForm());
            }
            catch (Exception ex)
            {
                MessageBox.Show("程序启动错误: " + ex.Message, "提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }

    public class M3Card : Panel
    {
        public int CornerRadius { get; set; }
        public Color CardBackColor { get; set; }
        public Color BorderColor { get; set; }

        public M3Card()
        {
            SetStyle(ControlStyles.UserPaint | ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer, true);
            DoubleBuffered = true;
            CornerRadius = 10;
            CardBackColor = Color.FromArgb(25, 26, 30);
            BorderColor = Color.FromArgb(42, 44, 50);
            BackColor = Color.FromArgb(16, 17, 20);
        }

        protected override void OnControlAdded(ControlEventArgs e)
        {
            base.OnControlAdded(e);
            if (e.Control != null && !(e.Control is M3Button) && !(e.Control is M3PillBadge) && !(e.Control is TextBox) && !(e.Control is ListView))
            {
                e.Control.BackColor = CardBackColor;
            }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            try
            {
                if (Width <= 4 || Height <= 4) return;
                Graphics g = e.Graphics;
                g.SmoothingMode = SmoothingMode.AntiAlias;
                Rectangle rect = new Rectangle(0, 0, Width - 1, Height - 1);
                using (GraphicsPath path = CreateRoundedRectanglePath(rect, CornerRadius))
                {
                    if (path != null)
                    {
                        using (SolidBrush brush = new SolidBrush(CardBackColor))
                        {
                            g.FillPath(brush, path);
                        }
                        using (Pen pen = new Pen(BorderColor, 1f))
                        {
                            g.DrawPath(pen, path);
                        }
                    }
                }
            }
            catch {}
        }

        public static GraphicsPath CreateRoundedRectanglePath(Rectangle rect, int radius)
        {
            GraphicsPath path = new GraphicsPath();
            if (rect.Width <= 4 || rect.Height <= 4)
            {
                path.AddRectangle(rect);
                return path;
            }
            int d = radius * 2;
            if (d > rect.Width) d = rect.Width;
            if (d > rect.Height) d = rect.Height;
            if (d <= 0) d = 2;
            path.AddArc(rect.X, rect.Y, d, d, 180, 90);
            path.AddArc(rect.Right - d, rect.Y, d, d, 270, 90);
            path.AddArc(rect.Right - d, rect.Bottom - d, d, d, 0, 90);
            path.AddArc(rect.X, rect.Bottom - d, d, d, 90, 90);
            path.CloseFigure();
            return path;
        }
    }

    public class M3Button : Button
    {
        public bool IsPrimary { get; set; }
        public bool IsAccent { get; set; }
        public bool IsDanger { get; set; }
        public bool IsSelected { get; set; }
        public int CornerRadius { get; set; }
        private bool isHovered = false;
        private bool isPressed = false;

        public M3Button()
        {
            SetStyle(ControlStyles.UserPaint | ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer, true);
            DoubleBuffered = true;
            FlatStyle = FlatStyle.Flat;
            FlatAppearance.BorderSize = 0;
            CornerRadius = 8;
            Cursor = Cursors.Hand;
            Font = new Font("Microsoft YaHei UI", 9.5f, FontStyle.Bold);
            BackColor = Color.FromArgb(25, 26, 30);
        }

        protected override void OnMouseEnter(EventArgs e) { isHovered = true; Invalidate(); base.OnMouseEnter(e); }
        protected override void OnMouseLeave(EventArgs e) { isHovered = false; isPressed = false; Invalidate(); base.OnMouseLeave(e); }
        protected override void OnMouseDown(MouseEventArgs mevent) { isPressed = true; Invalidate(); base.OnMouseDown(mevent); }
        protected override void OnMouseUp(MouseEventArgs mevent) { isPressed = false; Invalidate(); base.OnMouseUp(mevent); }

        protected override void OnPaint(PaintEventArgs pevent)
        {
            try
            {
                if (Width <= 4 || Height <= 4) return;
                Graphics g = pevent.Graphics;
                g.SmoothingMode = SmoothingMode.AntiAlias;
                Rectangle rect = new Rectangle(0, 0, Width - 1, Height - 1);

                Color bg;
                Color fg;
                Color border;

                if (IsPrimary || IsAccent)
                {
                    fg = Color.FromArgb(255, 255, 255);
                    border = Color.Transparent;
                    if (isPressed) bg = Color.FromArgb(21, 88, 214);
                    else if (isHovered) bg = Color.FromArgb(30, 136, 229);
                    else bg = Color.FromArgb(26, 115, 232);
                }
                else if (IsDanger)
                {
                    fg = Color.FromArgb(252, 165, 165);
                    if (isPressed) { bg = Color.FromArgb(32, 27, 27); border = Color.FromArgb(90, 50, 50); }
                    else if (isHovered) { bg = Color.FromArgb(51, 37, 37); border = Color.FromArgb(110, 68, 68); }
                    else { bg = Color.FromArgb(37, 38, 43); border = Color.FromArgb(74, 53, 53); }
                }
                else if (IsSelected)
                {
                    fg = Color.FromArgb(255, 255, 255);
                    border = Color.FromArgb(37, 99, 235);
                    bg = Color.FromArgb(30, 41, 59);
                }
                else
                {
                    fg = Color.FromArgb(229, 231, 235);
                    if (isPressed) { bg = Color.FromArgb(30, 31, 35); border = Color.FromArgb(50, 53, 60); }
                    else if (isHovered) { bg = Color.FromArgb(47, 49, 55); border = Color.FromArgb(78, 81, 93); }
                    else { bg = Color.FromArgb(37, 38, 43); border = Color.FromArgb(56, 58, 66); }
                }

                using (GraphicsPath path = M3Card.CreateRoundedRectanglePath(rect, CornerRadius))
                {
                    if (path != null)
                    {
                        using (SolidBrush brush = new SolidBrush(bg))
                        {
                            g.FillPath(brush, path);
                        }
                        if (border != Color.Transparent)
                        {
                            using (Pen pen = new Pen(border, 1f))
                            {
                                g.DrawPath(pen, path);
                            }
                        }
                    }
                }

                TextRenderer.DrawText(g, Text, Font, rect, fg, TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
            }
            catch {}
        }
    }

    public class M3PillBadge : Control
    {
        public bool IsSuccess { get; set; }
        public bool IsWarning { get; set; }
        public bool IsSafeMode { get; set; }
        public string BadgeText { get; set; }

        public M3PillBadge()
        {
            SetStyle(ControlStyles.UserPaint | ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer, true);
            DoubleBuffered = true;
            BadgeText = "正在检测";
            Font = new Font("Microsoft YaHei UI", 8.5f, FontStyle.Bold);
            Size = new Size(182, 30);
            BackColor = Color.FromArgb(25, 26, 30);
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            try
            {
                if (Width <= 4 || Height <= 4) return;
                Graphics g = e.Graphics;
                g.SmoothingMode = SmoothingMode.AntiAlias;
                Rectangle rect = new Rectangle(0, 0, Width - 1, Height - 1);

                Color bg;
                Color border;
                Color textCol;
                Color dotColor;

                if (IsSafeMode)
                {
                    bg = Color.FromArgb(19, 46, 31);
                    border = Color.FromArgb(30, 86, 53);
                    textCol = Color.FromArgb(134, 239, 172);
                    dotColor = Color.FromArgb(74, 222, 128);
                }
                else if (IsSuccess)
                {
                    bg = Color.FromArgb(23, 37, 84);
                    border = Color.FromArgb(30, 64, 175);
                    textCol = Color.FromArgb(147, 197, 253);
                    dotColor = Color.FromArgb(96, 165, 250);
                }
                else if (IsWarning)
                {
                    bg = Color.FromArgb(51, 39, 20);
                    border = Color.FromArgb(107, 79, 27);
                    textCol = Color.FromArgb(253, 230, 138);
                    dotColor = Color.FromArgb(251, 191, 36);
                }
                else
                {
                    bg = Color.FromArgb(37, 38, 42);
                    border = Color.FromArgb(61, 64, 70);
                    textCol = Color.FromArgb(209, 213, 219);
                    dotColor = Color.FromArgb(156, 163, 175);
                }

                using (GraphicsPath path = M3Card.CreateRoundedRectanglePath(rect, Height / 2))
                {
                    if (path != null)
                    {
                        using (SolidBrush brush = new SolidBrush(bg))
                        {
                            g.FillPath(brush, path);
                        }
                        using (Pen pen = new Pen(border, 1f))
                        {
                            g.DrawPath(pen, path);
                        }
                    }
                }

                int dotRadius = 3;
                int dotX = 14;
                int dotY = Height / 2;
                using (SolidBrush dotBrush = new SolidBrush(dotColor))
                {
                    g.FillEllipse(dotBrush, dotX - dotRadius, dotY - dotRadius, dotRadius * 2, dotRadius * 2);
                }

                Rectangle textRect = new Rectangle(24, 0, Width - 28, Height);
                TextRenderer.DrawText(g, BadgeText, Font, textRect, textCol, TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
            }
            catch {}
        }
    }

    public class M3LinearProgressBar : Control
    {
        private System.Windows.Forms.Timer animTimer;
        private int offset = 0;
        private bool isRunning = false;

        public M3LinearProgressBar()
        {
            DoubleBuffered = true;
            Height = 2;
            BackColor = Color.FromArgb(30, 31, 34);
            animTimer = new System.Windows.Forms.Timer();
            animTimer.Interval = 20;
            animTimer.Tick += (s, e) =>
            {
                try
                {
                    offset = (offset + 6) % (Math.Max(Width, 1) + 120);
                    Invalidate();
                }
                catch {}
            };
        }

        public void Start()
        {
            isRunning = true;
            offset = 0;
            Visible = true;
            if (animTimer != null) animTimer.Start();
        }

        public void Stop()
        {
            isRunning = false;
            if (animTimer != null) animTimer.Stop();
            Visible = false;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && animTimer != null)
            {
                animTimer.Stop();
                animTimer.Dispose();
                animTimer = null;
            }
            base.Dispose(disposing);
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            try
            {
                if (!isRunning || Width <= 0 || Height <= 0) return;
                Graphics g = e.Graphics;
                int barWidth = 120;
                Rectangle barRect = new Rectangle(offset - barWidth, 0, barWidth, Height);
                using (SolidBrush brush = new SolidBrush(Color.FromArgb(168, 199, 250)))
                {
                    g.FillRectangle(brush, barRect);
                }
            }
            catch {}
        }
    }

    public static class CacheCleaner
    {
        public static long GetCacheSize()
        {
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string[] subDirs = new string[] { "Cache", "Code Cache", "GPUCache", "DawnWebGPUCache", @"Crashpad\reports" };
            long total = 0;
            foreach (string sub in subDirs)
            {
                string p = Path.Combine(appData, "antigravity", sub);
                total += GetDirSize(p);
            }
            return total;
        }

        private static long GetDirSize(string dirPath)
        {
            if (!Directory.Exists(dirPath)) return 0;
            long size = 0;
            try
            {
                string[] files = Directory.GetFiles(dirPath, "*", SearchOption.AllDirectories);
                foreach (string f in files)
                {
                    try { size += new FileInfo(f).Length; } catch {}
                }
            }
            catch {}
            return size;
        }

        public static long CleanCache()
        {
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string[] subDirs = new string[] { "Cache", "Code Cache", "GPUCache", "DawnWebGPUCache", @"Crashpad\reports" };
            long cleaned = 0;
            foreach (string sub in subDirs)
            {
                string dir = Path.Combine(appData, "antigravity", sub);
                if (!Directory.Exists(dir)) continue;
                try
                {
                    string[] files = Directory.GetFiles(dir, "*", SearchOption.AllDirectories);
                    foreach (string f in files)
                    {
                        try
                        {
                            FileInfo fi = new FileInfo(f);
                            long len = fi.Length;
                            fi.Delete();
                            cleaned += len;
                        }
                        catch {}
                    }
                }
                catch {}
            }
            return cleaned;
        }
    }

    /// <summary>
    /// 词条模型与用户自定义词库管理服务
    /// </summary>
    public class DictEntry
    {
        public string English { get; set; }
        public string DefaultZh { get; set; }
        public string CustomZh { get; set; }
        public bool IsCustom { get { return !string.IsNullOrEmpty(CustomZh) && CustomZh != DefaultZh; } }
        public string ActiveZh { get { return IsCustom ? CustomZh : DefaultZh; } }
    }

    public static class CustomDictService
    {
        private static List<DictEntry> allEntries = new List<DictEntry>();
        private static Dictionary<string, string> customMap = new Dictionary<string, string>(StringComparer.Ordinal);
        private static bool isInitialized = false;

        public static string GetConfigFilePath()
        {
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string dir = Path.Combine(appData, "Antigravity");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            return Path.Combine(dir, "user_custom_dict.json");
        }

        public static void Initialize(string rawSnippet)
        {
            if (isInitialized && allEntries.Count > 0) return;
            allEntries.Clear();
            customMap.Clear();

            // 1. 读取用户本地已有的自定义词库
            LoadUserCustomFile();

            // 2. 从内置脚本中正则提取默认词条
            if (!string.IsNullOrEmpty(rawSnippet))
            {
                MatchCollection matches = Regex.Matches(rawSnippet, @"\[\s*""((?:\\.|[^""\\])*)""\s*,\s*""((?:\\.|[^""\\])*)""\s*\]");
                Dictionary<string, string> seen = new Dictionary<string, string>(StringComparer.Ordinal);
                foreach (Match m in matches)
                {
                    string en = UnescapeJsString(m.Groups[1].Value);
                    string zh = UnescapeJsString(m.Groups[2].Value);
                    if (!seen.ContainsKey(en))
                    {
                        seen[en] = zh;
                        DictEntry entry = new DictEntry();
                        entry.English = en;
                        entry.DefaultZh = zh;
                        if (customMap.ContainsKey(en))
                        {
                            entry.CustomZh = customMap[en];
                        }
                        allEntries.Add(entry);
                    }
                }
            }

            // 3. 将用户额外新增的独有词条也挂入列表
            foreach (var kvp in customMap)
            {
                bool exists = false;
                foreach (var e in allEntries)
                {
                    if (e.English == kvp.Key) { exists = true; break; }
                }
                if (!exists)
                {
                    DictEntry ne = new DictEntry();
                    ne.English = kvp.Key;
                    ne.DefaultZh = "(用户自增词条)";
                    ne.CustomZh = kvp.Value;
                    allEntries.Add(ne);
                }
            }

            isInitialized = true;
        }

        private static void LoadUserCustomFile()
        {
            try
            {
                string path = GetConfigFilePath();
                if (File.Exists(path))
                {
                    string json = File.ReadAllText(path, Encoding.UTF8);
                    ParseJsonToMap(json, customMap);
                }
            }
            catch {}
        }

        public static void SaveUserCustomFile()
        {
            try
            {
                string path = GetConfigFilePath();
                string json = SerializeMapToJson(customMap);
                File.WriteAllText(path, json, Encoding.UTF8);
            }
            catch {}
        }

        public static List<DictEntry> GetAllEntries()
        {
            return allEntries;
        }

        public static int GetCustomCount()
        {
            return customMap.Count;
        }

        public static void SetCustomWord(string en, string zh)
        {
            if (string.IsNullOrEmpty(en)) return;
            en = en.Trim();
            zh = (zh ?? "").Trim();

            DictEntry found = null;
            foreach (var e in allEntries)
            {
                if (e.English == en) { found = e; break; }
            }

            if (found != null)
            {
                if (string.IsNullOrEmpty(zh) || zh == found.DefaultZh)
                {
                    found.CustomZh = null;
                    if (customMap.ContainsKey(en)) customMap.Remove(en);
                }
                else
                {
                    found.CustomZh = zh;
                    customMap[en] = zh;
                }
            }
            else
            {
                if (!string.IsNullOrEmpty(zh))
                {
                    DictEntry ne = new DictEntry();
                    ne.English = en;
                    ne.DefaultZh = "(用户自增词条)";
                    ne.CustomZh = zh;
                    allEntries.Add(ne);
                    customMap[en] = zh;
                }
            }
            SaveUserCustomFile();
        }

        public static void ResetWord(string en)
        {
            if (string.IsNullOrEmpty(en)) return;
            en = en.Trim();
            foreach (var e in allEntries)
            {
                if (e.English == en)
                {
                    e.CustomZh = null;
                    break;
                }
            }
            if (customMap.ContainsKey(en)) customMap.Remove(en);
            SaveUserCustomFile();
        }

        public static void ClearAllCustom()
        {
            customMap.Clear();
            foreach (var e in allEntries)
            {
                e.CustomZh = null;
            }
            SaveUserCustomFile();
        }

        public static string GetCustomDictJson()
        {
            return SerializeMapToJson(customMap);
        }

        public static bool ImportJson(string json)
        {
            try
            {
                Dictionary<string, string> imported = new Dictionary<string, string>(StringComparer.Ordinal);
                ParseJsonToMap(json, imported);
                foreach (var kvp in imported)
                {
                    SetCustomWord(kvp.Key, kvp.Value);
                }
                SaveUserCustomFile();
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static void ParseJsonToMap(string json, Dictionary<string, string> map)
        {
            if (string.IsNullOrEmpty(json)) return;
            MatchCollection mc = Regex.Matches(json, @"\""((?:\\.|[^\""\\])*)\""\s*:\s*\""((?:\\.|[^\""\\])*)\""");
            foreach (Match m in mc)
            {
                string k = UnescapeJsString(m.Groups[1].Value);
                string v = UnescapeJsString(m.Groups[2].Value);
                map[k] = v;
            }
        }

        private static string SerializeMapToJson(Dictionary<string, string> map)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("{");
            int idx = 0;
            foreach (var kvp in map)
            {
                sb.Append("  ");
                sb.Append(CdpMemoryInjector.ToJsonString(kvp.Key));
                sb.Append(": ");
                sb.Append(CdpMemoryInjector.ToJsonString(kvp.Value));
                if (idx < map.Count - 1) sb.Append(",");
                sb.AppendLine();
                idx++;
            }
            sb.Append("}");
            return sb.ToString();
        }

        private static string UnescapeJsString(string str)
        {
            if (string.IsNullOrEmpty(str)) return "";
            return str.Replace("\\\"", "\"")
                      .Replace("\\\\", "\\")
                      .Replace("\\n", "\n")
                      .Replace("\\r", "\r")
                      .Replace("\\t", "\t");
        }
    }

    /// <summary>
    /// 原生 CDP 调试协议与纯内存无痕注入引擎
    /// 零 Python · 纯后台静默无黑框 · 绝不改动本地磁盘 asar · 零封号
    /// </summary>
    public static class CdpMemoryInjector
    {
        public static bool ProbeCdpActive(int port)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(string.Format("http://127.0.0.1:{0}/json", port));
                req.Timeout = 400;
                req.ReadWriteTimeout = 400;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    return resp.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        public static int DetectActivePort()
        {
            try
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string[] candidateFiles = new string[]
                {
                    Path.Combine(appData, "Antigravity", "DevToolsActivePort"),
                    Path.Combine(appData, "antigravity", "DevToolsActivePort")
                };

                foreach (string portFile in candidateFiles)
                {
                    if (File.Exists(portFile))
                    {
                        string[] lines = File.ReadAllLines(portFile);
                        if (lines != null && lines.Length > 0)
                        {
                            int p;
                            if (int.TryParse(lines[0].Trim(), out p) && p > 0)
                            {
                                if (ProbeCdpActive(p)) return p;
                            }
                        }
                    }
                }
            }
            catch {}

            if (ProbeCdpActive(9222)) return 9222;
            if (ProbeCdpActive(23664)) return 23664;

            return 0;
        }

        public static bool InjectScript(int port, string script, out string error)
        {
            error = "";
            try
            {
                string jsonUrl = string.Format("http://127.0.0.1:{0}/json", port);
                string json = "";
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(jsonUrl);
                req.Timeout = 2500;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                using (StreamReader sr = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
                {
                    json = sr.ReadToEnd();
                }

                List<string> pageWsUrls = new List<string>();
                List<string> otherWsUrls = new List<string>();

                MatchCollection targetMatches = Regex.Matches(json, @"\{[^{}]*""webSocketDebuggerUrl""\s*:\s*""(ws://[^""]+)""[^{}]*\}");
                foreach (Match tm in targetMatches)
                {
                    string block = tm.Value;
                    string ws = tm.Groups[1].Value;
                    if (block.Contains("\"type\":\"page\"") || Regex.IsMatch(block, @"""type""\s*:\s*""page"""))
                    {
                        pageWsUrls.Add(ws);
                    }
                    else if (!block.Contains("\"type\":\"worker\"") && !Regex.IsMatch(block, @"""type""\s*:\s*""worker"""))
                    {
                        otherWsUrls.Add(ws);
                    }
                }

                List<string> targetUrls = pageWsUrls.Count > 0 ? pageWsUrls : otherWsUrls;
                if (targetUrls.Count == 0)
                {
                    MatchCollection allWs = Regex.Matches(json, @"""webSocketDebuggerUrl""\s*:\s*""(ws://[^""]+)""");
                    foreach (Match m in allWs)
                    {
                        targetUrls.Add(m.Groups[1].Value);
                    }
                }

                if (targetUrls.Count == 0)
                {
                    error = "未发现活动的前端渲染窗口 (等待页面就绪中)";
                    return false;
                }

                bool anySuccess = false;
                foreach (string wsUrl in targetUrls)
                {
                    if (ExecuteScriptOnWs(wsUrl, script))
                    {
                        anySuccess = true;
                    }
                }

                if (!anySuccess)
                {
                    error = "向渲染窗口发送注入指令超时或连接失败";
                    return false;
                }
                return true;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                return false;
            }
        }

        public static bool PushCustomDictToClient(int port, string dictJson, out string error)
        {
            error = "";
            if (port <= 0)
            {
                error = "客户端未运行或未开启调试端口";
                return false;
            }
            string js = "(function(){ try { var d = " + (string.IsNullOrEmpty(dictJson) ? "{}" : dictJson) + "; window.__antigravityCustomDict = d; if(typeof window.updateAntigravityCustomDict === 'function'){ window.updateAntigravityCustomDict(d); } else if(typeof window.reapplyAntigravityZh === 'function'){ window.reapplyAntigravityZh(); } } catch(e){} })();";
            return InjectScript(port, js, out error);
        }

        private static bool ExecuteScriptOnWs(string wsUrl, string script)
        {
            try
            {
                using (ClientWebSocket ws = new ClientWebSocket())
                {
                    CancellationTokenSource cts = new CancellationTokenSource(5000);
                    ws.ConnectAsync(new Uri(wsUrl), cts.Token).Wait();
                    if (ws.State != WebSocketState.Open) return false;

                    SendWsText(ws, "{\"id\":1,\"method\":\"Page.enable\",\"params\":{}}");

                    string addScriptJson = "{\"id\":2,\"method\":\"Page.addScriptToEvaluateOnNewDocument\",\"params\":{\"source\":" + ToJsonString(script) + "}}";
                    SendWsText(ws, addScriptJson);

                    string evalJson = "{\"id\":3,\"method\":\"Runtime.evaluate\",\"params\":{\"expression\":" + ToJsonString(script) + ",\"userGesture\":true,\"awaitPromise\":true}}";
                    SendWsText(ws, evalJson);

                    try
                    {
                        byte[] buffer = new byte[4096];
                        CancellationTokenSource recvCts = new CancellationTokenSource(2500);
                        var recvTask = ws.ReceiveAsync(new ArraySegment<byte>(buffer), recvCts.Token);
                        recvTask.Wait();
                    }
                    catch {}

                    try { ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Done", CancellationToken.None).Wait(300); } catch {}
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        private static void SendWsText(ClientWebSocket ws, string text)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(text);
            ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None).Wait();
        }

        public static string ToJsonString(string text)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append('"');
            foreach (char c in text)
            {
                switch (c)
                {
                    case '\\': sb.Append("\\\\"); break;
                    case '\"': sb.Append("\\\""); break;
                    case '\n': sb.Append("\\n"); break;
                    case '\r': sb.Append("\\r"); break;
                    case '\t': sb.Append("\\t"); break;
                    case '\b': sb.Append("\\b"); break;
                    case '\f': sb.Append("\\f"); break;
                    default:
                        if (c < ' ')
                        {
                            sb.AppendFormat("\\u{0:x4}", (int)c);
                        }
                        else
                        {
                            sb.Append(c);
                        }
                        break;
                }
            }
            sb.Append('"');
            return sb.ToString();
        }

        public static bool ReloadPages(int port)
        {
            try
            {
                string jsonUrl = string.Format("http://127.0.0.1:{0}/json", port);
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(jsonUrl);
                req.Timeout = 2500;
                string json = "";
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                using (StreamReader sr = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
                {
                    json = sr.ReadToEnd();
                }

                MatchCollection allWs = Regex.Matches(json, @"""webSocketDebuggerUrl""\s*:\s*""(ws://[^""]+)""");
                foreach (Match m in allWs)
                {
                    string ws = m.Groups[1].Value;
                    ExecuteScriptOnWs(ws, "window.__antigravityStandaloneZhInstalled = false; location.reload();");
                }
                return true;
            }
            catch { return false; }
        }
    }


    /// <summary>
    /// 原生极速微创 ASAR 打补丁引擎
    /// 0.05 秒就地动态修补 preload.js · 彻底免除内嵌数兆字节 ASAR 归档 · 体积暴降 90%
    /// 跨官方版本自适应兼容 · 零封号 · 零外部依赖
    /// </summary>
    public static class MiniAsarPatcher
    {
        public static bool ApplyPatch(string asarPath, string zhSnippet, out string error)
        {
            error = "";
            try
            {
                if (!File.Exists(asarPath))
                {
                    error = "未找到目标 app.asar 文件";
                    return false;
                }

                byte[] asarBytes = File.ReadAllBytes(asarPath);
                if (asarBytes.Length < 16)
                {
                    error = "目标 app.asar 文件损坏或过小";
                    return false;
                }

                uint u0 = BitConverter.ToUInt32(asarBytes, 0);
                uint u4 = BitConverter.ToUInt32(asarBytes, 4);
                uint u8 = BitConverter.ToUInt32(asarBytes, 8);
                uint u12 = BitConverter.ToUInt32(asarBytes, 12);

                int headerLen = (int)u12;
                if (headerLen <= 0 || 16 + headerLen > asarBytes.Length)
                {
                    error = "无法解析 ASAR 头部结构";
                    return false;
                }

                string headerJson = Encoding.UTF8.GetString(asarBytes, 16, headerLen);
                int oldDataBaseOffset = (int)(8 + u4);
                int oldDataPayloadSize = asarBytes.Length - oldDataBaseOffset;
                if (oldDataBaseOffset <= 0 || oldDataPayloadSize <= 0)
                {
                    error = "ASAR 数据区结构异常";
                    return false;
                }

                Match mPreload = Regex.Match(headerJson, @"""preload\.js""\s*:\s*\{[\s\S]*?""offset""\s*:\s*""\d+""[\s\S]*?\}\}");
                if (!mPreload.Success)
                {
                    error = "未在 ASAR 头部树中找到 dist/preload.js 节点";
                    return false;
                }

                string preloadBlock = mPreload.Value;
                Match mSize = Regex.Match(preloadBlock, @"""size""s*:s*(d+)");
                Match mOffset = Regex.Match(preloadBlock, @"""offset""s*:s*""(d+)""");
                if (!mSize.Success || !mOffset.Success)
                {
                    error = "未能解析 preload.js 的 size 或 offset";
                    return false;
                }

                int oldPreloadSize = int.Parse(mSize.Groups[1].Value);
                int oldPreloadOffset = int.Parse(mOffset.Groups[1].Value);

                int absOldPreloadStart = oldDataBaseOffset + oldPreloadOffset;
                if (absOldPreloadStart + oldPreloadSize > asarBytes.Length)
                {
                    error = "preload.js 偏移量超出文件物理边界";
                    return false;
                }

                byte[] oldPreloadBytes = new byte[oldPreloadSize];
                Array.Copy(asarBytes, absOldPreloadStart, oldPreloadBytes, 0, oldPreloadSize);
                string oldPreloadStr = Encoding.UTF8.GetString(oldPreloadBytes);

                string baseCode = oldPreloadStr;
                int idxMarker = baseCode.IndexOf("/* __ANTIGRAVITY_ZH_ENGINE_V2__ */");
                if (idxMarker > 0)
                {
                    baseCode = baseCode.Substring(0, idxMarker);
                }

                string newPreloadStr = baseCode.TrimEnd() + "\n\n/* __ANTIGRAVITY_ZH_ENGINE_V2__ */\n" + zhSnippet;
                byte[] newPreloadBytes = Encoding.UTF8.GetBytes(newPreloadStr);

                string newHash;
                using (var sha = System.Security.Cryptography.SHA256.Create())
                {
                    byte[] hashBytes = sha.ComputeHash(newPreloadBytes);
                    StringBuilder sbH = new StringBuilder();
                    foreach (byte b in hashBytes) sbH.Append(b.ToString("x2"));
                    newHash = sbH.ToString();
                }

                string newPreloadBlock = string.Format(
                    "\"preload.js\":{{\"size\":{0},\"offset\":\"{1}\",\"integrity\":{{\"algorithm\":\"SHA256\",\"hash\":\"{2}\",\"blockSize\":4194304,\"blocks\":[\"{2}\"]}}}}",
                    newPreloadBytes.Length,
                    oldDataPayloadSize,
                    newHash
                );

                string newHeaderJson = headerJson.Substring(0, mPreload.Index) + newPreloadBlock + headerJson.Substring(mPreload.Index + mPreload.Length);
                byte[] newHeaderJsonBytes = Encoding.UTF8.GetBytes(newHeaderJson);

                int jsonLen = newHeaderJsonBytes.Length;
                int jsonPadding = (4 - (jsonLen % 4)) % 4;
                uint newHeaderPicklePayloadSize = (uint)(jsonLen + jsonPadding + 8);
                uint newHeaderStrSize = (uint)(jsonLen + jsonPadding + 4);

                byte[] newPickleHeader = new byte[16];
                Buffer.BlockCopy(BitConverter.GetBytes((uint)4), 0, newPickleHeader, 0, 4);
                Buffer.BlockCopy(BitConverter.GetBytes(newHeaderPicklePayloadSize), 0, newPickleHeader, 4, 4);
                Buffer.BlockCopy(BitConverter.GetBytes(newHeaderStrSize), 0, newPickleHeader, 8, 4);
                Buffer.BlockCopy(BitConverter.GetBytes((uint)jsonLen), 0, newPickleHeader, 12, 4);

                string tmpAsar = asarPath + ".tmp_patch";
                using (FileStream fs = new FileStream(tmpAsar, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    fs.Write(newPickleHeader, 0, 16);
                    fs.Write(newHeaderJsonBytes, 0, jsonLen);
                    if (jsonPadding > 0)
                    {
                        byte[] pad = new byte[jsonPadding];
                        fs.Write(pad, 0, jsonPadding);
                    }
                    fs.Write(asarBytes, oldDataBaseOffset, oldDataPayloadSize);
                    fs.Write(newPreloadBytes, 0, newPreloadBytes.Length);
                }

                if (File.Exists(asarPath)) File.Delete(asarPath);
                File.Move(tmpAsar, asarPath);
                return true;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                return false;
            }
        }
    }

    public class MainForm : Form
    {
        // 顶部 Header 与导航栏
        private M3Card cardHeader;
        private Label lblAppTitle;
        private Label lblSubTitle;
        private M3PillBadge pillStatus;
        private M3LinearProgressBar progressBar;

        private M3Button btnNavControl;
        private M3Button btnNavDict;
        private M3Button btnNavAbout;

        // 三个主工作面板
        private Panel panelControl;
        private Panel panelDict;
        private Panel panelAbout;

        // 面板三：关于与致谢控件
        private M3Card cardSponsor;
        private PictureBox picSponsor;
        private Label lblSponsorQuote;
        private Label lblSponsorDesc;
        private M3Card cardCopyright;
        private Label lblCopyrightHeader;
        private Label lblCopyrightBody;
        private Label btnSponsorFooter;
        private M3Button btnOpenGitHub;

        // 面板一：汉化控制中心控件
        private M3Card cardSafeMode;
        private Label lblSafeModeHeader;
        private Label lblSafeModeDesc;
        private M3Button btnSafeStart;

        private M3Card cardSolidMode;
        private Label lblSolidModeHeader;
        private Label lblSolidModeDesc;
        private M3Button btnInstall;
        private M3Button btnRestore;

        private M3Card cardSettings;
        private Label lblSettingsHeader;
        private CheckBox chkAutoHeal;
        private Label lblAutoHealDesc;
        private CheckBox chkLargeMemory;
        private Label lblLargeMemoryDesc;
        private CheckBox chkHookShortcut;
        private Label lblHookShortcutDesc;

        private M3Card cardMaintenance;
        private Label lblMaintHeader;
        private Label lblCacheSize;
        private M3Button btnCleanCache;

        // 面板二：词条自定义中心控件
        private M3Card cardDictSearch;
        private TextBox txtSearch;
        private Label lblDictStats;
        private CheckBox chkOnlyCustom;

        private M3Card cardDictList;
        private ListView listDict;

        private M3Card cardDictEdit;
        private Label lblEditTitle;
        private TextBox txtEditEn;
        private TextBox txtEditZh;
        private M3Button btnSaveWord;
        private M3Button btnResetWord;

        private M3Button btnApplyHot;
        private M3Button btnExportDict;
        private M3Button btnImportDict;
        private M3Button btnClearAllCustom;

        private Label lblTip;
        private string appPath = "";
        private string hostVersion = "";
        private System.Windows.Forms.Timer pollTimer;
        private bool memoryZhEnabled = true;

        public const string APP_VERSION = "v2.27.0";
        private string latestVersion = "";
        private string latestDownloadUrl = "";
        private string latestReleaseNotes = "";
        private bool isCheckingUpdate = false;
        private M3Button btnUpdateNotice;
        private M3Button btnCheckUpdate;

        public MainForm()
        {
            InitializeComponent();
            LocateAntigravity();
            LoadConfig();
            InitDictionaryData();
            RefreshState();
            StartBackgroundPoll();
            CheckUpdateAsync(true);
        }

        private void InitializeComponent()
        {
            Text = "Antigravity 汉化工具 " + APP_VERSION;
            ClientSize = new Size(640, 740);
            MinimumSize = new Size(640, 740);
            MaximumSize = new Size(640, 740);
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedSingle;
            MaximizeBox = false;
            BackColor = Color.FromArgb(16, 17, 20);
            ForeColor = Color.FromArgb(227, 227, 227);
            Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Regular);

            try
            {
                Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            }
            catch
            {
                try
                {
                    string icoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app.ico");
                    if (File.Exists(icoPath)) Icon = new Icon(icoPath);
                }
                catch {}
            }

            progressBar = new M3LinearProgressBar();
            progressBar.Location = new Point(0, 0);
            progressBar.Width = 640;
            progressBar.Visible = false;
            Controls.Add(progressBar);

            // ====================================================================
            // 1. 顶部 Header 卡片 (宽 600)
            // ====================================================================
            cardHeader = new M3Card();
            cardHeader.Location = new Point(20, 14);
            cardHeader.Size = new Size(600, 76);

            lblAppTitle = new Label();
            lblAppTitle.Text = "Antigravity 汉化工具 " + APP_VERSION;
            lblAppTitle.Font = new Font("Microsoft YaHei UI", 12f, FontStyle.Bold);
            lblAppTitle.ForeColor = Color.FromArgb(243, 244, 246);
            lblAppTitle.BackColor = Color.FromArgb(25, 26, 30);
            lblAppTitle.Location = new Point(18, 14);
            lblAppTitle.AutoSize = true;

            btnUpdateNotice = new M3Button();
            btnUpdateNotice.Text = "发现新版本 (点击升级)";
            btnUpdateNotice.Font = new Font("Microsoft YaHei UI", 8.5f, FontStyle.Bold);
            btnUpdateNotice.Location = new Point(236, 12);
            btnUpdateNotice.Size = new Size(156, 28);
            btnUpdateNotice.IsPrimary = true;
            btnUpdateNotice.Visible = false;
            btnUpdateNotice.Click += (s, e) => PromptUpdateDialog();

            lblSubTitle = new Label();
            lblSubTitle.Text = "正在侦测本地客户端与运行状态...";
            lblSubTitle.Font = new Font("Microsoft YaHei UI", 8.5f);
            lblSubTitle.ForeColor = Color.FromArgb(156, 163, 175);
            lblSubTitle.BackColor = Color.FromArgb(25, 26, 30);
            lblSubTitle.Location = new Point(19, 44);
            lblSubTitle.AutoSize = true;

            pillStatus = new M3PillBadge();
            pillStatus.Location = new Point(400, 23);
            pillStatus.Size = new Size(182, 30);

            cardHeader.Controls.Add(lblAppTitle);
            cardHeader.Controls.Add(btnUpdateNotice);
            cardHeader.Controls.Add(lblSubTitle);
            cardHeader.Controls.Add(pillStatus);
            Controls.Add(cardHeader);

            // ====================================================================
            // 2. 现代 Tab 导航切换栏 (宽 600)
            // ====================================================================
            btnNavControl = new M3Button();
            btnNavControl.Text = "汉化控制中心";
            btnNavControl.Location = new Point(20, 96);
            btnNavControl.Size = new Size(193, 34);
            btnNavControl.IsSelected = true;
            btnNavControl.Click += (s, e) => SwitchTab(0);

            btnNavDict = new M3Button();
            btnNavDict.Text = "词条自定义中心";
            btnNavDict.Location = new Point(223, 96);
            btnNavDict.Size = new Size(193, 34);
            btnNavDict.IsSelected = false;
            btnNavDict.Click += (s, e) => SwitchTab(1);

            btnNavAbout = new M3Button();
            btnNavAbout.Text = "关于与致谢支持";
            btnNavAbout.Location = new Point(426, 96);
            btnNavAbout.Size = new Size(194, 34);
            btnNavAbout.IsSelected = false;
            btnNavAbout.Click += (s, e) => SwitchTab(2);

            Controls.Add(btnNavControl);
            Controls.Add(btnNavDict);
            Controls.Add(btnNavAbout);

            // ====================================================================
            // 3. 面板一：汉化控制中心 (panelControl)
            // ====================================================================
            panelControl = new Panel();
            panelControl.Location = new Point(20, 136);
            panelControl.Size = new Size(600, 500);
            panelControl.BackColor = Color.FromArgb(16, 17, 20);

            // 模式一
            cardSafeMode = new M3Card();
            cardSafeMode.Location = new Point(0, 0);
            cardSafeMode.Size = new Size(600, 102);

            lblSafeModeHeader = new Label();
            lblSafeModeHeader.Text = "模式一：安全纯内存静默模式 (零封号 · 官方推荐)";
            lblSafeModeHeader.Font = new Font("Microsoft YaHei UI", 10f, FontStyle.Bold);
            lblSafeModeHeader.ForeColor = Color.FromArgb(112, 181, 249);
            lblSafeModeHeader.BackColor = Color.FromArgb(25, 26, 30);
            lblSafeModeHeader.Location = new Point(18, 12);
            lblSafeModeHeader.AutoSize = true;

            lblSafeModeDesc = new Label();
            lblSafeModeDesc.Text = "官方 ASAR 保持 100% 原版签名；通过内存通道无痕注入，随用随开。";
            lblSafeModeDesc.Font = new Font("Microsoft YaHei UI", 8.5f);
            lblSafeModeDesc.ForeColor = Color.FromArgb(156, 163, 175);
            lblSafeModeDesc.BackColor = Color.FromArgb(25, 26, 30);
            lblSafeModeDesc.Location = new Point(18, 36);
            lblSafeModeDesc.Size = new Size(560, 18);

            btnSafeStart = new M3Button();
            btnSafeStart.Text = "安全启动官方原版 (纯内存中文)";
            btnSafeStart.IsPrimary = true;
            btnSafeStart.Location = new Point(18, 58);
            btnSafeStart.Size = new Size(564, 34);
            btnSafeStart.Click += BtnSafeStart_Click;

            cardSafeMode.Controls.Add(lblSafeModeHeader);
            cardSafeMode.Controls.Add(lblSafeModeDesc);
            cardSafeMode.Controls.Add(btnSafeStart);
            panelControl.Controls.Add(cardSafeMode);

            // 模式二
            cardSolidMode = new M3Card();
            cardSolidMode.Location = new Point(0, 110);
            cardSolidMode.Size = new Size(600, 102);

            lblSolidModeHeader = new Label();
            lblSolidModeHeader.Text = "模式二：深度固化模式 (打开即中文 · 零跳字)";
            lblSolidModeHeader.Font = new Font("Microsoft YaHei UI", 10f, FontStyle.Bold);
            lblSolidModeHeader.ForeColor = Color.FromArgb(229, 231, 235);
            lblSolidModeHeader.BackColor = Color.FromArgb(25, 26, 30);
            lblSolidModeHeader.Location = new Point(18, 12);
            lblSolidModeHeader.AutoSize = true;

            lblSolidModeDesc = new Label();
            lblSolidModeDesc.Text = "将精准补丁写入客户端，直接双击官方图标启动；支持随时一键出厂还原。";
            lblSolidModeDesc.Font = new Font("Microsoft YaHei UI", 8.5f);
            lblSolidModeDesc.ForeColor = Color.FromArgb(156, 163, 175);
            lblSolidModeDesc.BackColor = Color.FromArgb(25, 26, 30);
            lblSolidModeDesc.Location = new Point(18, 36);
            lblSolidModeDesc.Size = new Size(560, 18);

            btnInstall = new M3Button();
            btnInstall.Text = "一键深度固化汉化";
            btnInstall.IsPrimary = false;
            btnInstall.Location = new Point(18, 58);
            btnInstall.Size = new Size(276, 34);
            btnInstall.Click += BtnInstall_Click;

            btnRestore = new M3Button();
            btnRestore.Text = "恢复官方出厂原版";
            btnRestore.IsDanger = true;
            btnRestore.Location = new Point(306, 58);
            btnRestore.Size = new Size(276, 34);
            btnRestore.Click += BtnRestore_Click;

            cardSolidMode.Controls.Add(lblSolidModeHeader);
            cardSolidMode.Controls.Add(lblSolidModeDesc);
            cardSolidMode.Controls.Add(btnInstall);
            cardSolidMode.Controls.Add(btnRestore);
            panelControl.Controls.Add(cardSolidMode);

            // 系统偏好
            cardSettings = new M3Card();
            cardSettings.Location = new Point(0, 220);
            cardSettings.Size = new Size(600, 165);

            lblSettingsHeader = new Label();
            lblSettingsHeader.Text = "功能偏好与系统守护";
            lblSettingsHeader.Font = new Font("Microsoft YaHei UI", 10f, FontStyle.Bold);
            lblSettingsHeader.ForeColor = Color.FromArgb(229, 231, 235);
            lblSettingsHeader.BackColor = Color.FromArgb(25, 26, 30);
            lblSettingsHeader.Location = new Point(18, 10);
            lblSettingsHeader.AutoSize = true;

            chkAutoHeal = new CheckBox();
            chkAutoHeal.Text = "开启版本更新自愈守护 (推荐常开 · 永久免维护)";
            chkAutoHeal.ForeColor = Color.FromArgb(243, 244, 246);
            chkAutoHeal.BackColor = Color.FromArgb(25, 26, 30);
            chkAutoHeal.Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Bold);
            chkAutoHeal.Location = new Point(18, 34);
            chkAutoHeal.AutoSize = true;
            chkAutoHeal.CheckedChanged += (s, e) => { SetAutoHealRegistry(chkAutoHeal.Checked); SaveConfig(); };

            lblAutoHealDesc = new Label();
            lblAutoHealDesc.Text = "官方后台升级覆盖后，开机自动检测并静默恢复汉化，无需手动重刷";
            lblAutoHealDesc.Font = new Font("Microsoft YaHei UI", 8f);
            lblAutoHealDesc.ForeColor = Color.FromArgb(156, 163, 175);
            lblAutoHealDesc.BackColor = Color.FromArgb(25, 26, 30);
            lblAutoHealDesc.Location = new Point(38, 54);
            lblAutoHealDesc.Size = new Size(540, 16);

            chkLargeMemory = new CheckBox();
            chkLargeMemory.Text = "开启 V8 8GB 大内存守护 (防长会话崩溃)";
            chkLargeMemory.ForeColor = Color.FromArgb(243, 244, 246);
            chkLargeMemory.BackColor = Color.FromArgb(25, 26, 30);
            chkLargeMemory.Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Bold);
            chkLargeMemory.Location = new Point(18, 74);
            chkLargeMemory.AutoSize = true;
            chkLargeMemory.Checked = true;
            chkLargeMemory.CheckedChanged += (s, e) => { ApplyAllShortcutArgs(chkLargeMemory.Checked, chkHookShortcut != null && chkHookShortcut.Checked); SaveConfig(); };

            lblLargeMemoryDesc = new Label();
            lblLargeMemoryDesc.Text = "拉满 8GB 堆内存，彻底杜绝千步超大历史会话 ArrayBuffer 内存溢出黑屏";
            lblLargeMemoryDesc.Font = new Font("Microsoft YaHei UI", 8f);
            lblLargeMemoryDesc.ForeColor = Color.FromArgb(156, 163, 175);
            lblLargeMemoryDesc.BackColor = Color.FromArgb(25, 26, 30);
            lblLargeMemoryDesc.Location = new Point(38, 94);
            lblLargeMemoryDesc.Size = new Size(540, 16);

            chkHookShortcut = new CheckBox();
            chkHookShortcut.Text = "接管桌面与开始菜单快捷方式 (点开官方图标即中文)";
            chkHookShortcut.ForeColor = Color.FromArgb(243, 244, 246);
            chkHookShortcut.BackColor = Color.FromArgb(25, 26, 30);
            chkHookShortcut.Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Bold);
            chkHookShortcut.Location = new Point(18, 114);
            chkHookShortcut.AutoSize = true;
            chkHookShortcut.Checked = true;
            chkHookShortcut.CheckedChanged += (s, e) => { ApplyAllShortcutArgs(chkLargeMemory.Checked, chkHookShortcut.Checked); SaveConfig(); };

            lblHookShortcutDesc = new Label();
            lblHookShortcutDesc.Text = "一键为快捷方式注入调试与内存参数，无需从小工具点击启动";
            lblHookShortcutDesc.Font = new Font("Microsoft YaHei UI", 8f);
            lblHookShortcutDesc.ForeColor = Color.FromArgb(156, 163, 175);
            lblHookShortcutDesc.BackColor = Color.FromArgb(25, 26, 30);
            lblHookShortcutDesc.Location = new Point(38, 134);
            lblHookShortcutDesc.Size = new Size(540, 16);

            cardSettings.Controls.Add(lblSettingsHeader);
            cardSettings.Controls.Add(chkAutoHeal);
            cardSettings.Controls.Add(lblAutoHealDesc);
            cardSettings.Controls.Add(chkLargeMemory);
            cardSettings.Controls.Add(lblLargeMemoryDesc);
            cardSettings.Controls.Add(chkHookShortcut);
            cardSettings.Controls.Add(lblHookShortcutDesc);
            panelControl.Controls.Add(cardSettings);

            // 维护与清理
            cardMaintenance = new M3Card();
            cardMaintenance.Location = new Point(0, 393);
            cardMaintenance.Size = new Size(600, 70);

            lblMaintHeader = new Label();
            lblMaintHeader.Text = "客户端瘦身与缓存清理";
            lblMaintHeader.Font = new Font("Microsoft YaHei UI", 10f, FontStyle.Bold);
            lblMaintHeader.ForeColor = Color.FromArgb(229, 231, 235);
            lblMaintHeader.BackColor = Color.FromArgb(25, 26, 30);
            lblMaintHeader.Location = new Point(18, 12);
            lblMaintHeader.AutoSize = true;

            lblCacheSize = new Label();
            lblCacheSize.Text = "正在计算冗余缓存体积...";
            lblCacheSize.Font = new Font("Microsoft YaHei UI", 8.5f);
            lblCacheSize.ForeColor = Color.FromArgb(156, 163, 175);
            lblCacheSize.BackColor = Color.FromArgb(25, 26, 30);
            lblCacheSize.Location = new Point(18, 36);
            lblCacheSize.AutoSize = true;

            btnCleanCache = new M3Button();
            btnCleanCache.Text = "一键清理";
            btnCleanCache.Location = new Point(478, 16);
            btnCleanCache.Size = new Size(104, 36);
            btnCleanCache.Click += BtnCleanCache_Click;

            cardMaintenance.Controls.Add(lblMaintHeader);
            cardMaintenance.Controls.Add(lblCacheSize);
            cardMaintenance.Controls.Add(btnCleanCache);
            panelControl.Controls.Add(cardMaintenance);

            Controls.Add(panelControl);

            // ====================================================================
            // 4. 面板二：词条自定义中心 (panelDict)
            // ====================================================================
            panelDict = new Panel();
            panelDict.Location = new Point(20, 136);
            panelDict.Size = new Size(600, 500);
            panelDict.BackColor = Color.FromArgb(16, 17, 20);
            panelDict.Visible = false;

            // 搜索卡片
            cardDictSearch = new M3Card();
            cardDictSearch.Location = new Point(0, 0);
            cardDictSearch.Size = new Size(600, 58);

            txtSearch = new TextBox();
            txtSearch.Location = new Point(16, 16);
            txtSearch.Size = new Size(290, 26);
            txtSearch.BackColor = Color.FromArgb(35, 37, 42);
            txtSearch.ForeColor = Color.FromArgb(243, 244, 246);
            txtSearch.BorderStyle = BorderStyle.FixedSingle;
            txtSearch.Font = new Font("Microsoft YaHei UI", 9.5f);
            txtSearch.TextChanged += (s, e) => FilterDictionary();

            lblDictStats = new Label();
            lblDictStats.Text = "共 2,313 条词条 (已自定义 0 项)";
            lblDictStats.Location = new Point(316, 20);
            lblDictStats.AutoSize = true;
            lblDictStats.ForeColor = Color.FromArgb(168, 199, 250);
            lblDictStats.BackColor = Color.FromArgb(25, 26, 30);
            lblDictStats.Font = new Font("Microsoft YaHei UI", 8.5f, FontStyle.Bold);

            chkOnlyCustom = new CheckBox();
            chkOnlyCustom.Text = "仅看已自定义";
            chkOnlyCustom.Location = new Point(494, 18);
            chkOnlyCustom.AutoSize = true;
            chkOnlyCustom.ForeColor = Color.FromArgb(209, 213, 219);
            chkOnlyCustom.BackColor = Color.FromArgb(25, 26, 30);
            chkOnlyCustom.Font = new Font("Microsoft YaHei UI", 8.5f);
            chkOnlyCustom.CheckedChanged += (s, e) => FilterDictionary();

            cardDictSearch.Controls.Add(txtSearch);
            cardDictSearch.Controls.Add(lblDictStats);
            cardDictSearch.Controls.Add(chkOnlyCustom);
            panelDict.Controls.Add(cardDictSearch);

            // 列表卡片
            cardDictList = new M3Card();
            cardDictList.Location = new Point(0, 64);
            cardDictList.Size = new Size(600, 266);

            listDict = new ListView();
            listDict.Location = new Point(10, 10);
            listDict.Size = new Size(580, 246);
            listDict.View = View.Details;
            listDict.FullRowSelect = true;
            listDict.GridLines = true;
            listDict.HeaderStyle = ColumnHeaderStyle.Nonclickable;
            listDict.BackColor = Color.FromArgb(20, 21, 24);
            listDict.ForeColor = Color.FromArgb(227, 227, 227);
            listDict.BorderStyle = BorderStyle.None;
            listDict.Font = new Font("Microsoft YaHei UI", 8.8f);
            listDict.Columns.Add("英文原文 (原版)", 260);
            listDict.Columns.Add("中文翻译 (生效中)", 220);
            listDict.Columns.Add("状态", 80);
            listDict.SelectedIndexChanged += ListDict_SelectedIndexChanged;

            cardDictList.Controls.Add(listDict);
            panelDict.Controls.Add(cardDictList);

            // 编辑卡片
            cardDictEdit = new M3Card();
            cardDictEdit.Location = new Point(0, 336);
            cardDictEdit.Size = new Size(600, 94);

            lblEditTitle = new Label();
            lblEditTitle.Text = "选中上方词条修改自定义翻译 (或输入新英文新增)";
            lblEditTitle.Location = new Point(14, 10);
            lblEditTitle.AutoSize = true;
            lblEditTitle.ForeColor = Color.FromArgb(156, 163, 175);
            lblEditTitle.BackColor = Color.FromArgb(25, 26, 30);
            lblEditTitle.Font = new Font("Microsoft YaHei UI", 8.5f);

            txtEditEn = new TextBox();
            txtEditEn.Location = new Point(14, 32);
            txtEditEn.Size = new Size(220, 24);
            txtEditEn.BackColor = Color.FromArgb(35, 37, 42);
            txtEditEn.ForeColor = Color.FromArgb(243, 244, 246);
            txtEditEn.BorderStyle = BorderStyle.FixedSingle;

            txtEditZh = new TextBox();
            txtEditZh.Location = new Point(244, 32);
            txtEditZh.Size = new Size(220, 24);
            txtEditZh.BackColor = Color.FromArgb(35, 37, 42);
            txtEditZh.ForeColor = Color.FromArgb(243, 244, 246);
            txtEditZh.BorderStyle = BorderStyle.FixedSingle;

            btnSaveWord = new M3Button();
            btnSaveWord.Text = "保存";
            btnSaveWord.Location = new Point(474, 30);
            btnSaveWord.Size = new Size(54, 28);
            btnSaveWord.IsPrimary = true;
            btnSaveWord.Click += BtnSaveWord_Click;

            btnResetWord = new M3Button();
            btnResetWord.Text = "还原";
            btnResetWord.Location = new Point(534, 30);
            btnResetWord.Size = new Size(54, 28);
            btnResetWord.IsDanger = true;
            btnResetWord.Click += BtnResetWord_Click;

            Label lblHintEdit = new Label();
            lblHintEdit.Text = "提示：左侧为英文原词，右侧为您喜欢的中文；点击“保存”即可存入个性化词库。";
            lblHintEdit.Location = new Point(14, 66);
            lblHintEdit.AutoSize = true;
            lblHintEdit.ForeColor = Color.FromArgb(107, 114, 128);
            lblHintEdit.BackColor = Color.FromArgb(25, 26, 30);
            lblHintEdit.Font = new Font("Microsoft YaHei UI", 8f);

            cardDictEdit.Controls.Add(lblEditTitle);
            cardDictEdit.Controls.Add(txtEditEn);
            cardDictEdit.Controls.Add(txtEditZh);
            cardDictEdit.Controls.Add(btnSaveWord);
            cardDictEdit.Controls.Add(btnResetWord);
            cardDictEdit.Controls.Add(lblHintEdit);
            panelDict.Controls.Add(cardDictEdit);

            // 底部操作栏按钮组
            btnApplyHot = new M3Button();
            btnApplyHot.Text = "保存并热生效 (一键注入客户端)";
            btnApplyHot.IsPrimary = true;
            btnApplyHot.Location = new Point(0, 438);
            btnApplyHot.Size = new Size(230, 36);
            btnApplyHot.Click += BtnApplyHot_Click;

            btnExportDict = new M3Button();
            btnExportDict.Text = "导出词库 (JSON)";
            btnExportDict.Location = new Point(240, 438);
            btnExportDict.Size = new Size(115, 36);
            btnExportDict.Click += BtnExportDict_Click;

            btnImportDict = new M3Button();
            btnImportDict.Text = "导入词库 (JSON)";
            btnImportDict.Location = new Point(365, 438);
            btnImportDict.Size = new Size(115, 36);
            btnImportDict.Click += BtnImportDict_Click;

            btnClearAllCustom = new M3Button();
            btnClearAllCustom.Text = "清空全部自定义";
            btnClearAllCustom.IsDanger = true;
            btnClearAllCustom.Location = new Point(490, 438);
            btnClearAllCustom.Size = new Size(110, 36);
            btnClearAllCustom.Click += BtnClearAllCustom_Click;

            panelDict.Controls.Add(btnApplyHot);
            panelDict.Controls.Add(btnExportDict);
            panelDict.Controls.Add(btnImportDict);
            panelDict.Controls.Add(btnClearAllCustom);

            Controls.Add(panelDict);

            // ====================================================================
            // 面板三：关于与致谢支持 (panelAbout)
            // ====================================================================
            panelAbout = new Panel();
            panelAbout.Location = new Point(20, 136);
            panelAbout.Size = new Size(600, 500);
            panelAbout.BackColor = Color.FromArgb(16, 17, 20);
            panelAbout.Visible = false;

            cardSponsor = new M3Card();
            cardSponsor.Location = new Point(0, 0);
            cardSponsor.Size = new Size(600, 275);

            picSponsor = new PictureBox();
            picSponsor.Location = new Point(215, 12);
            picSponsor.Size = new Size(170, 170);
            picSponsor.SizeMode = PictureBoxSizeMode.Zoom;
            picSponsor.BackColor = Color.FromArgb(25, 26, 30);
            picSponsor.Image = ExtractEmbeddedImage("sponsor_qr_png");

            lblSponsorQuote = new Label();
            lblSponsorQuote.Text = "“请作者喝瓶冰阔乐吧！”";
            lblSponsorQuote.Font = new Font("Microsoft YaHei UI", 12f, FontStyle.Bold);
            lblSponsorQuote.ForeColor = Color.FromArgb(245, 158, 11);
            lblSponsorQuote.BackColor = Color.FromArgb(25, 26, 30);
            lblSponsorQuote.Location = new Point(0, 192);
            lblSponsorQuote.Size = new Size(600, 26);
            lblSponsorQuote.TextAlign = ContentAlignment.MiddleCenter;

            lblSponsorDesc = new Label();
            lblSponsorDesc.Text = "纯自愿赞赏 · 微信扫码即付 · 您的支持是持续维护与精细化本土翻译的最大动力";
            lblSponsorDesc.Font = new Font("Microsoft YaHei UI", 8.5f);
            lblSponsorDesc.ForeColor = Color.FromArgb(156, 163, 175);
            lblSponsorDesc.BackColor = Color.FromArgb(25, 26, 30);
            lblSponsorDesc.Location = new Point(0, 222);
            lblSponsorDesc.Size = new Size(600, 20);
            lblSponsorDesc.TextAlign = ContentAlignment.MiddleCenter;

            cardSponsor.Controls.Add(picSponsor);
            cardSponsor.Controls.Add(lblSponsorQuote);
            cardSponsor.Controls.Add(lblSponsorDesc);
            panelAbout.Controls.Add(cardSponsor);

            cardCopyright = new M3Card();
            cardCopyright.Location = new Point(0, 285);
            cardCopyright.Size = new Size(600, 215);

            lblCopyrightHeader = new Label();
            lblCopyrightHeader.Text = "作者版权归属与项目官方主页";
            lblCopyrightHeader.Font = new Font("Microsoft YaHei UI", 9.5f, FontStyle.Bold);
            lblCopyrightHeader.ForeColor = Color.FromArgb(243, 244, 246);
            lblCopyrightHeader.BackColor = Color.FromArgb(25, 26, 30);
            lblCopyrightHeader.Location = new Point(16, 12);
            lblCopyrightHeader.Size = new Size(560, 20);

            lblCopyrightBody = new Label();
            lblCopyrightBody.Text = "开发者 / 维护者：YunLingHUI (GitHub: MoFenginto)\n1. 【完全免费】：本工具由 YunLingHUI 自主研发与维护，永久免费供个人开发者学习与日常效率提升使用。\n2. 【严禁倒卖】：严禁任何个人、商家或机构将本程序（或其任何衍生模块）倒卖、转售、打包捆绑或用于任何形式的商业收费牟利。\n3. 【严禁篡改】：未经作者授权，严禁擅自反编译、恶意修改逻辑、剥离作者信息与赞赏通道进行二次分发。\n4. 【免责声明】：本程序通过纯内存或微创方式提供辅助，不触碰官方云端协议，因个人环境异常造成的任何影响作者概不负责。";
            lblCopyrightBody.Font = new Font("Microsoft YaHei UI", 8.2f);
            lblCopyrightBody.ForeColor = Color.FromArgb(156, 163, 175);
            lblCopyrightBody.BackColor = Color.FromArgb(25, 26, 30);
            lblCopyrightBody.Location = new Point(16, 34);
            lblCopyrightBody.Size = new Size(568, 125);

            btnCheckUpdate = new M3Button();
            btnCheckUpdate.Text = "检查最新版本";
            btnCheckUpdate.Font = new Font("Microsoft YaHei UI", 9.5f, FontStyle.Bold);
            btnCheckUpdate.Location = new Point(30, 168);
            btnCheckUpdate.Size = new Size(250, 36);
            btnCheckUpdate.Click += (s, e) => CheckUpdateAsync(false);

            btnOpenGitHub = new M3Button();
            btnOpenGitHub.Text = "访问 GitHub 官方主页 (Star 支持)";
            btnOpenGitHub.IsPrimary = true;
            btnOpenGitHub.Font = new Font("Microsoft YaHei UI", 9.5f, FontStyle.Bold);
            btnOpenGitHub.Location = new Point(310, 168);
            btnOpenGitHub.Size = new Size(260, 36);
            btnOpenGitHub.Click += (s, e) => {
                try {
                    Process.Start("https://github.com/MoFenginto/Antigravity-Hans");
                } catch {}
            };

            cardCopyright.Controls.Add(lblCopyrightHeader);
            cardCopyright.Controls.Add(lblCopyrightBody);
            cardCopyright.Controls.Add(btnCheckUpdate);
            cardCopyright.Controls.Add(btnOpenGitHub);
            panelAbout.Controls.Add(cardCopyright);

            Controls.Add(panelAbout);

            // ====================================================================
            // 5. 底部固定状态提示栏 (上下层叠居中：上为请喝冰阔乐，下为版权声明)
            // ====================================================================
            btnSponsorFooter = new Label();
            btnSponsorFooter.Text = "[ 请作者喝瓶冰阔乐 ]";
            btnSponsorFooter.Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Bold);
            btnSponsorFooter.ForeColor = Color.FromArgb(245, 158, 11);
            btnSponsorFooter.BackColor = Color.FromArgb(16, 17, 20);
            btnSponsorFooter.Location = new Point(20, 650);
            btnSponsorFooter.Size = new Size(600, 24);
            btnSponsorFooter.TextAlign = ContentAlignment.MiddleCenter;
            btnSponsorFooter.Cursor = Cursors.Hand;
            btnSponsorFooter.Click += (s, e) => {
                if (!string.IsNullOrEmpty(latestVersion))
                {
                    PromptUpdateDialog();
                }
                else
                {
                    SwitchTab(2);
                }
            };
            Controls.Add(btnSponsorFooter);

            lblTip = new Label();
            lblTip.Text = "© 2026 YunLingHUI (MoFenginto) 版权所有 · 永久免费 · 严禁倒卖商用";
            lblTip.Font = new Font("Microsoft YaHei UI", 8.5f);
            lblTip.ForeColor = Color.FromArgb(107, 114, 128);
            lblTip.BackColor = Color.FromArgb(16, 17, 20);
            lblTip.Location = new Point(20, 680);
            lblTip.Size = new Size(600, 24);
            lblTip.TextAlign = ContentAlignment.MiddleCenter;
            Controls.Add(lblTip);
        }

        private void SwitchTab(bool isControl)
        {
            SwitchTab(isControl ? 0 : 1);
        }

        private void SwitchTab(int tabIndex)
        {
            btnNavControl.IsSelected = (tabIndex == 0);
            btnNavDict.IsSelected = (tabIndex == 1);
            btnNavAbout.IsSelected = (tabIndex == 2);
            btnNavControl.Invalidate();
            btnNavDict.Invalidate();
            btnNavAbout.Invalidate();

            panelControl.Visible = (tabIndex == 0);
            panelDict.Visible = (tabIndex == 1);
            panelAbout.Visible = (tabIndex == 2);

            if (tabIndex == 1)
            {
                FilterDictionary();
            }
        }

        private Image ExtractEmbeddedImage(string resourceName)
        {
            try
            {
                Assembly asm = Assembly.GetExecutingAssembly();
                using (Stream stream = asm.GetManifestResourceStream(resourceName))
                {
                    if (stream != null)
                    {
                        return Image.FromStream(stream);
                    }
                }
            }
            catch {}
            try
            {
                string localPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "resources", "sponsor_qr.png");
                if (File.Exists(localPath))
                {
                    return Image.FromFile(localPath);
                }
            }
            catch {}
            return null;
        }

        private void InitDictionaryData()
        {
            try
            {
                string snippet = ExtractEmbeddedString("zh_engine_snippet_js");
                if (string.IsNullOrEmpty(snippet))
                {
                    string localJs = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "resources", "zh_engine_snippet.js");
                    if (File.Exists(localJs)) snippet = File.ReadAllText(localJs, Encoding.UTF8);
                }
                CustomDictService.Initialize(snippet);
            }
            catch {}
        }

        private void FilterDictionary()
        {
            try
            {
                listDict.BeginUpdate();
                listDict.Items.Clear();

                string q = (txtSearch.Text ?? "").Trim().ToLower();
                bool onlyCustom = chkOnlyCustom.Checked;
                var list = CustomDictService.GetAllEntries();
                int customCount = 0;
                int shown = 0;

                foreach (var item in list)
                {
                    if (item.IsCustom) customCount++;

                    if (onlyCustom && !item.IsCustom) continue;

                    if (!string.IsNullOrEmpty(q))
                    {
                        bool matchEn = item.English != null && item.English.ToLower().Contains(q);
                        bool matchZh = item.ActiveZh != null && item.ActiveZh.ToLower().Contains(q);
                        if (!matchEn && !matchZh) continue;
                    }

                    if (shown < 300)
                    {
                        ListViewItem lvi = new ListViewItem(item.English);
                        lvi.SubItems.Add(item.ActiveZh);
                        lvi.SubItems.Add(item.IsCustom ? "已自定义" : "默认");
                        if (item.IsCustom)
                        {
                            lvi.ForeColor = Color.FromArgb(134, 239, 172);
                            lvi.Font = new Font("Microsoft YaHei UI", 8.8f, FontStyle.Bold);
                        }
                        else
                        {
                            lvi.ForeColor = Color.FromArgb(209, 213, 219);
                        }
                        listDict.Items.Add(lvi);
                        shown++;
                    }
                }

                listDict.EndUpdate();
                lblDictStats.Text = string.Format("共 {0} 条词条 (已自定义 {1} 项)", list.Count, customCount);
            }
            catch {}
        }

        private void ListDict_SelectedIndexChanged(object sender, EventArgs e)
        {
            try
            {
                if (listDict.SelectedItems.Count > 0)
                {
                    ListViewItem item = listDict.SelectedItems[0];
                    txtEditEn.Text = item.Text;
                    txtEditZh.Text = item.SubItems.Count > 1 ? item.SubItems[1].Text : "";
                }
            }
            catch {}
        }

        private void BtnSaveWord_Click(object sender, EventArgs e)
        {
            string en = (txtEditEn.Text ?? "").Trim();
            string zh = (txtEditZh.Text ?? "").Trim();
            if (string.IsNullOrEmpty(en))
            {
                MessageBox.Show("请先指定英文原词！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }
            CustomDictService.SetCustomWord(en, zh);
            FilterDictionary();
            lblTip.Text = "词条修改已保存至本地自定义词库";
            lblTip.ForeColor = Color.FromArgb(168, 218, 181);
        }

        private void BtnResetWord_Click(object sender, EventArgs e)
        {
            string en = (txtEditEn.Text ?? "").Trim();
            if (string.IsNullOrEmpty(en)) return;
            CustomDictService.ResetWord(en);
            FilterDictionary();
            lblTip.Text = "已恢复该词条的默认官方翻译";
            lblTip.ForeColor = Color.FromArgb(185, 190, 198);
        }

        private void BtnApplyHot_Click(object sender, EventArgs e)
        {
            progressBar.Start();
            lblTip.Text = "正在保存词库并向 Antigravity 客户端热注入...";
            Application.DoEvents();

            CustomDictService.SaveUserCustomFile();
            string json = CustomDictService.GetCustomDictJson();

            int port = cachedCdpPort > 0 ? cachedCdpPort : CdpMemoryInjector.DetectActivePort();
            if (port > 0)
            {
                string err;
                bool ok = CdpMemoryInjector.PushCustomDictToClient(port, json, out err);
                progressBar.Stop();
                if (ok)
                {
                    lblTip.Text = "已成功热注入至客户端！界面词条已毫秒级更新生效";
                    lblTip.ForeColor = Color.FromArgb(168, 218, 181);
                    MessageBox.Show("自定义词库已即时热生效！\n\n您无需重启客户端，当前活动界面的词条已自动按您的个性化定义重绘。", "热生效成功", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                else
                {
                    lblTip.Text = "词库已保存至磁盘；注入提示: " + err;
                    lblTip.ForeColor = Color.FromArgb(245, 195, 110);
                }
            }
            else
            {
                progressBar.Stop();
                lblTip.Text = "自定义词库已保存！下次启动 Antigravity 时将自动以最高优先级生效";
                lblTip.ForeColor = Color.FromArgb(168, 218, 181);
                MessageBox.Show("自定义词库已成功保存！\n\n当前 Antigravity 客户端未运行，下次启动时将自动加载生效。", "保存成功", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void BtnExportDict_Click(object sender, EventArgs e)
        {
            try
            {
                SaveFileDialog sfd = new SaveFileDialog();
                sfd.Title = "导出个性化词库";
                sfd.Filter = "JSON 文件 (*.json)|*.json";
                sfd.FileName = "antigravity_user_dict.json";
                if (sfd.ShowDialog() == DialogResult.OK)
                {
                    string json = CustomDictService.GetCustomDictJson();
                    File.WriteAllText(sfd.FileName, json, Encoding.UTF8);
                    MessageBox.Show("词库已成功导出到:\n" + sfd.FileName, "导出完成", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("导出失败: " + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void BtnImportDict_Click(object sender, EventArgs e)
        {
            try
            {
                OpenFileDialog ofd = new OpenFileDialog();
                ofd.Title = "导入个性化词库";
                ofd.Filter = "JSON 文件 (*.json)|*.json|全部文件 (*.*)|*.*";
                if (ofd.ShowDialog() == DialogResult.OK)
                {
                    string json = File.ReadAllText(ofd.FileName, Encoding.UTF8);
                    if (CustomDictService.ImportJson(json))
                    {
                        FilterDictionary();
                        MessageBox.Show("成功导入并合并词库！", "导入成功", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                    else
                    {
                        MessageBox.Show("未能识别有效的词库 JSON 格式！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("导入失败: " + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void BtnClearAllCustom_Click(object sender, EventArgs e)
        {
            DialogResult res = MessageBox.Show(
                "确定要清空全部自定义词条并恢复所有官方默认翻译吗？\n\n此操作不可逆，建议先导出备份。",
                "确认清空",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question
            );
            if (res == DialogResult.Yes)
            {
                CustomDictService.ClearAllCustom();
                FilterDictionary();
                lblTip.Text = "已清空所有自定义词条";
                lblTip.ForeColor = Color.FromArgb(185, 190, 198);
            }
        }

        private volatile int cachedCdpPort = 0;
        private volatile bool isDetectingPort = false;

        private void StartBackgroundPoll()
        {
            pollTimer = new System.Windows.Forms.Timer();
            pollTimer.Interval = 2500;
            pollTimer.Tick += (s, e) =>
            {
                RefreshStateUi();

                if (!isDetectingPort)
                {
                    isDetectingPort = true;
                    ThreadPool.QueueUserWorkItem((st) =>
                    {
                        try
                        {
                            Process[] procs = Process.GetProcessesByName("Antigravity");
                            bool isRunning = procs != null && procs.Length > 0;
                            int detected = isRunning ? CdpMemoryInjector.DetectActivePort() : 0;
                            cachedCdpPort = detected;

                            if (IsHandleCreated && !IsDisposed)
                            {
                                BeginInvoke(new Action(() =>
                                {
                                    RefreshStateUi();
                                }));
                            }

                            if (isRunning && detected > 0 && memoryZhEnabled && !CheckIsPatched(Path.Combine(appPath ?? "", "resources", "app.asar")))
                            {
                                string script = ExtractEmbeddedString("zh_engine_snippet_js");
                                if (string.IsNullOrEmpty(script))
                                {
                                    string localJs = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "resources", "zh_engine_snippet.js");
                                    if (File.Exists(localJs)) script = File.ReadAllText(localJs, Encoding.UTF8);
                                }
                                if (!string.IsNullOrEmpty(script))
                                {
                                    string err;
                                    CdpMemoryInjector.InjectScript(detected, script, out err);
                                }
                            }
                        }
                        catch {}
                        finally
                        {
                            isDetectingPort = false;
                        }
                    });
                }
            };
            pollTimer.Start();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && pollTimer != null)
            {
                pollTimer.Stop();
                pollTimer.Dispose();
                pollTimer = null;
            }
            base.Dispose(disposing);
        }

        private void LocateAntigravity()
        {
            try
            {
                string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string candidate = Path.Combine(localApp, "Programs", "antigravity");
                if (Directory.Exists(candidate))
                {
                    appPath = candidate;
                }
                else
                {
                    string candidate2 = Path.Combine(localApp, "antigravity");
                    if (Directory.Exists(candidate2)) appPath = candidate2;
                }

                if (!string.IsNullOrEmpty(appPath))
                {
                    string exe = Path.Combine(appPath, "Antigravity.exe");
                    if (File.Exists(exe))
                    {
                        FileVersionInfo vi = FileVersionInfo.GetVersionInfo(exe);
                        hostVersion = vi.ProductVersion ?? vi.FileVersion ?? "2.23.0";
                    }
                }
            }
            catch {}
        }

        private void LoadConfig()
        {
            try
            {
                chkAutoHeal.Checked = CheckAutoHealRegistry();
                bool hookShortcut = true;

                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string cfgPath = Path.Combine(appData, "Antigravity", "zh_settings.json");
                if (File.Exists(cfgPath))
                {
                    string content = File.ReadAllText(cfgPath);
                    if (content.Contains("\"large_memory_guardian\": false") || content.Contains("\"large_memory_guardian\":false"))
                    {
                        chkLargeMemory.Checked = false;
                    }
                    if (content.Contains("\"hook_shortcut\": false") || content.Contains("\"hook_shortcut\":false"))
                    {
                        hookShortcut = false;
                    }
                    if (content.Contains("\"memory_zh_enabled\": false") || content.Contains("\"memory_zh_enabled\":false"))
                    {
                        memoryZhEnabled = false;
                    }
                }
                if (chkHookShortcut != null) chkHookShortcut.Checked = hookShortcut;
                ApplyAllShortcutArgs(chkLargeMemory.Checked, hookShortcut);
            }
            catch {}
        }

        private void SaveConfig()
        {
            try
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string agDir = Path.Combine(appData, "Antigravity");
                if (!Directory.Exists(agDir)) Directory.CreateDirectory(agDir);
                string cfgPath = Path.Combine(agDir, "zh_settings.json");
                string json = "{\n  \"auto_translate_thought\": false,\n  \"auto_heal_daemon\": " + (chkAutoHeal.Checked ? "true" : "false") + ",\n  \"large_memory_guardian\": " + (chkLargeMemory.Checked ? "true" : "false") + ",\n  \"hook_shortcut\": " + ((chkHookShortcut != null && chkHookShortcut.Checked) ? "true" : "false") + ",\n  \"memory_zh_enabled\": " + (memoryZhEnabled ? "true" : "false") + "\n}";
                File.WriteAllText(cfgPath, json, Encoding.UTF8);
            }
            catch {}
        }

        private void ApplyAllShortcutArgs(bool enableMemory, bool enableDebugPort)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType == null) return;
                dynamic shell = Activator.CreateInstance(shellType);

                List<string> args = new List<string>();
                bool isPatchedCore = CheckIsPatched(Path.Combine(appPath ?? "", "resources", "app.asar"));
                if (enableDebugPort && !isPatchedCore)
                {
                    args.Add("--remote-debugging-port=23664");
                }
                if (enableMemory)
                {
                    args.Add("--js-flags=\"--max-old-space-size=8192\"");
                }
                string finalArgs = string.Join(" ", args.ToArray());

                List<string> lnkTargets = new List<string>();
                string realDesktop = @"D:\Users\MoFenginto\Desktop";
                if (Directory.Exists(realDesktop))
                {
                    lnkTargets.Add(Path.Combine(realDesktop, "Antigravity.lnk"));
                }

                string defaultDesktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                if (Directory.Exists(defaultDesktop))
                {
                    lnkTargets.Add(Path.Combine(defaultDesktop, "Antigravity.lnk"));
                }

                string startMenu = Environment.GetFolderPath(Environment.SpecialFolder.Programs);
                if (Directory.Exists(startMenu))
                {
                    lnkTargets.Add(Path.Combine(startMenu, "Antigravity.lnk"));
                    lnkTargets.Add(Path.Combine(startMenu, "Antigravity IDE", "Antigravity IDE.lnk"));

                    try
                    {
                        string[] files = Directory.GetFiles(startMenu, "*Antigravity*.lnk", SearchOption.AllDirectories);
                        foreach (string f in files)
                        {
                            if (!lnkTargets.Contains(f)) lnkTargets.Add(f);
                        }
                    }
                    catch {}
                }

                foreach (string lnk in lnkTargets)
                {
                    if (File.Exists(lnk))
                    {
                        try
                        {
                            dynamic sc = shell.CreateShortcut(lnk);
                            sc.Arguments = finalArgs;
                            sc.Save();
                        }
                        catch {}
                    }
                }

                string primaryDesktopLnk = Path.Combine(realDesktop, "Antigravity.lnk");
                if (!File.Exists(primaryDesktopLnk) && !string.IsNullOrEmpty(appPath))
                {
                    string exePath = Path.Combine(appPath, "Antigravity.exe");
                    if (File.Exists(exePath))
                    {
                        try
                        {
                            dynamic sc = shell.CreateShortcut(primaryDesktopLnk);
                            sc.TargetPath = exePath;
                            sc.WorkingDirectory = appPath;
                            sc.Arguments = finalArgs;
                            sc.IconLocation = exePath + ",0";
                            sc.Description = "Google Antigravity Agentic IDE";
                            sc.Save();
                        }
                        catch {}
                    }
                }
            }
            catch {}
        }

        private bool CheckAutoHealRegistry()
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Run", false))
                {
                    if (key != null)
                    {
                        object val = key.GetValue("AntigravityAutoHeal");
                        return val != null;
                    }
                }
            }
            catch {}
            return false;
        }

        private void SetAutoHealRegistry(bool enable)
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Run", true))
                {
                    if (key != null)
                    {
                        if (enable)
                        {
                            string exe = Application.ExecutablePath;
                            key.SetValue("AntigravityAutoHeal", "\"" + exe + "\" /auto-heal");
                        }
                        else
                        {
                            key.DeleteValue("AntigravityAutoHeal", false);
                        }
                    }
                }
            }
            catch {}
        }

        public static bool CheckIsPatched(string asarPath)
        {
            try
            {
                if (!File.Exists(asarPath)) return false;
                FileInfo fi = new FileInfo(asarPath);

                if (fi.Length == 4486221) return false;

                using (FileStream fs = new FileStream(asarPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    int scanLen = (int)Math.Min(fs.Length, 2097152);
                    byte[] buf = new byte[scanLen];
                    int count = fs.Read(buf, 0, buf.Length);
                    string text = Encoding.UTF8.GetString(buf, 0, count);
                    if (text.Contains("zhTranslationBridge") ||
                        text.Contains("__antigravityStandaloneZhInstalled") ||
                        text.Contains("__ANTIGRAVITY_EXACT__") ||
                        text.Contains("rawPhrases") ||
                        text.Contains("继承全局") ||
                        text.Contains("在此项目中工作时继承您的全局权限"))
                    {
                        return true;
                    }
                }

                if (fi.Length > 4600000) return true;
                return false;
            }
            catch
            {
                return false;
            }
        }

        private void RefreshState()
        {
            RefreshStateUi();
        }

        private void RefreshStateUi()
        {
            try
            {
                if (string.IsNullOrEmpty(appPath))
                {
                    lblSubTitle.Text = "未找到 Antigravity 安装目录";
                    pillStatus.IsSuccess = false;
                    pillStatus.IsWarning = true;
                    pillStatus.IsSafeMode = false;
                    pillStatus.BadgeText = "未安装";
                    pillStatus.Invalidate();
                    return;
                }

                string verStr = !string.IsNullOrEmpty(hostVersion) ? ("v" + hostVersion) : "v2.23.0";
                string asarPath = Path.Combine(appPath, "resources", "app.asar");
                bool isPatched = CheckIsPatched(asarPath);

                Process[] procs = Process.GetProcessesByName("Antigravity");
                bool isRunning = procs != null && procs.Length > 0;
                int cdpPort = cachedCdpPort;

                if (isPatched)
                {
                    lblSubTitle.Text = "宿主版本: (" + verStr + ") | 深度固化汉化就绪";
                    lblSubTitle.ForeColor = Color.FromArgb(168, 218, 181);
                    pillStatus.IsSuccess = true;
                    pillStatus.IsWarning = false;
                    pillStatus.IsSafeMode = false;
                    pillStatus.BadgeText = "深度固化汉化版 (" + verStr + ")";

                    btnSafeStart.Text = "当前处于深度固化模式 (官方 asar 已汉化)";
                    btnSafeStart.IsPrimary = false;
                    btnSafeStart.IsDanger = false;
                    btnSafeStart.Enabled = false;
                    btnSafeStart.Invalidate();
                    lblSafeModeDesc.Text = "如需切换为纯内存零改动模式，请先点击下方“恢复官方出厂原版”。";
                }
                else if (isRunning && cdpPort > 0)
                {
                    btnSafeStart.Enabled = true;
                    if (memoryZhEnabled)
                    {
                        lblSubTitle.Text = "宿主版本: (" + verStr + ") | 安全纯内存中文运行中 (Port:" + cdpPort + ")";
                        lblSubTitle.ForeColor = Color.FromArgb(145, 215, 250);
                        pillStatus.IsSuccess = false;
                        pillStatus.IsWarning = false;
                        pillStatus.IsSafeMode = true;
                        pillStatus.BadgeText = "纯内存静默中文 (运行中)";

                        btnSafeStart.Text = "停用纯内存汉化 (一键切回英文)";
                        btnSafeStart.IsPrimary = false;
                        btnSafeStart.IsDanger = true;
                        btnSafeStart.Invalidate();
                        lblSafeModeDesc.Text = "当前纯内存中文生效中。点击按钮一秒无损切回官方纯英文。";
                    }
                    else
                    {
                        lblSubTitle.Text = "宿主版本: (" + verStr + ") | 官方纯英文环境 (调试管道已就绪)";
                        lblSubTitle.ForeColor = Color.FromArgb(185, 190, 198);
                        pillStatus.IsSuccess = false;
                        pillStatus.IsWarning = false;
                        pillStatus.IsSafeMode = false;
                        pillStatus.BadgeText = "官方出厂原版 (运行中)";

                        btnSafeStart.Text = "开启纯内存中文 (一键热注入)";
                        btnSafeStart.IsPrimary = true;
                        btnSafeStart.IsDanger = false;
                        btnSafeStart.Invalidate();
                        lblSafeModeDesc.Text = "官方 ASAR 保持 100% 原版签名；点击一键在运行中开启纯内存中文。";
                    }
                }
                else
                {
                    btnSafeStart.Enabled = true;
                    lblSubTitle.Text = "宿主版本: (" + verStr + ") | 官方纯净英文原版";
                    lblSubTitle.ForeColor = Color.FromArgb(185, 190, 198);
                    pillStatus.IsSuccess = false;
                    pillStatus.IsWarning = false;
                    pillStatus.IsSafeMode = false;
                    pillStatus.BadgeText = "官方纯净英文原版";

                    btnSafeStart.Text = "安全启动官方原版 (纯内存中文)";
                    btnSafeStart.IsPrimary = true;
                    btnSafeStart.IsDanger = false;
                    btnSafeStart.Invalidate();
                    lblSafeModeDesc.Text = "官方 ASAR 保持 100% 原版签名；通过内存通道无痕注入，随用随开。";
                }
                pillStatus.Invalidate();

                ThreadPool.QueueUserWorkItem((state) =>
                {
                    try
                    {
                        long sz = CacheCleaner.GetCacheSize();
                        string szStr = sz > 0 ? (sz / 1024.0 / 1024.0).ToString("F1") + " MB" : "0 MB";
                        if (IsHandleCreated && !IsDisposed)
                        {
                            BeginInvoke(new Action(() =>
                            {
                                try
                                {
                                    if (!IsDisposed)
                                    {
                                        lblCacheSize.Text = "可释放临时缓存体积: " + szStr;
                                        lblCacheSize.ForeColor = Color.FromArgb(185, 190, 198);
                                    }
                                }
                                catch {}
                            }));
                        }
                    }
                    catch {}
                });
            }
            catch {}
        }

        private bool EnsureProcessClosed()
        {
            Process[] procs = Process.GetProcessesByName("Antigravity");
            if (procs.Length == 0) return true;

            MessageBox.Show(
                "检测到 Antigravity 客户端正在运行。\n\n为保障您的会话数据安全，请在主窗口中先保存并正常关闭 Antigravity，然后再继续此操作。",
                "提示",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information
            );
            return false;
        }

        private static void SafeWriteFileWithRetry(string path, byte[] data, int maxRetry = 10, int delayMs = 300)
        {
            for (int i = 0; i < maxRetry; i++)
            {
                try
                {
                    File.WriteAllBytes(path, data);
                    return;
                }
                catch (IOException)
                {
                    if (i == maxRetry - 1) throw;
                    Thread.Sleep(delayMs);
                }
            }
        }

        private static void SafeCopyFileWithRetry(string src, string dst, bool overwrite = true, int maxRetry = 10, int delayMs = 300)
        {
            for (int i = 0; i < maxRetry; i++)
            {
                try
                {
                    File.Copy(src, dst, overwrite);
                    return;
                }
                catch (IOException)
                {
                    if (i == maxRetry - 1) throw;
                    Thread.Sleep(delayMs);
                }
            }
        }

        private void BtnSafeStart_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(appPath))
            {
                MessageBox.Show("未能找到 Antigravity 安装目录！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            string exePath = Path.Combine(appPath, "Antigravity.exe");
            if (!File.Exists(exePath))
            {
                MessageBox.Show("未能找到 Antigravity.exe 主程序！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            Process[] procs = Process.GetProcessesByName("Antigravity");
            bool isAlreadyRunning = procs != null && procs.Length > 0;
            int detected = isAlreadyRunning ? CdpMemoryInjector.DetectActivePort() : 0;

            if (isAlreadyRunning && detected > 0 && memoryZhEnabled)
            {
                progressBar.Start();
                lblTip.Text = "正在停用纯内存汉化并切回官方纯英文...";
                lblTip.ForeColor = Color.FromArgb(245, 195, 110);
                Application.DoEvents();

                memoryZhEnabled = false;
                SaveConfig();

                ThreadPool.QueueUserWorkItem((state) =>
                {
                    CdpMemoryInjector.ReloadPages(detected);
                    Thread.Sleep(500);

                    if (IsHandleCreated && !IsDisposed)
                    {
                        BeginInvoke(new Action(() =>
                        {
                            progressBar.Stop();
                            RefreshState();
                            lblTip.Text = "已成功停用纯内存汉化，窗口已无损切回官方纯正英文";
                            lblTip.ForeColor = Color.FromArgb(185, 190, 198);
                        }));
                    }
                });
                return;
            }

            if (isAlreadyRunning && detected > 0 && !memoryZhEnabled)
            {
                progressBar.Start();
                lblTip.Text = "正在向运行中窗口注入纯内存中文...";
                lblTip.ForeColor = Color.FromArgb(145, 215, 250);
                Application.DoEvents();

                memoryZhEnabled = true;
                SaveConfig();

                string injectScript = ExtractEmbeddedString("zh_engine_snippet_js");
                if (string.IsNullOrEmpty(injectScript))
                {
                    string localJs = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "resources", "zh_engine_snippet.js");
                    if (File.Exists(localJs)) injectScript = File.ReadAllText(localJs, Encoding.UTF8);
                }

                ThreadPool.QueueUserWorkItem((state) =>
                {
                    string lastError;
                    bool ok = CdpMemoryInjector.InjectScript(detected, injectScript, out lastError);
                    Thread.Sleep(300);

                    if (IsHandleCreated && !IsDisposed)
                    {
                        BeginInvoke(new Action(() =>
                        {
                            progressBar.Stop();
                            RefreshState();
                            if (ok)
                            {
                                lblTip.Text = "纯内存静默汉化成功！官方 asar 零改动，零封号风险";
                                lblTip.ForeColor = Color.FromArgb(168, 218, 181);
                            }
                            else
                            {
                                lblTip.Text = "注入提示: " + (!string.IsNullOrEmpty(lastError) ? lastError : "请检查窗口状态");
                            }
                        }));
                    }
                });
                return;
            }

            memoryZhEnabled = true;
            SaveConfig();

            progressBar.Start();
            lblTip.Text = "正在拉起官方原版并建立纯内存通道...";
            lblTip.ForeColor = Color.FromArgb(145, 215, 250);
            Application.DoEvents();

            int port = 23664;
            if (!isAlreadyRunning)
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = exePath;
                psi.WorkingDirectory = appPath;
                psi.UseShellExecute = true;
                string args = "--remote-debugging-port=" + port;
                if (chkLargeMemory.Checked)
                {
                    args += " --js-flags=\"--max-old-space-size=8192\"";
                }
                psi.Arguments = args;

                try
                {
                    Process.Start(psi);
                    lblTip.Text = "官方客户端已安全拉起，正在等待前端页面就绪并注入...";
                }
                catch (Exception ex)
                {
                    progressBar.Stop();
                    MessageBox.Show("启动失败: " + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }
            }

            string startupScript = ExtractEmbeddedString("zh_engine_snippet_js");
            if (string.IsNullOrEmpty(startupScript))
            {
                string localJs = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "resources", "zh_engine_snippet.js");
                if (File.Exists(localJs)) startupScript = File.ReadAllText(localJs, Encoding.UTF8);
            }

            if (string.IsNullOrEmpty(startupScript))
            {
                progressBar.Stop();
                MessageBox.Show("未能获取到纯内存汉化引擎脚本！", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            ThreadPool.QueueUserWorkItem((state) =>
            {
                bool injectedSuccess = false;
                string lastError = "";

                for (int attempt = 0; attempt < 60; attempt++)
                {
                    Thread.Sleep(350);

                    int currentPort = CdpMemoryInjector.DetectActivePort();
                    if (currentPort > 0) port = currentPort;

                    if (CdpMemoryInjector.ProbeCdpActive(port))
                    {
                        cachedCdpPort = port;
                        if (CdpMemoryInjector.InjectScript(port, startupScript, out lastError))
                        {
                            injectedSuccess = true;
                            break;
                        }
                    }
                }

                if (IsHandleCreated && !IsDisposed)
                {
                    BeginInvoke(new Action(() =>
                    {
                        progressBar.Stop();
                        RefreshState();

                        if (injectedSuccess)
                        {
                            lblTip.Text = "纯内存静默汉化成功！官方 asar 零改动，零封号风险";
                            lblTip.ForeColor = Color.FromArgb(168, 218, 181);
                            MessageBox.Show(
                                "安全纯内存中文模式已就绪！\n\n- 本地磁盘 asar 100% 保持官方原版 4.48MB；\n- 官方数字签名完好，零封号风险；\n- 您可以随时点击此按钮一键切回英文。",
                                "纯内存中文已就绪",
                                MessageBoxButtons.OK,
                                MessageBoxIcon.Information
                            );
                        }
                        else
                        {
                            lblTip.Text = "注入提示: " + (!string.IsNullOrEmpty(lastError) ? lastError : "等待页面就绪超时");
                            lblTip.ForeColor = Color.FromArgb(245, 195, 110);
                        }
                    }));
                }
            });
        }

        private void BtnInstall_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(appPath))
            {
                MessageBox.Show("未能找到 Antigravity 安装目录！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            if (!EnsureProcessClosed()) return;

            progressBar.Start();
            lblTip.Text = "正在执行就地微创动态打补丁 (零环境依赖 · 耗时 0.05 秒)...";
            lblTip.ForeColor = Color.FromArgb(168, 199, 250);
            Application.DoEvents();

            Stopwatch sw = Stopwatch.StartNew();
            try
            {
                string resDir = Path.Combine(appPath, "resources");
                string asarPath = Path.Combine(resDir, "app.asar");
                string backupPath = Path.Combine(resDir, "app.asar.official_backup");

                // 1. 若尚未存在出厂原版备份，自动备份当前官方原版
                if (File.Exists(asarPath) && !File.Exists(backupPath) && !CheckIsPatched(asarPath))
                {
                    SafeCopyFileWithRetry(asarPath, backupPath, true, 10, 300);
                }

                // 2. 提取内嵌的轻量汉化引擎代码 (仅 274KB)
                string zhSnippet = ExtractEmbeddedString("zh_engine_snippet_js");
                if (string.IsNullOrEmpty(zhSnippet))
                {
                    string localJs = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "resources", "zh_engine_snippet.js");
                    if (File.Exists(localJs)) zhSnippet = File.ReadAllText(localJs, Encoding.UTF8);
                }

                if (string.IsNullOrEmpty(zhSnippet))
                {
                    progressBar.Stop();
                    MessageBox.Show("未找到内嵌汉化引擎脚本！", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                // 3. 执行原生极速微创打补丁 (耗时 0.05 秒)
                string patchErr;
                bool patchOk = MiniAsarPatcher.ApplyPatch(asarPath, zhSnippet, out patchErr);
                if (!patchOk)
                {
                    progressBar.Stop();
                    MessageBox.Show("就地微创打补丁失败: " + patchErr, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                if (chkLargeMemory.Checked)
                {
                    ApplyAllShortcutArgs(chkLargeMemory.Checked, chkHookShortcut != null && chkHookShortcut.Checked);
                }

                sw.Stop();
                progressBar.Stop();
                RefreshState();

                lblTip.Text = string.Format("固化汉化成功！耗时 {0:F2} 秒", sw.Elapsed.TotalSeconds);
                lblTip.ForeColor = Color.FromArgb(168, 218, 181);

                DialogResult res = MessageBox.Show(
                    "深度固化汉化成功！已完成全词全句精准匹配与整树剪枝。\n\n是否立即启动 Antigravity？",
                    "完成",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information
                );

                if (res == DialogResult.Yes)
                {
                    string exe = Path.Combine(appPath, "Antigravity.exe");
                    if (File.Exists(exe))
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = exe;
                        psi.WorkingDirectory = appPath;
                        psi.UseShellExecute = true;
                        if (chkLargeMemory.Checked)
                        {
                            psi.Arguments = "--js-flags=\"--max-old-space-size=8192\"";
                        }
                        Process.Start(psi);
                    }
                }
            }
            catch (Exception ex)
            {
                progressBar.Stop();
                MessageBox.Show("固化汉化失败: " + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void BtnRestore_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(appPath)) return;
            if (!EnsureProcessClosed()) return;

            progressBar.Start();
            lblTip.Text = "正在恢复官方出厂英文原版...";
            Application.DoEvents();

            try
            {
                string resDir = Path.Combine(appPath, "resources");
                string asarPath = Path.Combine(resDir, "app.asar");
                string backupPath = Path.Combine(resDir, "app.asar.official_backup");

                if (File.Exists(backupPath))
                {
                    SafeCopyFileWithRetry(backupPath, asarPath, true, 10, 300);
                }
                else
                {
                    string localBackup = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "resources", "app.asar.official_backup");
                    if (File.Exists(localBackup))
                    {
                        SafeCopyFileWithRetry(localBackup, asarPath, true, 10, 300);
                    }
                    else
                    {
                        progressBar.Stop();
                        MessageBox.Show("未在客户端目录或工具目录中检测到官方出厂备份文件 app.asar.official_backup！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        return;
                    }
                }

                ApplyAllShortcutArgs(false, false);
                progressBar.Stop();
                RefreshState();

                lblTip.Text = "已成功恢复为官方出厂英文原版";
                lblTip.ForeColor = Color.FromArgb(168, 218, 181);
                MessageBox.Show("已成功恢复为官方出厂英文原版！", "恢复成功", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                progressBar.Stop();
                MessageBox.Show("恢复失败: " + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void BtnCleanCache_Click(object sender, EventArgs e)
        {
            long cleaned = CacheCleaner.CleanCache();
            if (cleaned > 0)
            {
                string mb = (cleaned / 1024.0 / 1024.0).ToString("F1") + " MB";
                lblCacheSize.Text = "缓存已清理！释放空间: " + mb;
                MessageBox.Show("成功清理 " + mb + " 缓存垃圾！", "清理完成", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            else
            {
                lblCacheSize.Text = "当前无多余缓存垃圾需要清理";
                MessageBox.Show("当前已是极致纯净状态，无多余缓存垃圾。", "提示", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        public static byte[] ExtractEmbeddedBytes(string resName)
        {
            try
            {
                Assembly asm = Assembly.GetExecutingAssembly();
                using (Stream s = asm.GetManifestResourceStream(resName))
                {
                    if (s == null) return null;
                    byte[] buf = new byte[s.Length];
                    s.Read(buf, 0, buf.Length);
                    return buf;
                }
            }
            catch
            {
                return null;
            }
        }

        public static string ExtractEmbeddedString(string resName)
        {
            byte[] bytes = ExtractEmbeddedBytes(resName);
            if (bytes == null || bytes.Length == 0) return null;
            return Encoding.UTF8.GetString(bytes);
        }

        public static void RunSilentHeal()
        {
            try
            {
                string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string appDir = Path.Combine(localApp, "Programs", "antigravity");
                if (!Directory.Exists(appDir)) return;
                string asarPath = Path.Combine(appDir, "resources", "app.asar");
                if (CheckIsPatched(asarPath)) return;

                string zhSnippet = ExtractEmbeddedString("zh_engine_snippet_js");
                if (!string.IsNullOrEmpty(zhSnippet))
                {
                    string err;
                    MiniAsarPatcher.ApplyPatch(asarPath, zhSnippet, out err);
                }
            }
            catch {}
        }
        #region 在线更新引擎 (Auto Updater)

        public void CheckUpdateAsync(bool silent)
        {
            if (isCheckingUpdate) return;
            isCheckingUpdate = true;
            if (!silent && btnCheckUpdate != null)
            {
                btnCheckUpdate.Text = "正在检查更新...";
                btnCheckUpdate.Enabled = false;
            }

            Task.Factory.StartNew(() =>
            {
                string newVer = "";
                string downloadUrl = "";
                string notes = "";
                bool hasUpdate = false;
                string errorMsg = "";

                try
                {
                    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | (SecurityProtocolType)3072;

                    // 方案一：通过 GitHub Web 页面 302 重定向 HEAD 请求秒级解析最新 Tag (零 API 速率限制，绝对免 403)
                    try
                    {
                        HttpWebRequest headReq = (HttpWebRequest)WebRequest.Create("https://github.com/MoFenginto/Antigravity-Hans/releases/latest");
                        headReq.Method = "HEAD";
                        headReq.AllowAutoRedirect = false;
                        headReq.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
                        headReq.Timeout = 5000;
                        headReq.ReadWriteTimeout = 5000;

                        using (HttpWebResponse headResp = (HttpWebResponse)headReq.GetResponse())
                        {
                            string loc = headResp.Headers["Location"];
                            if (!string.IsNullOrEmpty(loc))
                            {
                                Match m = Regex.Match(loc, @"/releases/tag/(v[0-9\.]+)");
                                if (m.Success)
                                {
                                    newVer = m.Groups[1].Value.Trim();
                                    downloadUrl = "https://github.com/MoFenginto/Antigravity-Hans/releases/download/" + newVer + "/Antigravity-Hans-Manager.exe";
                                    hasUpdate = IsNewerVersion(APP_VERSION, newVer);
                                }
                            }
                        }
                    }
                    catch {}

                    // 方案二：如果方案一未获取到，降级通过 api.github.com
                    if (string.IsNullOrEmpty(newVer))
                    {
                        HttpWebRequest req = (HttpWebRequest)WebRequest.Create("https://api.github.com/repos/MoFenginto/Antigravity-Hans/releases/latest");
                        req.Method = "GET";
                        req.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
                        req.Accept = "application/vnd.github.v3+json";
                        req.Timeout = 5000;
                        req.ReadWriteTimeout = 5000;

                        using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                        {
                            if (resp.StatusCode == HttpStatusCode.OK)
                            {
                                using (StreamReader reader = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
                                {
                                    string json = reader.ReadToEnd();
                                    Match mTag = Regex.Match(json, @"""tag_name""\s*:\s*""([^""]+)""");
                                    if (mTag.Success) newVer = mTag.Groups[1].Value.Trim();

                                    Match mBody = Regex.Match(json, @"""body""\s*:\s*""((?:[^""\\]|\\.)*)""");
                                    if (mBody.Success)
                                    {
                                        try { notes = Regex.Unescape(mBody.Groups[1].Value); } catch { notes = mBody.Groups[1].Value; }
                                    }

                                    MatchCollection mUrls = Regex.Matches(json, @"""browser_download_url""\s*:\s*""([^""]+\.exe)""");
                                    foreach (Match m in mUrls)
                                    {
                                        string url = m.Groups[1].Value;
                                        if (url.IndexOf("Antigravity", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                            url.IndexOf("Manager", StringComparison.OrdinalIgnoreCase) >= 0)
                                        {
                                            downloadUrl = url;
                                            break;
                                        }
                                    }
                                    if (string.IsNullOrEmpty(downloadUrl) && mUrls.Count > 0)
                                    {
                                        downloadUrl = mUrls[0].Groups[1].Value;
                                    }

                                    if (!string.IsNullOrEmpty(newVer))
                                    {
                                        hasUpdate = IsNewerVersion(APP_VERSION, newVer);
                                    }
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    errorMsg = ex.Message;
                }

                try
                {
                    BeginInvoke(new Action(() =>
                    {
                        isCheckingUpdate = false;
                        if (btnCheckUpdate != null)
                        {
                            btnCheckUpdate.Text = "检查最新版本";
                            btnCheckUpdate.Enabled = true;
                        }

                        if (hasUpdate)
                        {
                            latestVersion = newVer;
                            latestDownloadUrl = downloadUrl;
                            latestReleaseNotes = notes;

                            if (btnUpdateNotice != null)
                            {
                                btnUpdateNotice.Text = "新版 " + newVer + " (点此升级)";
                                btnUpdateNotice.Visible = true;
                            }

                            if (btnSponsorFooter != null)
                            {
                                btnSponsorFooter.Text = "[ 发现新版本 " + newVer + "，点击立即一键升级 ]";
                                btnSponsorFooter.ForeColor = Color.FromArgb(52, 211, 153);
                            }

                            if (!silent)
                            {
                                PromptUpdateDialog();
                            }
                        }
                        else
                        {
                            if (!silent)
                            {
                                if (!string.IsNullOrEmpty(errorMsg) && string.IsNullOrEmpty(newVer))
                                {
                                    MessageBox.Show("检查更新遇到网络问题，请稍后再试或直接访问 GitHub 主页。\n\n详情: " + errorMsg, "检查更新", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                                }
                                else
                                {
                                    MessageBox.Show("当前已是最新版本 (" + APP_VERSION + ")，无需更新。", "检查更新", MessageBoxButtons.OK, MessageBoxIcon.Information);
                                }
                            }
                        }
                    }));
                }
                catch {}
            });
        }

        public static bool IsNewerVersion(string currentVer, string latestVer)
        {
            try
            {
                Version cur = ParseSemanticVersion(currentVer);
                Version lat = ParseSemanticVersion(latestVer);
                return lat > cur;
            }
            catch
            {
                return false;
            }
        }

        private static Version ParseSemanticVersion(string ver)
        {
            if (string.IsNullOrEmpty(ver)) return new Version(0, 0, 0, 0);
            string clean = Regex.Replace(ver.Trim(), @"^[^\d]+", "");
            string[] rawParts = clean.Split('.');
            int major = 0, minor = 0, build = 0, rev = 0;
            if (rawParts.Length > 0) int.TryParse(Regex.Replace(rawParts[0], @"\D", ""), out major);
            if (rawParts.Length > 1) int.TryParse(Regex.Replace(rawParts[1], @"\D", ""), out minor);
            if (rawParts.Length > 2) int.TryParse(Regex.Replace(rawParts[2], @"\D", ""), out build);
            if (rawParts.Length > 3) int.TryParse(Regex.Replace(rawParts[3], @"\D", ""), out rev);
            return new Version(major, minor, build, rev);
        }

        private void PromptUpdateDialog()
        {
            if (string.IsNullOrEmpty(latestVersion)) return;

            string msg = "检测到 Antigravity 汉化小工具存在新版本！\n\n"
                       + "本地当前版本：" + APP_VERSION + "\n"
                       + "远端最新版本：" + latestVersion + "\n\n";

            if (!string.IsNullOrEmpty(latestReleaseNotes))
            {
                string displayNotes = latestReleaseNotes.Replace("\r", "");
                if (displayNotes.Length > 320) displayNotes = displayNotes.Substring(0, 320) + "\n...";
                msg += "【更新说明】：\n" + displayNotes + "\n\n";
            }

            msg += "是否立即自动下载并完成无痕原地热升级？\n（更新过程将自动重启小工具，不影响正在运行的 Antigravity 客户端）";

            DialogResult dr = MessageBox.Show(msg, "发现新版本 " + latestVersion, MessageBoxButtons.YesNo, MessageBoxIcon.Information);
            if (dr == DialogResult.Yes)
            {
                StartSelfUpdateDownload(latestDownloadUrl, latestVersion);
            }
        }

        private void StartSelfUpdateDownload(string downloadUrl, string versionTag)
        {
            if (string.IsNullOrEmpty(downloadUrl) || !downloadUrl.EndsWith(".exe", StringComparison.OrdinalIgnoreCase))
            {
                DialogResult dr = MessageBox.Show("未能在 Releases 中直接找到单文件安装包，是否打开网页手动下载？", "提示", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                if (dr == DialogResult.Yes)
                {
                    try { Process.Start(string.IsNullOrEmpty(downloadUrl) ? "https://github.com/MoFenginto/Antigravity-Hans/releases/latest" : downloadUrl); } catch {}
                }
                return;
            }

            try
            {
                using (UpdateDownloadForm form = new UpdateDownloadForm(downloadUrl, Application.ExecutablePath, versionTag))
                {
                    form.ShowDialog(this);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("启动更新器失败: " + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        public static void ExecuteSelfUpdateBat(string newExePath)
        {
            try
            {
                string currentExe = Application.ExecutablePath;
                string exeName = Path.GetFileName(currentExe);
                string tempBat = Path.Combine(Path.GetTempPath(), "antigravity_hans_update.bat");

                StringBuilder sb = new StringBuilder();
                sb.AppendLine("@echo off");
                sb.AppendLine("chcp 936 >nul 2>&1");
                sb.AppendLine("title 正在更新 Antigravity 汉化小工具...");
                sb.AppendLine("set RETRIES=0");
                sb.AppendLine(":WAIT_LOOP");
                sb.AppendLine("tasklist /fi \"imagename eq " + exeName + "\" 2>nul | find /i \"" + exeName + "\" >nul");
                sb.AppendLine("if not errorlevel 1 (");
                sb.AppendLine("    timeout /t 1 /nobreak >nul 2>&1");
                sb.AppendLine("    set /a RETRIES+=1");
                sb.AppendLine("    if %RETRIES% leq 15 goto WAIT_LOOP");
                sb.AppendLine("    taskkill /f /im \"" + exeName + "\" >nul 2>&1");
                sb.AppendLine(")");
                sb.AppendLine("timeout /t 1 /nobreak >nul 2>&1");
                sb.AppendLine("copy /y \"" + newExePath + "\" \"" + currentExe + "\" >nul 2>&1");
                sb.AppendLine("if errorlevel 1 (");
                sb.AppendLine("    move /y \"" + newExePath + "\" \"" + currentExe + "\" >nul 2>&1");
                sb.AppendLine(")");
                sb.AppendLine("del /f /q \"" + newExePath + "\" >nul 2>&1");
                sb.AppendLine("start \"\" \"" + currentExe + "\"");
                sb.AppendLine("(goto) 2>nul & del /f /q \"%~f0\"");

                File.WriteAllText(tempBat, sb.ToString(), Encoding.GetEncoding(936));

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = tempBat;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                Process.Start(psi);

                Environment.Exit(0);
            }
            catch (Exception ex)
            {
                MessageBox.Show("启动自动更新脚本失败: " + ex.Message, "更新错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        #endregion
    }

    public class UpdateDownloadForm : Form
    {
        private Label lblTitle;
        private Label lblStatus;
        private ProgressBar progressBar;
        private M3Button btnCancel;
        private WebClient webClient;
        private string downloadUrl;
        private string targetExePath;
        private string tempNewExe;

        public UpdateDownloadForm(string url, string targetPath, string versionTag)
        {
            downloadUrl = url;
            targetExePath = targetPath;
            tempNewExe = Path.Combine(Path.GetTempPath(), "Antigravity-Hans-Manager.new.exe");

            Text = "在线更新 - Antigravity 汉化小工具";
            ClientSize = new Size(460, 180);
            StartPosition = FormStartPosition.CenterParent;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            BackColor = Color.FromArgb(20, 21, 24);
            ForeColor = Color.FromArgb(227, 227, 227);
            Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Regular);

            lblTitle = new Label();
            lblTitle.Text = "正在下载新版本 " + versionTag + "...";
            lblTitle.Font = new Font("Microsoft YaHei UI", 10.5f, FontStyle.Bold);
            lblTitle.ForeColor = Color.FromArgb(243, 244, 246);
            lblTitle.Location = new Point(24, 20);
            lblTitle.Size = new Size(410, 24);

            lblStatus = new Label();
            lblStatus.Text = "正在连接 GitHub 下载节点，请稍候...";
            lblStatus.Font = new Font("Microsoft YaHei UI", 8.5f);
            lblStatus.ForeColor = Color.FromArgb(156, 163, 175);
            lblStatus.Location = new Point(25, 48);
            lblStatus.Size = new Size(410, 20);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(25, 76);
            progressBar.Size = new Size(405, 22);
            progressBar.Minimum = 0;
            progressBar.Maximum = 100;
            progressBar.Value = 0;

            btnCancel = new M3Button();
            btnCancel.Text = "取消";
            btnCancel.Location = new Point(335, 120);
            btnCancel.Size = new Size(95, 34);
            btnCancel.Click += (s, e) => {
                if (webClient != null && webClient.IsBusy) webClient.CancelAsync();
                DialogResult = DialogResult.Cancel;
                Close();
            };

            Controls.Add(lblTitle);
            Controls.Add(lblStatus);
            Controls.Add(progressBar);
            Controls.Add(btnCancel);

            Shown += (s, e) => StartDownload();
        }

        private void StartDownload()
        {
            try
            {
                if (File.Exists(tempNewExe))
                {
                    try { File.Delete(tempNewExe); } catch {}
                }

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | (SecurityProtocolType)3072;
                webClient = new WebClient();
                webClient.Headers.Add("User-Agent", "Antigravity-Hans-Downloader");

                webClient.DownloadProgressChanged += (s, e) => {
                    progressBar.Value = Math.Min(100, Math.Max(0, e.ProgressPercentage));
                    double receivedMb = (double)e.BytesReceived / 1024.0 / 1024.0;
                    double totalMb = (double)e.TotalBytesToReceive / 1024.0 / 1024.0;
                    if (totalMb > 0.1)
                    {
                        lblStatus.Text = string.Format("已下载: {0:F1} MB / {1:F1} MB ({2}%)", receivedMb, totalMb, e.ProgressPercentage);
                    }
                    else
                    {
                        lblStatus.Text = string.Format("已下载: {0:F1} MB...", receivedMb);
                    }
                };

                webClient.DownloadFileCompleted += (s, e) => {
                    if (e.Cancelled)
                    {
                        try { if (File.Exists(tempNewExe)) File.Delete(tempNewExe); } catch {}
                        return;
                    }

                    if (e.Error != null)
                    {
                        try { if (File.Exists(tempNewExe)) File.Delete(tempNewExe); } catch {}
                        DialogResult dr = MessageBox.Show("下载更新遇到错误: " + e.Error.Message + "\\n\\n是否打开 GitHub Releases 页面直接手动下载？", "更新失败", MessageBoxButtons.YesNo, MessageBoxIcon.Warning);
                        if (dr == DialogResult.Yes)
                        {
                            try { Process.Start(downloadUrl); } catch {}
                        }
                        Close();
                        return;
                    }

                    FileInfo fi = new FileInfo(tempNewExe);
                    if (!fi.Exists || fi.Length < 500 * 1024)
                    {
                        try { if (File.Exists(tempNewExe)) File.Delete(tempNewExe); } catch {}
                        MessageBox.Show("下载的文件大小异常，请稍后再试或前往 GitHub 手动下载。", "更新提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        Close();
                        return;
                    }

                    lblStatus.Text = "下载完成，正在准备原子替换并重启...";
                    progressBar.Value = 100;
                    btnCancel.Enabled = false;

                    MainForm.ExecuteSelfUpdateBat(tempNewExe);
                };

                webClient.DownloadFileAsync(new Uri(downloadUrl), tempNewExe);
            }
            catch (Exception ex)
            {
                MessageBox.Show("初始化下载失败: " + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Close();
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (webClient != null)
                {
                    if (webClient.IsBusy) webClient.CancelAsync();
                    webClient.Dispose();
                    webClient = null;
                }
            }
            base.Dispose(disposing);
        }
    }
}
