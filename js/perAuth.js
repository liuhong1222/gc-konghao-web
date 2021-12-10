$(function () {
    //  已经登录成功
    isLogin(function () {
        $(".identImg .file").show();  //登录成功后，才可以点击上传图片
        loginHref();  //登录成功后，跳转对应的页面
    });
    var userid = "";
    getUserId(function () {
        userid = userId;
        idreadInfonum(); //获取未读消息个数
        imageBtn();  //点击图片
        $(".errorRelCon").html(errorRel)
        // if (ip == 'perAuth') {
        //     alert('个人认证')
        //     if (userType == 0) {
        //         $(".auth-Details").addClass('authShow');
        //         $(".enterprise-Detailsa").removeClass('authShow');
        //         $("#showName").html('个人认证')
        //         isAuthMsj(isAuth); //判断当前处于那种状态
        //     } else {
        //         $(".enterprise-Detailsa").addClass('authShow');//企业的整体
        //         $(".auth-Details").removeClass('authShow');
        //         $("#showName").html('企业认证')
        //         isAuthMsj(isAuth); //判断当前处于那种状态
        //     }

        // } else if (ip == "priseAuth") {
        //     alert('企业认证')
        //     if (userType == 1) {
        //         $(".enterprise-Detailsa").addClass('authShow');//企业的整体
        //         $(".auth-Details").removeClass('authShow');
        //         $("#showName").html('企业认证')
        //         isAuthMsj(isAuth); //判断当前处于那种状态
        //     } else {
        //         $(".auth-Details").addClass('authShow');
        //         $(".enterprise-Detailsa").removeClass('authShow');
        //         $("#showName").html('个人认证')
        //         isAuthMsj(isAuth); //判断当前处于那种状态
        //     }
        // }

        if (userType == 1) {
            if (sessionStorage.getItem('t') == 1) {
                $(".auth-Details").addClass('authShow');
                $(".enterprise-Detailsa").removeClass('authShow');
                $("#showName").html('个人认证')
                isAuthMsj(isAuth); //判断当前处于那种状态
            } else {
                $(".enterprise-Detailsa").addClass('authShow');//企业的整体
                $(".auth-Details").removeClass('authShow');
                $("#showName").html('企业认证')
                isAuthMsj(isAuth); //判断当前处于那种状态
            }
        } else if (userType == 0) {
            if (sessionStorage.getItem('t') == 1) {
                $(".enterprise-Detailsa").addClass('authShow');//企业的整体
                $(".auth-Details").removeClass('authShow');
                $("#showName").html('企业认证')
                isAuthMsj(isAuth); //判断当前处于那种状态
            } else {
                $(".auth-Details").addClass('authShow');
                $(".enterprise-Detailsa").removeClass('authShow');
                $("#showName").html('个人认证')
                isAuthMsj(isAuth); //判断当前处于那种状态
            }
        } else {
            if (sessionStorage.getItem('auth') == 'priseAuth') {
                $(".enterprise-Detailsa").addClass('authShow');//企业的整体
                $(".auth-Details").removeClass('authShow');
                $("#showName").html('企业认证')
                isAuthMsj(isAuth); //判断当前处于那种状态
                // sessionStorage.setItem('auth', '') 
            } else if (sessionStorage.getItem('auth') == 'perAuth') {
                $(".auth-Details").addClass('authShow');
                $(".enterprise-Detailsa").removeClass('authShow');
                $("#showName").html('个人认证')
                isAuthMsj(isAuth); //判断当前处于那种状态
                // sessionStorage.setItem('auth', '')
            }
        }
    })
    // 判断用户需要认证的是哪个
    var urls = location.href;
    if (urls.indexOf("?") != -1) {
        var str = urls.substr(1);
        strs = str.split("&");
        strs[0].split("=")[1];
        ip = strs[0].split("=")[1];
    }

    // 判断当前处于那种状态
    function isAuthMsj(isAuth) {
        if (isAuth == 0 || isAuth == null || isAuth == "") { //未认证
            $(".progress-bar span").removeClass('active')
            $(".subAuth").addClass('active');
            $(".subAuthCon").show();
        } else if (isAuth == 1) { //已提交审核
            $(".progress-bar span").removeClass('active')
            $(".waitAUth").addClass('active');
            $(".waitAuthNotice").show();
        } else if (isAuth == 2) { //审核驳回
            $(".progress-bar span").removeClass('active')
            $(".authOk").hide();
            $(".authError").addClass('active');
            $(".authError").show();
            $(".authErrorCon").show();
            $(".reAuthBtn").off().on('click', function () {  //转认证
                $(".progress-bar span").removeClass('active');
                $(".enterprise-bar span").removeClass('active')
                $(".subAuth").addClass('active');
                $(".authErrorCon").hide();
                $(".subAuthCon").show();
            })
        } else if (isAuth == 3) {  //已认证

            if (sessionStorage.getItem('t') == 1) {
                $(".progress-bar span").removeClass('active')
                $(".subAuth").addClass('active');
                $(".subAuthCon").show();
                sessionStorage.setItem('t', '0')
                // alert(333333)
            } else {
                // alert(44444)
                $(".progress-bar span").removeClass('active')
                $(".authOk").addClass('active');
                $(".authOk-Con").show();
                if (userType == 0) {   //个人
                    $(".progress-bar").hide();
                    authTrue(userType, userId);
                    // 点击相互转换
                    $(".transPre").off().on('click', function () {
                        // auth(1);
                        sessionStorage.setItem('t', '1')
                        location.href = "./perAuth.html";
                    })
                } else if (userType == 1) {   //企业
                    $(".enterprise-bar").hide();
                    authTrue(userType, userId);
                    // 点击相互转换
                    $(".transPre").off().on('click', function () {
                        // auth(0);
                        sessionStorage.setItem('t', '1')
                        location.href = "./perAuth.html";
                    })
                }
            }
        }
    }
    // 认证完成
    function authTrue(userType, userId) {
        $.ajax({
            url: url + '/user/getUserAuthInfo',
            dataType: 'json',
            data: {
                token: sessionStorage.getItem('token'),
                mobile: sessionStorage.getItem('id'),
                userType: userType,
                userId: userId
            }
        }).done(function (res) {
            if (res.resultCode == "000000") {
                if (res.resultObj != null) {
                    if (userType == 0) {  //个人
                        $("#userNameTrue").val(res.resultObj.username);
                        $("#idnoTrue").val(res.resultObj.idno);
                        $("#perAddressTrue").val(res.resultObj.address);
                        $("#effectTrue").val(res.resultObj.effectDate);
                        $("#expriseTrue").val(res.resultObj.expireDate);
                    } else if (userType == 1) {  //企业
                        $("#comTrue").val(res.resultObj.name);
                        $("#idcorTrue").val(res.resultObj.regnum);
                        $("#comAddressTrue").val(res.resultObj.address);
                        $("#legalPerTrue").val(res.resultObj.person);
                        $("#priseEffTrue").val(res.resultObj.effectDate);
                        $("#prisepisTrue").val(res.resultObj.expireDate);
                        $("#businTrue").val(res.resultObj.business);
                    }
                    // toast(res.resultMsg)
                }
            } else {
                $("#userNameTrue").val('');
                $("#idnoTrue").val('');
                $("#perAddressTrue").val('');
                $("#effectTrue").val('');
                $("#expriseTrue").val('');
                $("#comTrue").val('');
                $("#idcorTrue").val('');
                $("#comAddressTrue").val('');
                $("#legalPerTrue").val('');
                $("#priseEffTrue").val('');
                $("#prisepisTrue").val('');
                $("#businTrue").val('');
            }

        }).fail(function (res) {
            $("#userNameTrue").val('');
            $("#idnoTrue").val('');
            $("#perAddressTrue").val('');
            $("#effectTrue").val('');
            $("#expriseTrue").val('');
            $("#comTrue").val('');
            $("#idcorTrue").val('');
            $("#comAddressTrue").val('');
            $("#legalPerTrue").val('');
            $("#priseEffTrue").val('');
            $("#prisepisTrue").val('');
            $("#businTrue").val('');

            toast(res.resultMsg);
        });
    }
    // 表单验证 当点击提交认证的时候，如果为空，就提示，请完善信息，边框标称红色，否则，变成绿色，隐藏边框和提示语
    // 企业验证input
    var inp = $(".perAuth-info .enterprise-Detailsa .subAuthCon  form ul li input[type='text']");
    $(".enterprise-Detailsa .submitBtn").on('click', function () {
        for (var i = 0; i < inp.length; i++) {
            if (inp[i].value == "") {
                // console.log(inp[i])
                inp[i].className = "inpRed";
                // console.log(inp[i].nextSibling.nextSibling)
                inp[i].nextSibling.nextSibling.className = "tipsShow";
                return false;
            }
        }
        // subUserAuth();
        subUserAuthByBusiness()
    })

    // 企业认证 实时监听input
    $('.perAuth-info .enterprise-Detailsa').bind('input propertychange', function () {
        for (var i = 0; i < inp.length; i++) {
            if (inp[i].value != "") {
                // console.log(inp[i])
                inp[i].className = "inpGreen";
                // console.log(inp[i].nextSibling.nextSibling)
                if (inp[i].nextSibling.nextSibling.className == 'tipsShow') {
                    inp[i].nextSibling.nextSibling.remove("tipsShow")
                }
            }
        }
    });


    // 个人认证input
    var personinp = $(".perAuth-info .auth-Details .subAuthCon  form ul li input[type='text']");
    $(".auth-Details .submitBtn").on('click', function () {
        // alert(333)
        for (var i = 0; i < personinp.length; i++) {
            if (personinp[i].value == "") {
                // console.log(inp[i])
                personinp[i].className = "inpRed";
                // console.log(inp[i].nextSibling.nextSibling)
                personinp[i].nextSibling.nextSibling.className = "tipsShow";
                return false;
            }
        }
        subUserAuthByIdCard();
    });
    // 说明认证处于等待审核
    //提交个人
    function subUserAuthByIdCard() {
        // alert('提交个人')
        $.ajax({
            url: url + '/user/subUserAuthByIdCard',
            method: "POST",
            cache: false, //上传文件无需缓存
            dataType: 'json',
            data: {
                mobile: sessionStorage.getItem('id'),
                token: sessionStorage.getItem('token'),
                userId: userid,
                username: $("#perName").val(),
                address: $("#address").val(),
                idno: $("#idno").val(),
                effectDate: $("#effectDate").val(),
                expireDate: $("#expireDate").val()
            },
        }).done(function (res) {
            if (res.resultCode == '000000') {
                $(".subAuth").removeClass('active');
                $(".waitAUth").addClass('active');
                $(".subAuthCon").hide();
                $(".waitAuthNotice").show();
                //清空文本框
                $("form li input[type='text']").val("");
                // 按钮处于禁用按钮
                $(".submitBtn").attr("disabled", "disabled");
                $(".submitBtn").css("backgroundColor", '#ccc');
                sessionStorage.setItem('t', '0')
            } else {
                toast(res.resultMsg);
            }
        }).fail(function (res) {
            toast(err.resultMsg);
        })
    }

    // 提交企业
    function subUserAuthByBusiness() {
        // alert('提交企业')
        $.ajax({
            url: url + '/user/subUserAuthByBusiness',
            method: "POST",
            cache: false, //上传文件无需缓存
            dataType: 'json',
            data: {
                mobile: sessionStorage.getItem('id'),
                token: sessionStorage.getItem('token'),
                userId: userid,
                name: $("#name").val(),
                regnum: $("#regnum").val(),
                address: $("#prise-address").val(),
                person: $("#person").val(),
                effectDate: $("#certif-effectDate").val(),
                expireDate: $("#certif-expireDate").val(),
                business: $("#business").val()
            },
        }).done(function (res) {
            if (res.resultCode == '000000') {
                $(".subAuth").removeClass('active');
                $(".waitAUth").addClass('active');
                $(".subAuthCon").hide();
                $(".waitAuthNotice").show();
                //清空文本框
                $("form li input[type='text']").val("");
                // 按钮处于禁用按钮
                $(".submitBtn").attr("disabled", "disabled");
                $(".submitBtn").css("backgroundColor", '#ccc');
                sessionStorage.setItem('t', '0')
            } else {
                toast(res.resultMsg);
            }
        }).fail(function (res) {
            toast(err.resultMsg);
        })
    }

    // ===============================================================
    function imageBtn() {
        $(".identImg").on("change", "input[type=file]", function () {
            // console.log($(this).parent().data('flag'));
            $(this).prev().css("opacity", "1");
            var filePath = $(this).val();//读取图片路径 
            var fr = new FileReader();//创建new FileReader()对象  
            var formData = new FormData();
            var imgObj = this.files[0];//获取图片 
            var imgUrl = $("#file").val();
            // console.log(imgObj)
            // console.log(imgUrl)
            formData.append("file", imgObj);
            formData.append("name", imgUrl);
            fr.readAsDataURL(imgObj);//将图片读取为DataURL  
            var obj = $(this).prev()[0];// 
            if (imgObj.size > 1024 * 1024) {
                toast("文件大于1M， 太大了，小点吧！");
                return;
            }
            if (filePath.indexOf("jpg") != -1 || filePath.indexOf("JPG") != -1 || filePath.indexOf("PNG") != -1 || filePath.indexOf("png") != -1) {
                var arr = filePath.split('\\');
                var fileName = arr[arr.length - 1];
                fr.onload = function () {
                    obj.src = this.result;
                };
                if ($(this).parent().data('flag') == "positive") {  //正面
                    // alert('正面')
                    getIdentInfo(formData, userId);
                } else if ($(this).parent().data('flag') == "otherSide") {  //反面
                    // alert('反面')
                    getOtherInfo(formData, userId);
                } else if ($(this).parent().data('flag') == "enterprise") {  //营业执照
                    // alert('营业执照');
                    getenterprise(formData, userId);
                }

                //     //上传图片
                //     getIdentInfo(formData);

            } else {
                toast("您未上传文件，或者您上传文件类型有误！");
                return false;
            }
        });
    }

    //上传身份证正面
    function getIdentInfo(formData, userId) {
        var mobile = sessionStorage.getItem('id');
        var token = sessionStorage.getItem('token');
        var apiName = sessionStorage.getItem('customerIdMsj');
        var userId = userId;
        var pictureType = 'authIdFace';
        $.ajax({
            url: url + '/file/authPictureUpload?mobile=' + mobile + '&token=' + token + '&apiName=' + apiName + '&userId=' + userId + '&pictureType=' + pictureType,
            method: "POST",
            cache: false,			//上传文件无需缓存
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function () {  //请求成功之前，加载动画显示
                // $(".hisRecordList").html("");   //清空页面
                $(".spinner").show();
                $("#mask").show();
            }
        }).done(function (res) {
            if (res.resultCode == '000000') {
                $(".spinner").hide();
                $("#mask").hide();
                $("#perName").val(res.resultObj.username);
                $("#idno").val(res.resultObj.idno);
                $("#address").val(res.resultObj.address);
                // 身份证框获取到值得时候，四四分割
                // var idValue = $(".identity-code input").val();
                // $(".identity-code input").val(idValue.replace(/\s/g, '').replace(/[^\d]/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))
                for (var i = 0; i < personinp.length; i++) {
                    if (personinp[i].value != "") {
                        // console.log(inp[i])
                        personinp[i].className = "inpGreen";
                        // console.log(inp[i].nextSibling.nextSibling)
                        if (personinp[i].nextSibling && personinp[i].nextSibling.nextSibling && personinp[i].nextSibling.nextSibling.className == 'tipsShow') {
                            personinp[i].nextSibling.nextSibling.remove("tipsShow");
                        }
                    }
                }
            } else {
                $("#perName").val('');
                $("#idno").val('');
                $("#address").val('');

                toast(res.resultMsg);
                $(".spinner").hide();
                $("#mask").hide();
            }
        }).fail(function (err) {
            $("#perName").val('');
            $("#idno").val('');
            $("#address").val('');

            toast(err.resultMsg);
            $(".spinner").hide();
            $("#mask").hide();
        })
    }

    // 上传反面
    function getOtherInfo(formData, userId) {
        var mobile = sessionStorage.getItem('id');
        var token = sessionStorage.getItem('token');
        var apiName = sessionStorage.getItem('customerIdMsj');
        var userId = userId;
        var pictureType = 'authIdBack';
        $.ajax({
            url: url + '/file/authPictureUpload?mobile=' + mobile + '&token=' + token + '&apiName=' + apiName + '&userId=' + userId + '&pictureType=' + pictureType,
            method: "POST",
            cache: false,			//上传文件无需缓存
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function () {  //请求成功之前，加载动画显示
                // $(".hisRecordList").html("");   //清空页面
                $(".spinner").show();
                $("#mask").show();
            }
        }).done(function (res) {
            if (res.resultCode == '000000') {
                $(".spinner").hide();
                $("#mask").hide();
                $("#effectDate").val(res.resultObj.effectDate);
                $("#expireDate").val(res.resultObj.expireDate);
                for (var i = 0; i < personinp.length; i++) {
                    if (personinp[i].value != "") {
                        // console.log(inp[i])
                        personinp[i].className = "inpGreen";
                        // console.log(inp[i].nextSibling.nextSibling)
                        if (personinp[i].nextSibling && personinp[i].nextSibling.nextSibling && personinp[i].nextSibling.nextSibling.className == 'tipsShow') {
                            personinp[i].nextSibling.nextSibling.remove("tipsShow");
                        }
                    }
                }
            } else {
                $("#effectDate").val('');
                $("#expireDate").val('');

                toast(res.resultMsg);
                $(".spinner").hide();
                $("#mask").hide();
            }
        }).fail(function (err) {
            $("#effectDate").val('');
            $("#expireDate").val('');

            toast(err.resultMsg);
            $(".spinner").hide();
            $("#mask").hide();
        })
    }
    //==========================================================

    // 上传营业执照
    function getenterprise(formData, userId) {
        var mobile = sessionStorage.getItem('id');
        var token = sessionStorage.getItem('token');
        var apiName = sessionStorage.getItem('customerIdMsj');
        var userId = userId;
        var pictureType = 'authBusiLiven';
        $.ajax({
            url: url + '/file/authPictureUpload?mobile=' + mobile + '&token=' + token + '&apiName=' + apiName + '&userId=' + userId + '&pictureType=' + pictureType,
            method: "POST",
            cache: false,			//上传文件无需缓存
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function () {  //请求成功之前，加载动画显示
                // $(".hisRecordList").html("");   //清空页面
                $(".spinner").show();
                $("#mask").show();
            }
        }).done(function (res) {
            if (res.resultCode == '000000') {
                $(".spinner").hide();
                $("#mask").hide();
                $("#name").val(res.resultObj.name);
                $("#regnum").val(res.resultObj.regnum);
                $("#prise-address").val(res.resultObj.address);
                $("#person").val(res.resultObj.person);
                $("#certif-effectDate").val(res.resultObj.effectDate);
                $("#certif-expireDate").val(res.resultObj.expireDate);
                $("#business").val(res.resultObj.business);
                for (var i = 0; i < inp.length; i++) {
                    if (inp[i].value != "") {
                        // console.log(inp[i])
                        inp[i].className = "inpGreen";
                        // console.log(inp[i].nextSibling.nextSibling)
                        if (inp[i].nextSibling && inp[i].nextSibling.nextSibling && inp[i].nextSibling.nextSibling.className == 'tipsShow') {
                            inp[i].nextSibling.nextSibling.remove("tipsShow")
                        }
                    }
                }
            } else {
                $("#name").val('');
                $("#regnum").val('');
                $("#prise-address").val('');
                $("#person").val('');
                $("#certif-effectDate").val('');
                $("#certif-expireDate").val('');
                $("#business").val('');

                toast(res.resultMsg);
                $(".spinner").hide();
                $("#mask").hide();
            }
        }).fail(function (err) {
            $("#name").val('');
            $("#regnum").val('');
            $("#prise-address").val('');
            $("#person").val('');
            $("#certif-effectDate").val('');
            $("#certif-expireDate").val('');
            $("#business").val('');

            toast(err.resultMsg);
            $(".spinner").hide();
            $("#mask").hide();
        })
    }



})
