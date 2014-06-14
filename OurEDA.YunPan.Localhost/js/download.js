$(document).ready(function () {
    $('#b').click(function () {
        $.get("/Home/Download1/" + $('#key').val(), function (data, status) {
            if (data == "0"||data=="1"||data=="2") {
                var form = $("<form>");   //定义一个form表单
                form.attr('style', 'display:none');   //在form表单中添加查询参数
                form.attr('target', '');
                form.attr('method', 'get');
                form.attr('action', "/Home/Download/" + $('#key').val());
                $('body').append(form);  //将表单放置在web中
                form.submit();   //表单提交
                $('#warning').html("");
                $('#success').html("文件已经下载成功喽，欧耶\(^o^)/");
            }
            else {
                var form = $("<form>");   //定义一个form表单
                form.attr('style', 'display:none');   //在form表单中添加查询参数
                form.attr('target', '');
                form.attr('method', 'get');
                form.attr('action', data);
                $('body').append(form);  //将表单放置在web中
                form.submit();   //表单提交
                $('#warning').html("");
                $('#success').html("文件已经下载成功喽，欧耶\(^o^)/");
                //var form = $("<form>");   //定义一个form表单
                //form.attr('style', 'display:none');   //在form表单中添加查询参数
                //form.attr('target', '');
                //form.attr('method', 'get');
                //form.attr('action', "/Home/Download/" + $('#key').val());
                //$('body').append(form);  //将表单放置在web中
                //form.submit();   //表单提交
                //$('#warning').html("");
                //$('#success').html("文件已经下载成功喽，欧耶\(^o^)/");
            }
        });
    });
});