$(function () {
    //  已经登录成功
    isLogin(function () {
        loginHref();  //登录成功后，跳转对应的页面
    });
    getUserId(function () {
        idreadInfonum(); //获取未读消息个数
    });
    // 查看新闻详情
    getAboutMeContent();
    function getAboutMeContent() {
        $.ajax({
            url: url + '/news/getAboutMeContent',
            method: 'post',
            dataType: 'json',
            cache: false,
            data: {
                domain: document.domain
            }
        }).done(function (res) {
            if (res.ret_code == 0) {
                $(".newsDetailsInfo h3").html(res.ret_msg.title);
                $(".newsDetailsInfo .time").html(timeToDate(res.ret_msg.createtime));
                $(".newsInfo").html(res.ret_msg.message)
            } else {
                window.history.back(-1);
            }
        }).fail(function (err) {
            toast('系统异常');
        })
    }

})