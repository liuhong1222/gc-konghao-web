// 加载头部--头部操作
// $('#header').load('./header.html', function () {
$('#aside').load('./aside.html', function () {
    // debugger
    var links = $(".nav-list li a"),
        index = 0, //默认第一个菜单项  
        //取当前URL最后一个/后面的文件名，pop方法是删除最后一个元素并返回 最后一个元素  
        url = location.href.split("?")[0].split("/").pop();
    if (url) {//如果有取到，则进行匹配，否则默认首页（即index所指向的那个）  
        for (var i = 0; i < links.length; i++) {//遍历menu中的链接地址 
            if (links[i].href.indexOf(url) != -1) {
                index = i;
                break;
            }
        }
    }
    // debugger
    $(".nav-list li").removeClass("active");
    $(".nav-list li").eq(index).addClass("active");//给对应的<li>增加选中样式
    $(".nav-list li img").eq(index).attr('src','../images/iconfont/img' + index + '.svg'); // 变更选中的icon

    // 侧边栏点击收缩
    // debugger
    let shortWidth =  100, longWidth = 220;
    $(".nav-list .nav-switch").on('click', function () {
        console.log($('.aside-wrapper').width())
        // debugger
        if ($('.aside-wrapper').width() == longWidth) { // 收起
            $('.aside-wrapper').width(shortWidth)
            $(".nav-list li a span").hide()
            $(".nav-list .left-icon").hide()
            $(".nav-list .right-icon").show()
            $('.section-wrap').css("marginLeft",shortWidth)
            sessionStorage.setItem('asideStatus', 'packup');
        } else { // 展开
            $('.aside-wrapper').width(longWidth)
            $(".nav-list li a span").show()
            $(".nav-list .right-icon").hide()
            $(".nav-list .left-icon").show()
            $('.section-wrap').css("marginLeft",longWidth)
            sessionStorage.setItem('asideStatus', 'unfold');
        }
    });

    // debugger
    // 监听侧边栏状态
    console.log($(".nav-list .left-icon").is(':hidden'))
    console.log($(".nav-list .right-icon").is(':hidden'))
    console.log(sessionStorage.getItem('asideStatus'))
    if (sessionStorage.getItem('asideStatus') == 'packup') { // 收起
        $('.aside-wrapper').width(shortWidth)
        $(".nav-list li a span").hide()
        $(".nav-list .left-icon").hide()
        $(".nav-list .right-icon").show()
        $('.section-wrap').css("marginLeft",shortWidth)
    }
    //  else {
    //     $('.aside-wrapper').width(longWidth)
    //     $(".nav-list li a span").show()
    //     $(".nav-list .right-icon").hide()
    //     $(".nav-list .left-icon").show()
    //     $('.section-wrap').css("marginLeft",longWidth)
    // }
    


    // 如果为新闻详情，新闻激活
    var str = location.href;
    var obj = str.lastIndexOf("/");
    if (str.substr(obj + 1) == 'newsDetails.html') {
        $(".nav-list li").eq(0).removeClass("active");//给对应的<li>增加选中样式
        $(".nav-list li").eq(3).addClass("active");//给对应的<li>增加选中样式
    }
    // 点击导航栏的登录按钮
    $("#login").on('click', function () {
        $("#login-mode").toggle();
    });

    // 鼠标滑过个人中心时候，下拉显示，鼠标离开隐藏
    $(".personal-center").mouseover(function () {
        $(".personal-center ul").show();
    });
    $(".personal-center").mouseout(function () {
        $(".personal-center ul").hide();
    });
    // 点击退出登录
    $("#loginOut").on('click', function () {
        loginOut();
    });
    // =========================================================================
    // 点击个人资料
    $("#authInfo").off().on('click', function () {
        getUserId(function () {
            infoIsAuth(isAuth, userType);
        })
    })
    // ==========================公共充值==============================================
    $("#chongBtn").on('click', function () {
        localStorage.setItem('rechargeJump', '');  //公共充值--跳转空号检测
        location.href = "./recharge.html";
    });
});

// 加载联系我们侧边栏
$('#online-service').load('./onlineService.html', function () {
    $(".online-tools .online-service").on('mouseover', function (event) {
        event.stopPropagation();
        $(".online-tools .online-service .service-content").show()
    })
    $(".online-tools .online-service").on('mouseout', function (event) {
        event.stopPropagation();
        $(".online-tools .online-service .service-content").hide()
    })
    getWebSite()
});

// 引入公共的底部
$('#footer').load('./footer.html', function () {
    $(".footer-box .proLink ul li").on('click', function (e) {
        location.href = $(this).data('href');
        event.stopPropagation();
    })
    // 客服热线
    $(".custOnline").on('mouseover', function () {
        $(".custOnlineTips").show()
    })
    $(".custOnline").on('mouseout', function () {
        $(".custOnlineTips").hide()
    })

    // 在线客服
    $("#qqIcon").on('mouseover', function () {
        $(this).css('background', ' url(../images/mess2.png) no-repeat')
    })
    $("#qqIcon").on('mouseout', function () {
        $(this).css('background', ' url(../images/qqFIxed.png) no-repeat')
    })
    getWebSite()
});

