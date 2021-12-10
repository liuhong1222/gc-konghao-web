$(function () {
    //  已经登录成功
    isLogin(function () {
        $(".entry").hide();  //隐藏快速登录
        window.location.href = "./empty.html";  //登录成功跳转首页
        loginHref();  //登录成功后，跳转对应的页面
    });
    var timejg = 2000;//轮播间隔时间
    var size = $('.box_img ul li').size();
    $('.box_img ul li').eq(0).show();
    var i = 0;
    var time = setInterval(move, timejg);
    function move() {
        i++;
        if (i == size) {
            i = 0;
        }
        $('.box_img ul li').eq(i).fadeIn(1500).siblings().fadeOut(1500);
    }

    $('.box').hover(function () {
        clearInterval(time);
    }, function () {
        time = setInterval(move, timejg);
    });

    // 点击首页的一键登录
    $("#quickLogin").on('click', function () {
        $("#login-mode").toggle();
    })

    // 点击空号的几个产品，跳转到对应的详情页面
    $(".pro-btn>div .seller-entry").on('click', function (event) {
        location.href = $(this).data('href');
        event.stopPropagation();
    });
   
    // 点击 空号检测
    // $(".kong_icon").on('click',function(){
    //     location.href="../html/emptyPro.html?pro=null";
    // });

    // //点击身份信息核验
    // $(".shen_icon").on('click',function(){
    //     location.href="../html/identityPro.html?pro=ident"
    // });

    // // 点击ocr
    // $(".ocr_icon").on('click',function(){
    //     location.href="../html/ocrPro.html?pro=ocr"
    // });


})