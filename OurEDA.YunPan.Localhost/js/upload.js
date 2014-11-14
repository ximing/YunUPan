// 文件上传
jQuery(function () {
    var $ = jQuery,
    $list = $('#thelist'),
    $btn = $('#ctlBtn'),
    state = 'pending',
    uploader;

    var temp = "";

    uploader = WebUploader.create({

        // 不压缩image
        resize: false,
        chunked: false,
        fileNumLimit: 1,
        // swf文件路径
        swf: '/js/WebUploader/Uploader.swf',
        dnd: '#uploader',
        // 文件接收服务端。
        server: '/Home/Upload',
        auto: true,
        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: '#picker'
    });

    // 当有文件添加进来的时候
    uploader.on('fileQueued', function (file) {
        temp = file.id;
        $list.append('<div id="' + file.id + '" class="item">' +
        '<p class="info"> ' + '<span class="fname">' + file.name + '</span>' +
        '<span class="state">等待上传...</span>' + '<span class="tqm">' + '</span>' + '</p>' + '</div>');
    });

    // 文件上传过程中创建进度条实时显示。
    uploader.on('uploadProgress', function (file, percentage) {
        var $li = $('#' + file.id),
        $percent = $li.find('.progress .progress-bar');

        // 避免重复创建
        if (!$percent.length) {
            $percent = $(' <div class="row">     <div class="col-md-1"></div><div class="col-md-9"><div class="progress progress-striped active">' +
            '<div class="progress-bar" role="progressbar" style="width: 0%">' + '</div>' + ' </div> </div> </div>').appendTo($li).find('.progress-bar');
        }

        $li.find('span.state').text('上传中');

        $percent.css('width', percentage * 100 + '%');
    });



    uploader.on('uploadSuccess', function (file) {
        $('#' + file.id).find('span.state').text('已上传');
        temp = file.id;
    });

    uploader.on('uploadError', function (file) {
        $('#' + file.id).find('span.state').text('上传出错');
    });

    uploader.on('uploadComplete', function (file) {
        $('#' + file.id).find('.progress').fadeOut();
    });

    uploader.on('uploadAccept', function (object, ret) {
        $('#' + temp).find('span.tqm').text("提取码：" + ret._raw);
        temp = "";
        $('.webuploader-pick').text("继续上传");
        if (ret._raw == "-1") {
            $('#warning').html("当前文件太大啦，无法上传_(:з」∠)_");
        }
        else if (ret._raw == "0") {
            $('#warning').html("上传的文件好像是空的呢，再试试吧_(:з」∠)_");
        }
        else if (ret._raw == "-2") {
            $('#warning').html("上传遇到了怪怪的问题，再试试吧_(:з」∠)_");
        }
        else if (ret._raw == "undefined") {
            $('#warning').html("上传遇到了怪怪的问题，再试试吧_(:з」∠)_");
        }
        else {
            $('#srenren').css("display", "inherit");
            $('#erweixiazai').css("display", "inherit");
            $('#public').css("display", "inherit");
            $('#public').attr('href', '/Home/AddPublic?randName=' + ret._raw)
        }
        $('#pp').attr('href', 'http://upan.oureda.cn/');
        $('input').attr('disabled', 'disabled');

    });




    $btn.on('click', function () {
        if (state === 'uploading') {
            uploader.stop();
        }
        else {
            uploader.upload();
        }
    });


});




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