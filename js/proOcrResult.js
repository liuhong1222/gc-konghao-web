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
        getApiInfo(function () {
            if (ip == "identOcr") {
                getPageByUserId(1, 10, 'idCardOcr')
            } else if (ip == "busin") {
                getPageByUserId(1, 10, 'businessLicenseOcr')
            } else if (ip == "bank") {
                getPageByUserId(1, 10, 'bankOcr')
            } else if (ip == "driver") {
                getPageByUserId(1, 10, 'driverOcr')
            }
        });

        if (ip == "identOcr") {
            getEcharts(mydate, 'idocrAccount'); //获取报表
        } else if (ip == "busin") {
            getEcharts(mydate, 'blocrAccount'); //获取报表
        } else if (ip == "bank") {
            getEcharts(mydate, 'bocrAccount'); //获取报表
        } else if (ip == "driver") {
            getEcharts(mydate, 'docrAccount'); //获取报表
        }
    });
    //根据参数，判断点击过来的是那页
    var urls = location.href;
    if (urls.indexOf("?") != -1) {
        var str = urls.substr(1);
        strs = str.split("&");
        strs[0].split("=")[1];
        var ip = strs[0].split("=")[1];
    }
    if (ip == "identOcr") {
        $("title").html("身份证OCR");
        // 点击充值
        $("#basic-rechargeBtn").on('click', function () {
            var storage = window.localStorage;
            storage.setItem("rechargeJump", 'identOcrReJump');
            window.location.href = './recharge.html';
        });
        //对接文档
        doc('idocrAccount')
        $(".fourOcrResult .fold-line .title").html('身份证OCR检测/月');
        // 余额的编辑
        accEdit('idocrAccount');
    } else if (ip == "busin") {
        $("title").html("营业执照OCR");
        // 点击充值
        $("#basic-rechargeBtn").on('click', function () {
            var storage = window.localStorage;
            storage.setItem("rechargeJump", 'businReJump');
            window.location.href = './recharge.html';
        });
        //对接文档
        doc('blocrAccount')
        $(".fourOcrResult .fold-line .title").html('营业执照OCR检测/月');
        // 余额的编辑
        accEdit('blocrAccount');
    } else if (ip == "bank") {
        $("title").html("银行卡OCR");
        // 点击充值
        $("#basic-rechargeBtn").on('click', function () {
            var storage = window.localStorage;
            storage.setItem("rechargeJump", 'bankReJump');
            window.location.href = './recharge.html';
        });
        //对接文档
        doc('bocrAccount');
        $(".fourOcrResult .fold-line .title").html('银行卡OCR检测/月');
        // 余额的编辑
        accEdit('bocrAccount');
    } else if (ip == "driver") {
        $("title").html("驾驶证OCR");
        // 点击充值
        $("#basic-rechargeBtn").on('click', function () {
            var storage = window.localStorage;
            storage.setItem("rechargeJump", 'driverReJump');
            window.location.href = './recharge.html';
        });
        //对接文档
        doc('docrAccount');
        $(".fourOcrResult .fold-line .title").html('驾驶证OCR检测/月');
        // 余额的编辑
        accEdit('docrAccount');
    }

    function accEdit(proname) {
        // 点击到余额在调用查看余额提醒
        $(".his-tabs ul.tabs li").click(function () {
            if ($(".accRemind").hasClass('active')) {
                getAccWarn(proname);//获取显示余额
            }
        });

        // 更新余额提醒
        $("#balSaveBtn").on('click', function () {
            var warningCount = $(".remindInp").val();  //预警值
            var informMobiles = $(".remindInp1").val();  //提醒的手机号
            updateAccRemind(proname, warningCount, informMobiles)
        })
    }
    // 获取当前余额
    getCount();
    function getCount() {
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
                if (ip == "identOcr") {
                    $("#basci-balance").html(res.resultObj.idocrAccount);
                } else if (ip == "busin") {
                    $("#basci-balance").html(res.resultObj.blocrAccount);
                } else if (ip == "bank") {
                    $("#basci-balance").html(res.resultObj.bocrAccount);
                } else if (ip == "driver") {
                    $("#basci-balance").html(res.resultObj.docrAccount);
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
    function getPageByUserId(currentPage, numPerPage, method) {
        $.ajax({
            url: url + '/feign/apiMobileTest/getOcrPageByCustomerId',
            method: 'post',
            dataType: 'json',
            data: {
                customerId: sessionStorage.getItem('customerIdMsj'),
                token: sessionStorage.getItem('token'),
                mobile: sessionStorage.getItem('id'),
                pageNo: currentPage || 1,
                pageSize: numPerPage || 10,
                method: method,
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
                        limit: numPerPage || 10,
                        layout: ['count', 'prev', 'page', 'next', 'skip'],
                        jump: function (obj, first) { //触发分页后的回调
                            if (!first) { //点击跳页触发函数自身，并传递当前页：obj.curr
                                // console.log(obj.curr)
                                getPageByUserId(obj.curr, obj.limit, method);
                            }
                        }
                    });
                });
                var html = "";
                for (var i = 0; i < res.resultObj.tlist.length; i++) {
                    html += ' <dl>'
                        + '<dd>' + res.resultObj.tlist[i].orderNo + '</dd>'
                        + '<dd>' + res.resultObj.tlist[i].resultCode + '</dd>'
                        + '<dd>' + res.resultObj.tlist[i].result + '</dd>'
                        + '<dd>' + timeToDate(res.resultObj.tlist[i].createTime) + '</dd>'
                        + '<dd>' + dateTrans(res.resultObj.tlist[i].createDate) + '</dd>'
                        + ' <dd>' + (res.resultObj.tlist[i].remark == null ? '' : res.resultObj.tlist[i].remark) + '</dd>'
                        + '</dl>'
                }
                $(".hisRecordList").html(html);
            } else {
                toast(res.resultMsg)
            }
        }).fail(function (err) {
            toast(err.resultMsg);
        })
    }

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
        if (ip == "identOcr") {
            getEcharts(lastMonth, 'idocrAccount'); //获取报表
        } else if (ip == "busin") {
            getEcharts(lastMonth, 'blocrAccount'); //获取报表
        } else if (ip == "bank") {
            getEcharts(lastMonth, 'bocrAccount'); //获取报表
        } else if (ip == "driver") {
            getEcharts(lastMonth, 'docrAccount'); //获取报表
        }
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
        if (ip == "identOcr") {
            getEcharts(lastMonth, 'idocrAccount'); //获取报表
        } else if (ip == "busin") {
            getEcharts(lastMonth, 'blocrAccount'); //获取报表
        } else if (ip == "bank") {
            getEcharts(lastMonth, 'bocrAccount'); //获取报表
        } else if (ip == "driver") {
            getEcharts(lastMonth, 'docrAccount'); //获取报表
        }
        $("#monthShow").html(lastMonth)
    })
    // ==================================================================================
    // 点击当月 获取当月信息
    $("#currMonth").on('click', function () {
        $("#monthShow").html(mydate);
        $("#nextMonth").hide();
        if (ip == "identOcr") {
            getEcharts(mydate, 'idocrAccount'); //获取报表
        } else if (ip == "busin") {
            getEcharts(mydate, 'blocrAccount'); //获取报表
        } else if (ip == "bank") {
            getEcharts(mydate, 'bocrAccount'); //获取报表
        } else if (ip == "driver") {
            getEcharts(mydate, 'docrAccount'); //获取报表
        }
    })
    // ==================================================================================
    $("#monthShow").html(mydate);
    // 使用刚指定的配置项和数据显示图表。
    // myChart.setOption(option);

    // 对接文档
    function doc(word) {
        $("#api-duibtn").on('click', function () {
            window.location.href = downUrl + 'word/' + word + '.zip';
        })

    }
})