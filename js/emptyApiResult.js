$(function () {
  //  已经登录成功
  isLogin(function () {
    loginHref();  //登录成功后，跳转对应的页面
  });
  getUserId(function () {
    idreadInfonum(); //获取未读消息个数
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
    getApiInfo(function () { });
    getPageByUserId();
    getEcharts(mydate, 'apiAccount'); //获取报表

  });


  // 点击到余额在调用查看余额提醒
  $(".his-tabs ul.tabs li").click(function () {
    if ($(".accRemind").hasClass('active')) {
      getAccWarn('apiAccount');//获取显示余额
    }
  })


  // 验证余额输入是否正确
  // /^(?:13|15|18)[0-9]{9}$/
  // 更新余额提醒
  $("#balSaveBtn").on('click', function () {
    var warningCount = $(".remindInp").val();  //预警值
    var informMobiles = $(".remindInp1").val();  //提醒的手机号
    // var phones = $(".remindInp1").val();
    // var arr = new Array();
    // arr = phones.split(',');
    // var reg = new RegExp("^1[3578][0-9]{9}(,1[3578][0-9]{9})*$");
    // if (reg.test(arr)) {
    //     alert(3333)
    // }else {
    //   alert('手机号码个')
    // }
    updateAccRemind('apiAccount', warningCount, informMobiles);
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
        $("#basci-balance").html(res.resultObj.apiAccount);
        if (res.resultObj) {
          localStorage.setItem('accBalance ', res.resultObj.apiAccount);
        } else {
          localStorage.setItem('accBalance ', '0');
        }
        userId = res.resultObj.creUserId;
      } else {
        toast(res.resultMsg);
        $("#basci-balance ").html('0');
      }
    }).fail(function (err) {
      toast('请求超时');
      $("#basci-balance ").html('0');
    })
  }


  // 获取历史列表
  function getPageByUserId(currentPage, numPerPage) {
    $.ajax({
      url: url + '/feign/apiMobileTest/getPageByUserId',
      method: 'post',
      dataType: 'json',
      data: {
        creUserId: userId,
        token: sessionStorage.getItem('token'),
        mobile: sessionStorage.getItem('id'),
        pageNo: currentPage || 1,
        pageSize: numPerPage || 10,
        type: 3
      },
      beforeSend: function () {  //请求成功之前，加载动画显示
        // $(".hisRecordList").html("");   //清空页面
        $(".spinner").show();
      }
    }).done(function (res) {
      if (res.resultCode == '000000') {
        $(".spinner").hide();
        // $(".history-record").css({ 'padding-bottom': '0px' });
        if (res.resultObj.tlist == null) {
          $("#page").hide();
          $(".hisRecordList").html('<p style="text-align:center;margin:20px auto;color:#C0C3CC;font-size: 14px;">' + '暂无数据' + '</p>');
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
            limit: numPerPage || 10,
            layout: ['count', 'prev', 'page', 'next', 'skip'],
            jump: function (obj, first) { //触发分页后的回调
              if (!first) { //点击跳页触发函数自身，并传递当前页：obj.curr
                getPageByUserId(obj.curr, obj.limit);
              }
            }
          });
        });
        var html = "";
        for (var i = 0; i < res.resultObj.tlist.length; i++) {

          // 订单类型
          var status;
          var Status = res.resultObj.tlist[i].status;
          switch (Status) {
            case '0':
              status = '空号';
              break;
            case '1':
              status = '实号';
              break;
            case '2':
              status = '停机';
              break;
            case '3':
              status = '库无';
              break;
            case '4':
              status = '沉默号';
              break;
            case '5':
              status = '风险号';
              break;
            default:
              status = ''
              break;
          }

          html += ' <dl>'
            + '<dd>' + res.resultObj.tlist[i].orderNo + '</dd>'
            + '<dd>' + res.resultObj.tlist[i].mobile + '</dd>'
            + '<dd>' + status + '</dd>'
            + '<dd>' + (res.resultObj.tlist[i].chargesStatus == "1" ? '收费' : '不收费') + '</dd>'
            + '<dd>' + res.resultObj.tlist[i].area + '</dd>'
            + '<dd>' + res.resultObj.tlist[i].numberType + '</dd>'
            + '<dd>' + timeToDate(res.resultObj.tlist[i].createTime) + '</dd>'
            + ' <dd>' + timeToDate(res.resultObj.tlist[i].lastTime) + '</dd>'
            + '</dl>'
        }
        $(".hisRecordList").html(html);
      } else {
        toast(res.resultMsg);
      }
    }).fail(function (err) {
      toast(err.resultMsg);
    })
  };

  // 点击充值 页面跳转
  $("#basic-rechargeBtn").on('click', function () {
    var storage = window.localStorage;
    storage.setItem("rechargeJump", 'emApiReJump');
    window.location.href = './recharge.html';
  })
  // 下载文档
  $("#api-duibtn").on('click', function () {
    window.location.href = downUrl + 'word/RQAPI.zip';
  });

  // textarea字数限制

  // 测试
  // text()
  function text() {
    $.ajax({
      url: url + '/apiInvokingTest/findByMobilesNew',
      method: 'post',
      dataType: 'json',
      data: {
        token: sessionStorage.getItem('token'),
        userPhone: sessionStorage.getItem('id'),
        apiName: sessionStorage.getItem('customerIdMsj'),
        password: sessionStorage.getItem('customerpwd'),
        mobiles: $("#apiText").val(),
      }
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
  $("#nullApiTest").unbind('click')
  $("#nullApiTest").on('click', function () {
    if ($("#apiText").val() == "") {
      toast("请输入手机号!");
      return;
    }
    text();
  })


  //======================================================================================
  //报表
  var date = new Date;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" + month : month);
  var mydate = (year.toString() + '-' + month.toString());
  // ==================================================================================

  // 点击上个月
  var num = -1;
  $("#lastMonth").on('click', function () {
    $("#nextMonth").show();
    var eDate = reduceMonth(($("#monthShow").html()), num);
    // num--;
    var lastMonth = eDate.getFullYear() + '-' + ((eDate.getMonth() + 1) >= 10 ? (eDate.getMonth() + 1) : "0" + (eDate.getMonth() + 1))

    getEcharts(lastMonth, 'apiAccount'); //获取报表
    $("#monthShow").html(lastMonth);
  })
  // ==================================================================================

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
    getEcharts(lastMonth, 'apiAccount'); //获取报表
    $("#monthShow").html(lastMonth)
  })
  // ==================================================================================
  // 点击当月 获取当月信息
  $("#currMonth").on('click', function () {
    $("#monthShow").html(mydate);
    $("#nextMonth").hide();
    // if($("#monthShow").html() == mydate){
    //   toast('已经是最新数据')
    //     return;
    // }
    getEcharts(mydate, 'apiAccount'); //获取报表
  })
  // ==================================================================================

  $("#monthShow").html(mydate);
  // 使用刚指定的配置项和数据显示图表。
  // myChart.setOption(option);
})
