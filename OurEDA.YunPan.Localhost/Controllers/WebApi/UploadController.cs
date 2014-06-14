using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using System.Threading;
using System.Web.UI;
using System.IO;
using jQuery_File_Upload.MVC3;
using System.Web.Mvc;

namespace MvcTesting.Controllers.WebApi
{
    public class UploadController : Controller
    {
        public HttpResponseMessage Upload()
        {

            var files = Request.Files;
            var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            for (int i = 0; i < files.Count; i++)
            {
                HttpPostedFileBase file = files[i];
                string date = DateTime.Now.ToString("yyyyMMdd");
                string fullUrl = Path.Combine(HttpContext.Request.MapPath(@"~/file/" + date));
                if (Directory.Exists(fullUrl) == false)
                {
                    Directory.CreateDirectory(fullUrl); //如果文件夹不存在，直接创建文件夹。
                }
                var filepath = Path.Combine(fullUrl, "1234" + file.FileName);
                long fileLenth;
                var startPost = new UploadProcess().SaveAs(filepath, file, out fileLenth);

                HttpContext.Response.Write(serializer.Serialize(new { name = "1234" + file.FileName }));
                HttpContext.Response.StatusCode = 200;
                HttpContext.Response.AddHeader("Range", string.Format("bytes={0}-{1}/{2}", 0, startPost, fileLenth));
            }
            return new HttpResponseMessage(HttpStatusCode.OK);
            //     var files = HttpContext.Current.Request.Files;
            //    var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            //    for (int i = 0; i < files.Count; i++)
            //    {
            //        var file = files[i];
            //        string date = DateTime.Now.ToString("yyyyMMdd");
            //        string fullUrl = Path.Combine(HttpContext.Current.Request.MapPath(@"~/file/" + date));
            //        if (Directory.Exists(fullUrl) == false)
            //        {
            //            Directory.CreateDirectory(fullUrl); //如果文件夹不存在，直接创建文件夹。
            //        }
            //        var filepath = Path.Combine(fullUrl, "1234"+file.FileName);
            //        long fileLenth;
            //        var startPost = new UploadProcess().SaveAs(filepath, file, out fileLenth);

            //        HttpContext.Current.Response.Write(serializer.Serialize(new { name = "1234"+ file.FileName}));
            //        HttpContext.Current.Response.StatusCode = 200;
            //        HttpContext.Current.Response.AddHeader("Range", string.Format("bytes={0}-{1}/{2}",0, startPost,fileLenth));
            //}


        }
    }
}
