$(function () {
  //  已经登录成功
  isLogin(function () {
    getUserId(function () {

    });
    loginHref();  //登录成功后，跳转对应的页面
  });
  getUserId(function () {
    idreadInfonum(); //获取未读消息个数
    rechargeJump();   //跳转页面
  })
  var qrcode = new QRCode(document.getElementById("qrcode"), {
    width: 172,
    height: 172
  });
  var productsId = 1;
  var productIndex = 1;
  var number = 0;
  var orderNo = '';
  var time = null;

  // 动态循环获取套餐
  function getPayPackage(productIdPay) {
    $.ajax({
      url: url + '/trdorder/getPayPackage',
      method: 'post',
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        creUserId: userId,
        productId: productIdPay
      }
    }).done(function (res) {
      if (res.resultCode == '000000') {
        var html1 = "";
        for (var i = 0; i < res.resultObj.packageList.length; i++) {
          html1 += '<li class="recharge-package ' + (i == 0 ? 'active' : (i == 1) ? '' : '') + '">'
            + ' <p class="package">' + res.resultObj.packageList[i].packageName + '</p>'
            + ' <p class="info gray"><span class="yellow">￥</span><span class="yellow font36">' + res.resultObj.packageList[i].money + '</span>/' + ((res.resultObj.packageList[i].number) / 10000) + '万条'
            + '</p>'
            + '<p class="charge gray"><span class="red tag">' + (res.resultObj.packageList[i].discout) * 10 + '折</span>'
            + ' <span class="through gray">￥' + res.resultObj.packageList[i].originalCost + '</span>'
            + '</p>'
            + ' <span class="choose"></span>'
            + ' </li>'
        }
        // 自定义充值
        $(".tips").html("（" + Math.floor((res.resultObj.definedPackage.money) * 10000) + "元／万，最低充值" + Math.floor((res.resultObj.definedPackage.money) * 10000) + "元，必须为整数）");
        var minReg = Math.floor((res.resultObj.definedPackage.money) * 10000);   //最低充值
        if (productIdPay == "1") {
          $("#nullcodePackage").html(html1);
          $(".tips").html("（" + Math.floor((res.resultObj.definedPackage.money) * 10000) + "元／万，最低充值200元，必须为整数）");
          var minReg = Math.floor((res.resultObj.definedPackage.money) * 100000);   //最低充值
        } else if (productIdPay == "2") {
          $("#erciPackage").html(html1)
          $(".tips").html("（" + Math.floor((res.resultObj.definedPackage.money) * 10000) + "元／万，最低充值1000元，必须为整数）");
          var minReg = Math.floor((res.resultObj.definedPackage.money) * 50000);   //最低充值
        } else if (productIdPay == "3") {
          $("#emptyApiPackage").html(html1)
        } else if (productIdPay == "6") {
          $("#codeRealPackage").html(html1)
        } else if (productIdPay == "9" || productIdPay == "10") {//人脸
          $("#faceLiveContrast").html(html1)
        } else if (productIdPay == "13" || productIdPay == "14" || productIdPay == "11" || productIdPay == "12") {//银行卡
          $("#moreOcrPackage").html(html1)
        }
        var packageArr = res.resultObj.packageList;
        xxx(packageArr)  //点击每个小方块
        var customRegId = res.resultObj.definedPackage.packageId  //自定义id
        var customRegPrice = res.resultObj.definedPackage.money;  //自定义单价
        // var minReg = Math.floor((res.resultObj.definedPackage.money) * 100000);   //最低充值
        trueBtn(customRegId, customRegPrice, minReg, packageArr)// 点击自定义确定按钮
        ajaxIsPay(res.resultObj.packageList[0].packageId)
      } else {
        toast('套餐获取失败!')
      }
    }).fail(function (err) {
      toast(err.resultMsg)
    })
  }
  //tab栏切换
  var that;
  var productIdPay;
  $("ul.tabs li").click(function () {
    $("ul.tabs li").removeClass("active"); //移除所有的激活类 
    $(this).addClass("active");
    that = $(this).data('flag');
    productIdPay = $(this).data('productid');
    getPayPackage(productIdPay)   //根据id获取对应套餐
    $(".tab_content").hide();
    $(".alipay").hide(); //隐藏支付二维码
    var activeTab = $(this).find("a").attr("href");  //获取a标签对应的href
    $(activeTab).show(); //a标签对应的href和对应内容的id对应
    if (activeTab == "#tab3") {  //如果为空号检测api  隐藏I定义充值
      $(".apiCon").hide();
    } else {
      $(".apiCon").show();
    }
    return false;
  });

  // 跳转页面
  function rechargeJump() {
    var storage = window.localStorage;
    var Jump = storage.getItem("rechargeJump");
    $(".tab").removeClass("active"); //所有tab栏
    if (Jump == "emApiReJump") {  //空号检测api
      $(".emptyApi").addClass("active");//空号api的tab栏
      $("#tab3").addClass("df"); //空号api的模块
      $(".apiCon").hide();
      getPayPackage(3)  //获取套餐
    } else if (Jump == "accTwoReJump") {  //账号二次清洗
      $(".erci").addClass("active");
      $("#tab2").addClass("df");
      getPayPackage(2)  //获取套餐
    } else if (Jump == "numRealReJump") { //号码实时在线查询api
      $(".codeapi").addClass("active");
      $("#tab6").addClass("df");
      getPayPackage(6)  //获取套餐
    } else if (Jump == "faceReJump") { //人脸比对
      $(".faceapi").addClass("active");
      $("#tab8").addClass("df");
      getPayPackage(9)  //获取套餐
    } else if (Jump == "liveReJump") { //活体检测
      $(".liveapi").addClass("active");
      $("#tab8").addClass("df");
      getPayPackage(10)  //获取套餐
    } else if (Jump == "bankReJump") { //银行卡ocr
      $(".bankocrapi").addClass("active");
      $("#tab9").addClass("df");
      getPayPackage(13)  //获取套餐
    } else if (Jump == "driverReJump") { //驾驶证OCR
      $(".driverocrapi").addClass("active");
      $("#tab9").addClass("df");
      getPayPackage(14)  //获取套餐 
    } else if (Jump == "identOcrReJump") { //身份证OCR
      $(".identocrapi").addClass("active");
      $("#tab9").addClass("df");
      getPayPackage(11)  //获取套餐 
    } else if (Jump == "businReJump") { //营业执照OCR
      $(".bussicocrapi").addClass("active");
      $("#tab9").addClass("df");
      getPayPackage(12)  //获取套餐 
    } else {  //其他
      $(".konghao").addClass("active");
      $("#tab1").addClass("df");
      getPayPackage(1)  //获取套餐 
    }
  }


  // 点击每个小方块显示二维码
  function xxx(param) {
    $("#money").html(param[0].money); // 显示每个产品的第一个价格
    $(".recharge-package").unbind("click");
    $(".recharge-package").on('click', function () {
      // alert('切换套餐')
      $("#maskReg").show()
      $(".spinner").show();
      orderNo = '';
      clearInterval(time);
      qrcode.clear();
      $(".ways").hide();
      var index = $(this).index();
      for (var i = 0; i < param.length; i++) {
        if (index == i) {
          // console.log(param[i].packageId)
          productsId = param[i].packageId;
          $("#money").html(param[i].money);
          ajaxIsPay(productsId);
        }
      }
      number = 0;
      $(this).addClass('active').siblings().removeClass('active');

    })
  }
  // 根据价格套餐显示二维吗
  function makeOrder(callback, packageId) {
    var money = $("#money").html();
    $.ajax({
      url: url + '/trdorder/alipayrecharge',
      method: 'GET',
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        creUserId: userId,
        productsId: packageId,
        money: money,
        payType: 1,
        type: 1,
        number: number,
        userType: userType
      }
    }).done(function (res) {
      if (res.resultCode == '000000') {
        $("#maskReg").hide();
        $(".spinner").hide();
        // resultMsg的值为display的话，就显示二维码
        if (res.resultMsg !== "display") {
          $("#pay-box-id").hide();
          $("#noRecharge").show();
          return;
        }
        $("#confirm").hide();
        $(".ways").show(); //二维码显示
        $(".alipay").show(); //显示支付二维码
        var resObj = JSON.parse(res.resultObj);
        orderNo = resObj.orderNo;
        callback(resObj.payUrl);
      } else if (res.resultCode == "999999") {
        $("#maskReg").hide();
        $(".spinner").hide();
        toast("二维码获取失败!");
      } else {
        toast(res.resultMsg);
        $("#maskReg").hide();
        $(".spinner").hide();
      }
    }).fail(function (err) {
      toast('下单失败');
    })
  }
  // 显示二维码
  function ajaxIsPay(packageId) {
    makeOrder(function (url) {
      qrcode.makeCode(url);
      clearInterval(time);
      time = setInterval(function () {
        isPay(function () {
          clearInterval(time);
          window.location.href = './perCenter.html';
        })
      }, 10000)
    }, packageId);
  }


  // 支付
  function isPay(callback) {
    $.ajax({
      url: url + '/trdorder/findOrderInfoByOrderNo',
      method: 'GET',
      dataType: 'json',
      data: {
        mobile: sessionStorage.getItem('id'),
        token: sessionStorage.getItem('token'),
        orderNo: orderNo,
      }
    }).done(function (res) {
      if (res.resultCode == '000000') {
        if (res.resultObj.status == 1) {
          callback();
        }
      } else {
        toast(res.resultMsg);
      }
    }).fail(function (err) {
      toast('请求超时');
    })
  }


  // 点击自定义充值
  function trueBtn(packageId, num, minReg, packageArr) {
    $("#confirmCount").unbind("click");
    $("#confirmCount").on('click', function () {
      $(".alipay").show(); //显示支付二维码
      if ($("#confirmInput").val() == "") {
        toast("请输入充值金额！");
        return;
      }
      if ($("#confirmInput").val() >= 100000) {
        toast('请您联系客服!')
        return;
      }
      if ($("#confirmInput").val()) {
        orderNo = '';
        clearInterval(time);
        qrcode.clear();
        $(".ways").hide();
        $("#confirm").show();
        productsId = packageId;
        number = parseInt($("#confirmInput").val() / num);   //num单价

        var next = 0;
        for (var i = 0; i < $("#confirmInput").val().length; i++) {
          if (/(^[0-9]*$)/.test($("#confirmInput").val()[i])) {
            next++;
          }
        }
        if (next == $("#confirmInput").val().length) {
          if ($("#confirmInput").val() >= minReg) {
            $("#money").html($("#confirmInput").val());
            // $("#giveNumberCustom").html(Math.floor(number * 0.2))  //赠送
            $("#confirmInput").val("")
            ajaxIsPay(productsId);  //显示二维码
            if ($("#confirmInput").val() >= packageArr[0].money) {
              toast('建议您选择更优惠套餐!')
            }
          } else {
            toast('充值金额必须大于' + minReg + '元')
          }
        } else {
          toast('请输入整数');
        }
      }
    })
  }
  /* isAgent*/
  /* ================================================== */
  var hf_isAgent = sessionStorage.getItem('hf_isAgent');
  var rechargetabs = $(".tabs").find("li");
  if (hf_isAgent && hf_isAgent == 0) {
    //充值套餐全部
    for (var index = 0; index < rechargetabs.length; index++) {
      rechargetabs[index].style.display = '';
    }
  } else {
    //充值套餐 只保留空号
    for (var index = 0; index < rechargetabs.length; index++) {
      if (rechargetabs[index].className.indexOf("konghao") <= 1) {
        rechargetabs[index].style.display = 'none';
      }
    }
  }

  /* isPay*/
  /* ================================================== */
  var hf_isPay = sessionStorage.getItem('hf_isPay');
  if (hf_isPay && hf_isPay == 1) {
    $(".recharge-content").show();
    $(".recharge-content-filler").hide();
  } else {
    $(".recharge-content").hide();
    $(".recharge-content-filler").show();
  }

})