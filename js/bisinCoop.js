

//  已经登录成功
isLogin(function () {
    loginHref();  //登录成功后，跳转对应的页面
    loginAccess();//登录成功，立即转入
});
getUserId(function () {
    idreadInfonum(); //获取未读消息个数
}); //api账号信息

$("#formSumit").on('click', function () {
    var nametip = checkComName();
    var passtip = checkContactName();
    var phonetip = checkPhone();
    // return nametip && passtip  && phonetip;
    if (nametip && passtip && phonetip) {
        // alert(333333)
        $.ajax({
            url: url + "/agent/agentApply",
            type: 'POST',
            dataType: 'json',
            data: {
                companyName: $("#comName").val(),
                person: $("#contactName").val(),
                phone: $("#userPhone").val(),
                mail: $("#email").val(),
                position: $("#work").val()
            },
            success: function (data) {
                if (data.resultCode === '000000') {
                    $("#comName").val('');
                    $("#contactName").val('');
                    $("#userPhone").val('');
                    $("#email").val('');
                    $("#work").val('');
                    $("#phoneErr").attr("class", "default");
                    $("#comNameErr").attr("class", "default");
                    $("#contactNameErr").attr("class", "default");
                    $("#phoneErr").html('请输入公司名称')
                    $("#comNameErr").html('请输入联系人')
                    $("#contactNameErr").html('请输入11位手机号码')
                    toast('提交成功！我们将于24小时内联系您。')
                } else {
                    toast('系统异常');
                }
            }
        });
    }
})


// 验证手机号
function checkPhone() {
    var userphone = document.getElementById('userPhone');
    var phonrErr = document.getElementById('phoneErr');
    var pattern = /^1[34578]\d{9}$/; //验证手机号正则表达式 
    if (userphone.value == "") {
        phonrErr.innerHTML = "手机号码不能为空!"
        phonrErr.className = "error"
        return false;
    }
    if (!pattern.test(userphone.value)) {
        phonrErr.innerHTML = "手机号码不合规范!"
        phonrErr.className = "error"
        return false;
    }
    else {
        phonrErr.innerHTML = "ok!"
        phonrErr.className = "success";
        return true;
    }
}


// 验证公司名称
function checkComName() {
    var comName = document.getElementById('comName');
    var comNameErr = document.getElementById('comNameErr');
    if (comName.value == "") {
        comNameErr.innerHTML = "公司名称不能为空!"
        comNameErr.className = "error"
        return false;
    } else {
        comNameErr.innerHTML = "ok!"
        comNameErr.className = "success";
        return true;
    }
}


// 验证联系人
function checkContactName() {
    var contactName = document.getElementById('contactName');
    var contactNameErr = document.getElementById('contactNameErr');
    if (contactName.value == "") {
        contactNameErr.innerHTML = "联系人不能为空!"
        contactNameErr.className = "error"
        return false;
    } else {
        contactNameErr.innerHTML = "ok!"
        contactNameErr.className = "success";
        return true;
    }
}


// 点击我要代理
$('#ready-agent').click(function () { $('html,body').animate({ scrollTop: $('.Contact-us').offset().top }, 500); });
