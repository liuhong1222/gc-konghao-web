$(function () {
    //  已经登录成功
    isLogin(function () {
        loginHref();  //登录成功后，跳转对应的页面
    });
    getUserId(function () {
        idreadInfonum(); //获取未读消息个数
        getApiInfo(function () {
            getPageByUserId();
        });
        
        getEcharts(mydate, 'idCardAuth'); //获取报表
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
                $("#basci-balance ").html(res.resultObj.tcAccount);
            } else {
                toast(res.resultMsg);
                $("basci-balance").html('0');
            }
        }).fail(function (err) {
            toast('请求超时');
            $("#basci-balance").html('0');
        })
    }

    //获取检测列表
    function getPageByUserId(currentPage) {
        $.ajax({
            url: url + '/feign/apiMobileTest/getPageByCustomerId',
            method: 'post',
            dataType: 'json',
            data: {
                customerId: sessionStorage.getItem('customerIdMsj'),
                method: 'idCardAuth',
                token: sessionStorage.getItem('token'),
                mobile: sessionStorage.getItem('id'),
                pageNo: currentPage || 1,
                pageSize: 10,
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
                    html += ' <dl>'
                        + '<dd>' + res.resultObj.tlist[i].name + '</dd>'
                        + '<dd>' + res.resultObj.tlist[i].idtype + '</dd>'
                        + '<dd>' + res.resultObj.tlist[i].idnum + '</dd>'
                        + '<dd>' + res.resultObj.tlist[i].result + '</dd>'
                        + '<dd>' + res.resultObj.tlist[i].resultDesc + '</dd>'
                        + ' <dd>' + timeToDate(res.resultObj.tlist[i].createTime) + '</dd>'
                        + '</dl>'
                }
                $(".hisRecordList").html(html);
            } else {
                toast(res.resultMsg);
            }
        }).fail(function (err) {
            toast(err.resultMsg);
        })
    }
    // 点击测试
    function text() {
        var result = JSON.stringify({
            token: sessionStorage.getItem('token'),
            userPhone: sessionStorage.getItem('id'),
            apiName: sessionStorage.getItem('customerIdMsj'),
            password: sessionStorage.getItem('customerpwd'),
            idno: $("#idno").val(),
            userName: $("#userName").val()
        })
        $.ajax({
            url: url + '/apiInvokingTest/idCardAuth',
            method: 'post',
            dataType: 'json',
            data: result,
            contentType: "application/json",
        }).done(function (res) {
            if (res.resultCode == '000000') {
                // json格式化
                var mes = JSON.stringify(res, null, 4);
                // 将换行符和空格进行转义
                var html = mes.replace(/\n/g, '<br>').replace(/\s/g, '&nbsp');
                // console.log(mes)
                $(".res-con").html(html);
            } else {
                toast(res.resultMsg)
            }
        }).fail(function (err) {
            toast(err.resultMsg)
        })
    }
    $("#identText").unbind('click')
    $("#identText").on('click', function (event) {
        if ($("#idno").val() == "" || $("#userName").val() == "") {
            toast('请完善信息!');
            return
        }
        text();
        event.stopPropagation();
    });

    // 余额提醒
    // 点击到余额在调用查看余额提醒
    $(".his-tabs ul.tabs li").click(function () {
        if ($(".accRemind").hasClass('active')) {
            getAccWarn('idCardAuth');//获取显示余额
        }
    });
    // 更新余额提醒
    $("#balSaveBtn").on('click', function () {
        var warningCount = $(".remindInp").val();  //预警值
        var informMobiles = $(".remindInp1").val();  //提醒的手机号
        updateAccRemind('idCardAuth', warningCount, informMobiles)
    })

    // 在线测试
    function eleTest() {
        var result = JSON.stringify({
            token: sessionStorage.getItem('token'),
            userPhone: sessionStorage.getItem('id'),
            apiName: sessionStorage.getItem('customerIdMsj'),
            password: sessionStorage.getItem('customerpwd'),
            idno: $("#idno").val(),
            userName: $("#userName").val()
        })
        $.ajax({
            url: url + '/apiInvokingTest/idCardAuth',
            method: 'post',
            dataType: 'json',
            data: result,
            contentType: "application/json",
        }).done(function (res) {
            if (res.resultCode == '000000') {
                // json格式化
                var mes = JSON.stringify(res, null, 4);
                // 将换行符和空格进行转义
                var html = mes.replace(/\n/g, '<br>').replace(/\s/g, '&nbsp');
                // console.log(mes)
                $(".res-con").html(html);
            } else {
                toast(res.resultMsg)
            }
        }).fail(function (err) {
            toast(err.resultMsg)
        })
    }

    $("#identTest").off().on('click', function (event) {
        if ($("#userName").val() == "" || $("#idno").val() == "" || $("3mobile").val() == "") {
            toast('请完善信息!');
            return;
        }
        eleTest();
        return false;
    });


    // 折线图
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

        getEcharts(lastMonth, 'idCardAuth'); //获取报表

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
        getEcharts(lastMonth, 'idCardAuth'); //获取报表
        $("#monthShow").html(lastMonth)
    })
    // ==================================================================================
    // 点击当月 获取当月信息
    $("#currMonth").on('click', function () {
        $("#monthShow").html(mydate);
        $("#nextMonth").hide();
        getEcharts(mydate, 'idCardAuth'); //获取报表

    })
    // ==================================================================================
    $("#monthShow").html(mydate);
    // 使用刚指定的配置项和数据显示图表。
    // myChart.setOption(option);

    // 点击充值 页面跳转
    $("#basic-rechargeBtn").on('click', function () {
        var storage = window.localStorage;
        storage.setItem("rechargeJump", 'identVerReJump');
        window.location.href = './recharge.html';
    });
    // 下载文档
    $("#api-duibtn").on('click', function () {
        window.location.href = downUrl + 'word/tcAcount.zip';
    });
})