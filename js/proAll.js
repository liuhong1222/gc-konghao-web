$(function () {
    //  已经登录成功
    isLogin(function () {
        loginHref();  //登录成功后，跳转对应的页面
    });
    getUserId(function () {
        idreadInfonum(); //获取未读消息个数
    })
    // 类切换
    $(".proTabs span").on('click', function () {
        $(".proTabs span").removeClass('active');
        $(this).addClass('active');
        var index = $(".proTabs span").index(this);
        if (index == 0) {
            $(".allProducts").hasClass("show");
            $(".allProducts").addClass("show");
        } else {
            $(".allProducts").removeClass("show");
        }
        if (index == 1) {
            $(".nullcodeProducts").hasClass("show");
            $(".nullcodeProducts").addClass("show");
        } else {
            $(".nullcodeProducts").removeClass("show");
        }
        if (index == 2) {
            $(".identityPros").hasClass("show");
            $(".identityPros").addClass("show");
        } else {
            $(".identityPros").removeClass("show");
        }
        if (index == 3) {
            $(".ocrPros").hasClass("show");
            $(".ocrPros").addClass("show");
        } else {
            $(".ocrPros").removeClass("show");
        }
    })

    // 点击产品大全的几个产品，跳转到对应的详情页面
    $(".proAlls li").on('click', function () {
        // if ($(this).data('href') == "") {
        //     toast('功能未开放');
        //     return;
        // }
        // console.log($(this).data('href'));
        location.href = $(this).data('href');
        return false;
    });

    // 拖拽 加载
    $("body").flowUp(".allProducts li", { transalteY: 100, duration: 1 });

})