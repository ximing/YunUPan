/* 
*   浏览器检测弹出框
*   Sys.ie  firefox chrome opera safari 为版本号
*/
(function(){        
        var Sys = {}; 
        var ua = navigator.userAgent.toLowerCase(); 
        var s; 
        var Bname,Bverson;

        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] : 
        (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] : 
        (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] : 
        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] : 
        (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0; 
        //版本与版本号 检测
        if( Sys.ie ){
            Bname = "IE";
            Bverson = parseInt( Sys.ie.split(".")[0] );
            if(Bverson<=8){
                var backContainer = document.createElement("div");
                backContainer.style.position = "fixed";
                backContainer.style.top = 0;
                backContainer.style.left = 0;
                backContainer.style.bottom = 0;
                backContainer.style.right = 0;
                backContainer.style.zIndex = 1000;
                backContainer.style.background = "url(http://upan.u.qiniudn.com/gray.png)";
                // backContainer.style.filter = "Alpha(opacity=30)";  IE8filter会覆盖子层
                var boardContainer = document.createElement("div")
                boardContainer.style.width = "600px";
                boardContainer.style.height = "250px";
                boardContainer.style.backgroundColor = "white";
                boardContainer.style.margin = "150px auto";
                boardContainer.style.border = "5px solid darkgray";
                boardContainer.style.padding = "15px";
                boardContainer.style.paddingLeft = "25px";
                boardContainer.style.paddingRight = "25px";
                boardContainer.style.color = "black";
                boardContainer.innerHTML = "<p style='text-indent:2em;font-size:18px;line-height:25px;'>对不起，您正在使用的浏览器是非常陈旧的<span style='font-size:24px;font-weight:bold;'>"
                +Bname+" "+Bverson+"</span>内核，这是一款已经服役了十几年的古董浏览器。</p>\
                <p style='text-indent:2em;font-size:18px;line-height:25px;'>为了不影响本网站的正常操作和得到更好的使用体验，我们推荐您使用最新的浏览器：例如<span style='color:red;'>Chrome浏览器，360浏览器</span>等等。</p>\
                <a onclick='$(this).parent().parent().hide();'>算了,先凑合着</a>\
                <a href='http://rj.baidu.com/soft/detail/14744.html?ald' target='blank' style='cursor:pointer;float:right;border:none;display:block;margin-top:60px;font-size:20px;color:#1994DF;'>去下载新的浏览器>></a>";
                backContainer.appendChild(boardContainer);
                document.body.appendChild(backContainer);
            }
        }
    })();