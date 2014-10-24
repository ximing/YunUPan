// 文件上传

function shareClick() {
    if ($('.fname').html() == '') {
        var rrShareParam = {
            resourceUrl: '',	//分享的资源Url
            srcUrl: '',	//分享的资源来源Url,默认为header中的Referer,如果分享失败可以调整此值为resourceUrl试试
            pic: 'http://upan.u.qiniudn.com/renrenwyp.jpg',		//分享的主题图片Url
            title: '我刚刚发现了一个实用的网站，快戳进来看看吧',		//分享的标题
            description: 'OurEDA微云盘,随时上传，随地下载，四位提取码，极速分享！再也不怕打印室电脑的木马，再也不怕上课忘带U盘啦！课件、代码、实验报告、照片、文档，分享你的所想！'	//分享的详细描述
        };
        rrShareOnclick(rrShareParam);
    }
    else {
        var rrShareParam = {
            resourceUrl: '',	//分享的资源Url
            srcUrl: '',	//分享的资源来源Url,默认为header中的Referer,如果分享失败可以调整此值为resourceUrl试试
            pic: 'http://upan.u.qiniudn.com/renrenwyp.jpg',		//分享的主题图片Url
            title: '我刚刚上传了' + $('.fname').html() + '，提取码是' + $('.tqm').html() + ",小伙伴们快戳进来看一看吧",		//分享的标题
            description: 'OurEDA微云盘,随时上传，随地下载，四位提取码，极速分享！　　微云盘现已迭代至beta2.0版本，实时进度、大文件分片上传...更多功能等你体验！'	//分享的详细描述
        };
        rrShareOnclick(rrShareParam);
    }
}