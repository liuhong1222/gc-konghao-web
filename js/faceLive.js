$(function () {
    //  已经登录成功
    isLogin(function () {
        loginAccess();//登录成功，立即转入
        loginHref();
        // 登录成功点击立即转入按钮、
        $(".faceLive-access-tiao").on('click', function () {
            // 判断谁有激活的类
            var obj = $(".faceLive-con li.con");
            obj.each(function (index1) {
                if ($(this).hasClass("active")) {
                    stext = $(this).data('href');
                }
            })
            if (stext == "#tab1") {//人脸
                // alert('人脸')
                location.href = "./faceLiveResult.html?re=face"
            } else if (stext == "#tab2") {  //活体
                // alert('活体')
                location.href = "./faceLiveResult.html?re=live"
            }

        });
    });
    getUserId(function () {
        idreadInfonum(); //获取未读消息个数
    })

    // $(".faceLive-access-tiao").on('click', function () {
    //     alert(33)
    // })
    var urls = location.href;
    if (urls.indexOf("?") != -1) {
        var str = urls.substr(1);
        strs = str.split("&");
        strs[0].split("=")[1];
        var ip = strs[0].split("=")[1];
    }
    // 活体和人脸的切换
    // 1.根据tag参数判断点击进来的是谁，在进行添加激活类
    // 2.点击谁，谁添加激活类，并显示对应的内容
    if (ip == 'face') {  //人脸
        $(".con").removeClass('active');
        $(".contentTabs").hide();
        $(".faceCon").addClass('active');
        $("#tab1").show();
    } else if (ip == 'live') { //活体
        $(".con").removeClass('active');
        $(".contentTabs").hide();
        $(".liveCon").addClass('active');
        $("#tab2").show();
    }

    $(".faceLive-con li.con").on('click', function () {
        $(".faceLive-con li.con").removeClass("active"); //移除所有的激活类 
        $(this).addClass("active");
        $(".contentTabs").hide();
        var activeTab = $(this).data("href");  //获取a标签对应的href
        $(activeTab).show(); //a标签对应的href和对应内容的id对应
    });


})