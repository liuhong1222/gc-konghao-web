$(function () {
  //  已经登录成功
  isLogin(function () {
    loginHref();  //登录成功后，跳转对应的页面
  });
  getUserId(function () {

    if (isWhiteUser == 'false') {
      if (sessionStorage.getItem('isShow') == null || sessionStorage.getItem('isShow') == "") {
        $("#blackShow").show(); //黑
        $("#whiteShow").hide(); //白
        $("#auth-mask").show();
        $("#mask").show();
        sessionStorage.setItem('isShow', 'show');
      }
    } else {
      if (sessionStorage.getItem('isShow') == null || sessionStorage.getItem('isShow') == "") {
        // isAuthMsjno(isAuth);  //判断认证状态
      }
    }
    idreadInfonum(); //获取未读消息个数
    getApiInfo(function () {
      getPageByUserId();
      getEcharts(mydate, 'msAccount'); //获取报表

    }); //api账号信息

  })

  // 点击到余额在调用查看余额提醒
  $(".his-tabs ul.tabs li").click(function () {
    if ($(".accRemind").hasClass('active')) {
      getAccWarn('msAccount');//获取显示余额
    }
  })
  // 更新余额提醒
  $("#balSaveBtn").on('click', function () {
    var warningCount = $(".remindInp").val();  //预警值
    var informMobiles = $(".remindInp1").val();  //提醒的手机号
    updateAccRemind('msAccount', warningCount, informMobiles)
  })
  // 获取当前余额
  getBalance()
  function getBalance() {
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
        // alert('获取数据成功');
        $("#basci-balance").html(res.resultObj.msAccount);
        userId = res.resultObj.creUserId;
      } else {
        toast(res.resultMsg);
        $("#basci-balance").html('0');
      }
    }).fail(function (err) {
      toast('请求超时');
      $("#basci-balance").html('0');
    })
  }

  // 获取历史列表
  function getPageByUserId(currentPage) {
    $.ajax({
      url: url + '/feign/apiMobileTest/getMobileStatePageByCustomerId',
      method: 'post',
      dataType: 'json',
      data: {
        customerId: sessionStorage.getItem('customerIdMsj'),
        token: sessionStorage.getItem('token'),
        mobile: sessionStorage.getItem('id'),
        method: 'mobileStatusQuery',
        pageNo: currentPage || 1,
        pageSize: 10,
        type: 4
      },
      beforeSend: function () {  //请求成功之前，加载动画显示
        // $(".hisRecordList").html("");   //清空页面
        $(".spinner").show();
      }
    }).done(function (res) {
      if (res.resultCode == '000000') {
        $(".spinner").hide();
        if (res.resultObj.tlist == null) {
          $("#page").hide();
          var nullInfo = '<p style="color:#333;width:100px;margin:20px auto">' + '暂无历史检测结果' + '</p>'
          $(".hisRecordList").html(nullInfo)
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
                getPageByUserId(obj.curr);
              }
            }
          });
        });
        var html = "";
        for (var i = 0; i < res.resultObj.tlist.length; i++) {
          var statusInfo;
          var statusCode = res.resultObj.tlist[i].numberType;
          switch (statusCode) {
            case "1":
              statusInfo = "中国移动";
              break;
            case "2":
              statusInfo = "中国联通";
              break;
            case "3":
              statusInfo = "中国电信";
              break;
          }
          html += ' <dl>'
            + '<dd>' + res.resultObj.tlist[i].orderNo + '</dd>'
            + '<dd>' + res.resultObj.tlist[i].mobile + '</dd>'
            + '<dd>' + res.resultObj.tlist[i].status + '</dd>'
            + '<dd>' + res.resultObj.tlist[i].chargesStatus + '</dd>'
            + '<dd>' + res.resultObj.tlist[i].area + '</dd>'
            + '<dd>' + statusInfo + '</dd>'
            + '<dd>' + timeToDate(res.resultObj.tlist[i].createTime) + '</dd>'
            + '</dl>'
        }
        $(".hisRecordList").html(html);
      } else {
        $(".hisRecordList").html('<p style="text-align:center;margin:20px auto;color:#C0C3CC;font-size: 14px;">' + '暂无数据' + '</p>');
      }

    }).fail(function (err) {
      toast(err.resultMsg)
    })
  }


  // 测试
  // text()
  function text() {
    var result = JSON.stringify({
      token: sessionStorage.getItem('token'),
      userPhone: sessionStorage.getItem('id'),
      apiName: sessionStorage.getItem('customerIdMsj'),
      password: sessionStorage.getItem('customerpwd'),
      mobile: $("#realText").val(),
    })
    $.ajax({
      url: url + '/apiInvokingTest/mobileStatusQuery',
      method: 'post',
      dataType: 'json',
      data: result,
      contentType: "application/json",
    }).done(function (res) {
      // json格式化
      var mes = JSON.stringify(res, null, 4);
      // 将换行符和空格进行转义
      var html = mes.replace(/\n/g, '<br>').replace(/\s/g, '&nbsp');
      // console.log(mes)
      $(".res-con").html(html);

    }).fail(function (err) {
      toast(err.resultMsg)
    })
  }

  // $("#realQuText").unbind('click')
  $('#realQuText').off().on('click', function () {
    if ($("#realText").val() == "") {
      toast("请输入手机号!");
      return;
    }
    var reg = /^(1[\d]{10}|0\d{2,3}\-\d{7,8})$/;
    if (reg.test($("#realText").val()) == false) {  //没有通过验证
      toast("手机号码格式不正确！");
    } else {
      text();
      return false;
    }
  })
  // ==============================================================
  // 折线图
  //报表
  var date = new Date;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" + month : month);
  var mydate = (year.toString() + '-' + month.toString());

  // 点击上个月
  var num = -1;
  $("#lastMonth").on('click', function () {
    $("#nextMonth").show();
    var eDate = reduceMonth(($("#monthShow").html()), num);
    // num--;
    var lastMonth = eDate.getFullYear() + '-' + ((eDate.getMonth() + 1) >= 10 ? (eDate.getMonth() + 1) : "0" + (eDate.getMonth() + 1))

    getEcharts(lastMonth, 'msAccount'); //获取报表
    $("#monthShow").html(lastMonth);
  });

  // 点击下个月
  var addnum = 1;
  $("#nextMonth").on('click', function () {
    var eDate = addMonth(($("#monthShow").html()), addnum);
    // addnum++;
    var lastMonth = eDate.getFullYear() + '-' + ((eDate.getMonth() + 1) >= 10 ? (eDate.getMonth() + 1) : "0" + (eDate.getMonth() + 1));
    if (lastMonth > mydate) {
      toast("这是当月，没有下一月");
      $("#nextMonth").hide();
      return;
    }
    getEcharts(lastMonth, 'msAccount'); //获取报表
    $("#monthShow").html(lastMonth)
  })

  // 点击当月 获取当月信息
  $("#currMonth").on('click', function () {
    $("#monthShow").html(mydate);
    $("#nextMonth").hide();
    getEcharts(mydate, 'msAccount'); //获取报表
  })

  $("#monthShow").html(mydate);
  // 使用刚指定的配置项和数据显示图表。
  // myChart.setOption(option);
  // ==============================================================
  // 点击充值 页面跳转
  $("#basic-rechargeBtn").on('click', function () {
    var storage = window.localStorage;
    storage.setItem("rechargeJump", 'numRealReJump');
    window.location.href = './recharge.html';
  });
  // 对接文档
  $("#api-duibtn").on('click', function () {
    window.location.href = downUrl + 'word/msAccount.zip';
  });
})

