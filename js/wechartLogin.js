$(function () {

  var wechartCode,  //	微信回调传过来的code
    state,  //	微信回调传过来的state
    mobile,  //手机号码
    openId,  //微信用户的openid
    accessToken; //微信用户的accessToken
    var hfDomain = document.domain;  
  /* 获取微信参数 */
  /* ================================================== */
  function getQueryString(name) {
    var after = window.location.href.split("?")[1];
    if (after) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = after.match(reg);
      if (r != null) {
        return decodeURIComponent(r[2]);
      } else {
        return null;
      }
    }
  }

  wechartCode = getQueryString('code');
  state = getQueryString('state');
  var weisee = sessionStorage.getItem('weisee');  //防止用户微信登录后刷新再次调用接口

  //如果存在参数 
  if (wechartCode && state && !weisee) {
    loginCallBack(wechartCode, state);
  } else if (weisee) {
    sessionStorage.removeItem('weisee');
    window.location.href = './index.html';
  } else {
    toast('系统异常，请重新登录');
  }


  /* 判断微信用户是否已绑定手机号码 */
  /* ================================================== */
  function loginCallBack(wechartCode, state) {
    $.ajax({
      url: url + "/login/weixinLoginCallBack",
      type: 'POST',
      dataType: 'json',
      data: {
        code: wechartCode,
        domain:hfDomain
        // state: state
      },
      success: function (data) {
        if (data.resultCode === '000000') {
          if (data.resultObj) {
            mobile = data.resultObj.mobile ? data.resultObj.mobile : '';
            openId = data.resultObj.openId ? data.resultObj.openId : '';
            accessToken = data.resultObj.accessToken ? data.resultObj.accessToken : '';

            //signed yes:已经绑定 no:未绑定
            if (data.resultObj.signed && data.resultObj.signed == 'yes') {
              sessionStorage.setItem('token', data.resultObj.token);
              sessionStorage.setItem('id', mobile);
              sessionStorage.setItem('weisee', 'weisee');

              loginShow();
              gotoPage();
            }
          }
        } else {
          toast(data.resultMsg);
        }
      }
    });
  }
  

  /* 微信用户绑定手机号码  点击登录按钮*/
  /* ================================================== */
  $("#wechartLoginBtn").on('click', function () {
    var tel = $.trim($(".phone").val());
    var code = $(".pwd").val();
    phoneIsMatch(tel, function () { //验证手机号
      if (code) {
        $(".password-warn").removeClass('warnShow');
        bindMobile(tel, code);
      } else {
        $(".password-warn").addClass('warnShow');
      }
    })
  });

  // 回车登录
  $("body").keydown(function () {
    if (event.keyCode == "13") {//keyCode=13是回车键
      $('#wechartLoginBtn').trigger('click');
    }
  });

  /* 微信用户绑定手机号码 */
  /* ================================================== */
  function bindMobile(tel, code) {
    $.ajax({
      url: url + "/login/weixinBindMobile",
      type: 'POST',
      dataType: 'json',
      data: {
        mobile: tel,
        code: code,
        openId: openId,
        accessToken: accessToken
      },
      success: function (data) {
        if (data.resultCode === '000000') {
          if (data.resultObj) {
            if (data.resultObj.token) {
              sessionStorage.setItem('token', data.resultObj.token);
              sessionStorage.setItem('id', tel);
              sessionStorage.setItem('weisee', 'weisee');

              loginShow();
              gotoPage();
            } else {
              toast('系统异常，请重新登录');
            }
          }
        } else {
          toast(data.resultMsg);
        }
      }
    });
  }


  /* 页面跳转 */
  /* ================================================== */
  function gotoPage() {

    if (state == "bank") {
      location.href = "./proOcrResult.html?url=bank"
    } else if (state == "driver") {
      location.href = "proOcrResult.html?url=driver"
    } else if (state == "mas") {
      location.href = "./proOcrResult.html?url=identOcr"
    } else if (state == "busin") {
      location.href = "./proOcrResult.html?url=busin"
    } else if (state == "face") {
      location.href = "./faceLiveResult.html?re=face"
    } else if (state == "live") {
      location.href = "./faceLiveResult.html?re=live"
    } else if (state == "nullCodeTest") {
      location.href = "./empty.html"
    } else if (state == "emptyAPI") {
      location.href = "./emptyApiResult.html"
    } else if (state == "accTwoClean") {
      location.href = "./accTwoResult.html"
    } else if (state == "realOnQuery") {
      location.href = "./realQuResult.html"
    } else if (state == "empty") {
      location.href = "./empty.html"
    }else {
      getUserId(function () {
        // isAuthMsj(isAuth);
      });
    }
  }
})
