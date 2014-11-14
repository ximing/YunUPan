using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OurEDA.YunPan.Localhost.Until
{
    /**//// <summary>

/// 防盗链Filter.

/// </summary>

public class AntiOutSiteLinkAttribute : ActionFilterAttribute, IActionFilter

{

    public AntiOutSiteLinkAttribute()
    {
    }



    /**//// <summary>

    /// 请求的文件类型.(文件或图片)

    /// </summary>

    public FileType FileType { get; set; }


    void IActionFilter.OnActionExecuting(ActionExecutingContext filterContext)

    {

        HttpContextBase httpContext = filterContext.HttpContext;

        if (null != httpContext.Request.UrlReferrer)

        {

            string serverDomain = httpContext.Request.Url.Host;

            string refDomain = httpContext.Request.UrlReferrer.Host;

            if (GetRootDomain(refDomain).Equals(GetRootDomain(serverDomain), StringComparison.OrdinalIgnoreCase))

            {

                return;//如果根域名相同就返回

            }

        }
        filterContext.Result = new RedirectResult("http://upan.oureda.cn/Home/Public");

    }


    /**//// <summary>

    /// 获取网站的根域名

    /// </summary>

    /// <param name="domain">网站的域名，不带"Http://"</param>

    /// <returns></returns>

    private string GetRootDomain(string domain)

    {

        if (string.IsNullOrEmpty(domain))

        {

            throw new ArgumentNullException("参数'domain'不能为空");

        }

        string[] arr = domain.Split(new[] { '.' }, StringSplitOptions.RemoveEmptyEntries);

        if (arr.Length <= 2)

        {

            return domain;

        }

        else

        {

            return arr[arr.Length - 2] + "." + arr[arr.Length - 1];

        }

    }

}



public enum FileType

{

    File = 1,

    Image

}
}