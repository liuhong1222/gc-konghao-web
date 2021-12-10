$(function () {
    //  已经登录成功
    isLogin(function () {
        $(".fistNav a").attr('href', './empty.html');  //登录成功后，首页调转到检测的首页
        loginAccess();//登录成功，立即转入
        
    });
    getUserId(function () {
        idreadInfonum(); //获取未读消息个数
    })
})