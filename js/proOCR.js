$(function () {
    isLogin(function () {
        loginAccess();//登录成功，立即转入
        loginHref();
        // 点击四个里面分别的立即接入
        $(".proAccessBtn").on('click', function (event) {
            var ocrReUrl = $(this).parent().parent().data('url');
            location.href = ocrReUrl;
            event.stopPropagation();
        });
        // 点击公共的立即接入
        $(".ocr-access-tiao").on('click', function () {
            // 判断谁有激活的类
            var obj = $(".proOCR li.conocr");
            obj.each(function (index1) {
                if ($(this).hasClass("active")) {
                    stext = $(this).data('href');
                }
            })
            if (stext == "#tab1") {//身份证ocr
                location.href = "./proOcrResult.html?url=identOcr"
            } else if (stext == "#tab2") {  //营业执照ocr
                location.href = "./proOcrResult.html?url=busin"
            } else if (stext == "#tab3") { //  银行卡ocr
                location.href = "./proOcrResult.html?url=bank"
            } else if (stext == "#tab4") { //  驾驶证ocr
                location.href = "./proOcrResult.html?url=driver"
            }

        });
    });
    getUserId(function () {
        idreadInfonum(); //获取未读消息个数
    })
    var urls = location.href;
    if (urls.indexOf("?") != -1) {
        var str = urls.substr(1);
        strs = str.split("&");
        strs[0].split("=")[1];
        var ip = strs[0].split("=")[1];
    }
    if (ip == 'bank') {
        // alert('银行卡')
        $(".conocr").removeClass('active');
        $(".ocrcontentTabs").hide();
        $(".bankOCR").addClass('active');
        $("#tab3").show();
    } else if (ip == 'mas') {
        // alert('身份证');
        $(".conocr").removeClass('active');
        $(".ocrcontentTabs").hide();
        $(".identOCR").addClass('active');
        $("#tab1").show();
    } else if (ip == 'driver') {
        // alert("驾驶证");
        $(".conocr").removeClass('active');
        $(".ocrcontentTabs").hide();
        $(".driverOCR").addClass('active');
        $("#tab4").show();
    } else if (ip == 'busin') {
        // alert('营业执照');   
        $(".conocr").removeClass('active');
        $(".ocrcontentTabs").hide();
        $(".businOCR").addClass('active');
        $("#tab2").show();
    }
    // 切换产品内容
    $(".proOCR>ul li").on('click', function () {
        $(".proOCR>ul li ").removeClass("active"); //移除所有的激活类 
        $(this).addClass("active");
        $(".ocrcontentTabs").hide();
        var activeTab = $(this).data("href");  //获取a标签对应的href
        $(activeTab).show(); //a标签对应的href和对应内容的id对应
    });


})