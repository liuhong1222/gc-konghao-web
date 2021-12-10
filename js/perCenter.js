$(function () {
  //  已经登录成功
  isLogin(function () {
    loginHref();  //登录成功后，跳转对应的页面
    loginAccess();//登录成功，立即转入
    // getUser(function () {
    //   getOrder();  //获取订单
    // }); //获取账户信息
  });
  var userid = "";
  var timerLoginOut = null;
  getUserId(function () {
    idreadInfonum(); //获取未读消息个数
    getOrder();  //获取订单
    userid = userId;
    // alert(userId)
    getApiInfo(function () { })
    if (isSetPwd == "1") {  //设置了
      // $(".cancelPwd").show();
      $(".editPassWord").html('修改');
      $(".twoTrueCon").html('本次修改/取消操作仅对操作后的检测生效，本次操作前的所有检测包只能用之前的密码解压，请您牢记之前的密码，以免无法查看之前的检测结果。')
    } else if (isSetPwd == "0") {
      // $(".cancelPwd").hide()
      $(".pwdTitle").html('设置解压密码')
      $(".editPassWord").html('设置');
      $("#setComPresscon").html('解压密码设置完成之后，您的检测结果将需该密码解压才能打开查看，请您牢记您的密码，以免无法查看检测结果。')
      $(".twoTrueCon").html('解压密码设置完成之后，您的检测结果将需该密码解压才能打开查看，请您牢记您的密码，以免无法查看检测结果。')
    }
  })

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

  /* 验证邮箱格式 */
  /* ======================================= */
  function mailIsMatch(mail, callback) {
    var mailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (mail.match(mailReg)) {
      // $("#warningMail").hide();
      callback();
    } else {
      toast('邮箱格式不正确！')
    }
  }
  // 余额格式转换
  var accs = sessionStorage.getItem('balance') ? sessionStorage.getItem('balance') : '0';
  function formatNumber(n, zero) {
    var point = n.toString().indexOf(".") !== -1 ? n.toString().substr(n.toString().indexOf(".")) : "";
    var b = parseInt(n).toString();
    var len = b.length;
    var zero = zero || "";
    if (len <= 3) { return b + point + zero; }
    var r = len % 3;
    return r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") + point + zero : b.slice(r, len).match(/\d{3}/g).join(",") + point + zero;
  }
  // 获取账户余额
  getBalance(function () {
    // debugger
    // $("#accNumber").html(formatNumber(accs));
    // $("#moneyAccs").html((Math.floor((accs / 10000) * 100) / 100).toFixed(2) + "W");
  });


  // 获取订单
  function getOrder(currentPage) {
    $.ajax({
      url: url + '/userAccount/pageFindTrdOrderByCreUserId',
      method: 'POST',
      dataType: 'json',
      data: {
        creUserId: userId,
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        pageNum: currentPage || 1,
        pageSize: 10
      }
    }).done(function (res) {
      if (res.resultCode == '000000') {
        // console.log(res)
        if (res.resultObj.tlist == null) {
          $("#page").hide();
          var nullInfo = '<p style="color:#C0C3CC;width:115px;margin:20px auto">' + '暂无订单记录' + '</p>'
          $(".hisRecordList").html(nullInfo);
          return;
        }
        layui.use(['laypage', 'layer'], function () {
          var laypage = layui.laypage
            , layer = layui.layer;
          //完整功能
          laypage.render({
            elem: 'page',
            count: res.resultObj.totalNumber,
            curr: currentPage || 1,  //控制hash
            layout: ['count', 'prev', 'page', 'next', 'skip'],
            jump: function (obj, first) { //触发分页后的回调
              if (!first) { //点击跳页触发函数自身，并传递当前页：obj.curr
                getOrder(obj.curr);
              }
            }
          });
        });
        var html = "";
        for (var i = 0; i < res.resultObj.tlist.length; i++) {
          // 订单类型
          var type;
          var Type = res.resultObj.tlist[i].type;
          switch (Type) {
            case "1":
              type = "充值";
              break;
            case "2":
              type = "退款";
              break;
          }
          var payType;
          var paytype = res.resultObj.tlist[i].payType;
          switch (paytype) {
            case "1":
              payType = "支付宝";
              break;
            case "5":
              payType = "支付宝";
              break;
            case "3":
              payType = "对公转账";
              break;
            case "6":
              payType = "对公转账";
              break;
            case "7":
              payType = "赠送";
              break;
            case "4":
              payType = "管理员充值";
              break;
            case "9":
              payType = "活动赠送";
              break;
            case "10":
              payType = "注册赠送";
              break;
            default:
              payType = "";
          }
          html += ' <dl>'
            + '<dd>' + res.resultObj.tlist[i].orderNo + '</dd>'
            + '<dd>' + res.resultObj.tlist[i].money + '</dd>'
            + '<dd>' + res.resultObj.tlist[i].number + '</dd>'
            + '<dd>' + type + '</dd>'
            + '<dd>' + (res.resultObj.tlist[i].status == 1 ? '成功' : '') + '</dd>'
            + '<dd>' + (typeof (res.resultObj.tlist[i].payTime) == 'undefined' ? '' : (timeToDate(res.resultObj.tlist[i].payTime))) + '</dd>'
            + '<dd>' + payType + '</dd>'
            // + '<dd  class="contrastNo" data-contractUrl= "' + res.resultObj.tlist[i].contractUrl + '">' + (typeof (res.resultObj.tlist[i].contractNo) == 'undefined' ? '' : (res.resultObj.tlist[i].contractNo)) + '</dd>'
            + '</dl>'
        }
        $(".hisRecordList").html(html);

        // 点击合同编号，下载合同
        $(".contrastNo").on('click', function () {
          window.location.href = downUrl + $(this).attr('data-contractUrl');
        })
      } else {
        toast(res.resultMsg)
      }
    }).fail(function (err) {
      toast(err.resultMsg)
    })
  }
  //关闭手机弹出层
  $("#closeBind").on('click', function () {
    $(".reveal-modal-bg").hide();
    $(".reBindPhone").hide();
  })

  // 关闭邮箱弹出层
  $("#closeBindEmail").on('click', function () {
    $(".reveal-modal-bg").hide();
    $(".bindEmails").hide();
  })

  // 关闭设置密码
  $("#closeBindCompressPwd").on('click', function () {
    $(".reveal-modal-bg").hide();
    $(".setCompressPwd").hide();
    $("#compressPwd").val("");
  })
  // 关闭修改密码
  $("#closeupdatePwd").on('click', function () {
    $(".reveal-modal-bg").hide();
    $(".updatePwd").hide();
    $(".oldPwd").val("")
    $(".newPwd").val("")
    $(".trueNewPwd").val("")
    $("#update-perfect").css('backgroundColor', '#ccc')
  })


  //点击修改手机号
  $(".editIphone").on('click', function () {
    if ($(this).html() == '绑定') {  //账号登录
      $(".divBG").show();
      $(".accBindMobile").show()
    } else if ($(this).html() == '修改') {  //手机号登录
      $(".reveal-modal-bg").show();
      $(".reBindPhone").show();
    }

  });

  // 手机号失去焦点
  $(".bindMobile").blur(function () {
    var tel = $(".bindMobile").val();
    mobileIsMatch(tel, function () {

    })
  });

  function mobileIsMatch(tel, callback) {
    var telReg = /^13[0-9]{9}$|14[0-9]{9}$|15[0-9]{9}$|16[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}$|19[0-9]{9}$/;
    if (tel == "") {
      $(".bindMobileWarn").addClass('warnShow');
      $(".bindMobileWarns").removeClass('warnShow');
      return false;
    } else if (tel != "") {
      if (tel.match(telReg)) {
        $(".bindMobileWarn").removeClass('warnShow');
        $(".bindMobileWarns").removeClass('warnShow');
        callback();//验证通过
      } else {
        $(".bindMobileWarn").removeClass('warnShow');
        $(".bindMobileWarns").addClass('warnShow');
      }
    }
  }
  //手机号验证码
  $(".mobileCode").blur(function () {
    if ($(".mobileCode").val() == "") {
      $(".mobileCodeWarn").addClass('warnShow');
      return;
    }
    if ($(".mobileCode").val() !== "") {
      $(".mobileCodeWarn").removeClass('warnShow');
      return;
    }
  });

  // 点击绑定手机号
  $("#accBindMobileBtn").on('click', function () {
    var tel = $(".bindMobile").val();
    var mobileCode = $(".mobileCode").val();
    mobileIsMatch(tel, function () {
      if (mobileCode) {
        // 提交绑定手机号 
        updateUserPhone(tel, mobileCode, '', '');

      } else {
        $(".mobileCodeWarn").addClass('warnShow');
      }
    });
  });
  // 获取手机号验证
  $("#getMoblieCode").off().on('click', function () {
    var tel = $(".bindMobile").val();
    mobileIsMatch(tel, function () {
      getPerCode(tel, 'new');
    });
    // $("#getMoblieCode").hide();  //获取验证码隐藏
    // $(".getMoblieCodeTime").show();   //倒计时显示
    // 获取验证码，成功后进行倒计时
  });

  // 点击修改邮箱
  $(".editEmail").on('click', function () {
    $(".reveal-modal-bg").show();
    $(".bindEmails").show();
  })

  // 设置,修改密码
  $(".editPassWord").on('click', function () {
    if ($(this).html() == '修改') {
      $("#compressPwd").val($("#resultPwd").val())
      // alert(333)
      $(".updatePwd").show()
    } else if ($(this).html() == '设置') {
      $(".setCompressPwd").show()
    }
    $(".reveal-modal-bg").show();

  })

  // 点击获取原来手机号验证码
  $(".getOldCode").on('click', function () {
    var tel = $.trim($("#oldPhone").val());
    getPerCode(tel, 'old');
  });

  // 点击新手机号
  $(".getNewCode").on('click', function () {
    var tel = $.trim($("#newPhone").val());
    if ($("#newPhone").val() == "") {
      toast('请输入新的手机号')
      return;
    }
    getPerCode(tel, 'new');
  });
  //倒计时中断
  function secondDone() {
    $(".getOldCode").show();
    $(".codeOldTime").hide();
    $(".codeOldTime").val('60S');
  }
  function secondDoneNew() {
    $(".getNewCode").show();
    $(".codeNewTime").hide();
    $(".codeNewTime").val('60S');

    $("#getMoblieCode").show();
    $(".getMoblieCodeTime").hide();
    $(".getMoblieCodeTime").val('60S')

  }
  // 验证新手机号是否通过
  $(".oldCode").blur(function () {
    if ($(this).val() == "") {
      toast('请获取原手机号验证码！')
      return;
    }
    $.ajax({
      url: url + '/user/checkOldCode',
      method: 'post',
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        userId: userid,
        phone: $("#oldPhone").val(),
        phoneCode: $(this).val(),
      }
    }).done(function (res) {
      if (res.resultCode == "000000") {
        toast('原手机号验证通过，请输入新手机号！')
        $("#newPhone").removeAttr('disabled')
      } else {
        toast(res.resultMsg)
        $("#newPhone").attr('disabled', true)
      }
    }).fail(function (res) {
      toast(res.resultMsg)
      $("#newPhone").attr('disabled', true)
    })
  })
  function getPerCode(tel, type) {
    $.ajax({
      url: url + '/user/getIdenCodeToUpMob',
      method: 'post',
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        userId: userid,
        phone: tel,
        phoneType: type,
        domain: document.domain
      }
    }).done(function (res) {
      if (res.resultCode = '000000') {
        toast("验证码获取成功");
        if (type == "old") {
          $(".codeOldTime").show();

          var second = 60;
          timer = setInterval(function () {
            second--;
            $(".codeOldTime").val(second + "S")
            if (second <= 0) {
              clearInterval(timer);

              secondDone();
            }
          }, 1000);
        } else if (type == "new") {
          $("#getMoblieCode").hide();  //获取验证码隐藏
          $(".getMoblieCodeTime").show();   //倒计时显示
          $(".codeNewTime").show();
          var secondNew = 60;
          timerNew = setInterval(function () {
            secondNew--;
            $(".getMoblieCodeTime").val(secondNew + "S")
            $(".codeNewTime").val(secondNew + "S")
            if (secondNew <= 0) {
              clearInterval(timerNew);
              secondDoneNew();
            }
          }, 1000);
        }
      } else {
        secondDone();
      }
    }).fail(function (err) {
      secondDone();
    })
  }

  // 触发新手机号码 验证绑定的新手号是否存在
  $('#newPhone').bind('input', function () {
    var borrowValue = $(this).val();
    if (borrowValue.length == 11) {
      // 验证手机号是否存在
      iphoneExist();
    }
  });
  function iphoneExist() {
    $.ajax({
      url: url + '/user/checkUserPhone',
      method: 'post',
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        phone: $("#newPhone").val()
      }
    }).done(function (res) {
      if (res.resultCode == "000000") {
        toast('该用户已经注册！')
      } else {
        $(".getNewCode").removeAttr("disabled");
        $(".getNewCode").css({
          'background-color': '#1673ff',
          "border": 'solid 1px #1673ff'
        })
      }
    }).fail(function (res) {
      toast(res.resultMsg)
    })
  }
  // 点击完善
  $("#immedia-perfect").off().on('click', function () {
    if ($(".centerCode").val() == "" || $("#newPhone").val() == "" || $(".oldCode").val() == "" || $(".newCode").val() == "") {
      toast('请完善信息再提交！');
      return;
    }
    var oldPhone = $("#oldPhone").val();
    var oldCode = $(".oldCode").val();
    var tel = $("#newPhone").val();
    var mobileCode = $(".newCode").val();
    updateUserPhone(tel, mobileCode, oldPhone, oldCode);
  });

  // 绑定手机号
  function updateUserPhone(tel, mobileCode, oldPhone, oldCode) {
    $.ajax({
      url: url + '/user/updateUserPhone',
      method: 'post',
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        userId: userid,
        phoneNew: tel,
        phoneNewCode: mobileCode,
        phoneOld: oldPhone,
        phoneOldCode: oldCode,
      }
    }).done(function (res) {
      if (res.resultCode == "000000") {
        // $("#phone").html()
        toast('请用新手机号重新登录！');
        $(".divBG").show();

        //退出登录，主页重新登录
        var timeLoginOut = 1;
        timerLoginOut = setInterval(function () {   //倒计时三秒后，调用检测接口
          timeLoginOut--;
          if (timeLoginOut <= 0) {
            clearInterval(timerLoginOut);
            loginOut()
          }
        }, 1000);
      } else {
        toast(res.resultMsg)
      }
    }).fail(function (res) {
      toast(res.resultMsg);
    })
  };
  // 点击完善邮箱
  $("#email-perfect").off().on('click', function () {
    var mail = $("#emails").val();
    if (mail) {
      mailIsMatch(mail, function () {
        /* ======================================= */
        $.ajax({
          url: url + '/user/updateCreUser',
          method: "POST",
          dataType: 'json',
          data: {
            userPhone: sessionStorage.getItem('id'),
            token: sessionStorage.getItem('token'),
            id: userid,
            userEmail: mail
          },
        }).done(function (res) {
          if (res.resultCode == '000000') {
            toast(res.resultMsg);
            $(".reveal-modal-bg").hide();
            $(".bindEmails").hide();
            $("#userEmail").html(res.resultObj.userEmail)
            $(".editEmail").html('修改')
          } else {
            toast(res.resultMsg);
          }
        }).fail(function (err) {
          toast(err.resultMsg);
        })
      })
    }

  })
  // 设置,修改密码
  function pressPwdSet(param) {
    $.ajax({
      url: url + '/userAccount/updateResultPwd',
      method: "POST",
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        resultPwd: param
      },
    }).done(function (res) {
      if (res.resultCode == '000000') {
        toast(res.resultMsg);
        $(".reveal-modal-bg").hide();
        if (param == 'cancel') {
          location.reload();
        } else {
          location.reload();
          $(".setCompressPwd").hide();
          $(".updatePwd").hide();
          $("#resultPwd").val(res.resultObj)
        }
      } else {
        toast(res.resultMsg);
      }
    }).fail(function (err) {
      toast(err.resultMsg);
    })
  }
  // ========================================================================================
  // 点击设置密码
  $("#compressPwd-perfect").off().on('click', function () {
    var pressPwd = $("#compressPwd").val()
    if (pressPwd == "") {
      toast('请输入压缩包密码');
      return;
    }
    $(".twoTrueBtn").show()
    // 点击二次确定
    $("#trueTwoBtn").off().on('click', function () {
      pressPwdSet(pressPwd)
      // alert(4444)
    });
    // 点击二次的差号
    $("#closetwoTrueBtn").on('click', function () {
      // alert('取消')
      $(".twoTrueBtn").hide();
      $(".setCompressPwd").hide();
      $("#compressPwd").val("");
      $(".reveal-modal-bg").hide();
    })
  })

  // 确定取消
  // $("#cancelPwdMaskBtn").off().on('click', function () {
  //   pressPwdSet('cancel')
  // })

  // 验证旧密码
  $(".updatePwd .oldPwd").blur(function () {
    var oldPwd = $.trim($(".oldPwd").val());
    if (oldPwd == "") {
      toast('旧密码不能为空!')
      return;
    }
    checkoutOldPwd(oldPwd)
  })
  function checkoutOldPwd(oldPwd) {
    $.ajax({
      url: url + '/userAccount/checkOldResultPwd',
      method: "get",
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        creUserId: userId,
        oldResultPwd: oldPwd
      },
    }).done(function (res) {
      if (res.resultCode == '000000') {
        if (res.resultObj == "true") {
          toast('旧密码校验成功');
          $("#update-perfect").removeAttr("disabled");
          $("#update-perfect").css('backgroundColor', '#1673ff')
        } else {
          toast('旧密码校验失败');
        }
      } else {
        toast(res.resultMsg);
      }
    }).fail(function (err) {
      toast(err.resultMsg);
    })
  }
  // 忘记密码
  $("#forgetPwd").on('click', function () {
    $.ajax({
      url: url + '/userAccount/forgetResultPwd',
      method: "get",
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        domain: document.domain,
        creUserId: userId,
      },
    }).done(function (res) {
      if (res.resultCode == '000000') {
        toast("您的密码已通过短信发送至您" + $("#phone").html() + "的手机号上，请查收并牢记您的密码。");
      } else {
        toast(res.resultMsg);
      }
    }).fail(function (err) {
      toast(err.resultMsg);
    })
  })
  // 点击修改密码
  $("#update-perfect").on('click', function () {
    if ($(".newPwd").val() !== "" && $(".trueNewPwd").val() !== "") {
      if ($.trim($(".newPwd").val()) !== $.trim($(".trueNewPwd").val())) {
        toast('两次密码输入的不一致!');
        return;
      }
    }
    if ($(".newPwd").val() !== "" && $(".trueNewPwd").val() == "") {
      toast('请再次输入新密码!')
      return;
    }
    if ($(".trueNewPwd").val() !== "" && $(".newPwd").val() == "") {
      toast('请输入新密码!')
      return;
    }

    var newPwd = $(".newPwd").val();
    $(".twoTrueBtn").show()
    $(".updatePwd").hide();
    // 点击二次确定
    $("#trueTwoBtn").off().on('click', function () {
      if ($(".newPwd").val() == "" && $(".trueNewPwd").val() == "") {
        pressPwdSet('cancel')
      } else {
        pressPwdSet(newPwd)
      }

    });
    $("#closetwoTrueBtn").on('click', function () {
      $(".twoTrueBtn").hide();
      $(".oldPwd").val("");
      $(".newPwd").val("");
      $(".trueNewPwd").val("");
      $("#update-perfect").css('backgroundColor', '#ccc')
      $(".reveal-modal-bg").hide();
    })
  })

  // ==============================================================================
  // 点击电测记录--进入历史检测
  $(".test").on('click', function () {
    location.href = "../html/textRecord.html"
  });

  // 点击我的下载
  $(".down").on('click', function () {
    location.href = "../html/myDownload.html"
  });

  // 点击充值
  $("#rechargeBtn").on('click', function () {
    localStorage.setItem('rechargeJump', '');  //公共充值--跳转空号检测
    location.href = "./recharge.html";
  })

  /* 显示隐藏充值模块以及充值按钮，*/
  /* ================================================== */
  var hf_isPay = sessionStorage.getItem('hf_isPay');
  if (hf_isPay && hf_isPay == 1) {
    $(".recharge-showhide").show();
    // $(".testbtn").css("border-right", '1px solid #dcdcdc');
  } else if (hf_isPay && hf_isPay == 0) {
    $(".recharge-showhide").hide();
    $(".testbtn").css("border-right", 'none');
  };
  // 新增修改登录密码
  $(".editloginPwd").on('click', function () {
    if ($(this).html() == '设置') {  //账号登录
      $(".setLoginPwd").show();
      $(".reveal-modal-bg").show();
      valid('#passwordField')
    } else if ($(this).html() == '修改') {  //手机号登录
      $(".reveal-modal-bg").show();
      $(".updateLoginPwd").show();
      valid('#updatePwdField')
    }
  })

 

  $("#updatePwdField").focus(function () {

    $("#checkRulesList").show();
    $("#gsTwo").hide()
  }).blur(function () {
    if ($(".rules .ok").length < 4) {
      $("#gsTwo").show();
    }
    $("#checkRulesList").hide();
  });

  $("#passwordField").focus(function () {
    $("#checkRulesList").show();
    $("#gs").hide()
  }).blur(function () {
    if ($(".rules .ok").length < 4) {
      $("#gs").show();
    }
    $("#checkRulesList").hide();
  });

  // 新增登录密码
  $("#setLoginPwdBtn").off().on('click', function () {
    if ($("#passwordField").val() == "") {
      $("#gs").show();
      return;
    }
    if ($("#loginTwoPwd").val() == "") {
      $(".contractPwd").show();
      return;
    }
    if ($("#passwordField").val() !== "" && $("#loginTwoPwd").val() !== "") {
      if ($("#passwordField").val() == $("#loginTwoPwd").val()) {
        $(".contractPwd").hide();
        // alert('通过');
        // 新增密码
        newAddloginPwd("#passwordField");
      } else {
        $(".contractPwd").show();
      }
    }
  });

  // 新增密码
  function newAddloginPwd(id) {
    $.ajax({
      url: url + '/feign/apiAccountInfo/updateCreUserPwd',
      method: "get",
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        userId: userid,
        password: $(id).val()
      },
    }).done(function (res) {
      if (res.resultCode == '000000') {
        toast(res.resultMsg);
        $(id).val("")
        $("#loginTwoPwd").val("")
        $(".trueupdatePwdField").val("")
        $(".oldLoginPwd").val("")
        loginOut()
      } else {
        toast(res.resultMsg);
      }
    }).fail(function (err) {
      toast(err.resultMsg);
    })
  };
  // 修改登录密码
  // 验证旧密码是否通过
  $(".oldLoginPwd").blur(function () {
    if ($(".oldLoginPwd").val() == "") {
      $(".pldPwdWarn").show();
      return;
    }
    if ($(".oldLoginPwd").val() !== "") {
      $(".pldPwdWarn").hide();
      // 验证旧密码是否通过
      checkOldPwd()
      return;
    }
  });
  function checkOldPwd() {
    $.ajax({
      url: url + '/feign/apiAccountInfo/checkCreUserOldPwd',
      method: 'post',
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        userId: userid,
        password: $(".oldLoginPwd").val()
      }
    }).done(function (res) {
      if (res.resultCode == '000000') {
        if (res.resultObj == "false") {
          toast('旧密码验证失败，请重新输入密码！');
          $("#updatePwdField").attr("disabled", true);
          $(".trueupdatePwdField").attr("disabled", true);
          (".pldContrastPwdWarn").hide();
        } else {
          toast('旧密码验证成功，请输入新密码！');
          $("#updatePwdField").removeAttr("disabled");
        }

      } else {
        toast(res.resultMsg);
      }
    }).fail(function (err) {
      toast(err.resultMsg);
    })
  }
  $(".trueupdatePwdField").blur(function () {
    if ($(this).val() == "") {
      $(".pldContrastPwdWarn").show();
      $(".pldContrastPwdWarn").html('新再次确认新密码！')
    } else {
      if ($(this).val() !== $("#updatePwdField").val()) {
        $(".pldContrastPwdWarn").show();
        $(".pldContrastPwdWarn").html('两次密码不一致！')
      } else {
        $(".pldContrastPwdWarn").hide();
      }
    }
  })
  // 提交修改登录密码
  $("#setLoginTwoPwdBtn").off().on('click', function () {
    if ($(".oldLoginPwd").val() == "") {
      toast('请先输入旧密码进行验证！');
      return;
    }
    if ($("#updatePwdField").attr('disabled') == "disabled") {
      toast('请先验证旧密码！')
      return
    }
    if ($("#updatePwdField").val() == "") {
      toast('请输入新密码！')
      return
    }
    if ($(".trueupdatePwdField").val() == "") {
      toast('请再次确认新密码！')
      return
    }

    if ($(".trueupdatePwdField").val() !== $("#updatePwdField").val()) {
      $(".pldContrastPwdWarn").show();
      $(".pldContrastPwdWarn").html('两次密码不一致！')
    } else {
      newAddloginPwd("#updatePwdField")
      $(".pldContrastPwdWarn").hide();
    }
  })

  // 关闭弹窗
  $(".closesetLoginPwd").on('click', function () {
    location.reload()
  });
  // 关闭弹窗
  $(".closesetLoginTwoPwd").on('click', function () {
    location.reload()
  })

})
