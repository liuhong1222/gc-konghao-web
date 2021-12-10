

var uploadFileId = [];
var uploadFileIdAll = [];
var count = 0;
var uploadUrl = '';
var fileCounts = "";
var fileCountsArr = [];
var fileCountsArrAll = [];

isLogin(function () {
  loginHref();  //登录成功后，跳转对应的页面
  getBalance(function () {
    getUserId(function () {
      idreadInfonum(); //获取未读消息个数
      $("#easyContainer .easy_upload_select").show();
      $("#easyContainer .easy_upload_noselect").hide();
    })
  });
});

/* 批量上传 */
$('#easyContainer').easyUpload({
  allowFileTypes: '*.txt;',
  // allowFileSize: 20480,
  selectText: '浏览',
  multi: true,
  multiNum: 30,
  showNote: true,
  note: `<div>
  <p>
    注: 1、待检测文件格式<strong>支持TXT格式（每行一个手机号码）</strong>
  </p>
  <p class="form-remark form-remark1">
    2、支持最低3001-300W条号码(40M)上传，并支持批量上传，最多上传30个文件
  </p>
  <p class="form-remark form-remark2">
    3、检测完成后，请点击<strong>【历史检测】</strong>查看检测报告
  </p>
</div>`,//文件上传说明
  showPreview: true,
  url: url + '/file/upload',
  fileName: 'file',
  formParam: {
    token: sessionStorage.getItem('token'),
    mobile: sessionStorage.getItem('id')
  },
  timeout: 30000,
  okCode: 000000,
  successFunc: function (res) {
    var param = _findEle(res.easyFileIndex, res.target);
    if (res.resultCode = '000000') {

      // 停顿8秒去调用检测接口
      // var secondTest = 5;  //需要的分钟
      // var timersecondsTest = null;
      // timersecondsTest = setInterval(function () {
      //   secondTest--;
      //   if (secondTest <= 0) {
      //     clearInterval(timersecondsTest);
          fileUrl = res.resultObj.id;
          // 每个文件的总条数
          fileCounts = res.resultObj.fileRows;
          uploadUrl = res.resultObj.id;   //上传文件地址
          uploadFileIdAll.push(uploadUrl)
          fileCountsArrAll.push(fileCounts)
          setCount();
          runIng(param, uploadUrl, fileCounts);
        // }
      // }, 1000)
    }
  },
  errorFunc: function (res) {
    console.log('失败回调', res);
    uploadFileIdAll.push(0)
    fileCountsArrAll.push(0)
    setCount();
  },//上传失败回调函数
  deleteFunc: function (res) {
    console.log('删除回调', res);
  }//删除文件回调函数
});

function _findEle(index, target) {
  var obj = {};
  obj.ele = $(target).find(`.easy_upload_queue_item[data-index=${index}]`);
  obj.upBar = $(obj.ele).find('.easy_upload_bar');
  obj.upPeacent = $(obj.ele).find('.easy_upload_percent');
  obj.statusDiv = $(obj.ele).find('.easy_upload_status');
  obj.upStatus = $(obj.ele).find('.queue_check').attr('data-up');
  return obj;
}
function setCount() {
  for (var i = 0; i < uploadFileIdAll.length; i++) {
    // 为每个li添加上传文件id
    $(".easy_upload_queue").children('li:eq(' + i + ')')[0].dataset.fileid = uploadFileIdAll[i];
  }

  for (var j = 0; j < fileCountsArrAll.length; j++) {
    // 为每个li添加上传文件id
    $(".easy_upload_queue").children('li:eq(' + j + ')')[0].dataset.filecounts = fileCountsArrAll[j];
    if (fileCountsArrAll[j] !== 0) {
      $(".easy_upload_queue").children('li:eq(' + j + ')').children().children('.easy_upload_fiesize').html('号码条数：' + fileCountsArrAll[j] + '条')
    }
  }
};

function _handleChecked(param, status) {
  // $(param.upBar).css("background-color", "red");
  $(param.statusDiv).find('.status').hide().end().find(status).show();
};

function runIng(param, uploadUrl, fileCounts, dataindex) {
  // console.log(param)
  // console.log(uploadUrl)

  if (!sessionStorage.getItem('VIPtimetamp')) {
    sessionStorage.setItem('VIPtimetamp', new Date().getTime());
  }
  var timetamp = sessionStorage.getItem('VIPtimetamp');
  $.ajax({
    url: url + '/credit/theTest',
    method: 'post',
    dataType: 'json',
    data: {
      code: uploadUrl,
      source: 'pc1.0',
      type: 1,
      mobile: sessionStorage.getItem('id'),
      token: sessionStorage.getItem('token'),
      startLine: 0,
    }
  }).done(function (res) {
    // console.log('res'+res);
    if (res.resultCode == '000000') {
      $(".easy_upload_percent").hide()
      $(".easy_check_percent").show();  //检测的百分子显示
      // $(" #easyContainer .status7").show(); //检测中
      _handleChecked(param, '.status7');
      uploadFileId.push(uploadUrl);
      fileCountsArr.push(fileCounts)
      // console.log(uploadFileId);

      if (count == 0) {
        checkProgress()
      }
      count++;

    } else if (res.resultObj.status == '5') {  //小于3001
      _handleChecked(param, '.status20');
      $(".easy_upload_percent").hide()
      // $(".easy_check_percent").hide()
    } else if (res.resultObj.status == '6') {  //大于150万
      _handleChecked(param, '.status21');
      $(".easy_upload_percent").hide()
    } else if (res.resultObj.status == '4') {  //余额不足
      _handleChecked(param, '.status9');
      $(".easy_upload_percent").hide()
      // $(".easy_check_percent").hide()
    } else {
      // _handleChecked(param, '.status80');
      $(param.statusDiv).find('.status').hide().end().find('.status80').html(res.resultMsg);
      $(param.statusDiv).find('.status').hide().end().find('.status80').show();
      $(".easy_upload_percent").hide()
    }
  }).fail(function (err) {
    toast('请求超时');
  })

};


function checkProgress() {

  checkTimer = setInterval(function () {
    if (uploadFileId.length == 0) {
      window.location.href = './textRecord.html';
      clearInterval(checkTimer);
    }
    // console.log(uploadFileId.length)
    for (var i = 0; i < uploadFileId.length; i++) {
      //   uploadFileId.remove(uploadFileId[i]);
      // console.log(uploadFileId)
      $.ajax({
        url: url + '/credit/getTestProcessMobile',
        method: 'POST',
        dataType: 'json',
        async: false,
        data: {
          mobile: sessionStorage.getItem('id'),
          token: sessionStorage.getItem('token'),
          userId: userId,
          fileCode: uploadFileId[i],
        },
      }).done(function (res) {
        // 000000进行中，999978已终止 ，999977已暂停，999979已完成 ， 系统异常
        if (res.resultCode == '000000') { //检测进行中 
          // console.log(uploadFileId[i])
          var currFileId = uploadFileId[i];
          for (var k = 0; k < $(".easy_upload_queue li").length; k++) {
            if ($(".easy_upload_queue").children('li:eq(' + k + ')').data('fileid') == currFileId) {
              // console.log('哈哈');
              $(".easy_upload_queue").children('li:eq(' + k + ')').children().children('.easy_check_percent').show()
              var baifenbi = parseInt((res.resultObj.testCounts) / parseInt($(".easy_upload_queue").children('li:eq(' + k + ')').data('filecounts')) * 100) + '%'
              $(".easy_upload_queue").children('li:eq(' + k + ')').children().children('.status16').hide()
              $(".easy_upload_queue").children('li:eq(' + k + ')').children().children('.status7').show()
              if (baifenbi == '100%') {
                $(".easy_upload_queue").children('li:eq(' + k + ')').children().children('.status7').hide()
                $(".easy_upload_queue").children('li:eq(' + k + ')').children().children('.status15').show()
              }
              $(".easy_upload_queue").children('li:eq(' + k + ')').children().children('.easy_check_percent').html(baifenbi)
            }
          };
        } else if (res.resultCode == '999979') {  //检测完成
          var currFileId = uploadFileId[i];
          for (var a = 0; a < $(".easy_upload_queue li").length; a++) {
            if ($(".easy_upload_queue").children('li:eq(' + a + ')').data('fileid') == currFileId) {
              $(".easy_upload_queue").children('li:eq(' + a + ')').children().children('.easy_check_percent').hide()
              $(".easy_upload_queue").children('li:eq(' + a + ')').children().children('.status7').hide()
              $(".easy_upload_queue").children('li:eq(' + a + ')').children().children('.status15').hide()
              $(".easy_upload_queue").children('li:eq(' + a + ')').children().children('.status8').show()
            }
          }
          // $(".easy_upload_queue").children('li:eq(' + i + ')').children().children('.status8').show()
          uploadFileId.remove(uploadFileId[i]);
        } else { //检测异常
          toast(res.resultMsg)
        }
      }).fail(function (err) {
        toast(err.resultMsg)
      })
    }
  }, 1400);

}

Array.prototype.indexOf = function (val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == val) return i;
  }
  return -1;
};

Array.prototype.remove = function (val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};





