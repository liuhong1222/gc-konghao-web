/*
easyUpload.js
funnyque@163.com
https://github.com/funnyque
*/
; (function ($) {
  $.fn.easyUpload = function (opts) {
    var defaults = {
      allowFileTypes: '*.txt;',//允许上传文件类型，格式'*.pdf;*.doc;'
      allowFileSize: 40960,
      selectText: '浏览',//上传按钮文案
      multi: true,//是否允许多文件上传
      multiNum: 30,//多文件上传时允许的有效文件数
      showNote: true,//是否展示文件上传说明
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
      isUploadChunk: false, // 是否为分片上传
      url: '',//上传文件地址
      fileName: 'file',//文件配置参数
      formParam: null,//文件以外的配置参数，格式：{key1:value1,key2:value2}
      timeout: 30000,//请求超时时间
      okCode: 200,//与后端返回数据code值一致时执行成功回调，不配置默认200
      successFunc: null,//上传成功回调函数
      errorFunc: null,//上传失败回调函数
      deleteFunc: null//删除文件回调函数
    }
    var option = $.extend(defaults, opts);
    // 通用函数集合
    var F = {
      // 将文件的单位由bytes转换为KB或MB，若第二个参数指定为true，则永远转换为KB
      formatFileSize: function (size, justKB) {
        if (size > 1024 * 1024 && !justKB) {
          size = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
        } else {
          size = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';
        }
        return size;
      },
      // 将输入的文件类型字符串转化为数组,原格式为*.jpg;*.png
      getFileTypes: function (str) {
        var result = [];
        var arr = str.split(";");
        for (var i = 0, len = arr.length; i < len; i++) {
          result.push(arr[i].split(".").pop());
        }
        return result;
      }
    };
    this.each(function (index, element) {
      // 文件相关变量
      var allowFiles = [];
      var selectedFiles = {};
      var fileArr = [];
      var msjFileCount = null;
      // 文件上传请求次数
      var postedNum = 0;
      // 标识上传是否完成
      var upFiniehed = true;
      // 标识当前是否允许新的文件上传
      var allowNewPost = true;
      // 进度条相关变量
      var loadedPercent = 0;
      var increasePercent = 1;
      var showTimer = undefined;
      var uploadCompleted = false;
      //  定义变量接收上传返回结果
      var response = {};
      response.success = [];
      response.error = [];
      // 实例化相关变量
      var _ele = $(element);   //最外层div
      // console.log(_ele)
      var easyManager = {
        init: function () {
          var $html = '';
          $html = '<div class="easy_upload-container"><div class="easy_upload-head">';
          $html += '<div class="file fl" id="fileName">请上传文件进行检测</div>';
          $html += '<input type="file" '
          $html += option.multi ? 'multiple ' : '';
          $html += 'class="fileInput" data-count="0"  accept="text/plain"  style="display:none;" />';
          $html += '<span class="easy_upload_noselect" >' + option.selectText + '</span>';
          $html += '<span class="easy_upload_select noselect">' + option.selectText + '</span>';
          $html += option.showNote ? '<span class="easy_upload_note">' + option.note + '</span>' : '';
          $html += '</div>';
          $html += '<div class="msjPopup">';
          $html += '<div class="msjTask">';
          $html += '<span class="easy_upload_msjTitle" style="display:none">' + '批量检测' + '</span>';
          $html += '<span class="close-dialog"></span>';
          $html += '<ul class="easy_upload_queue" style="margin-top:20px" ></ul>';
          $html += option.multi ? '<span class="easy_upload_head_btn1 uploadBtn noselect" style="display:none">立即上传</span>' : '';
          $html += option.multi ? '<span class="continueAdd" style="display:block"><img src="../images/uploadPlus.png" style="margin-right: 6px;vertical-align: sub;">添加文件</span>' : '';
          $html += '<p class="waringTips" ></p>';
          $html += '</div>';
          $html += '</div>';
          $html += '</div>';
          _ele.html($html);
          this.bindHead();
        },
        isTxt: function (path) {
          var index1 = path.lastIndexOf(".");
          var index2 = path.length;
          var str = path.substring(index1 + 1, index2);//后缀名
          if (str == 'txt') {
            return true;
          } else {
            return false;
          }
        },
        bindHead: function () {
          var _this = this;
          // 绑定前先解绑，一个页面多个easyUpload实例时如不解绑，事件会执行多次
          $('.easy_upload_select').off('click').click(function () {
            $(this).parent().find('.fileInput').trigger('click');
          });
          $(".continueAdd").off('click').click(function () {
            $(this).parent().parent().prev().find('.fileInput').trigger('click');
          })
          $('.fileInput').off('change').change(function () {
            var count = Number($(this).attr('data-count'));
            fileArr = [];
            var files = this.files;
            if (_this.isTxt($('.fileInput').val())) {
              for (var i = 0; i < files.length; i++) {
                var obj = {};
                obj.index = count;
                obj.file = files[i];
                fileArr.push(obj);
                // 用对象将所有选择文件存储起来
                selectedFiles[count] = obj;
                count++;
              }
              $(this).val('').attr('data-count', count);
              _this._checkFile(fileArr, this);
              $(this).parent().find('.head_check').html('&#xe693;').attr('data-checked', 'no');
            } else {
              toast('仅支持TXT格式的文件!')
            }
          });
          $('.head_check').off('click').click(function () {
            var opt = { type: 'all', target: this };
            var flag = $(this).attr('data-checked');
            if (flag == 'no') {
              opt.check = 'yes';
            } else {
              opt.check = 'no';
            }
            _this._handleCheck(opt);
          });

          // 点击上传
          $('.easy_upload_head_btn1').off('click').click(function () {
            $(".notice-pop-up").show();
            $('.easy_upload_head_btn1').hide();
            $(".continueAdd").hide();  //隐藏添加文件
            $(".waringTips").hide();
            //  $('.easy_upload_head_btn1').hide();  //点击完上传，上传就掩藏
            // var queueUl = $(this).parent().parent().find('.easy_upload_queue');
            // var arr = _this._findItems(1, queueUl);
            // if (arr.length>0) {
            //   allowFiles = allowFiles.concat(arr);
            //   upFiniehed = true;
            //   _this._uploadFile(queueUl);
            // }
          });

          // 点击关闭页面
          $(".close-dialog").off().on('click', function () {
            selectedFiles = {};
            $(".easy_upload_queue").html("");
            $(".notice-pop-up").hide();
            $(".fileInput").val('').attr('data-count', 0);  // 上传清空
            $(".msjTask").hide();
            $(".msjPopup").hide()
          })

          // 确定上传
          $("#notice-pop-upBtnTrue").off('click').click(function () {
            $('.easy_upload_head_btn1').hide();  //点击完上传，上传就掩藏
            $(".close-dialog").hide();  //隐藏关闭按钮
            $(".notice-pop-up").hide();
            $(".easy_upload_delbtn").hide();  //删除按钮
            var queueUl = $(this).parent().parent().siblings().children().find('.easy_upload_queue');
            var arr = _this._findItems(1, queueUl);
            if (arr.length > 0) {
              allowFiles = allowFiles.concat(arr);
              upFiniehed = true;
              _this._uploadFile(queueUl);
              if (option.setFileCount) {
                option.setFileCount(allowFiles.length)
              }
            }
          })

          // 取消上传
          $("#notice-pop-upBtnClear").off('click').click(function () {
            $(".notice-pop-up").hide();
            $('.easy_upload_head_btn1').show();
            $(".continueAdd").show();  //隐藏添加文件
            $(".waringTips").show()
          })

          $('.easy_upload_head_btn2').off('click').click(function () {
            var queueUl = $(this).parent().parent().find('.easy_upload_queue');
            var arr = _this._findItems(2, queueUl);
            if (arr.length > 0) _this._deleFiles(arr, queueUl);
          });
        },
        bindQueue: function () {
          var _this = this;
          $('.queue_check').off('click').click(function () {
            var opt = { type: 'notall', target: this };
            var flag = $(this).attr('data-checked');
            if (flag == 'no') {
              opt.check = 'yes';
            } else {
              opt.check = 'no';
            }
            _this._handleCheck(opt);
            // 点击单个时同时判断是否有全部选中
            var checkedAll = _this._countCheck(this);
            var hItem = $(this).parent().parent().parent().parent().find('.head_check');
            if (checkedAll) {
              $(hItem).html('&#xe61e;').attr('data-checked', 'yes');
            } else {
              $(hItem).html('&#xe693;').attr('data-checked', 'no');
            }
          });
          $('.easy_upload_upbtn').off('click').click(function () {
            var index = $(this).parent().parent().attr('data-index');
            allowFiles.push(index);
            $(this).hide(400);
            var queueUl = $(this).parent().parent().parent();
            _this._uploadFile(queueUl);
          });
          $('.easy_upload_delbtn').off('click').click(function () {
            // debugger
            var upStatus = $(this).parent().parent().find('.queue_check').attr('data-up');
            if (upStatus != '3') {
              var indx = $(this).parent().parent().attr('data-index');  //li的index
              var target = $(this).parent().parent().parent();   //li的父亲
              _this._deleFiles([indx], target);
            }
          });
        },
        _checkFile: function (fileArr, target) {
          var typeArr = F.getFileTypes(option.allowFileTypes);
          if (typeArr.length > 0) {
            for (var i = 0; i < fileArr.length; i++) {
              var f = fileArr[i].file;
              if (parseInt(F.formatFileSize(f.size, true)) <= option.allowFileSize) {
                if ($.inArray('*', typeArr) >= 0 || $.inArray(f.name.split('.').pop(), typeArr) >= 0) {
                  fileArr[i].allow = true;
                } else {
                  fileArr[i].allow = false;
                }
              } else {
                fileArr[i].allow = false;
              }
            }
          }
          this._renderFile(fileArr, target);
        },
        _renderFile: function (fileArr, target) {

          // 边框显示
          $(".msjTask").show();
          $(".msjPopup").show();
          var queueUl = $(target).parent().parent().find('.easy_upload_queue');  //渲染文件
          $(".easy_upload_head_btn1").show();
          $(".easy_upload_msjTitle").show();
          function render(file) {
            var preview;
            var f = file.file;
            var fileType = f.name.split('.').pop();
            if (fileType == 'bmp' || fileType == 'jpg' || fileType == 'jpeg' || fileType == 'png' || fileType == 'gif') {
              var imgSrc = URL.createObjectURL(f);
              preview = '<img class="easy_upload_img" src="' + imgSrc + '" />';
            } else if (fileType == 'rar' || fileType == 'zip' || fileType == 'arj' || fileType == 'z') {
              // preview = '<i class="easy_upload_icon easyUploadIcon">&#xe69d;</i>';
            } else {
              // preview = '<i class="easy_upload_icon easyUploadIcon">&#xe64d;</i>';
            }
            // debugger
            // var serialNumber = ((file.index) + 1) >= 10 ? ((file.index) + 1) : (' 0' + ((file.index) + 1))
            var sHtml = '';
            sHtml += '<p class="status status1" >等待上传</p>';
            sHtml += '<p class="status status2" style="margin-top: -17px;">等待上传</p>';
            sHtml += '<p class="status status3">上传中.</p>';
            sHtml += '<p class="status status4">上传失败</p>';
            sHtml += '<p class="status status5">上传完成</p>';
            sHtml += '<p class="status status7" style="margin-top: -3px;">检测中</p>';
            sHtml += '<p class="status status15" style="display:none;color:#bee8fb">解析中</p>';
            sHtml += '<p class="status status20" style="display:none;color:red">最低上传3001条</p>';
            sHtml += '<p class="status status21" style="display:none;color:red">最大检测150万条</p>';
            sHtml += '<p class="status status80" style="display:none;color:red">该文件中不存在可识别的手机号码</p>';
            sHtml += '<p class="status status8" style="display:none;color:#bee8fb">检测完成 <img src="../images/wanc.png" style="position: relative; right: -46px;top: -17px;"></p>';
            sHtml += '<p class="status status9" style="display:none;color:red">余额不足</p>';

            var $html = '';
            $html += '<li class="easy_upload_queue_item queue_check_allow_' + file.allow + '" data-index="' + file.index + '">';
            $html += '<div class="easy_upload_preview queue_item-section" style="color: #cde1fa;font-size: 16px;font-weight:bold"> </div>';
            $html += '<div class="easy_upload_file1 queue_item-section">';
            $html += '<p class="easy_upload_filename">' + f.name + '</p>';
            $html += '<p class="easy_upload_fiesize">' + F.formatFileSize(f.size) + '</p>';
            $html += '<p class="easy_upload_progress">';
            $html += '<span class="easy_upload_bar"><span class="easy_upload_bar_guang" data-index="" style="display:none"></span></span>';
            $html += '</p>';
            $html += '</div>';
            $html += '<div class="easy_upload_file2 queue_item-section">';
            $html += '<p class="easy_upload_percent" style="color: #8996a6;" style="display:none"></p>';
            $html += '</div>';
            $html += '<div class="easy_upload_file2 queue_item-section">';
            $html += '<p class="easy_check_percent" style="color: #8996a6;display:none" ></p>';
            $html += '</div>';
            $html += '<div class="easy_upload_status queue_item-section">';
            $html += file.allow ? sHtml : '<p class="status status6">文件不允许</p>';
            $html += '<p class="easy_upload_delbtn btn noselect" style="margin-top:2px;margin-left:13px;cursor:pointer"><img src="../images/delUpload.png"></p>';
            $html += '</div>';
            $html += '<div class="easy_upload_btn queue_item-section">';
            $html += '</div>';

            $html += '</div>';
            if (option.multi) {
              $(queueUl).append($html);
              // 重新渲染li的个数
              var index = 0;
              $(queueUl).find('li').each(function (index1) {
                index = (index1 + 1) >= 10 ? (index1 + 1) : (' 0' + (index1 + 1))
                $(this)[0].firstChild.innerHTML = index;   //删除后，改变li的序号
                //
              })

            } else {
              $(queueUl).html($html);
            }


          }

          //  console.log((Object.keys(selectedFiles)).length)
          // console.log('selectedFiles删除前', selectedFiles)
          // (Object.keys(selectedFiles)).length 已经上传浏览的文件个数

          for (var i = 0; i < fileArr.length; i++) {
            if (option.multi) {
              var qItemNum = $(queueUl).find('.easy_upload_queue_item:visible').length;
              if (qItemNum < option.multiNum)
                render(fileArr[i]);
            } else {
              render(fileArr[i]);
            }
          }
          console.log((Object.keys(selectedFiles)).length)
          console.log(fileArr)
          console.log(Number(sessionStorage.getItem('shengyu')))
          if ((Object.keys(selectedFiles)).length !== fileArr.length) {   //已选  和  每次选的
            var dd = Number(sessionStorage.getItem('shengyu')) + fileArr.length;   //列表剩余+ 每次选的
          }
          if ($(queueUl).find('li').length < 30) {
            $(".msjTask .waringTips").html('<span style="color:#4a568a;margin: 20px auto;width:300px;display: block;">' + '注：您已添加' + $(queueUl).find('li').length + '个文件，最多可再添加' + ((option.multiNum) - ($(queueUl).find('li').length)) + '个文件' + '</span>')
          } else if (dd > 30) {
            $(".beyond-file-format-tip").stop().show();
            setTimeout(function () {
              $(".beyond-file-format-tip").stop().hide();
            }, 3000);
            $(".continueAdd").hide(); // 隐藏掉添加文件
            $(".msjTask .waringTips").html('<span style="color:#4a568a;margin: 20px auto;width: 540px;display: block;">' + '注：系统已自动选择前30个文件，如需检测其他文件，请删除列表中的文件后再添加。' + '</span>')
          } else if (dd = 30) {
            $(".continueAdd").hide(); // 隐藏掉添加文件
            $(".msjTask .waringTips").html('<span style="color:#4a568a;margin: 20px auto;width:300px;display: block;">' + '注：您已添加30个文件，最多可再添加' + ((option.multiNum) - ($(queueUl).find('li').length)) + '个文件' + '</span>')
          }

          this.bindQueue();
        },
        _handleCheck: function (opt) {
          if (opt.type == 'all') {
            if (opt.check == 'yes') {
              $(opt.target).html('&#xe61e;').attr('data-checked', 'yes');
              var qItems = $(opt.target).parent().parent().find('.queue_check');
              for (var i = 0; i < qItems.length; i++) {
                $(qItems[i]).html('&#xe61e;').attr('data-checked', 'yes');
              }
            } else {
              $(opt.target).html('&#xe693;').attr('data-checked', 'no');
            }
          } else {
            if (opt.check == 'yes') {
              $(opt.target).html('&#xe61e;').attr('data-checked', 'yes');
            } else {
              $(opt.target).html('&#xe693;').attr('data-checked', 'no');
            }
          }
        },
        _countCheck: function (target) {
          var checkedAll = true;
          var qItems = $(target).parent().parent().parent().find('.queue_check');
          for (var i = 0; i < qItems.length; i++) {
            if ($(qItems[i]).attr('data-checked') == 'no') checkedAll = false;
          }
          return checkedAll;
        },
        _uploadFile: function (target) {
          var _this = this;
          this._setStatus2(target);
          function controlUp() {
            if (postedNum < allowFiles.length) {
              upFiniehed = false;
              if (option.isUploadChunk) {
                pieceUpload()
              } else {
                upload();
              }
            } else {
              upFiniehed = true;
            }
          }
          function upload() {
            if (allowNewPost) {
              allowNewPost = false;
              var file = selectedFiles[allowFiles[postedNum]];
              postedNum++;
              _this._resetParam();
              var fd = new FormData();
              fd.append(option.fileName, file.file);
              if (option.formParam) {
                for (key in option.formParam) {
                  fd.append(key, option.formParam[key]);
                }
              }
              _this._setUpStatus({ index: file.index, target: target }, 1);
              // _this._showProgress(file.index, target);
              $.ajax({
                url: option.url,
                type: "POST",
                data: fd,
                async: true,
                processData: false,
                contentType: false,
                timeout: option.timeout,
                success: function (res) {
                  _this._showProgress(file.index, target);
                  // 标记索引，用于删除操作

                  res.easyFileIndex = file.index;
                  var param = _this._findEle(file.index, target);
                  if (res.resultCode != option.okCode) {
                    // allowNewPost = true;
                    if (option.multi) {
                      response.error.push(res);
                      option.errorFunc && option.errorFunc(response);
                    } else {
                      option.errorFunc && option.errorFunc(res);
                    }
                    uploadCompleted = true;
                    var tips = res.resultMsg;
                    _this._handleFailed(param, tips);
                  } else {  //成功
                    uploadCompleted = true;
                    if (option.multi) {
                      var objRes = res;
                      objRes.target = target;

                      file.fileCount = res.resultObj.fileRows;
                      // objRes.file = file.fileCount;
                      // console.log(file.index)
                      // 上传后 显示条数
                      // $(".easy_upload_queue").children('li:eq(' + file.index + ')').children().children('.easy_upload_fiesize').html('号码条数：' + file.fileCount + '条')

                      // console.log($(".easy_upload_queue").children('li:eq(' + file.index + ')').children().children('.easy_upload_fiesize').html())
                      // response.success.push(objRes);
                      option.successFunc && option.successFunc(objRes);
                      //====================================================================

                      //====================================================================

                    } else {
                      option.successFunc && option.successFunc(res);
                    }
                  }
                  controlUp();
                  _this._setUpStatus({ index: file.index, target: target }, 2);
                },
                error: function (res) {
                  res.easyFileIndex = file.index;
                  if (option.multi) {
                    response.error.push(res);
                    option.errorFunc && option.errorFunc(response);
                  } else {
                    option.errorFunc && option.errorFunc(res);
                  }
                  allowNewPost = true;
                  var param = _this._findEle(file.index, target);
                  _this._handleFailed(param);
                  controlUp();
                  _this._setUpStatus({ index: file.index, target: target }, 2);
                }
              });
            }
          }
          function pieceUpload() {
            if (allowNewPost) {
              allowNewPost = false;
              var file = selectedFiles[allowFiles[postedNum]];
              postedNum++;
              _this._resetParam();
              _this._setUpStatus({ index: file.index, target: target }, 1);
  
              // 开始分片上传处理
              _this._showPieceUploadProgress(file.index, target, false, false)
              _this._uploadByPieces(file.file, function (res) {
                _this._showPieceUploadProgress(file.index, target, true, true);
                uploadCompleted = true;
                res.easyFileIndex = file.index;
                if (option.multi) {
                  var objRes = res;
                  objRes.target = target;
                  file.fileCount = res.resultObj.fileRows;
                  option.successFunc && option.successFunc(objRes);
                } else {
                  option.successFunc && option.successFunc(res);
                }

                controlUp();
                _this._setUpStatus({ index: file.index, target: target }, 2);
              }, function (res) {
                _this._showPieceUploadProgress(file.index, target, true, false);
                res.easyFileIndex = file.index;
                var param = _this._findEle(file.index, target);
                if (option.multi) {
                  response.error.push(res);
                  option.errorFunc && option.errorFunc(response);
                } else {
                  option.errorFunc && option.errorFunc(res);
                }
                uploadCompleted = true;
                allowNewPost = true;
                var tips = res && res.resultMsg ? res.resultMsg : '';
                _this._handleFailed(param, tips);

                controlUp();
                _this._setUpStatus({ index: file.index, target: target }, 2);
              }, file.index, target)
            }
          }
          if (upFiniehed) {
            if (option.isUploadChunk) {
              pieceUpload(target)
            } else {
              upload(target);
            }
          }
        },
        _uploadByPieces: function (file, successCb, errorCb, fileIndex, target) {
          var _this = this;
          // 重写 FileReader 相关原型函数
          FileReader.prototype.readAsBinaryString = function (fileData) {
            var binary = ''
            var pt = this
            var reader = new FileReader()
            reader.onload = function (e) {
              var bytes = new Uint8Array(reader.result)
              var length = bytes.byteLength
              for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i])
              }
              // pt.result  - readonly so assign binary
              pt.content = binary
              // 页面内data取pt.content文件内容
              pt.onprogress(pt)
            }
            reader.readAsArrayBuffer(fileData)
          }
          
          // 上传过程中用到的变量
          var fileMD5 = '' // 总文件列表
          var chunkSize = 0.25 * 1024 * 1024 // 5MB一片
          var chunkCount = Math.ceil(file.size / chunkSize) // 总片数
          var batchDealNum = 10 // promise并发请求数量
          var sliceCount = 3 // 失败片数重新上传次数
          var fileChunkList = []
          var fileChunkLength = 0

          // 获取md5
          function readFileMD5() {
            // if (file.size > 40 * 1024 * 1024) {
            //   errorCb('上传文件不能超过40M，请重新上传')
            //   return false
            // }
            // 读取文件的md5
            var fileRederInstance = new FileReader()
            fileRederInstance.readAsBinaryString(file)
            fileRederInstance.onprogress = function (data) {
              var fileBolb = data.content
              fileMD5 = md5(fileBolb)
              console.log('将分片上传')
              createFileChunk()
              batchUpload(0)
            }
          }

          // 循环分解文件
          function createFileChunk() {
            var count = 0
            var fileKey = file.name + '_' + +new Date()
            while (count < file.size) {
              fileChunkList.push({
                key: fileKey,
                chunk: file.slice(count, count + chunkSize),
                index: fileChunkLength,
                isLast: count + chunkSize > file.size
              })
              fileChunkLength++
              count += chunkSize
            }
          }

          // 分片上传，设置并发
          function batchUpload(currIndex) {
            var isLast = (currIndex + batchDealNum) >= chunkCount
            var currChunks = fileChunkList.slice(currIndex, currIndex + batchDealNum)
            var uploadTaskArr = currChunks.map(function (ele, index) {
              return creatUploadTask(ele, currIndex + index)
            })
            Promise.all(uploadTaskArr)
              .then(function (chunkInfo) {
                var completed = Math.floor(((currIndex + batchDealNum) / chunkCount) * 100)
                if (isLast) {
                  if (currIndex + batchDealNum < chunkCount - 1) {
                    console.log('分片上传成功' + (currIndex + batchDealNum))
                  } else {
                    // 当总数大于等于分片个数的时候
                    if (currIndex + batchDealNum >= chunkCount - 1) {
                      uploadStatus()
                    }
                  }
                } else {
                  _this._updateProgrePercent(fileIndex, target, completed)
                  batchUpload(currIndex + batchDealNum)
                }
              })
              .catch(function (err) {
                console.log('分片上传失败：-----------------' + err)
                errorCb(err)
              })
          }

          function creatUploadTask(chunkInfo, index) {
            return new Promise(function (resolve, reject) {
              var params = new FormData()
              params.append('file', chunkInfo.chunk);
              params.append('fileRealName', file.name);
              params.append('chunkNumber', index);
              params.append('chunkSize', chunkSize);
              params.append('totalChunks', chunkCount);
              params.append('identifier', fileMD5);
              params.append('token', option.formParam ? option.formParam.token : undefined);
              params.append('mobile', option.formParam ? option.formParam.mobile : undefined);
              $.ajax({
                url: option.chunkUploadUrl,
                type: "POST",
                data: params,
                async: true,
                processData: false,
                contentType: false,
                timeout: option.timeout,
                success: function (res) {
                  if (res.resultCode != option.okCode) {
                    rejectFn(chunkInfo, index, resolve, reject, 0)
                  } else {  //成功
                    resolve(chunkInfo)
                  }
                },
                error: function (res) {
                  rejectFn(chunkInfo, index, resolve, reject, 0)
                }
              });
            })
          }

          // 分片上传某片失败时，重传该片3次
          function rejectFn(
            chunkInfo,
            index,
            parentResolve,
            parentReject,
            tryCount
          ) {
            tryCount++
            new Promise(function (resolve, reject) {
              var params = new FormData()
              params.append(option.fileName, chunkInfo.chunk);
              params.append('fileRealName', file.name);
              params.append('chunkNumber', index);
              params.append('chunkSize', chunkSize);
              params.append('totalChunks', chunkCount);
              params.append('identifier', fileMD5);
              params.append('token', option.formParam ? option.formParam.token : undefined);
              params.append('mobile', option.formParam ? option.formParam.mobile : undefined);
              $.ajax({
                url: option.chunkUploadUrl,
                type: "POST",
                data: params,
                async: true,
                processData: false,
                contentType: false,
                timeout: option.timeout,
                success: function (res) {
                  if (res.resultCode != option.okCode) {
                    reject(res.resultMsg)
                  } else {  //成功
                    resolve('子分片重传成功')
                  }
                },
                error: function (res) {
                  reject(res)
                }
              });
            })
              .then(function () {
                parentResolve(chunkInfo)
              })
              .catch(function (err) {
                console.log('子error----当前片重传尝试第' + tryCount + '次')
                if (tryCount == sliceCount) {
                  parentReject(err)
                } else {
                  rejectFn(chunkInfo, index, parentResolve, parentReject, tryCount)
                }
              })
          }

          
          function uploadStatus() { // 上传状态获取
            var params = new FormData()
            params.append('productCode', 0); // 空号
            params.append('fileName', file.name);
            params.append('chunks', chunkCount);
            params.append('md5', fileMD5);
            params.append('token', option.formParam ? option.formParam.token : undefined);
            params.append('mobile', option.formParam ? option.formParam.mobile : undefined);
            $.ajax({
              url: option.uploadStatusUrl,
              type: "POST",
              data: params,
              async: true,
              processData: false,
              contentType: false,
              timeout: option.timeout,
              success: function (res) {
                let timer
                if (res.resultCode == option.okCode) { // 成功
                  clearTimeout(timer)
                  successCb(res)
                } else if (res.resultCode == option.uploadingCode) {  // 正在上传中
                  timer = setTimeout(function () {
                    uploadStatus()
                  }, 3000)
                } else { // 失败
                  clearTimeout(timer)
                  errorCb(res)
                }
              },
              error: function (res) {
                errorCb(res)
              }
            });
          }

          readFileMD5() // 开始执行代码
        },
        _setUpStatus: function (opt, type) {
          var param = this._findEle(opt.index, opt.target);
          if (type == 1) {
            $(param.ele).find('.queue_check').attr('data-up', 3);
          } else {
            $(param.ele).find('.queue_check').attr('data-up', 4);
          }
        },
        _setStatus2: function (target) {
          var _this = this;
          allowFiles.forEach(function (item) {
            var qItem = _this._findEle(item, target);
            if (qItem.upStatus == '1') {
              $(qItem.statusDiv).find('.status').hide().end().find('.status2').show();
              $(qItem.ele).find('.easy_upload_upbtn').hide();
              $(qItem.ele).find('.queue_check').attr('data-up', 2);
            }
          });
        },
        _showProgress: function (index, target) {
          // debugger
          var _this = this;
          var param = this._findEle(index, target);
          $(param.ele).find('.easy_upload_upbtn').hide(400);
          $(param.statusDiv).find('.status').hide().end().find('.status3').show();
          // 对应每条的进度箭头
          var guang = param.guang;
          $(guang).show()
          // 上传对应关闭
          var upBar = param.upBar;
          var upPeacent = param.upPeacent;
          $(upPeacent).show();
          var percentBoundary = Math.floor(Math.random() * 10) + 0;
          showTimer = setInterval(function () {
            if (loadedPercent < 100) {
              if (!uploadCompleted && loadedPercent > percentBoundary) {
                increasePercent = 0;
              } else {
                increasePercent = 1;
              }
              loadedPercent += increasePercent;
              $(upPeacent).text(loadedPercent + '%');
              $(upBar).css("width", loadedPercent + "%");

            } else {
              $(upPeacent).text('100%');
              $(upPeacent).hide();
              $(upBar).css("width", "100%");
              $(guang).hide()

              // $(param.statusDiv).find('.status').hide().end().find('.status5').show();
              upFiniehed = true;
              allowNewPost = true;
              clearInterval(showTimer);
              if (postedNum < allowFiles.length) _this._uploadFile(target);
            }
          }, 1);
        },
        _showPieceUploadProgress: function (index, target, isComplete, isSuccess) {
          var param = this._findEle(index, target);
          var guang = param.guang; // 对应每条的进度箭头

          // 进度条相关节点
          var upBar = param.upBar;
          var upPeacent = param.upPeacent;

          if (isComplete) { // 完成
            if (isSuccess) { // 成功
              $(upPeacent).text('100%');
              $(upBar).css("width", "100%");
              upFiniehed = true;
              allowNewPost = true;
              if (postedNum < allowFiles.length) {
                this._uploadFile(target);
              }
            }

            $(upPeacent).hide();
            $(guang).hide();
          } else { // 初始化进度条
            $(param.ele).find('.easy_upload_upbtn').hide(400);
            $(param.statusDiv).find('.status').hide().end().find('.status3').show();

            $(guang).show()
            $(upPeacent).show();

            $(upPeacent).text('0%');
            $(upBar).css("width", "0%");
          }
        },
        _updateProgrePercent: function (index, target, newPercent) {
          var param = this._findEle(index, target);
          var upBar = param.upBar;
          var upPeacent = param.upPeacent;
          $(upPeacent).text(newPercent + '%');
          $(upBar).css("width", newPercent + "%");
        },
        _findEle: function (index, target) {
          var obj = {};
          obj.ele = $(target).find(`.easy_upload_queue_item[data-index=${index}]`);
          obj.upBar = $(obj.ele).find('.easy_upload_bar');
          obj.upPeacent = $(obj.ele).find('.easy_upload_percent');
          obj.statusDiv = $(obj.ele).find('.easy_upload_status');
          obj.upStatus = $(obj.ele).find('.queue_check').attr('data-up');
          obj.guang = $(obj.ele).find('.easy_upload_bar_guang')
          return obj;
        },
        _findItems: function (type, target) {
          var arr = [];
          if (type == 1) {
            // var icon = $(target).find('.easy_upload_queue_item');
            var icon = $(target).find('.queue_check_allow_true');
            /*var icon = $(target).find('.queue_check_allow_true[data-up="1"][data-checked="yes"]:visible');*/
          } else {
            var icon = $(target).find('.queue_check[data-up="1"][data-checked="yes"]:visible,.queue_check[data-up="2"][data-checked="yes"]:visible,.queue_check[data-up="4"][data-checked="yes"]:visible');
          }
          for (var i = 0; i < icon.length; i++) {
            // var indx = $(icon[i]).parent().parent().attr('data-index');
            var indx = $(icon[i]).attr('data-index');
            arr.push(indx);
          }
          return arr;
        },
        _deleFiles: function (arr, target) {

          var _this = this;
          function dele(item) {
            response.success.forEach(function (item1, index1) {
              if (item == item1.easyFileIndex) response.success.splice(index1, 1);
            });
            response.error.forEach(function (item2, index2) {
              if (item == item2.easyFileIndex) response.error.splice(index2, 1);
            });
          }
          function deleAllowFiles(itm) {
            allowFiles.forEach(function (item, index) {
              if (itm == item) allowFiles.splice(index, 1);
            });
          }
          arr.forEach(function (item) {

            $(target).find(`.easy_upload_queue_item[data-index=${item}]`).remove().find('.queue_check').hide();
            fileArr.splice(item, 1)
            sessionStorage.setItem('shengyu', $(".easy_upload_queue li").length)
            console.log($(".easy_upload_queue li").length)
            // fileArr.length
            if ($(".easy_upload_queue li").length == 0) {
              selectedFiles = {};
              $(".easy_upload_queue").html("");
              $(".notice-pop-up").hide();
              $(".fileInput").val('').attr('data-count', 0);  // 上传清空
              $(".msjTask").hide();
              $(".msjPopup").hide()
              return;
            }
            if (delete selectedFiles[item]) {
              // $(target).find('.easy_upload_queue_item').length
              if ($(".easy_upload_queue li").length <= 30) {
                $(".continueAdd").show(); // 隐藏掉添加文件
                $(".msjTask .waringTips").html('<span style="color:#4a568a;margin: 20px auto;width:300px;display: block;">' + '注：您已添加' + $(".easy_upload_queue li").length + '个文件，最多可再添加' + ((option.multiNum) - ($(".easy_upload_queue li").length)) + '个文件' + '</span>')
              } else {
                // $(".beyond-file-format-tip").stop().show();  //提示超出
                // setTimeout(function () {
                //   $(".beyond-file-format-tip").stop().hide();
                // }, 3000)
                // $(".continueAdd").hide(); // 隐藏掉添加文件
                // $(".msjTask .waringTips").html('<span style="color:#4a568a;margin: 20px auto;width: 540px;display: block;">' + '注：系统已自动选择前30个文件，如需检测其他文件，请删除列表中的文件后再添加。' + '</span>')
              }
            }


            // 重新渲染li的个数
            $(target).find('li').each(function (index1) {
              // console.log($(this)[0].dataset.index)
              // $(this)[0].dataset.index = index1;    //删除后，改变li的data-index  （改变id会报错）
              index = (index1 + 1) >= 10 ? (index1 + 1) : (' 0' + (index1 + 1))
              $(this)[0].firstChild.innerHTML = index;   //删除后，改变li的序号
              // console.log($(this)[0].firstChild.innerHTML)
            })


            // _this._renderFile(fileArr, target)
            if (option.multi) dele(item);
            var qItem = _this._findEle(item, target);
            if (qItem.upStatus == '2') deleAllowFiles(item);
          });
          option.deleteFunc && option.deleteFunc(response);
        },

        _handleFailed: function (param, tips) {

          // clearInterval(showTimer);
          // $(param.upBar).css("background-color", "red");
          $(param.statusDiv).find('.status').hide().end().find('.status4').html(tips)
          $(param.statusDiv).find('.status').hide().end().find('.status4').show();
        },
        // _handleChecked: function(param) {
        //   clearInterval(showTimer);
        //   $(param.statusDiv).find('.status').hide().end().find('.status6').show();
        // },
        _resetParam: function () {
          loadedPercent = 0;
          increasePercent = 1;
          showTimer = undefined;
          uploadCompleted = false;
        }
      };
      easyManager.init();
    });
  }
}(jQuery));
