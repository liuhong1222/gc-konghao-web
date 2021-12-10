
var timer1 = null;
var timersecondTest = null;
var fileUrl = sessionStorage.getItem('url') ? sessionStorage.getItem('url') : '';
var runCount = '';
var uploadUrl = '';
var userId = "";
var checkTimer = null;
var progress = parseInt(sessionStorage.getItem('progress')) ? parseInt(sessionStorage.getItem('progress')) : 0;//浏览器中如果没有存进度说明检测已经完毕
var testStatus = false;
isLogin(function () {
  loginHref();  //登录成功后，跳转对应的页面
  getBalance(function () {
    getUserId(function () {
      userId = userId;
      idreadInfonum(); //获取未读消息个数
      if (sessionStorage.getItem('url')) {//如果有浏览器中有url的话说明上次检测还未提交
        $("#testing").show(); //旋转检测进度
        clearInterval(checkTimer);
        checkTimer = setInterval(function () {
          getTestProcessMobile();
        }, 1400)
      } else {
        // 清空本地缓存
        clearSetItem();
        sessionStorage.setItem('timetamp', '');
        $("#fileBtn").show();
        $("#notAllow").hide();
      }
    })
  });
});

/* 上传文件 */
/* ======================================= */
function upLoad(callback) {
  var token = sessionStorage.getItem('token');
  var tel = sessionStorage.getItem('id');
  var formData = new FormData();
  var name = $("#file").val();
  formData.append("file", $("#file")[0].files[0]);
  formData.append("name", name);
  $.ajax({
    url: url + '/file/upload?mobile=' + tel + '&token=' + token,
    method: 'POST',
    dataType: 'json',
    data: formData,
    processData: false,
    contentType: false,
    xhr: function () {
      myXhr = $.ajaxSettings.xhr();
      if (myXhr.upload) {
        myXhr.upload.addEventListener('progress', progressHandlingFunction, false);
      }
      return myXhr;
    },
  }).done(function (res) {
    if (res.resultCode == '999999') {
      toast(res.resultMsg);
      $("#test").hide();
      return;
    } else if (res.resultCode == '000000') {
      fileUrl = res.resultObj.id;
      sessionStorage.setItem('count', res.resultObj.fileRows);
      uploadUrl = res.resultObj.id;
      callback();
      if (res.resultObj.fileRows >= 1000000) {
        var secondTest = 2;  //需要的分钟
        timersecondTest = setInterval(function () {
          secondTest--;
          if (secondTest <= 0) {
            clearInterval(timersecondTest);
            $("#test").show();
          }
        }, 1000)
      } else {
        $("#test").show();
      }
    } else {
      toast(res.resultMsg);
    }
  })
}
///上传进度回调函数： 
function progressHandlingFunction(e) {
  if (e.lengthComputable) {
    $('progress').attr({
      value: e.loaded,
      max: e.total
    });
    //更新数据到进度条
    var percent = e.loaded / e.total * 100;
    if (percent == 100) {
      $("#barProgress").hide();
      $("#progressBar").hide();
    }
    $('#progressBar').html(e.loaded + "/" + e.total + " bytes. " + percent.toFixed(2) + "%");
  }
};

//浏览文件
$("#fileBtn").on('click', function () {
  if (parseInt(sessionStorage.getItem('balance')) > 0) { //先判断余额是不是大于0
    if (sessionStorage.getItem('id')) {//判断用户是否登录
      $("#file").click();
    } else {
      loginHide();
    }
  } else {
    toast('账户余额不足')
  }
});
//file文件改变
$("#file").on('change', function () {
  if ($("#file").val()) {//上传的文件是否为空
    if (isTxt($("#file").val())) {//上传的文件是否为txt格式
      var fileSize = $("#file")[0].files[0].size;
      if (fileSize / 1024 / 1024 < 20) {//文件大小不能大于20mb
        $("#fileName").html($("#file").val());
        sessionStorage.setItem('timetamp', new Date().getTime());
        if (fileSize >= 6500031) {
          $("#sendBtn").show();
          $("#test").hide();
        } else {
          $("#sendBtn").hide();
          upLoad(function () {
          });
        }
      } else {
        toast('文件大小不能超过20MB');
      }
    } else {
      toast('请上传TXT格式文件');
    }
  } else {
    $("#fileName").html('请上传文件进行检测');
    $("#test").hide();
  }
});


// 点击上传
$("#sendBtn").on('click', function () {
  $(this).hide();
  $("#test").hide();
  $("#barProgress").show();
  $("#progressBar").show();
  upLoad(function () {
  });
});
/* 上传文件类型必须为txt */
/* ======================================= */
function isTxt(path) {
  var index1 = path.lastIndexOf(".");
  var index2 = path.length;
  var str = path.substring(index1 + 1, index2);//后缀名
  if (str == 'txt') {
    return true;
  } else {
    return false;
  }
};

// 模块显示和隐藏
function modalSH() {
  $("#testing").hide();
  $("#test").hide();
  $("#fileBtn").show();
  $("#notAllow").hide();
  $("#mask").hide();
  $("#testBox").hide();
}

// 清空本地存储
function clearSetItem() {
  sessionStorage.setItem('url', '');
  sessionStorage.setItem('count', '');
  sessionStorage.setItem('progress', '');
}
//开始检测
$("#test").on('click', function () {
  if (sessionStorage.getItem('count') <= 3000) {
    toast("对不起，空号检测类业务最低检测条数为3001条");
    return;
  }
  $(".readFileWait").show();
  $("#mask").show();
  $("#test").hide();  //立即检测按钮
  $("#testBtnDisabled").show();
  testStatus = true;
  sessionStorage.setItem('url', uploadUrl);
  runIng(function () {

  });
});


// 第一次检测
function runIng(callback) {
  if (!sessionStorage.getItem('timetamp')) {
    sessionStorage.setItem('timetamp', new Date().getTime());
  }
  var timetamp = sessionStorage.getItem('timetamp')
  $.ajax({
    url: url + '/credit/theTest',
    method: 'post',
    dataType: 'json',
    data: {
      code: sessionStorage.getItem('url'),
      source: 'pc1.0',
      type: 1,
      mobile: sessionStorage.getItem('id'),
      token: sessionStorage.getItem('token'),
      startLine: 0,
    }
  }).done(function (res) {
    $("#testBtnDisabled").hide();
    // 成功返回
    if (res.resultCode == '000000') {

      $("#test").hide();  //立即检测按钮
      var second = res.resultObj.runCount;  //需要的分钟
      timersecond = setInterval(function () {
        second--;
        if (second <= 0) {
          clearInterval(timersecond);
          checkTimer = setInterval(function () {
            getTestProcessMobile();
          }, 1400)
          //关闭主页的提示框
          $("#close1").on('click', function () {
            $("#noBalance").hide();
          })
        }
      }, 1000)
    } else {
      toast(res.resultMsg);  //提示账户余额不足
      $(".readFileWait").hide();
      $("#mask").hide();
      // 模块显示隐藏
      modalSH();
      // // 清空本地缓存
      clearSetItem();
    }
  }).fail(function (err) {
    toast('请求超时');
    $(".readFileWait").hide();
    // 模块显示隐藏
    modalSH();
    $("#testBtnDisabled").hide();
    // 清空本地缓存
    clearSetItem();
  })
}

function getTestProcessMobile() {

  $.ajax({
    url: url + '/credit/getTestProcessMobile',
    method: 'POST',
    dataType: 'json',
    data: {
      mobile: sessionStorage.getItem('id'),
      token: sessionStorage.getItem('token'),
      userId: userId,
      fileCode: sessionStorage.getItem('url'),
    },
  }).done(function (res) {
    console.log(res.resultCode)
    // 000000进行中 , 999979已完成 ， 系统异常
    if (res.resultCode == '000000') {   //进行中
      if (res.resultObj.testCounts == "36") {
        $("#runCount").html("0")
        $(".statusName").html('准备检测')
        $(".text").html('准备检测')
      } else {
        progress = parseInt(res.resultObj.testCounts);
        $(".statusName").html('正在检测')
        $(".text").html('正在检测')
      }
      if (sessionStorage.getItem('closeBox') == 'trueClose') {
        $("#testBox").hide();   //大框框显示
        $("#mask").hide();
      } else {
        $("#testBox").show();   //大框框显示
        $("#mask").show();
      }
      $("#testing").show(); //旋转检测进度

      $("#fileBtn").hide();
      $("#notAllow").show();
      $(".readFileWait").hide();

      // 查看进度
      var htmlMobileList = '';
      var mobileList = res.resultObj.mobileList;
      for (var i = 0; i < mobileList.length; i++) {
        var type;
        var Type = mobileList[i].color;
        switch (Type) {
          case "red":
            type = "!";
            break;
          case "blue":
            type = "√";
            break;
          case "gray":
            type = "×";
            break;
          case "yellow":
            type = "?";
            break;
        }
        htmlMobileList += '<li class="' + mobileList[i].color + '">' + mobileList[i].mobile + '<span>' + type + '</span>' + '</li > '
      }

      $("#numList").html(htmlMobileList)
      // 运行条数
      sessionStorage.setItem('progress', res.resultObj.testCounts);
      //运行条数和总条数
      if (res.resultObj.fileCounts == "0") {
        countAll = sessionStorage.getItem('count')
      } else {
        countAll = res.resultObj.fileCounts
      }
      if (progress >= parseInt(countAll)) {
        progress = parseInt(countAll);
        sessionStorage.setItem('progress', countAll);
        // clearInterval(checkTimer);
        $("#loadingBox").hide();
        $("#fileLoading").show();
      }
      // 百分比
      $("#progress").html(parseInt(progress / parseInt(countAll) * 100) + '%');
      $("#loadingBox").css({ 'background-position-y': 138 - (progress / parseInt(countAll)) * 138 + 'px' });
      //比例显示
      $("#runCount").html(progress);  //运行条数
      $("#allCount").html(countAll)  //总条数
    } else if (res.resultCode == '999979') {   //检测完成
      // 检测完成页面
      clearInterval(checkTimer);
      doneTick();
      sessionStorage.setItem('timetamp', '');//清空时间戳
      $("#test").hide()
    } else {
      toast(res.resultMsg);
      // 暂留
      checkTimer = setInterval(function () {

        getTestProcessMobile();
      }, 1400)
    }
  }).fail(function (res) {
    toast(res.resultMsg);
    modalSH();
    clearSetItem();
    sessionStorage.setItem('timetamp', '');//清空时间戳
  })
};



/* 检测完毕时的显示方式 */
/* ======================================= */
function doneTick() {
  $("#doneBox .p2 .cost").html(sessionStorage.getItem('count'));
  $("#doneBox .p3 .last").html(sessionStorage.getItem('balance') == 0 ? '0' : parseInt(sessionStorage.getItem('balance')) - parseInt(sessionStorage.getItem('count')));
  // 清空本地
  clearSetItem();
  sessionStorage.setItem('timetamp', '');//检测成功之后把时间戳清空
  sessionStorage.removeItem('closeBox')
  $("#mask").show();

  $("#doneBox").show();
  // 模块的显示和隐藏
  modalSH()
  var second = 10;
  clearInterval(timer1);
  timer1 = setInterval(function () {
    second--;
    $("#second").html(second);
    if (second <= 0) {
      clearInterval(timer1);
      window.location.href = './textRecord.html';
    }
  }, 1000);
}

//关闭检测弹框
$("#testBox span.close").on('click', function () {
  $("#mask").hide();
  $("#testBox").hide();
  sessionStorage.setItem('closeBox', 'trueClose');
  $("#phone").html(sessionStorage.getItem('id'));
});


// 点击转圈圈的
$("#testing").on('click', function () {
  testStatus = true;
  sessionStorage.removeItem('closeBox')
  clearInterval(checkTimer);
  checkTimer = setInterval(function () {
    getTestProcessMobile();
  }, 1400)
});



