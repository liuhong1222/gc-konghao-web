
// var url = 'http://90949.cn/web';  // 地址  
var downUrl = 'http://' + window.location.hostname + ':8180/';  // 测试  
var url = 'http://172.16.43.49:8765/web';  // stable地址  
var token, tel;
var timer;
var timer1 = null;
var timerEmail;
var userId = '';
var isAgent = 0;  //isAgent为1的时候隐藏产品大全栏除空号检测产品以外的所有产品，isAgent为0的时候显示产品大全栏下的全部产品
var isPay = 1;  //isPay为1的时候显示充值模块以及充值按钮，isPay为0的时候隐藏充值模块以及充值按钮
var isAuth = '';  //认证到那步骤
var userType = '';//那个认证了
var isWhiteUser = "";// 判断是黑白
var isInitPwd = "";  //判断是否初次登录
var ip;
var hfDomain = document.domain;

// 判断当前的index.html  提示认证
var htmlUrl = location.href;
var htmlName = htmlUrl.substring(htmlUrl.lastIndexOf('/') + 1);
var fileurls = location.href;
if (fileurls.indexOf("?") != -1) {
    var filestr = fileurls.substr(1);
    filestrs = filestr.split("&");
    filestrs[0].split("=")[1];
    var tag = filestrs[0].split("=")[1];
}

// 获取?userId
var urlUserId = location.search;
var theParam = new Object();
if (urlUserId.indexOf("?") != -1) {
    var str = urlUserId.substr(1);
    strs = str.split("&");
    for (var i = 0; i < strs.length; i++) { //遍历参数数组
        theParam[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
}
for (var key in theParam) {
    if (key == 'userId') {
        sessionStorage.setItem('inviteUseId', theParam[key])  //存储邀请的userId
    }
}

// 公共登录框
$("body").append(
    '<div id="login-mode" style="display:none">' +
    '<div id="tabs">' +
    ' <ul class="clearfix has-wechat">' +
    '<li class="active">快捷登录</li>' +
    ' <li class="has-wechat-li">账号登录</li>' +
    '</ul>' +
    '</div>' +
    '<div class="accountLogin loginShow info-hide ">' +
    '<div class="accLoginShow">' +
    ' <i class="phoneIcon"></i>' +
    '<input type="text" placeholder="请输入账号/手机号/邮箱"  id="phoneEmailAcc">' +
    ' <p class="iphone-warn-acc">请输入账号</p>' +
    '<i class="tyan"></i>' +
    '<input type="password" placeholder="请输入密码" id="accPwdInp" style="margin-bottom:20px">' +
    ' <p class="pwd-warn-acc">请输入密码</p>' +
    '<div class="clearfix" style="margin-bottom:15px;color: #3a7cff;">' +
    // '<input type="checkbox" id="remindPwd"  class="checkbox" style="display:none">' +
    // ' <label for="remindPwd" style="margin-right:0"></label> 自动登录' +
    '<a href="javascript:;" class="fr forgetPwd">忘记密码</a>' +
    '</div>' +
    ' <div id="accLoginBtn">登 &nbsp; 录</div>' +
    '</div>' +
    ' </div>' +
    '<div class="quickLogin loginShow  info-hide info-show">' +
    '<div class="quickLshow">' +
    ' <i class="phoneIcon"></i>' +
    '<input type="text" placeholder="请输入手机号码" name="phone" class="phone" id="account">' +
    ' <p class="iphone-warn">请输入手机号</p>' +
    '<p id="warningTel">手机格式不正确</p>' +
    '<i class="tyan"></i>' +
    '<input type="text" placeholder="请输入验证码" name="password" class="pwd">' +
    '<p class="password-warn">请输入验证码</p>' +
    ' <div id="loginBtn">登 &nbsp; 录</div>' +
    '</div>' +
    ' <div class="getCodes">' +
    '<input type="text" value="获取验证码" class="getCode" name="getCode" readonly>' +
    ' <input type="text" value="60S" class="codeBtn" name="codeBtn" readonly>' +
    ' </div>' +
    ' </div>' +
    ' </div>' +
    '<div id="mask"></div>'
)
// 公共的认证
// 登录成功后，先判断有没有验证过，如果没有验证，提示他去验证，否则不提示
$("body").append(
    '<div id="auth-mask"  style="display:none">' +
    '<a href="javascript:;" class="fr closeAuth"><img src="../images/closeAuth.png" alt=""></a>' +
    '<div id="whiteShow">' +
    '<p class="ser">为了更好的给你提供服务</p>' +
    ' <p>请您完善<span>认证资料</span></p>' +
    '</div>' +
    '<div id="blackShow">' +
    '<p class="blackInfo">您的账号存在异常，为保证您的正常使用和账号安全，请您先完成认证，认证审核通过后，系统将赠送您5000条数。</p>' +
    '</div>' +
    '<button id="notAuth">我再看看</button>' +
    '<button id="selectAuth">马上完善</button>' +
    '<div class=authBtnSel>' +
    '<input type="button" id="perAuthBtn" value="个人认证">' +
    '<input type="button" id="priseAuthBtn" value="企业认证">' +
    '</div>' +
    '</div>'
)
// 跳转的提示
$("body").append(
    '<div id="JumpPrompt"  style="display:none">' +
    '<div class="kuimg">' +
    '<img src="../images/ku.png" alt="">' +
    '</div>' +
    '<h3>登录失败</h3>' +
    '<p>系统检测到您上次的登录地址为' +
    '<span class="JumpPromptAdress"></span>' +
    '</p>' +
    '<div>' +
    '<span id="secondLogin">10</span>' +
    'S后将自动进入到原来的地址，或点击<a href="javascript:;" id="immedEnter">立即进入</a></div>' +
    '</div>'
);
// 全屏弹窗
$("body").append(
    '<div class="divBG"></div>'
)
// 忘记密码
$("body").append(
    '<div class="basicSet retrievePwd" style="display: none">' +
    '<span class="basicSetClose">' +
    '<img src="../images/close_black.png" alt="">' +
    ' </span>' +
    '<h2>找回密码</h2>' +
    '<form action="">' +
    ' <input type="text" placeholder="请填写与您帐户关联的邮箱地址" class="emailAddress" >' +
    '<p class="emailAddressWarn">邮箱地址不能为空！</p>' +
    '<input type="text" placeholder="请输入邮箱验证码" class="fl emailCode">' +
    '<p style="top:203px" class="emailCodeWarn">邮箱验证码不能为空！</p>' +
    '<div class="fr getEmail">' +
    ' <input type="text" value="获取验证码" id="getEmailCode" readonly>' +
    ' <input type="text" value="60S" class="getEmailCodeTime" readonly>' +
    '</div>' +
    '<input type="button" value="下一步" id="emailNextBtn">' +
    '</form>' +
    '</div>'
);
// 邮箱找回修改密码 
$("body").append(

    ' <div class="basicSet emailEditPwd" style="display:none">' +
    '<span class="basicSetClose">' +
    ' <img src="../images/close_black.png" alt="">' +
    '</span>' +
    '<h2>修改密码</h2>' +
    ' <form action="">' +
    // class="emailEditNewPwd" 
    ' <input type="password" name="forgetPwdEmail" id="forgetPwdEmail" class="form-control"  autocomplete="new-password" placeholder="请输入8~16的位新密码！"  required="required"/>' +
    ' <p class="emailEditNewPwdWarn">密码格式不正确</p>' +
    '<p class="emailEditNewPwdWarns">密码长度为8~16位！</p>' +
    '<input type="password" placeholder="请确认新密码" class="emailEditNewPwdNext" disabled>' +
    '<p style="top:203px" class="emailEditNewPwdNextWarn">请确认新密码</p>' +
    '<p style="top:203px" class="emailEditNewPwdNextWarns">两次输入的密码不一致</p>' +
    ' <input type="button" value="确定" id="editPedTrueBtn">' +
    '</form>' +
    ' </div>'
)
//  首次登录---提示修改密码
$('body').append(
    '<div class="basicSet firstLoginEditPwd" style="display:none">' +
    '<span class="basicSetClose firstLoginEditPwdClose">' +
    '<img src="../images/close_black.png" alt="">' +
    '</span>' +
    '<h2>修改密码</h2>' +
    '<form action="">' +
    '<input type="password" placeholder="请输入原始密码" class="originLoginPwd">' +
    '<p class="originLoginPwdWarn">原始密码不能为空！</p>' +
    '<input type="password" placeholder="请输入新密码" class="newLoginPwd" disabled>' +
    ' <p class="newLoginPwdWarn" style="margin-top: 70px;">新密码不能为空！</p>' +
    '<input type="password" placeholder="请再次输入新密码" class="nextNewLoginPwd" disabled>' +
    '<p class="nextNewLoginPwdWarn" style="margin-top: 140px;">确认密码不能为空！</p>' +
    '<p class="nextNewLoginPwdWarns" style="margin-top: 143px;">两次输入的密码不一致！</p>' +
    '<input type="button" value="确定" id="firstLoginEditPwdBtn">' +
    ' <div style="text-align: left;color: #333;margin-top: 10px">' +
    '<span>为保证您的资金安全，请尽快修改初始密码。</span>' +
    ' </div>' +
    ' </form>' +
    ' </div>'
);



function meiqia(m, ei, q, i, a, j, s) {
    m[i] = m[i] || function () {
        (m[i].a = m[i].a || []).push(arguments)
    };
    j = ei.createElement(q),
        s = ei.getElementsByTagName(q)[0];
    j.async = true;
    j.charset = 'UTF-8';
    j.src = 'https://static.meiqia.com/dist/meiqia.js?_=t';
    s.parentNode.insertBefore(j, s);
};

getWebSite()
function getWebSite() {
    $.ajax({
        url: url + "/login/webSiteInit",
        type: 'POST',
        dataType: 'json',
        data: {
            domain: hfDomain
            // domain: 'data.253.com'
        },
        success: function (data) {
            if (data.resultCode === '000000') {

                if (data.resultObj.customerStatus == "0") {
                    if (data.resultObj.customerID == "") {
                        $("#qqIcon").hide()
                        // 隐藏美洽的id
                        sessionStorage.setItem('customerID', "")
                    } else {
                        $("#qqIcon").show()
                        // 保存美洽的id
                        sessionStorage.setItem('customerID', data.resultObj.customerID);
                        meiqia(window, document, 'script', '_MEIQIA')
                        _MEIQIA('entId', data.resultObj.customerID);
                        //在这里开启手动模式（必须紧跟美洽的嵌入代码）
                        _MEIQIA('manualInit');
                        // 点击美洽
                        $("#qqIcon").on('click', function () {
                            $("#qqIcon").hide()
                            // 你可以自己的代码中选择合适的时机来调用手动初始化
                            _MEIQIA('init');
                        })

                    }

                } else if (data.resultObj.customerStatus == "-1" || data.resultObj.customerStatus == null || data.resultObj.customerStatus == "") {

                    $("#qqIcon").hide()
                    // 隐藏美洽的id
                    sessionStorage.setItem('customerID', "")
                }

                if (data.resultObj.isAboutMe == 'yes') {
                    $(".aboutWe").show();
                } else if (data.resultObj.isAboutMe == 'no') {
                    $(".aboutWe").hide();
                }

                if (data.resultObj) {
                    var logoUrl, //代理商logo图片地址
                        iconUrl, //代理商icon图片地址
                        address, //代理商公司地址
                        companyName,
                        licence, //电信许可
                        copyright, //版权信息
                        icpRecord, //icp备案
                        policeRecord,//公安备案
                        hotline,//客服热线
                        qq,//qq
                        contactInfo,
                        bizNo; //商务合作号
                    logoUrl = data.resultObj.logoUrl ? data.resultObj.logoUrl : '';
                    iconUrl = data.resultObj.iconUrl ? data.resultObj.iconUrl : '';
                    address = data.resultObj.address ? data.resultObj.address : '';
                    companyName = data.resultObj.companyName ? data.resultObj.companyName : '';
                    licence = data.resultObj.licence ? data.resultObj.licence : '';
                    copyright = data.resultObj.copyright ? data.resultObj.copyright : '';
                    icpRecord = data.resultObj.icpRecord ? data.resultObj.icpRecord : '';
                    policeRecord = data.resultObj.policeRecord ? data.resultObj.policeRecord : '';
                    hotline = data.resultObj.hotline ? data.resultObj.hotline : '';
                    qq = data.resultObj.qq ? data.resultObj.qq : '';
                    contactInfo = data.resultObj.contactInfo ? data.resultObj.contactInfo : '';
                    bizNo = data.resultObj.bizNo ? data.resultObj.bizNo : '';
                    if (logoUrl && logoUrl != '') {
                        $('.lists-wrapper .logo a img').attr("src", downUrl + logoUrl);
                        $('#headLogoImg').attr("src", downUrl + logoUrl);
                        $('#headerINDEX .nav .logo').css({ 'background-image': "url(" + (downUrl + logoUrl) + ")" })
                    }
                    if (iconUrl && iconUrl != '') {
                        $("#icon").attr("href", downUrl + iconUrl);
                    }
                    if (address && address != '') {
                        $(".msj-adress").html(address)
                    }
                    if (companyName && companyName != '') {
                        $(".msj-companyName").html(companyName)
                    }
                    if (copyright && copyright != '') {
                        $(".msj-copyright").html(copyright)
                    }
                    if (licence && licence != '') {
                        $(".msj-licence").html(licence)
                    }
                    if (icpRecord && icpRecord != '') {
                        $(".msj-icpRecord").html(icpRecord)
                    }
                    if (policeRecord && policeRecord != '') {
                        $(".msj-policeRecord").html(policeRecord)
                    }
                    if (hotline && hotline != '') {
                        $(".msj-hotline").html(hotline);

                        if (hfDomain == "jy.mobwin.com.cn") {  //聚赢
                            $(".custOnline").show()
                        }
                        if (hotline.indexOf(" ") == -1) {
                            $(".custOnlineTipsCon").css('line-height', '46px')
                        } else {
                            $(".custOnlineTipsCon").css('line-height', '22px')
                        }
                        $(".custOnlineTipsCon").html(hotline);
                    }
                    if (qq && qq != '') {
                        $(".msj-qq").html(qq);
                        $(".msj-qq-href").attr('href', `http://wpa.qq.com/msgrd?V=3&uin=${qq}&Site=qq&Menu=yes`);
                        $(".msj-qq-src").attr('src', `http://wpa.qq.com/pa?p=2:${qq}:51`);
                    }
                    if (contactInfo && contactInfo != '') {
                        $(".contactInfo").html(contactInfo)
                    } else {
                        $(".contactInfoName").hide()
                    }
                    if (bizNo && bizNo != '') {
                        $(".msj-bizNo").html(bizNo)
                    }
                }
            }
        }
    });
}
// 代理商时候存在充值
isPayAgent()
function isPayAgent() {
    $.ajax({
        url: url + '/login/isPay',
        method: 'POST',
        dataType: 'json',
        data: {
            domain: hfDomain
        }
    }).done(function (res) {
        if (res == true) {
            $(".how-recharge-self").show();
            $(".how-recharge-kefu").hide();
        } else if (res == false) {
            $(".how-recharge-self").hide();
            $(".how-recharge-kefu").show();
        }
    }).fail(function (err) {
        toast('稍后重试');  //系统异常
    })
}
// ==================认证=================================
// 点击个人资料，判断是否认证过
function infoIsAuth(isAuth, userType) {
    if (isAuth == 0 || isAuth == null || isAuth == "") {  //没认证过
        $("#whiteShow").show(); //白
        $("#blackShow").hide(); //黑
        $("#auth-mask").show();
        $("#mask").show();
    } else {    //认证过 (然后判断认证过的是个人还是企业)
        if (userType == 0) {
            location.href = "./perAuth.html";
        } else if (userType == 1) {
            location.href = "./perAuth.html"
        }
    }
}
// 鼠标点击，马上完善，显示
$("#selectAuth").off().on('click', function () {
    $(".authBtnSel").show();
})
// 点击我再看看的时候，相当于点击的关闭
$("#notAuth,.closeAuth").on('click', function () {
    $("#auth-mask").hide();
    $("#mask").hide();
    if (sessionStorage.getItem('weisee')) {
        sessionStorage.removeItem('weisee');
        if (window.location.href.indexOf("wechartLogin") != -1) {
            window.location.href = './index.html';
        } else {
            location.reload();
        }
        return
    } else {
        location.reload();
    }
});

// 点击个人认证
$("#perAuthBtn").on('click', function () {
    location.href = "./perAuth.html"
    sessionStorage.setItem('auth', 'perAuth')
});
// 点击企业认证
$("#priseAuthBtn").on('click', function () {
    location.href = "./perAuth.html"
    sessionStorage.setItem('auth', 'priseAuth')
});

//历史检测---tab栏切换
$(".his-tabs ul.tabs li").click(function () {
    $(".his-tabs  ul.tabs li").removeClass("active");
    $(this).addClass("active");
    var activeTab = $(this).find("a").attr("href");
    $(".his-tabs  .hide").hide();
    $(activeTab).show();
    return false;
})

// 如果余额提醒为空，或者ip地址为空，按钮灰色，禁止点击，不为空时候，变成紫色rgb(35,51,121)
function controlBtn(btn, ele, val, val1) {
    if ($(val).val() == "") {
        $(btn).css({ 'background-color': 'rgb(207,205,205)' })  //灰色
        $(btn).attr("disabled", "disabled");
    } else {
        $(btn).css({ 'background-color': '#3a7cff' })    //紫色
        $(btn).removeAttr("disabled")
    }

    // 输入值变成紫色，否则为灰色禁用
    $(ele).bind('input propertychange', function () {
        if ($(val).val() != "" && $(val1).val() != "") {
            $(btn).css({ 'background-color': '#3a7cff' })    //紫色
            $(btn).removeAttr("disabled")
        } else {
            $(btn).css({ 'background-color': 'rgb(207,205,205)' })  //灰色 
            $(btn).attr("disabled", "disabled");
        };
    });
}
controlBtn('#ipSaveBtn', 'textarea', '#IpValue');   //ip  绑定
controlBtn('#balSaveBtn', 'input', '.remindInp', '.remindInp1');  //余额提醒 同时满足两个条件

// 登录成功，充值，个人中心显示，登录按钮，登录的框框隐藏
function loginShow() {
    $(".lists-wrapper #login").hide();
    $(".lists-wrapper .personal-center").show();
    $("#login-mode").hide();
    window.location.href = "./empty.html";  //跳转首页
}
// 登录失败，充值，个人中心隐藏，登录按钮，登录的框框显示
function loginHide() {
    $(".lists-wrapper #login").show();
    $(".lists-wrapper #chongBtn").hide();
    $(".lists-wrapper .personal-center").hide();
    $("#login-mode").stop().fadeIn();
}
// toast提示框
$('body').append('<div id="tipBox">' + '</div>');
/* 显示提示框 */
function toast(val) {
    $("#tipBox").html(val);
    $("#tipBox").stop().show();
    setTimeout(function () {
        $("#tipBox").stop().hide();
    }, 3000)
}
/* 查询登录状态 */
/* ======================================= */
function isLogin(callback) {
    $.ajax({
        url: url + '/login/isLogout',
        method: 'GET',
        dataType: 'json',
        data: {
            mobile: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token')
        }
    }).done(function (res) {
        if (res.resultCode == "000000") {  //登录成功
            // 隐藏登录按钮，显示充值和个人中心
            if (!res.resultObj) {
                sessionStorage.removeItem('hf_isAgent');
                sessionStorage.removeItem('hf_isPay');
                sessionStorage.setItem('id', '');
                sessionStorage.setItem('token', '');
                window.location.href = "./index.html";  //跳转首页
                self.location = './index.html';
                return;
            }
            // 登录成功显示
            $(".lists-wrapper #login").hide();
            $(".lists-wrapper .personal-center").show();
            callback();
        } else {
            sessionStorage.removeItem('hf_isAgent');
            sessionStorage.removeItem('hf_isPay');
            $(".lists-wrapper #login").show();
            $(".lists-wrapper #chongBtn").hide();
            $(".lists-wrapper .personal-center").hide();
            // 空号产品接入,空号检测api, 账号二次清洗
            $(".empty-access,.emptyAPi-access,.accTwo-access,.faceLive-access-tiao,.ocr-access-tiao,.bankAuth-access,.bank-access-tiao,.proAccessBtn,.face-access,.ocr-access,.real-access,.opera-access,.identver-access,.bankThree-access,.bankFour-access,.rechargeBtnOne,.Invitation").on('click', function (event) {
                toast("请先登录，再进入...");
                event.stopPropagation();
            });
        }
    }).fail(function (err) {
        toast(err.resultMsg)
        sessionStorage.removeItem('hf_isAgent');
        sessionStorage.removeItem('hf_isPay');
        $("#login").show();
        $("#chongBtn").hide();
        $(".personal-center").hide();
    });
}
//  登录状态的页面跳转
function loginHref() {
    $(".fistNav a").attr('href', './empty.html');  //登录成功后，首页调转到检测的首页
    $(".emptyTest").data('href', './empty.html');  //空号检测页面跳转
    $(".emptyTestApi").data('href', './emptyApiResult.html'); //空号检测api
    $(".accTwoClear").data('href', './accTwoResult.html'); //账号二次清洗
    $(".codeRealquery").data('href', './realQuResult.html'); // 号码实时在线查询api
    $(".operatorsEle").data('href', './opEleResult.html');  //运营商三要素api
    $(".identverAPI").data('href', './identVerResult.html'); //身份信息核验API
    $(".bankThreeEle").data('href', './bankAuthResult.html?bk=bankAuthRe'); //银行卡鉴权
    $(".bankFourEle").data('href', './bankAuthResult.html?bk=bankAuthDetailRe'); //银行卡鉴权api
    $(".faceContrast").data('href', './faceLiveResult.html?re=face'); //人脸比对
    $(".liveContrast").data('href', './faceLiveResult.html?re=live'); //活体检测
    $(".bankOcrResult").data('href', './proOcrResult.html?url=bank'); //银行卡详情
    $(".identOcrResults").data('href', './proOcrResult.html?url=identOcr'); //身份证详情
    $(".driverOcrResult").data('href', './proOcrResult.html?url=driver'); //驾驶证详情
    $(".businOcrResult").data('href', './proOcrResult.html?url=busin'); //营业执照
}
//登录方式切换
$("#login-mode #tabs ul li").on('click', function () {
    $("#login-mode #tabs ul li").removeClass('active');
    $(this).addClass('active');
    var index = $("#login-mode #tabs ul li").index(this);
    if (index == 0) {
        $(".quickLogin").hasClass("info-show");
        $(".quickLogin").addClass("info-show");
    } else {
        $(".quickLogin").removeClass("info-show");
    }
    if (index == 1) {
        $(".accountLogin").hasClass("info-show");
        $(".accountLogin").addClass("info-show");
    } else {
        $(".accountLogin").removeClass("info-show");
    }
})
// ------------------------------------------------//

function valid(id) {
    $(id).passwordRulesValidator({
        'msgRules': '你填写的密码必须符合下面的规则：',
        'rules': {
            'length': {
                'regex': '^.{6,32}$',
                'name': 'length',
                'message': '密码长度至少为6-32个字符',
                'enable': true
            },
            'lowercase': {
                'regex': '[a-z]{1,}',
                'name': 'lowercase',
                'message': '至少需要一个小写字母',
                'enable': true
            },
            'uppercase': {
                'regex': '[A-Z]{1,}',
                'name': 'uppercase',
                'message': '至少需要一个大写字母',
                'enable': true
            },
            'number': {
                'regex': '[0-9]{1,}',
                'name': 'number',
                'message': '至少需要一个数字',
                'enable': true
            },
        }
    })
}

$("#forgetPwdEmail").focus(function () {
    $("#checkRulesList").show();
    $(".emailEditNewPwdWarn").hide()
}).blur(function () {
    if ($(".rules .ok").length < 4) {
        $(".emailEditNewPwdWarn").show();
    }
    $("#checkRulesList").hide();
});

// =---------------------------------------------------------//
//============================= 登录验证===============================================
$('#account').bind('input', function () {
    var tel = $.trim($(".phone").val());
    setTimeout(function () {
        phoneIsMatch(tel, function () {
            init(tel)
        })
    }, 250)
});
// 当密码文本框失去焦点
$(".quickLshow .pwd").blur(function () {
    if ($(".pwd").val() == "") {
        $(".password-warn").addClass('warnShow');
        return;
    }
    if ($(".pwd").val() != "") {
        $(".password-warn").removeClass('warnShow');
        return;
    }
});
// 判断是几，判断是否认证
function isAuthMsj(isAuth) {
    // alert(isAuth)
    if (isAuth == 0 || isAuth == null || isAuth == "") {  //没认证过
        // alert(isAuth)
        $("#whiteShow").show(); //白
        $("#blackShow").hide(); //黑
        $("#auth-mask").show();
        $("#mask").show();
        sessionStorage.setItem('isShow', 'show');
    } else {    //认证过（1：待审核，2：驳回，3：完成）
        $("#auth-mask").hide();
        $("#mask").hide();
        location.reload()
    }
}
// 跳页面后判断是否认证
// function isAuthMsjno(isAuth) {
//     // alert(isAuth)
//     if (isAuth == 0 || isAuth == null || isAuth == "") {  //没认证过
//         // alert(isAuth)
//         $("#whiteShow").show(); //白
//         $("#blackShow").hide(); //黑
//         $("#auth-mask").show();
//         $("#mask").show();
//         sessionStorage.setItem('isShow', 'show');
//     } else {    //认证过（1：待审核，2：驳回，3：完成）
//         $("#auth-mask").hide();
//         $("#mask").hide();
//     }
// }
// 点击(手机号验证码)登录按钮
$("#loginBtn").on('click', function () {
    var tel = $.trim($(".phone").val());
    var code = $(".pwd").val();

    phoneIsMatch(tel, function () { //验证手机号
        if (code) {
            $(".password-warn").removeClass('warnShow');
            // 登录按钮显示登录中
            $("#loginBtn").html('登录中');
            $("#loginBtn").css({
                'background-color': '#ccc',
                'pointer-events': 'none'
            });
            // debugger
            login(tel, code, function () {
                loginCallaBck();
            });
        } else {
            $(".password-warn").addClass('warnShow');
        }
    })
});

function loginCallaBck() {
    // alert('登录成功回调')
    // debugger
    getUserId(function () {
        // debugger
        if (isInitPwd == 'true') { //是否初始密码
            // alert('我是初始密码')
            $(".firstLoginEditPwd").show();
            $(".divBG").show();
        } else {
            if (tag == "bank") {
                location.href = "./proOcrResult.html?url=bank"
            } else if (tag == "driver") {
                location.href = "proOcrResult.html?url=driver"
            } else if (tag == "mas") {
                location.href = "./proOcrResult.html?url=identOcr"
            } else if (tag == "busin") {
                location.href = "./proOcrResult.html?url=busin"
            } else if (tag == "face") {
                location.href = "./faceLiveResult.html?re=face"
            } else if (tag == "live") {
                location.href = "./faceLiveResult.html?re=live"
            } else if (htmlName == "nullCodeTest.html" || htmlName == "emptyAPI.html" || htmlName == "accTwoClean.html" || htmlName == "realOnQuery.html") {
                loginAccess();
                $(".empty-access,.emptyAPi-access,.accTwo-access,.real-access").trigger('click')
            } else {
                location.reload();
                $(".firstLoginEditPwd").hide();
            }

        }
    })

}
// 新域名功能开始
//点击（账号密码登录）按钮
$("#accLoginBtn").on('click', function () {
    var tel = $.trim($("#phoneEmailAcc").val());
    var pwd = $("#accPwdInp").val();
    if (tel == "") {
        $(".iphone-warn-acc").addClass('warnShow');
        return;
    }
    if (pwd == "") {
        $(".pwd-warn-acc").addClass('warnShow');
        return;
    }
    // 登录接口
    loginAcc(tel, pwd, function () {
        loginCallaBck()
    });
})

// 当账号文本框失去焦点
$("#phoneEmailAcc").blur(function () {
    if ($.trim($("#phoneEmailAcc").val()) == "") {
        $(".iphone-warn-acc").addClass('warnShow');
        return;
    }
    if ($.trim($("#phoneEmailAcc").val()) != "") {
        $(".iphone-warn-acc").removeClass('warnShow');
        return;
    }
});
// 密码失去焦点
$("#accPwdInp").blur(function () {
    if ($("#accPwdInp").val() == "") {
        $(".pwd-warn-acc").addClass('warnShow');
        return;
    }
    if ($("#accPwdInp").val() !== "") {
        $(".pwd-warn-acc").removeClass('warnShow');
        return;
    }
});

// 点击忘记密码
$(".forgetPwd").off().on('click', function () {
    if ($("#phoneEmailAcc").val() == "") {
        toast('请输入账号进行找回密码!');
        return
    }
    valid('#forgetPwdEmail')
    $(".retrievePwd").show();
    $(".emailAddress").val('');
    $(".emailCode").val('');
    $("#getEmailCode").show();
    $(".getEmailCodeTime").hide();
    $(".getEmailCodeTime").val('60S')
    $(".divBG").show();
})
// 邮箱找回密码
// 点击下一步
$("#emailNextBtn").off().on('click', function () {
    var emailAddress = $(".emailAddress").val();
    var emailCode = $(".emailCode").val();
    if (emailAddress == "") {
        $(".emailAddressWarn").addClass('warnShow');
        return;
    }
    if (emailCode == "") {
        $(".emailCodeWarn").addClass('warnShow');
        return;
    }
    // 调用接口进行下一步
    checkMailCode()
})

function checkMailCode() {
    $.ajax({
        url: url + '/email/checkMailCode',
        method: 'post',
        dataType: 'json',
        data: {
            userName: sessionStorage.getItem('loginAcc'),
            userId: userId,
            emailRecive: $(".emailAddress").val(),
            code: $(".emailCode").val(),
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            $(".retrievePwd").hide();
            $(".emailEditPwd").show();

        } else {
            toast(res.resultMsg)
        }
    }).fail(function (err) {
        toast(err.resultMsg);
    })
}
// 邮箱地址失去焦点
$(".emailAddress").blur(function () {
    if ($(".emailAddress").val() == "") {
        $(".emailAddressWarn").addClass('warnShow');
        return;
    }
    if ($(".emailAddress").val() !== "") {
        $(".emailAddressWarn").removeClass('warnShow');
        return;
    }
});
//邮箱验证码
$(".emailCode").blur(function () {
    if ($(".emailCode").val() == "") {
        $(".emailCodeWarn").addClass('warnShow');
        return;
    }
    if ($(".emailCode").val() !== "") {
        $(".emailCodeWarn").removeClass('warnShow');
        return;
    }
});
// 获取邮箱验证码
$("#getEmailCode").off().on('click', function () {
    if ($(".emailAddress").val() == "") {
        $(".emailAddressWarn").addClass('warnShow');
        return;
    }
    // 倒计时显示
    // 获取验证码，成功后进行倒计时

    getEmailCodeAjax();   //获取验证码

});
// 获取邮箱验证码
function getEmailCodeAjax() {
    $.ajax({
        url: url + '/email/sendMail',
        method: 'post',
        dataType: 'json',
        data: {
            userName: $("#phoneEmailAcc").val(),
            emailRecive: $(".emailAddress").val()
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            toast("验证码获取成功");
            sessionStorage.setItem('loginAcc', res.resultObj)
            $("#getEmailCode").hide();  //获取验证码隐藏
            $(".getEmailCodeTime").show();   //倒计时显示
            var second = 60;
            timerEmail = setInterval(function () {
                second--;
                $(".getEmailCodeTime").val(second + "S")
                if (second <= 0) {
                    clearInterval(timerEmail);
                    secondDoneEmail();
                }
            }, 1000)
        } else {
            toast(res.resultMsg);
            secondDoneEmail();
        }
    }).fail(function (err) {
        secondDoneEmail();
    })
}
function secondDoneEmail() {
    $('#getEmailCode').val('获取验证码')
    $("#getEmailCode").show();  //获取验证码隐藏
    $(".getEmailCodeTime").hide();   //倒计时显示
    $(".getEmailCodeTime").val('60S')
}

// 点击确定修改密码
$("#editPedTrueBtn").off().on('click', function () {
    var emailEditNewPwd = $("#forgetPwdEmail").val();
    var emailEditNewPwdNext = $(".emailEditNewPwdNext").val();
    console.log($(".emailEditNewPwd").val())
    console.log($(".emailEditNewPwdNext").val())
    if ($(".emailEditNewPwdNext").val() !== "") {
        if ($("#forgetPwdEmail").val() == $(".emailEditNewPwdNext").val()) {
            $(".emailEditNewPwdNextWarn").removeClass('warnShow');
            $(".emailEditNewPwdNextWarns").removeClass('warnShow');
            updateCreUserPwd()

        } else {
            $(".emailEditNewPwdNextWarn").removeClass('warnShow');
            $(".emailEditNewPwdNextWarns").addClass('warnShow'); //确认是否一致
        }
        return;
    }


});
function updateCreUserPwd() {
    $.ajax({
        url: url + '/client/apiAccountInfo/forgetCreUserPwd',
        method: 'post',
        dataType: 'json',
        data: {
            email: $(".emailAddress").val(),
            password: $("#forgetPwdEmail").val()
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            toast('密码修改成功!');
            $(".emailEditPwd").hide();
            // 遮罩层隐藏
            $(".divBG").hide();
        } else {
            toast(res.resultMsg);
        }
    }).fail(function (err) {
        toast(err.resultMsg);
    })
}

// 新密码失去焦点
// $(".emailEditNewPwd").blur(function () {
//     if ($(".emailEditNewPwd").val() == "") {
//         $(".emailEditNewPwdWarn").addClass('warnShow');
//         return;
//     }
//     if ($(".emailEditNewPwd").val() !== "") {
//         if ($(".emailEditNewPwd").val().length < 8) {
//             $(".emailEditNewPwdWarns").addClass('warnShow');
//             $(".emailEditNewPwdWarn").removeClass('warnShow');
//         } else {
//             $(".emailEditNewPwdWarns").removeClass('warnShow');
//             $(".emailEditNewPwdWarn").removeClass('warnShow');
//         }
//         return;
//     }
// });

// 旧密码

$(".emailEditNewPwdNext").blur(function () {
    if ($(".emailEditNewPwdNext").val() == "") {
        $(".emailEditNewPwdNextWarns").removeClass('warnShow');
        $(".emailEditNewPwdNextWarn").addClass('warnShow');
        return;
    }
    if ($(".emailEditNewPwdNext").val() !== "") {
        if ($("#forgetPwdEmail").val() == $(".emailEditNewPwdNext").val()) {
            $(".emailEditNewPwdNextWarn").removeClass('warnShow');
            $(".emailEditNewPwdNextWarns").removeClass('warnShow');
        } else {
            $(".emailEditNewPwdNextWarn").removeClass('warnShow');
            $(".emailEditNewPwdNextWarns").addClass('warnShow'); //确认是否一致
        }

        return;
    }
});
// 首次登录---提示修改密码、
$("#firstLoginEditPwdBtn").on('click', function () {
    var originLoginPwd = $(".originLoginPwd").val();
    var newLoginPwd = $(".newLoginPwd").val();
    var nextNewLoginPwd = $(".nextNewLoginPwd").val();
    if (originLoginPwd == "") {
        $(".originLoginPwdWarn").addClass('warnShow');
        return;
    }
    if (newLoginPwd == "") {
        $(".newLoginPwdWarn").addClass('warnShow');
        return;
    }
    if (nextNewLoginPwd == "") {
        $(".nextNewLoginPwdWarn").addClass('warnShow');
        return;
    }
    if ($(".nextNewLoginPwd").val() !== "") {
        if ($(".newLoginPwd").val() == $(".nextNewLoginPwd").val()) {
            $(".nextNewLoginPwdWarn").removeClass('warnShow');
            $(".nextNewLoginPwdWarns").removeClass('warnShow');
            feignUpdateCreUserPwd();
        } else {
            $(".nextNewLoginPwdWarn").removeClass('warnShow');
            $(".nextNewLoginPwdWarns").addClass('warnShow'); //确认是否一致
        }
        return;
    }
});
// 确认修改初始密码
var timerLoginOut = null;
function feignUpdateCreUserPwd() {
    $.ajax({
        url: url + '/feign/apiAccountInfo/updateCreUserPwd',
        method: 'post',
        dataType: 'json',
        data: {
            mobile: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token'),
            userId: userId,
            password: $(".newLoginPwd").val(),
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            toast('密码修改成功,请重新登录!');
            var timeLoginOut = 1;
            timerLoginOut = setInterval(function () {   //倒计时三秒后，调用检测接口
                timeLoginOut--;
                if (timeLoginOut <= 0) {
                    clearInterval(timerLoginOut);
                    loginOut()
                }
            }, 1000);
            $(".firstLoginEditPwd").hide();
            // 遮罩层隐藏
            $(".divBG").hide();
        } else {

        }
    }).fail(function (err) {
        toast(err.resultMsg);
    })
};


$(".originLoginPwd").blur(function () {
    if ($(".originLoginPwd").val() == "") {
        $(".originLoginPwdWarn").addClass('warnShow');
        return;
    }
    if ($(".originLoginPwd").val() !== "") {
        $(".originLoginPwdWarn").removeClass('warnShow');
        // 验证旧密码是否通过
        checkCreUserOldPwd()
        return;
    }
});
// 关闭 首次登录修改密码
$(".firstLoginEditPwdClose").on('click', function () {
    location.reload();
})
// 验证旧密码是否通过
function checkCreUserOldPwd() {
    $.ajax({
        url: url + '/feign/apiAccountInfo/checkCreUserOldPwd',
        method: 'post',
        dataType: 'json',
        data: {
            mobile: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token'),
            userId: userId,
            password: $(".originLoginPwd").val()
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            if (res.resultObj == "false") {
                toast('旧密码验证失败，请重新输入密码！');
                $(".newLoginPwd").attr("disabled", true);
                $(".nextNewLoginPwd").attr("disabled", true);

            } else {
                toast('旧密码验证成功，请输入新密码！');
                $(".newLoginPwd").removeAttr("disabled");
                $(".nextNewLoginPwd").removeAttr("disabled");
            }

        } else {
            toast(res.resultMsg);
        }
    }).fail(function (err) {
        toast(err.resultMsg);
    })
}
$(".newLoginPwd").blur(function () {
    if ($(".newLoginPwd").val() == "") {
        $(".newLoginPwdWarn").addClass('warnShow');
        return;
    }
    if ($(".newLoginPwd").val() !== "") {
        $(".newLoginPwdWarn").removeClass('warnShow');
        return;
    }
});
$(".nextNewLoginPwd").blur(function () {
    if ($(".nextNewLoginPwd").val() == "") {
        $(".nextNewLoginPwdWarns").removeClass('warnShow');
        $(".nextNewLoginPwdWarn").addClass('warnShow');
        return;
    }
    if ($(".nextNewLoginPwd").val() !== "") {
        if ($(".newLoginPwd").val() == $(".nextNewLoginPwd").val()) {
            $(".nextNewLoginPwdWarn").removeClass('warnShow');
            $(".nextNewLoginPwdWarns").removeClass('warnShow');
        } else {
            $(".nextNewLoginPwdWarn").removeClass('warnShow');
            $(".nextNewLoginPwdWarns").addClass('warnShow'); //确认是否一致
        }
        return;
    }
});

// 关闭弹窗
$(".basicSetClose").on('click', function () {
    // $(".divBG").hide()
    // $(".basicSet").hide()
    location.reload()
});
// 新域名功能结束

// 立即转入按钮
function loginAccess() {
    // 空号产品
    $(".empty-access").on('click', function () {
        // location.href = "../html/empty.html"
        location.href = "./empty.html"
    });
    // 人脸识别
    $(".face-access").on('click', function () {
        location.href = "./faceLiveResult.html?re=face"
    });
    // 空号检测api
    $(".emptyAPi-access").on('click', function () {
        location.href = "./emptyApiResult.html"
    });
    // 账号二次清洗
    $(".accTwo-access").on('click', function () {
        // alert("账号二次清洗")
        location.href = "./accTwoResult.html"
    });
    // ocr
    $(".ocr-access").on('click', function () {
        location.href = "./ocrResult.html"
    });

    $(".opera-access").on('click', function () {
        location.href = "./realQuResult.html"
    });

    //号码实时在线查询
    $(".real-access").on('click', function () {
        location.href = "./realQuResult.html"
    });

    // // 身份信息核验
    $(".identver-access").on('click', function () {
        location.href = "./identVerResult.html"
    });
}

//查看-隐藏密码
//关闭状态
$(".showPwd").on('click', function () {
    var state = $(this).data('state');
    if (state == "off") {   //关闭
        $(".apipass").attr('type', 'text');
        $(".showPwd").data('state', 'on');
        $(".showPwd").css({
            'background-image': 'url(../images/closeEye.png)'
        })
    } else {
        $(".apipass").attr('type', 'password');
        $(".showPwd").data('state', 'off');
        $(".showPwd").css({
            'background-image': 'url(../images/eyes.png)'
        });
    }
});
/* 登录 */
/* ======================================= */
function login(tel, code, callback) {
    $.ajax({
        url: url + '/login/userLogin',
        method: 'GET',
        dataType: 'json',
        data: {
            mobile: tel,
            code: code,
            domain: hfDomain,
            userId: sessionStorage.getItem('inviteUseId'),  //存储邀请的userId
            loginType: 'mobile'
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            if (res.resultObj.domain !== "" && res.resultObj.domain !== null) {
                window.location.href = res.resultObj.domain + '/index.html?token=' + res.resultObj.token + '&mobile=' + tel
                // window.location.href = res.resultObj.domain + '/index.html?token=' + res.resultObj.token + '&mobile=' + tel
                return;
            }
            sessionStorage.setItem('token', res.resultObj.token);
            sessionStorage.setItem('id', tel);
            loginShow();
            callback();
        } else if (res.resultCode == '999981') {
            $("#loginBtn").html('登录');
            $("#loginBtn").css({
                'background-color': '#3a7cff',
                'pointer-events': 'auto'
            });
            $("#JumpPrompt").show();
            $(".JumpPromptAdress").html(res.resultMsg);
            // 点击立即进入
            $("#immedEnter").on('click', function () {
                $(this).attr('href', res.resultMsg)
            })
            var second = 10;
            clearInterval(timer1);
            timer1 = setInterval(function () {
                second--;
                $("#secondLogin").html(second);
                if (second <= 0) {
                    clearInterval(timer1);
                    window.location.href = res.resultMsg;
                }
            }, 1000);
        } else {
            $("#login-mode").show();
            $("#loginBtn").html('登录');
            $("#loginBtn").css({
                'background-color': '#3a7cff',
                'pointer-events': 'auto'
            });
            toast(res.resultMsg);
        }
    }).fail(function (err) {
        toast('稍后重试');  //系统异常
        $("#login-mode").show();
    })
}



//账号登录
function loginAcc(tel, pwd, callback) {
    $.ajax({
        url: url + '/login/userLogin',
        method: 'GET',
        dataType: 'json',
        data: {
            userName: tel,
            password: pwd,
            domain: hfDomain,
            userId: sessionStorage.getItem('inviteUseId'),  //存储邀请的userId
            loginType: 'account'
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
			if (res.resultObj.domain !== "" && res.resultObj.domain !== null) {
                window.location.href = res.resultObj.domain + '/index.html?token=' + res.resultObj.token + '&mobile=' + tel
                // window.location.href = res.resultObj.domain + '/index.html?token=' + res.resultObj.token + '&mobile=' + tel
                return;
            }
            sessionStorage.setItem('token', res.resultObj.token);
            sessionStorage.setItem('id', res.resultObj.userName);
            isInitPwd = res.resultObj.isInitPwd;
            loginShow();
            callback();
        } else {
            toast(res.resultMsg);

        }
    }).fail(function (err) {
        toast('稍后重试');  //系统异常    
    })
}

// 极验验证
// ==================================================================================
var handler = function (captchaObj) {
    captchaObj.onReady(function () {
        $("#wait").hide();
    }).onSuccess(function () {
        $('.getCode').attr('disabled', true);
        $('.getCode').val('等待中...')
        $('.getCode').css({ 'color': '#333', 'background-color': '#fff' });
        var result = captchaObj.getValidate();
        if (!result) {
            return toast('请完成验证');
        }
        $.ajax({
            url: url + "/login/verifyTyCode", // 加随机数防止缓存
            type: 'POST',
            dataType: 'json',
            data: {
                mobile: $("#account").val(),
                geetest_challenge: result.geetest_challenge,
                geetest_validate: result.geetest_validate,
                geetest_seccode: result.geetest_seccode,
                domain: hfDomain
                // domain: 'data.253.com'
            },
            success: function (data) {
                if (data.status === 'success') {
                    clearInterval(timer);
                    var tel = $.trim($("#account").val());
                    phoneIsMatch(tel, function () {   //验证成功
                        $(".getCode").hide();  //获取验证码隐藏
                        $(".codeBtn").show();   //倒计时显示
                        getCode(tel);
                        var second = 60;
                        timer = setInterval(function () {
                            second--;
                            $(".codeBtn").val(second + "S")
                            if (second <= 0) {
                                clearInterval(timer);
                                secondDone();
                            }
                        }, 1000)

                    })
                } else if (data.status === 'fail') {
                    setTimeout(function () {
                        toast('登录失败，请完成验证');
                        captchaObj.reset();
                    }, 1500);
                }
            }
        });
    });
    $('.getCode').off().on('click', function () {
        // 调用之前先通过前端表单校验
        if ($("#account").val() == "") {
            toast("请输入手机号");

        } else {
            var tel = $.trim($(".phone").val());
            phoneIsMatch(tel, function () {
                captchaObj.verify(); //进行验证  
            })
        }
    });
};

function init(tels) {
    $.ajax({
        url: url + "/login/initjyCode?mobile=" + tels, // 加随机数防止缓存
        type: "get",
        dataType: "json",
        success: function (data) {

            // 调用 initGeetest 进行初始化
            initGeetest({
                gt: data.gt,
                challenge: data.challenge,
                new_captcha: data.new_captcha,
                offline: !data.success,
                product: "bind", // 产品形式，包括：float，popup
                width: "300px"
            }, handler);
        }
    });
}

// 回车登录
$("body").keydown(function () {
    if (event.keyCode == "13") {//keyCode=13是回车键
        $('#loginBtn').trigger('click');
        $('#accLoginBtn').trigger('click');
    }
});

//倒计时中断
function secondDone() {
    $('.getCode').attr('disabled', false);
    $('.getCode').val('获取验证码')
    $('.getCode').css({ 'color': '#3066FC', 'background-color': '#fff' });
    $(".getCode").show();
    $(".codeBtn").hide();
    $(".codeBtn").val('60S');
}

function getCode(tel) {
    $.ajax({
        url: url + '/login/sendSms',
        method: 'GET',
        dataType: 'json',
        data: {
            mobile: tel
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            toast("验证码获取成功")
        } else {
            secondDone();
        }
    }).fail(function (err) {
        secondDone();
    })
}

//   退出登录
function loginOut() {
    $.ajax({
        url: url + '/login/logout',
        method: 'GET',
        dataType: 'json',
        data: {
            mobile: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token')
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            sessionStorage.setItem('id', '');
            sessionStorage.setItem('token', '');
            sessionStorage.setItem('isShow', '');

            sessionStorage.removeItem('hf_isAgent');
            sessionStorage.removeItem('hf_isPay');
            sessionStorage.removeItem('inviteUseId');   //移除邀请的代理商id

            sessionStorage.removeItem('asideStatus'); 

            location.reload();
            window.location.href = "./index.html";  //跳转首页
            self.location = 'index.html';

        } else {
            toast('请求超时');
        }
    }).fail(function (err) {
        toast('请求超时');
    });
}

// 余额格式转换
function formatNumber(n, zero) {
  var point = n.toString().indexOf(".") !== -1 ? n.toString().substr(n.toString().indexOf(".")) : "";
  var b = parseInt(n).toString();
  var len = b.length;
  var zero = zero || "";
  if (len <= 3) { return b + point + zero; }
  var r = len % 3;
  return r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") + point + zero : b.slice(r, len).match(/\d{3}/g).join(",") + point + zero;
}

// 个人中心，账户余额
function getBalance(callback) {
    // debugger
    $.ajax({
        url: url + '/userAccount/findbyMobile',
        method: 'GET',
        dataType: 'json',
        data: {
            mobile: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token')
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            if (res.resultObj) {
                sessionStorage.setItem('balance', res.resultObj.account);
                $("#accNumber").html(formatNumber(res.resultObj.account));
                $("#moneyAccs").html((Math.floor((res.resultObj.account / 10000) * 100) / 100).toFixed(2) + "W");
            } else {
                sessionStorage.setItem('balance', '0');
            }
            callback();
        } else {
            toast(res.resultMsg);
            $("#accNumber").html('0'); //个人中心，账户余额
        }
    }).fail(function (err) {
        toast('请求超时');
        $("#accNumber").html('0');//个人中心，账户余额
    })
}


function isPhoneNumber(tel) {
    var reg = /^0?1[3|4|5|6|7|8][0-9]\d{8}$/;
    if (reg.test(tel)) {
        $(".editIphone").html('修改')
    } else {
        $(".editIphone").html('绑定')
    }

}
//  用户id 
function getUserId(callback) {
    $.ajax({
        url: url + '/user/findbyMobile',
        method: 'GET',
        dataType: 'json',
        data: {
            mobile: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token'),
            domain: hfDomain
            // domain: 'data.253.com'
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            userId = res.resultObj.id;
            $("#phone").html(res.resultObj.userPhone);
            isPhoneNumber(res.resultObj.userPhone)

            $("#oldPhone").val(res.resultObj.userPhone);
            $("#emails").val(res.resultObj.userEmail);
            $("#userEmail").html(res.resultObj.userEmail ? res.resultObj.userEmail : '(暂未绑定邮箱)');
            $(".editEmail").html(res.resultObj.userEmail != null ? '修改' : '添加');

            isAgent = res.resultObj.isAgent ? res.resultObj.isAgent : 0;  //大全栏下的全部产品
            sessionStorage.setItem('hf_isAgent', isAgent);

            isPay = res.resultObj.isPay ? res.resultObj.isPay : 1;  //判断是否认证
            sessionStorage.setItem('hf_isPay', isPay);  //充值模块以及充值按钮

            //显示隐藏充值按钮
            hfisPay();
            isWhiteUser = res.resultObj.isWhiteUser;  // 判断是黑还是白
            isAuth = res.resultObj.isAuth;  //判断是否认证
            userType = res.resultObj.userType;  //判断是谁认证了
            errorRel = res.resultObj.authMemo// 驳回原因
            isSetPwd = res.resultObj.isSetPwd; //是否设置密码
            callback();
        } else {
            // toast(res.resultMsg);
        }
    }).fail(function (err) {
        toast('请求超时');
    })
}

//获取API账号信息
function getApiInfo(callback) {
    $.ajax({
        url: url + '/feign/apiAccountInfo/findByCreUserId',
        method: 'post',
        dataType: 'json',
        data: {
            creUserId: userId,
            mobile: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token')
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            id = res.resultObj.id;
            $("#getid").val(id)
            $(".apiCount").val(res.resultObj.name);
            $(".apipass").val(res.resultObj.password);
            sessionStorage.setItem('customerIdMsj', res.resultObj.name);

            // 产品的ip绑定
            $("#IpValue").html(res.resultObj.bdIp);
            if (res.resultObj.password) {
                var pwdLen = (res.resultObj.password).substring(0, 16);

                $("#phoneAccOpera").val(pwdLen)
                $("#phoneAccOpera").attr('type', 'password')
                $(".editloginPwd").html('修改')

            } else {
                $("#phoneAccOpera").val('(请设置登录密码)')
                $("#phoneAccOpera").attr('type', 'text')
                $(".editloginPwd").html('设置')
            }
            if (res.resultObj.resultPwd) {
                $("#compressPwd").val(res.resultObj.resultPwd)
                $("#resultPwd").val(res.resultObj.resultPwd)
                $("#resultPwd").attr('type', 'password')
            } else {
                $("#resultPwd").val('(请设置解压检测结果包的安全密码)')
                $("#resultPwd").attr('type', 'text')
            }
            $(".editPassWord").html(res.resultObj.resultPwd ? '修改' : '设置');
            callback();
        } else {
            toast(res.resultMsg);
        }
    }).fail(function (err) {
        toast('请求超时')
    })
}
// 显示每个产品的余额
function getAccWarn(productName) {
    $.ajax({
        url: url + '/user/getUserWarning',
        method: 'post',
        dataType: 'json',
        data: {
            userId: userId,
            productName: productName,
            mobile: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token')
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            if (res.resultObj == null) {
                toast('还没设置余额提醒!');
                return;
            }
            $(".remindInp").val(res.resultObj.warningCount);
            $(".remindInp1").val(res.resultObj.informMobiles);
        } else {
            toast(res.resultMsg);
        }
    }).fail(function (err) {
        toast('请求超时');
    })
}

// 添加，修改余额提醒
function updateAccRemind(productName, warningCount, informMobiles) {
    $.ajax({
        url: url + '/user/updateUserWarning',
        method: 'post',
        dataType: 'json',
        data: {
            userId: userId,
            mobile: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token'),
            productName: productName,
            warningCount: warningCount,
            informMobiles: informMobiles
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            toast(res.resultMsg);
        } else {
            toast(res.resultMsg);
        }
    }).fail(function (err) {
        toast('请求超时');
    })
}

// ip绑定保存
$("#ipSaveBtn").on('click', function () {
    bindIp();
})

//为每个产品绑定ip
function bindIp() {
    $.ajax({
        url: url + '/feign/apiAccountInfo/updateApiAccountInfo',
        method: 'post',
        dataType: 'json',
        data: {
            creUserId: userId,
            bdIp: $("#IpValue").val(),
            id: $("#getid").val(),
            mobile: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token')
        }
    }).done(function (res) {
        if (res.resultCode == '000000') {
            toast("保存成功");
            // $("#ipText").val("");
        } else {
            toast(res.resultMsg);
        }
    })
}
// 未读消息个数
function idreadInfonum() {
    $.ajax({
        url: url + '/message/getNoReadMessageCount',
        method: 'post',
        dataType: 'json',
        data: {
            userId: userId,
            userPhone: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token'),
        }
    }).done(function (res) {
        if (res.ret_code == 0) {
            $(".isreadIcon").html(res.ret_msg);
        }
    }).fail(function () {
        toast('请求超时');
    })
}

function getLatestNews() {
    $.ajax({
        type: "post",
        url: url + '/news/getTop2News',
        dataType: 'json',
    }).done(function (res) {
        var html = "";
        for (var i = 0; i < res.ret_msg.length; i++) {
            html += '<li>'
                + '<div class="info">'
                + '<span>' + timeToDate(res.ret_msg[i].createtime) + '</span>'
                + '<span>' + res.ret_msg[i].title + '</span>'
                + '</div>'
                + '</li>'
        }
        $("#latesnNews").html(html);
    }).fail(function () {
        toast('系统异常');
    })
}


// 下个月
function addMonth(date, num) {
    num = parseInt(num);
    var arr = date.split('-');
    var sYear = parseInt(arr[0]); //获取当前日期的年份
    var sMonth = parseInt(arr[1]); //
    var eYear = sYear;
    var eMonth = sMonth + num;
    while (eMonth > 12) {
        eYear++;
        eMonth -= 12;
    }
    var eDate = new Date(eYear, eMonth - 1);
    while (eDate.getMonth() != eMonth - 1) {
        eDate = new Date(eYear, eMonth - 1);
    }
    return eDate;
}
// 点击上个月
function reduceMonth(date, num) {
    num = parseInt(num);
    var arr = date.split('-');
    var sYear = parseInt(arr[0]); //获取当前日期的年份
    var sMonth = parseInt(arr[1]); //
    var eYear = sYear;
    var eMonth = sMonth + num;
    while (eMonth < 1) {
        eYear--;
        eMonth += 12;
    }
    var eDate = new Date(eYear, eMonth - 1);
    while (eDate.getMonth() != eMonth - 1) {
        eDate = new Date(eYear, eMonth - 1);
    }
    return eDate;
}
// 获取报表数据
function getEcharts(month, proName) {

    var myChart = echarts.init(document.getElementById('main'));
    // 指定图表的配置项和数据
    option = {
        tooltip: {  //提示框
            trigger: 'axis',
            formatter: "检测: {c} 条", // 这里是鼠标移上去的显示数据
            backgroundColor: '#3FA9F5',  // 提示背景颜色，默认为透明度为0.7的黑色
            borderColor: '#333',// 提示边框颜色
        },
        legend: {// 这个就是图例，也就是每条折线或者项对应的示例
            // data:['ssss']
            top: 20,
        },
        toolbox: {   //工具盒
            show: true,
            feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar',] },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        calculable: true,
        xAxis: [
            {
                type: 'category',
                name: '（日/期）',
                boundaryGap: false,
                data: []  //显示x轴
            }
        ],
        yAxis: [
            {
                type: 'value',   //Y轴坐标根据数据的变化  而自动变化
                name: '（条数）',
                // splitNumber:10
            }
        ],

        series: [  //折线图数据
            {
                name: '检测',
                type: 'line',
                smooth: true,  //线性为圆滑
                symbol: 'circle',  //设定为实心点
                symbolSize: 8,  //设定实心点的大小
                sampling: 'average',
                itemStyle: {
                    normal: {
                        color: '#3FA9F5',
                        borderColor: '#fff'
                    }
                },
                stack: 'a',
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                { offset: 0, color: '#3FA9F5' },
                                { offset: 0.3, color: '#3FA9F5' },
                                { offset: 0.5, color: '#95D2FC' },
                                { offset: 0.7, color: '#BFE3FD' },
                                { offset: 1, color: '#ECF7FE' }
                            ]
                        ),
                        lineStyle: {    //线样式
                            color: '#3FA9F5',
                            width: '3'
                        }
                    }
                },
                data: []   //显示数据
            },
        ]
    };
    var result = JSON.stringify({
        userId: userId,
        productName: proName,
        month: month,
        token: sessionStorage.getItem('token'),
        mobile: sessionStorage.getItem('id'),
    })
    //加载数据  
    $.ajax({
        url: url + "/apiInvokingTest/getCreUserApiConsumeCounts",
        type: 'post',
        dataType: 'json',
        data: result,
        contentType: "application/json",
    }).done(function (res) {
        if (res.resultCode == "000000") {
            if (res.resultObj.length == 0) {
                // toast('此月无数据');
                $("#main").hide();
                return;
            }
            $("#main").show();
            var legends = [];    //x轴
            var Series = [];    //数据
            var json = res.resultObj;
            for (var i = 0; i < json.length; i++) {
                legends.push(json[i].days); //x 轴 
                Series.push(json[i].account);  //数据
            }
            option.xAxis[0].data = legends;
            option.series[0].data = Series; // 设置图表  
            myChart.setOption(option);// 重新加载图表  
        } else {
            toast(res.resultMsg)
        }
    }).fail(function (err) {
        toast('失败')
    })
}

//  转化为带时间
function timeToDate(time) {
    var date = new Date(time);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var date = date.getDate();
    var hour = (new Date(time)).getHours();
    var minute = (new Date(time)).getMinutes();
    var second = (new Date(time)).getSeconds();
    if (month >= 10) { month = month; } else { month = "0" + month; }
    if (date >= 10) { date = date; } else { date = "0" + date; }
    if (hour >= 10) { hour = hour; } else { hour = "0" + hour; }
    if (second >= 10) { second = second; } else { second = "0" + second; }
    if (minute >= 10) { minute = minute; } else { minute = "0" + minute; }
    return (year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second);
}
// 转化为不带时间
function dateTrans(time) {
    var date = new Date(time);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var date = date.getDate();
    if (month >= 10) { month = month; } else { month = "0" + month; }
    if (date >= 10) { date = date; } else { date = "0" + date; }
    return (year + '-' + month + '-' + date);
}
/* 验证手机格式 */
/* ======================================= */
function phoneIsMatch(tel, callback) {
    var telReg = /^13[0-9]{9}$|14[0-9]{9}$|15[0-9]{9}$|16[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}$|19[0-9]{9}$/;
    if (tel == "") {
        $("#warningTel").hide();
        $(".iphone-warn").addClass('warnShow');
        return false;
    } else if (tel != "") {
        if (tel.match(telReg)) {
            $(".iphone-warn").removeClass('warnShow');
            $("#warningTel").hide();
            callback();//验证通过
        } else {
            $(".iphone-warn").removeClass('warnShow');
            $("#warningTel").show();
        }
    }
}

//isAgent为1的时候隐藏产品大全栏除空号检测产品以外的所有产品，isAgent为0的时候显示产品大全栏下的全部产品
var hf_isAgent = sessionStorage.getItem('hf_isAgent');
if (hf_isAgent && hf_isAgent == 1) {

    $(".shen_icon").hide()
    $(".ocr_icon").hide()
    $(".kong_icon").hide()
    $("#agentPro").show()

    //干掉产品大全
    $(".proTabs").hide()
    $(".ocrPros").hide()
    $(".nullcodeProducts").show();
    $(".nullcodeProducts").css('margin', '200px 280px')
    $(".identityPros").hide()
    $(".emptyTestApi").hide()
    $(".accTwoClear").hide()
    $(".codeRealquery").hide()
    $(".allProducts").hide()

    $(".khapiTab").hide()
    $(".twoTab").hide()
    $(".realCodeTab").hide()
    $(".nullCodeApi").remove()
    $(".twoCleanCon").remove()
    $(".realCodeQuery").remove()

    //去掉percenter的3个轮播
    $(".pic2").hide()
    $(".pic3").hide()
    $(".pic4").hide()

    //去掉产品服务
    $(".proLink").hide()


} else if (hf_isAgent && hf_isAgent == 0) {  //说明不是代理商客户
    // alert('不是代理商客户')
}

/* isPay为1的时候显示充值模块以及充值按钮，isPay为0的时候隐藏充值模块以及充值按钮*/
/* ================================================== */
function hfisPay() {
    var hf_isPay = sessionStorage.getItem('hf_isPay');
    if (hf_isPay && hf_isPay == 1) {
        $(".lists-wrapper #chongBtn").show();

        $(".how-recharge-self").show();
        $(".how-recharge-kefu").hide();
    } else if (hf_isPay && hf_isPay == 0) {
        ;
        $(".lists-wrapper #chongBtn").hide();

        $(".how-recharge-self").hide();
        $(".how-recharge-kefu").show();
    }
}
hfisPay();
