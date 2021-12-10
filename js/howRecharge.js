
$(function () {
    //  已经登录成功
    isLogin(function () {
        loginHref();  //登录成功后，跳转对应的页面
        loginAccess();//登录成功，立即转入
    });
    getUserId(function () {
        idreadInfonum(); //获取未读消息个数
    }); //api账号信息
    
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
    })

})