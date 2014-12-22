using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Text;
using System.Drawing;
//using ZXing.Common;
//using ZXing;
//using ZXing.QrCode;
using System.Threading.Tasks;
using OurEDA.YunPan.Localhost.Models;
using OurEDA.YunPan.Localhost.Until;
using MongoDB.Driver;
using MongoDB.Driver.Builders;

namespace MvcWebRole1.Controllers
{
    public class HomeController : AsyncController
    {
        public string connectionString;
        public MongoClient client;
        public MongoServer server;
        public HomeController()
        {
            connectionString = "mongodb://210.30.100.181";
            client = new MongoClient(connectionString);
            server = client.GetServer();
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult DownFileView()
        {
            return View();
        }

        public void DownFileByrandName(string randName)
        {
            if (string.IsNullOrEmpty(randName))
            {
                TempData["error"] = "提取码不能为空";
                Response.Redirect("DownFileView");
                return;
            }
            randName = randName.Trim();
            var database = server.GetDatabase("test");
            var downcollection = database.GetCollection<FileStore>("filestores");
            var fileinfo = downcollection.FindOne(Query.EQ("RandName", randName));
            if (fileinfo == null)
            {
                TempData["error"] = "提取码不存在";
                Response.Redirect("DownFileView");
                return;
            }
            System.IO.FileInfo fileInfo = new System.IO.FileInfo(fileinfo.FileUrl);
            if (fileInfo.Exists == true)
            {
                const long ChunkSize = 51000;
                byte[] buffer = new byte[ChunkSize];
                Response.Clear();
                System.IO.FileStream iStream = System.IO.File.OpenRead(fileinfo.FileUrl);
                long dataLengthToRead = iStream.Length;//获取下载的文件总大小
                Response.ContentType = "application/octet-stream";
                Response.AddHeader("Content-Disposition", "attachment; filename=" + HttpUtility.UrlEncode(fileinfo.FileName.Substring(4)));
                Response.AddHeader("Content-Length", iStream.Length.ToString());
                while (dataLengthToRead > 0 && Response.IsClientConnected)
                {
                    int lengthRead = iStream.Read(buffer, 0, Convert.ToInt32(ChunkSize));
                    Response.OutputStream.Write(buffer, 0, lengthRead);
                    Response.Flush();
                    dataLengthToRead = dataLengthToRead - lengthRead;
                }
                Response.Close();
            }
            else
            {
                TempData["error"] = "文件不存在";
                Response.Redirect("DownFileView");
            }
        }

        [AntiOutSiteLink]
        public void DownPublicFileByrandName(string randName)
        {
            if (string.IsNullOrEmpty(randName))
            {
                TempData["error"] = "提取码不能为空";
                Response.Redirect("Public");
                return;
            }
            var database = server.GetDatabase("test");
            var downcollection = database.GetCollection<FileStore>("filestores");
            var fileinfo = downcollection.FindOne(Query.EQ("RandName", randName));
            if (fileinfo == null)
            {
                TempData["error"] = "提取码不存在";
                Response.Redirect("Public");
                return;
            }
            using (OurEDA.YunPan.Localhost.db.YunPanEntities db = new OurEDA.YunPan.Localhost.db.YunPanEntities())
            {
                var file=db.publicFiles.FirstOrDefault(a => a.RandName == randName);
                if (file!=null)
                {
                    file.LikeCount += 1;
                    file.DownCount += 1;
                    db.Entry(file).State = System.Data.Entity.EntityState.Modified;
                    db.SaveChanges();
                }
            }
            System.IO.FileInfo fileInfo = new System.IO.FileInfo(fileinfo.FileUrl);
            if (fileInfo.Exists == true)
            {
                const long ChunkSize = 51000;
                byte[] buffer = new byte[ChunkSize];
                Response.Clear();
                System.IO.FileStream iStream = System.IO.File.OpenRead(fileinfo.FileUrl);
                long dataLengthToRead = iStream.Length;//获取下载的文件总大小
                Response.ContentType = "application/octet-stream";
                Response.AddHeader("Content-Disposition", "attachment; filename=" + HttpUtility.UrlEncode(fileinfo.FileName.Substring(4)));
                Response.AddHeader("Content-Length", iStream.Length.ToString());
                while (dataLengthToRead > 0 && Response.IsClientConnected)
                {
                    int lengthRead = iStream.Read(buffer, 0, Convert.ToInt32(ChunkSize));
                    Response.OutputStream.Write(buffer, 0, lengthRead);
                    Response.Flush();
                    dataLengthToRead = dataLengthToRead - lengthRead;
                }
                Response.Close();
            }
            else
            {
                TempData["error"] = "文件不存在";
                Response.Redirect("Public");
            }
        }

        public ActionResult AddPublic(string randName)
        {
            if (string.IsNullOrEmpty(randName))
            {
                TempData["error"] = "提取码不能为空";
                return View("Index"); ;
            }
            var database = server.GetDatabase("test");
            var downcollection = database.GetCollection<FileStore>("filestores");
            var fileinfo = downcollection.FindOne(Query.EQ("RandName", randName));
            if (fileinfo == null)
            {
                TempData["error"] = "提取码不存在";
                return View("Index");
            }
            else
            {
                using (OurEDA.YunPan.Localhost.db.YunPanEntities db = new OurEDA.YunPan.Localhost.db.YunPanEntities())
                {
                     System.IO.FileInfo fileInfo = new System.IO.FileInfo(fileinfo.FileUrl);
                     db.publicFiles.Add(new OurEDA.YunPan.Localhost.db.publicFile
                     {
                         CreateTime = DateTime.Now,
                         DownCount = 1,
                         fileSize = fileInfo.Length,
                         LikeCount = 1,
                         Name = fileinfo.FileName.Substring(4),
                         RandName = fileinfo.RandName
                     });
                     db.SaveChanges();
                    return RedirectToAction("Public");
                }
            }
        }

        public ActionResult Public()
        {
            using (OurEDA.YunPan.Localhost.db.YunPanEntities db = new OurEDA.YunPan.Localhost.db.YunPanEntities())
            {
                return View(db.publicFiles.OrderByDescending(a=>a.DownCount).ToList());
            }
        }


































        public ActionResult TestWebUploader()
        {
            return View();
        }

        public ActionResult Test()
        {
            return View();
        }

        public ActionResult Fdownload()
        {
            return View();
        }

        public ActionResult Introduce()
        {
            return View();
        }

        public ActionResult Question()
        {
            return View();
        }
        //文件上传
        //public string Upload1(HttpPostedFileBase uplode)
        //{
        //    try
        //    {
        //        if ((uplode == null))
        //        {
        //            return ("0");
        //        }
        //        var fileExt = System.IO.Path.GetExtension(Path.GetFileName(uplode.FileName));
        //        var mimeType = uplode.ContentType;
        //        Stream fileStream = uplode.InputStream;
        //        Random r = new Random();
        //        string twmpstring = GenerateCheckCode(4);
        //        var filename = twmpstring + Path.GetFileName(uplode.FileName);
        //        string date = DateTime.Now.ToString("yyyyMMdd");
        //        string fullUrl = String.Format(@"~/file/{0}", date);
        //        if (Directory.Exists(fullUrl) == false)
        //        {
        //            Directory.CreateDirectory(fullUrl); //如果文件夹不存在，直接创建文件夹。
        //        }
        //        var filepath = Path.Combine(fullUrl, filename);
        //        uplode.SaveAs(filepath);
        //        var files = new FileStore()
        //        {
        //            RandName = twmpstring,
        //            MimeType = mimeType,
        //            FileName = filename,
        //            FileUrl = filepath,//Path.Combine(filepath),
        //            date = DateTime.Now.ToUniversalTime()
        //        };
        //        db.FileStores.Add(files);//存储到数据库
        //        db.SaveChanges();
        //        return files.RandName;
        //    }
        //    catch (Exception)
        //    {
        //        return "-2";
        //    }
        //}

        public string Upload(HttpPostedFileBase uplode)
        {
            try
            {
                uplode = Request.Files[0];
                if ((uplode == null))
                {
                    return ("0");
                }
                var fileExt = System.IO.Path.GetExtension(Path.GetFileName(uplode.FileName));
                var mimeType = uplode.ContentType;
                Stream fileStream = uplode.InputStream;
                Random r = new Random();
                string twmpstring = GetCode();
                var filename = twmpstring + Path.GetFileName(uplode.FileName);
                string date = DateTime.Now.ToString("yyyyMMdd");
                string fullUrl = Path.Combine(Server.MapPath("~/file/"), date);
                if (Directory.Exists(fullUrl) == false)
                {
                    Directory.CreateDirectory(fullUrl); //如果文件夹不存在，直接创建文件夹。
                }
                var filepath = Path.Combine(fullUrl, filename);
                uplode.SaveAs(filepath);
                var files = new FileStore()
                {
                    RandName = twmpstring,
                    MimeType = mimeType,
                    FileName = filename,
                    FileUrl = filepath,//Path.Combine(filepath),
                    date = DateTime.Now.ToUniversalTime()
                };
                var database = server.GetDatabase("test");
                var collection = database.GetCollection<FileStore>("filestores");
                collection.Insert(files);
                return files.RandName;
            }
            catch (Exception e)
            {
                var database = server.GetDatabase("test");
                var collection = database.GetCollection<Exp>("logs");
                collection.Insert(new Exp() { Message = e.Message });
                return "-2";
            }
        }
        //文件下载
        public FilePathResult Download(string randName)
        {
            string s = IpHelper.ClientIP();
            var database = server.GetDatabase("test");
            if (s != null)
            {
                var collection = database.GetCollection<Iplimit>("Iplimits");
                var tempip = collection.FindOne(Query.EQ("IpAdress", s));
                if (tempip == null)
                {
                    collection.Insert(new Iplimit() { BeginTime = DateTime.Now, Count = 1, IpAdress = s });
                }
                else
                {
                    DateTime d1 = new DateTime(tempip.BeginTime.Ticks);
                    DateTime d2 = new DateTime(DateTime.Now.Ticks);
                    TimeSpan d3 = d2 - d1;
                    if (d3.TotalMinutes > 5)
                    {
                        tempip.BeginTime = DateTime.Now;
                        tempip.Count = 1;
                    }
                    else
                    {
                        if (tempip.Count > 100)
                        {
                            HttpContext.Response.Redirect("https://upan.aimo.plus/Home/Question", true);
                            return null;
                        }
                        else
                        {
                            tempip.Count += 1;
                        }
                    }
                }
            }
            else
            {
                HttpContext.Response.Redirect("https://upan.aimo.plus/Home/Question", true);
                return null;
            }
            var downcollection = database.GetCollection<FileStore>("filestores");
            var fileinfo = downcollection.FindOne(Query.EQ("RandName", randName));
            if (fileinfo == null)
            {
                Response.RedirectLocation = "https://upan.aimo.plus/Home/Inform";
                Response.StatusCode = (int)HttpStatusCode.RedirectMethod;
                TempData["randName"] = randName;
                return null;
            }
            //else if (DateTime.Now.ToUniversalTime().Subtract(fileinfo.date).Days > 7)
            //{
            //    try
            //    {
            //        db.FileStores.Remove(fileinfo);
            //    }
            //    catch (Exception)
            //    {
            //    }
            //    finally
            //    {
            //        Response.RedirectLocation = "https://upan.aimo.plus/Home/Inform";
            //        Response.StatusCode = (int)HttpStatusCode.RedirectMethod;
            //        TempData["randName"] = randName;
            //        db.SaveChanges();
            //    }
            //    return null;
            //}
            else
            {
                return File(fileinfo.FileUrl, fileinfo.MimeType, fileinfo.FileName);
            }
        }

        public string Download1(string randName)
        {
            var database = server.GetDatabase("test");
            var downcollection = database.GetCollection<FileStore>("filestores");
            var fileinfo = downcollection.FindOne(Query.EQ("RandName", randName));
            if (fileinfo == null)
            {
                return "0";
            }
            else if (DateTime.Now.ToUniversalTime().Subtract(fileinfo.date).Days > 0)
            {
                return "1";
            }
            else
            {
                if (fileinfo.MimeType == "application/octet-stream")
                {
                    var v = fileinfo.FileUrl.Split('\\');
                    byte[] gbk = Encoding.GetEncoding("GBK").GetBytes(v[v.Length - 1]);
                    string s1 = BitConverter.ToString(gbk);
                    s1 = "%" + s1.Replace('-', '%');
                    string path = v[v.Length - 2] + "/" + s1;
                    string fullpath = "https://upan.aimo.plus/file/" + path;
                    return fullpath;
                }
                else
                {
                    return "2";
                }
            }
        }

        public void DownFile(string randName)
        {
            var database = server.GetDatabase("test");
            var downcollection = database.GetCollection<FileStore>("filestores");
            var fileinfo = downcollection.FindOne(Query.EQ("RandName", randName));
            if (fileinfo == null)
            {
                Response.RedirectLocation = "https://upan.aimo.plus/Home/Inform";
                Response.StatusCode = (int)HttpStatusCode.RedirectMethod;
                TempData["randName"] = randName;
                //TempData["success"] = "文件好像找不到了，再确认一下提取码呢?";
                return;
            }

            else
            {
                System.IO.FileInfo fileInfo = new System.IO.FileInfo(fileinfo.FileUrl);
                if (fileInfo.Exists == true)
                {
                    const long ChunkSize = 510000;
                    byte[] buffer = new byte[ChunkSize];
                    Response.Clear();
                    System.IO.FileStream iStream = System.IO.File.OpenRead(fileinfo.FileUrl);
                    long dataLengthToRead = iStream.Length;//获取下载的文件总大小
                    Response.ContentType = "application/octet-stream";
                    Response.AddHeader("Content-Disposition", "attachment; filename=" + HttpUtility.UrlEncode(fileinfo.FileName));
                    while (dataLengthToRead > 0 && Response.IsClientConnected)
                    {
                        int lengthRead = iStream.Read(buffer, 0, Convert.ToInt32(ChunkSize));
                        Response.OutputStream.Write(buffer, 0, lengthRead);
                        Response.Flush();
                        dataLengthToRead = dataLengthToRead - lengthRead;
                    }
                    Response.Close();
                }
            }
        }

        public ActionResult Inform()
        {
            return View();
        }

        /// <summary>
        /// 随机生成字符串
        /// </summary>
        /// <param name="codeCount">字符串长度</param>
        /// <returns></returns>
        private string GenerateCheckCode(int codeCount)
        {
            int number;
            char code;
            string checkCode = String.Empty;
            System.Random random = new Random();
            for (int i = 0; i < codeCount; i++)
            {
                number = random.Next();
                if (number % 2 == 0)
                    code = (char)('0' + (char)(number % 10));
                else
                    code = (char)('a' + (char)(number % 26));
                checkCode += code.ToString();
            }
            return checkCode;
        }

        private string GetCode()
        {
            string s = GenerateCheckCode(4);
            var database = server.GetDatabase("test");
            var collection = database.GetCollection<FileStore>("filestores");
            var temp = collection.FindOne(Query.EQ("RandName", s));
            if (temp != null)
            {
                s = GetCode();
            }
            return s;
        }

        //public ActionResult GerErWM(string randName)
        //{
        //    EncodingOptions options = null;
        //    BarcodeWriter writer = null;
        //    options = new QrCodeEncodingOptions
        //    {
        //        DisableECI = true,
        //        CharacterSet = "UTF-8",
        //        Width = 300,
        //        Height = 300
        //    };
        //    writer = new BarcodeWriter();
        //    writer.Format = BarcodeFormat.QR_CODE;
        //    writer.Options = options;
        //    Bitmap bitmap = writer.Write(randName);
        //    bitmap.Save(Response.OutputStream, System.Drawing.Imaging.ImageFormat.Jpeg);
        //    return null;
        //}

        public string GetFile(string randName)
        {
            var database = server.GetDatabase("test");
            var collection = database.GetCollection<FileStore>("filestores");
            var fileinfo = collection.FindOne(Query.EQ("RandName", randName));
            if (fileinfo == null)
            {
                return "0";
            }
            else if (DateTime.Now.ToUniversalTime().Subtract(fileinfo.date).Days > 7)
            {
                return "1";
            }
            else
            {
                var v = fileinfo.FileUrl.Split('\\');
                string path = v[v.Length - 2] + "/" + v[v.Length - 1];
                string fullpath = "ftp://210.30.100.120/03_OCloud/" + path;
                return fullpath;
            }
        }

        public string GetId(string ranName)
        {
            return "";
        }

        public ActionResult BigIndex()
        {
            return View();
        }

        public string WpGetUrl(string randName)
        {
            var database = server.GetDatabase("test");
            var collection = database.GetCollection<FileStore>("filestores");
            var fileinfo = collection.FindOne(Query.EQ("RandName", randName));
            if (fileinfo == null)
            {
                return "0";
            }
            else if (DateTime.Now.ToUniversalTime().Subtract(fileinfo.date).Days > 0)
            {
                return "1";
            }
            else
            {
                var v = fileinfo.FileUrl.Split('\\');
                string path = v[v.Length - 2] + "/" + v[v.Length - 1];
                string fullpath = "https://upan.aimo.plus/file/" + path;
                return fullpath;
            }
        }


































































































        //public string PhoneUpload()
        //{
        //    string fileName = Request.Headers["FileName"];
        //    string fileType = Request.Headers["FileType"];
        //    string twmpstring = GetCode();
        //    var filename = twmpstring + Path.GetFileName(fileName);
        //    string date = DateTime.Now.ToString("yyyyMMdd");
        //    string fullUrl = Path.Combine(Server.MapPath(@"~/file/" + date));
        //    if (Directory.Exists(fullUrl) == false)
        //    {
        //        Directory.CreateDirectory(fullUrl); //如果文件夹不存在，直接创建文件夹。
        //    }
        //    var filepath = Path.Combine(fullUrl, filename);
        //    FileStream fs = new FileStream(filepath, FileMode.CreateNew);
        //    byte[] bytes = new byte[Request.InputStream.Length];
        //    Request.InputStream.Read(bytes, 0, bytes.Length);

        //    // 设置当前流的位置为流的开始 
        //    Request.InputStream.Seek(0, SeekOrigin.Begin);
        //    var files = new FileStore()
        //    {
        //        RandName = twmpstring,
        //        MimeType = fileType,
        //        FileName = filename,
        //        FileUrl = filepath,//Path.Combine(filepath),
        //        date = DateTime.Now.ToUniversalTime()
        //    };
        //    db.FileStores.Add(files);//存储到数据库
        //    db.SaveChanges();
        //    return files.RandName;
        //    try
        //    {
        //        var uplode = Request.Files[0];
        //        if ((uplode == null))
        //        {
        //            return ("0");
        //        }
        //        var fileExt = System.IO.Path.GetExtension(Path.GetFileName(uplode.FileName));
        //        var mimeType = uplode.ContentType;
        //        Stream fileStream = uplode.InputStream;
        //        Random r = new Random();
        //        string twmpstring = GetCode();
        //        var filename = twmpstring + Path.GetFileName(uplode.FileName);
        //        string date = DateTime.Now.ToString("yyyyMMdd");
        //        string fullUrl = Path.Combine(Server.MapPath(@"~/file/" + date));
        //        if (Directory.Exists(fullUrl) == false)
        //        {
        //            Directory.CreateDirectory(fullUrl); //如果文件夹不存在，直接创建文件夹。
        //        }
        //        var filepath = Path.Combine(fullUrl, filename);
        //        uplode.SaveAs(filepath);
        //        var files = new FileStore()
        //        {
        //            RandName = twmpstring,
        //            MimeType = mimeType,
        //            FileName = filename,
        //            FileUrl = filepath,//Path.Combine(filepath),
        //            date = DateTime.Now.ToUniversalTime()
        //        };
        //        db.FileStores.Add(files);//存储到数据库
        //        db.SaveChanges();
        //        return files.RandName;
        //    }
        //    catch (Exception)
        //    {
        //        return "-2";
        //    }
        //}

        public ActionResult TextIndex()
        {
            return View();
        }
    }
}
