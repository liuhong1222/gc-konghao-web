$(function () {
    //  已经登录成功
    isLogin(function () {
        loginHref();  //登录成功后，跳转对应的页面
        loginAccess();//登录成功，立即转入
        // $(".fistNav a").attr('href','../html/empty.html');  //登录成功后，首页调转到检测的首页
        // $(".emptyTest").data('href','../html/empty.html');  //空号检测页面跳转
        // $(".emptyTestApi").data('href','../html/emptyApiResult.html')
        
    });
   
    getUserId(function () {
        idreadInfonum(); //获取未读消息个数
        // isAuthMsj(isAuth);
    })
    // 判断是几，判断是否认证
    // function isAuthMsj(isAuth){
    //     if(isAuth == 0 || isAuth== null || isAuth == ""){  //没认证过
    //         $("#auth-mask").show();
    //         $("#mask").show();
    //     }else if(isAuth == 3){    //认证过
    //         $("#auth-mask").hide();
    //         $("#mask").hide();
    //     }
    // }

    // 全屏轮播图
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        paginationClickable: true,
        spaceBetween: 0,
        centeredSlides: true,
        effect: 'fade',  //渐变效果
        autoplay: 3000,
        autoplayDisableOnInteraction: false
    });
    
    // 点击空号的几个产品，跳转到对应的详情页面
    $(".nullCodePro li").on('click', function () {
        // if ($(this).data('href') == "") {
        //     toast('功能未开放');
        //     return;
        // }
        // console.log($(this).data('href'));
        location.href = $(this).data('href');
    });
    // 拖拽 加载
    $("body").flowUp(".nullCodePro li", { transalteY: 100, duration: 1 });

    // 获取最新的两条新闻
     getLatestNews();
     
})