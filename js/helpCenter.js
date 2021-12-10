$(function () {
    //  已经登录成功
    isLogin(function () {
        loginHref();  //登录成功后，跳转对应的页面
        // $(".fistNav a").attr('href','../html/empty.html');  //登录成功后，首页调转到检测的首页
        // $(".emptyTest").data('href','../html/empty.html');  //空号检测页面跳转
        // $(".emptyTestApi").data('href','../html/emptyApiResult.html')
    });
    getUserId(function () {
        idreadInfonum(); //获取未读消息个数
    })

    $(".tabsLeft").height($(".konghao").height()+110+'px')
    // tab栏切换
    $(".conTabsIinfo .tabsLeft span").click(function () {
        $(".conTabsIinfo .tabsLeft span").removeClass("active"); //移除所有的激活类 
        $(this).addClass("active");
        $(".quesHide").hide();
        var activeTab = $(this).data("href");  //获取a标签对应的href
        $(activeTab).show(); //a标签对应的href和对应内容的id对应
        // alert( $(activeTab).height())
        $(".tabsLeft").height($(activeTab).height()+110+'px')
        return false;
    });

})