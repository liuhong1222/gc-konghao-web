
$(function () {
    var timer = null;
    var bannerIndex = 0;
    var date = new Date;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var date = date.getDate();
    month = (month < 10 ? "0" + month : month);
    date = (date < 10 ? "0" + date : date);

    var mydate = (year.toString() + '-' + month.toString());
    var mydatelay = (year.toString() + '-' + month.toString() + '-' + date.toString());

    //  已经登录成功
    isLogin(function () {
        $(".fistNav a").attr('href', './empty.html');  //登录成功后，首页调转到检测的首页
        loginAccess();//登录成功，立即转入
    })
    getUserId(function () {
        idreadInfonum(); //获取未读消息个数
        getajax();
        // 根据存储值，判读是否设置了密码
        if (isSetPwd == "1") {  //设置了
            $(".downBtnFlag").hide()
        } else if (isSetPwd == "0") {
            $(".downBtnFlag").show()
        };
        getRecordList(userId, mydate);  //折线图
        getMonthTime(userId, mydate)
    })

    // 全屏轮播图
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        paginationClickable: true,
        spaceBetween: 0,
        centeredSlides: true,
        effect: 'fade',  //渐变效果
        autoplay: 3000,
        autoplayDisableOnInteraction: false

    });

    // 弹出层鼠标滑过离开效果
    $(".result-box ul li").on('mouseenter', function () {
        $(this).children(".box").show();
    });

    $(".result-box ul li").on('mouseleave', function () {
        $(this).children(".box").hide();
    });
    // 清空选中
    function clearSelect() {
        $(".singleCheck").each(function (index, val) {
            $(val).prop('checked', false);
        });
        $("#checkAll").prop('checked', false);
    }
    //用jquery-3.2.1.min.js 否则post会被转换为get
    function getajax(currentPage, numPerPage, startDate, endDate) {
        $.ajax({
            url: url + '/credit/getPageByMobile',
            method: 'post',
            dataType: 'json',
            async: false,
            data: {
                userId: userId,
                mobile: sessionStorage.getItem('id'),
                token: sessionStorage.getItem('token'),
                pageNo: currentPage || 1,
                pageSize: numPerPage || 10,
                startDate: startDate ? startDate : '',
                endDate: endDate ? endDate : ''
            },
            beforeSend: function () {  //请求成功之前，加载动画显示
                $(".spinner").show();
            }
        }).done(function (res) {
            if (res.resultObj.tlist == null) {
                $(".hisRecordList").html('<p style="text-align:center;margin:20px auto;color:#C0C3CC;font-size: 14px;">' + '暂无数据' + '</p>');
                $("#page").hide();
                $(".opert").hide();
                $(".exportExcel").hide();
                $(".spinner").hide();
                clearSelect();
                $("#threePackage").html(0); //实号包
                $("#sixPackage").html(0); //空号包
                $("#nullPackage").html(0); //沉默包
                $("#shutDownPage").html(0); //关机包
                // ======================================================================================
                $("#threePackageMb").html(0);
                $("#sixPackageMb").html(0);
                $("#nullPackageMb").html(0);
                $("#shutDownPageMb").html(0);
                $(".result-box").hide();
                $(".download-box").hide();
                return;
            }
            // 点击下载实号包
            $("#downThree").on('click', function () {
                if (res.resultCode == '000000') {
                    if (res.resultObj.tlist.length > 0 && res.resultObj.tlist[0].thereFilePath != null) {
                        window.location.href = downUrl + res.resultObj.tlist[0].thereFilePath;
                    } else {
                        toast('实号包不存在，所以无法下载')
                    }
                } else {
                    toast(res.resultMsg)
                }
            });
            // 点击下载空号包
            $("#downSix").on('click', function () {
                if (res.resultCode == '000000') {
                    if (res.resultObj.tlist.length > 0 && res.resultObj.tlist[0].sixFilePath != null) {
                        window.location.href = downUrl + res.resultObj.tlist[0].sixFilePath;
                    } else {
                        toast('空号包不存在，所以无法下载')
                    }
                } else {
                    toast(res.resultMsg);
                }
            });
            // 点击下载沉默包
            $("#downNull").on('click', function () {
                if (res.resultCode == '000000') {
                    if (res.resultObj.tlist.length > 0 && res.resultObj.tlist[0].unknownFilePath != null) {
                        window.location.href = downUrl + res.resultObj.tlist[0].unknownFilePath;
                    } else {
                        toast('空号包不存在，所以无法下载')
                    }
                } else {
                    toast(res.resultMsg)
                }
            });
            //点击下载风险包
            $("#shutDown").on('click', function () {
                if (res.resultCode == '000000') {
                    if (res.resultObj.tlist.length > 0 && res.resultObj.tlist[0].shutFilePath != null) {
                        window.location.href = downUrl + res.resultObj.tlist[0].shutFilePath;
                    } else {
                        toast('空号包不存在，所以无法下载')
                    }
                } else {
                    toast(res.resultMsg)
                }
            });
            //   下载所有
            $("#downAll").on('click', function () {
                if (res.resultCode == '000000') {
                    if (res.resultObj.tlist.length > 0) {
                        window.location.href = downUrl + res.resultObj.tlist[0].zipPath;
                    } else {
                        toast('暂无数据')
                    }
                } else {
                    toast(res.resultMsg)
                }
            });
            if (res.resultCode == "000000") {
                clearSelect()
                $("#page").show();
                $(".opert").show();
                $(".exportExcel").show();
                $(".spinner").hide();
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
                                getajax(obj.curr, obj.limit, startDate, endDate);
                            }
                        }
                    });
                });
                var html = '';
                // 显示结果包大小和数量
                if (res.resultObj.tlist != null) { //改动了
                    $("#threePackage").html(res.resultObj.tlist[0].thereCount ? res.resultObj.tlist[0].thereCount : '0'); //实号包
                    $("#sixPackage").html(res.resultObj.tlist[0].sixCount ? res.resultObj.tlist[0].sixCount : '0'); //空号包
                    $("#nullPackage").html(res.resultObj.tlist[0].unknownSize ? res.resultObj.tlist[0].unknownSize : '0'); //沉默包
                    $("#shutDownPage").html(res.resultObj.tlist[0].shutCount ? res.resultObj.tlist[0].shutCount : '0'); //关机包
                    // ======================================================================================

                    $("#threePackageMb").html(res.resultObj.tlist[0].thereFileSize ? res.resultObj.tlist[0].thereFileSize : '0M');
                    $("#sixPackageMb").html(res.resultObj.tlist[0].sixFileSize ? res.resultObj.tlist[0].sixFileSize : '0M');
                    $("#nullPackageMb").html(res.resultObj.tlist[0].unknownFileSize ? res.resultObj.tlist[0].unknownFileSize : '0M');
                    $("#shutDownPageMb").html(res.resultObj.tlist[0].shutFileSize ? res.resultObj.tlist[0].shutFileSize : '0M');
                    $(".result-box").show();
                    $(".download-box").show();
                }

                // 列表渲染
                for (var i = 0; i < res.resultObj.tlist.length; i++) {
                    var realNum = Number(res.resultObj.tlist[i].thereCount) ? Number(res.resultObj.tlist[i].thereCount) : 0; //实号
                    var silent = Number(res.resultObj.tlist[i].unknownSize) ? Number(res.resultObj.tlist[i].unknownSize) : 0;//沉默
                    var nullNum = Number(res.resultObj.tlist[i].sixCount) ? Number(res.resultObj.tlist[i].sixCount) : 0;  //空号
                    var shutNum = Number(res.resultObj.tlist[i].shutCount) ? Number(res.resultObj.tlist[i].shutCount) : 0;//关机

                    html += '<dl class="clearfix">'
                        + '<dd  class="checkClass">' +
                        '<input class="singleCheck checkbox" id="singlesCheck' + res.resultObj.tlist[i].id + '" type="checkbox" style="display:none"  data-id="' + res.resultObj.tlist[i].id + '">' +
                        '<label for="singlesCheck' + res.resultObj.tlist[i].id + '">' +
                        '</label>' +
                        '</dd>'
                        + '<dd class="zipImg" title="' + res.resultObj.tlist[i].zipName + '">' + res.resultObj.tlist[i].zipName + '</dd>'
                        + ' <dd >' + res.resultObj.tlist[i].zipSize + '</dd>'
                        + '<dd >' + timeToDate(res.resultObj.tlist[i].createTime) + '</dd>'
                        + '<dd >' + realNum + '</dd>'
                        + '<dd >' + silent + '</dd>'
                        + '<dd >' + nullNum + '</dd>'
                        + '<dd >' + shutNum + '</dd>'
                        + '<dd >' + (realNum + silent + nullNum + shutNum) + '</dd>'
                        + '<dd >'
                        + '<a href="javascript:;" class="down" data-path="' + res.resultObj.tlist[i].zipPath + '">下载</a>'
                        + '<a href="javascript:;" class="del" data-id="' + res.resultObj.tlist[i].id + '">删除</a>'
                        + '</dd>'
                        + '</dl>'
                }
                $(".hisRecordList").html(html);

                // 点击列表里面的下载
                $(".down").on('click', function () {
                    window.location.href = downUrl + $(this).attr('data-path');
                    clearSelect();
                })

                // 点击列表里面的删除
                $(".del").off().on('click', function () {
                    var that = $(this)
                    var ids = ' ';
                    $(".delDialog").show();
                    $(".reveal-modal-bg").show();
                    $(".trueDel").off().on('click', function () {
                        delHistory(that.attr('data-id'));
                    });
                })
                // 点击单选，全选选中
                $(".singleCheck").on('change', function () {
                    if ($(".singleCheck:checked").length == $(".singleCheck").length) {
                        $("#checkAll").prop('checked', true);
                    } else {
                        $("#checkAll").prop('checked', false);
                    }
                });
            }
        }).fail(function (err) {
            toast(err.resultMsg)
        })
    }
    $("#delDialogClose").on('click', function () {
        $(".delDialog").hide()
        $(".reveal-modal-bg").hide()
    })
    // 点击全选，全部选中
    $("#checkAll").change(function () {
        if ($(this).prop('checked')) {
            $(".singleCheck").each(function (index, val) {
                $(val).prop('checked', true);
            });
        } else {
            $(".singleCheck").each(function (index, val) {
                $(val).prop('checked', false);
            });
        }
    });

    // 点击查询
    $(".queryDate").on('click', function () {
        var startDate = $("#dateTimeStart").val();
        var endDate = $("#dateTimeEnd").val();
        if (startDate !== "" && endDate == "") {
            toast('请输入结束时间!')
        } else if (startDate == "" && endDate !== "") {
            toast('请输入开始时间!')
        } else {
            getajax(1, 10, startDate, endDate)
        }

    })
    // 单条 删除
    function delHistory(ids) {
        $.ajax({
            url: url + '/credit/deleteCvsByIds',
            method: 'GET',
            dataType: 'json',
            data: {
                ids: ids,
                userId: userId,
                mobile: sessionStorage.getItem('id'),
                token: sessionStorage.getItem('token')
            }
        }).done(function (res) {
            if (res.resultCode == '000000') {
                toast('删除成功');
                $(".delDialog").hide()
                $(".reveal-modal-bg").hide();
                $("#dateTimeStart").val("");
                $("#dateTimeEnd").val("");
                getajax(); //检测的列表
                getRecordList(userId, mydate);  //折线图//折线数据
            } else {
                toast(res.resultMsg)
            }
        })
    };
    // 批量下载
    $(".exportAll").off().on('click', function () {
        var ids = ' ';
        var flag = false;
        $(".singleCheck:checked").each(function () { // 遍历选中的checkbox
            ids += $(this).attr('data-id') + ',';
            ids = ids.trim();
            flag = true;
        });
        if (flag) {
            window.open(url + '/report/batchDownloadFile?userId=' + userId + '&mobile=' + sessionStorage.getItem('id') + '&token=' + sessionStorage.getItem('token') + '&ids=' + ids)
            clearSelect();
        } else {
            toast('请至少选择一条记录!');
        };
    });

    // 批量删除
    $(".delAllBtn").off().on('click', function () {
        var ids = ' ';
        var flag = false;
        $(".singleCheck:checked").each(function () { // 遍历选中的checkbox
            ids += $(this).attr('data-id') + ',';
            ids = ids.trim();
            flag = true;
        });
        if (flag) {
            $(".delDialog").show()
            $(".reveal-modal-bg").show();
            $(".trueDel").off().on('click', function () {
                delAllHistory(ids);
            })
        } else {
            toast('请至少选择一条记录!');
        };
    });
    function delAllHistory(ids) {
        $.ajax({
            url: url + '/credit/deleteCvsByIds',
            method: 'GET',
            dataType: 'json',
            data: {
                userId: userId,
                ids: ids,
                mobile: sessionStorage.getItem('id'),
                token: sessionStorage.getItem('token'),
            }
        }).done(function (res) {
            if (res.resultCode == '000000') {
                $(".delDialog").hide();
                $(".reveal-modal-bg").hide();
                var dateTimeStart = $("#dateTimeStart").val();
                var dateTimeEnd = $("#dateTimeEnd").val();
                getajax(1, 10, dateTimeStart, dateTimeEnd);
                getRecordList(userId, mydate);  //折线图
            } else {
                toast(res.resultMsg)
            }
        }).fail(function (res) {
            toast(res.resultMsg)
        })
    }

    // 导出
    $(".exportExcel").on('click', function () {
        var startDate = $("#dateTimeStart").val();
        var endDate = $("#dateTimeEnd").val();
        if (startDate !== "" && endDate == "") {
            toast('请输入结束时间!')
        } else if (startDate == "" && endDate !== "") {
            toast('请输入开始时间!')
        } else {
            window.open(url + '/report/getHistoryTestData?userId=' + userId + '&mobile=' + sessionStorage.getItem('id') + '&token=' + sessionStorage.getItem('token') + '&startDate=' + startDate + '&endDate=' + endDate)
        }
    })

    // 批量操作切换
    $(".opert").mouseover(function () {
        $(".opertCon").show();
    });
    $(".opert").mouseout(function () {
        $(".opertCon").hide();
    });

    getDateTime();
    function getDateTime() {
        //开始时间
        var start = laydate.render({
            elem: '#dateTimeStart',
            type: 'date',
            min: '2017-09-01',
            max: mydatelay,
            trigger: 'click',
            done: function (value, date, endDate) {
                end.config.min = {
                    year: date.year,
                    month: date.month - 1,
                    date: date.date,
                };
                end.config.value = {
                    year: date.year,
                    month: date.month - 1,
                    date: date.date,
                };
            }
        });
        //结束时间
        var end = laydate.render({
            elem: '#dateTimeEnd',
            type: 'date',
            min: '2017-09-01',
            max: mydatelay,
            trigger: 'click',
            // done: function (value, date, endDate) {
            //     start.config.max = {
            //         year: date.year,
            //         month: date.month - 1,
            //         date: date.date,
            //     };
            // }
        })

    }

    // 折线图
    var myChart = echarts.init(document.getElementById('mainMore'));
    var option = {
        title: {
            text: '检测包数据'
        },
        tooltip: {
            trigger: 'axis'
        },
        color: ['#4992ff', '#f6b37f', '#A2A2A0', 'red', 'pink'],
        legend: {
            data: ['实号包', '沉默包', '空号包', '风险包', '总条数']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar',] },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '实号包',
                type: 'line',
                itemStyle: {
                    normal: {
                        lineStyle: {
                            color: '#4992ff'
                        }
                    }
                },
                data: []
            },
            {
                name: '沉默包',
                type: 'line',
                itemStyle: {
                    normal: {
                        lineStyle: {
                            color: '#f6b37f'
                        }
                    }
                },
                data: []
            },
            {
                name: '空号包',
                type: 'line',
                itemStyle: {
                    normal: {
                        lineStyle: {
                            color: '#A2A2A0'
                        }
                    }
                },
                data: []
            },
            {
                name: '风险包',
                type: 'line',
                itemStyle: {
                    normal: {
                        lineStyle: {
                            color: 'red'
                        }
                    }
                },
                data: []
            },
            {
                name: '总条数',
                type: 'line',
                itemStyle: {
                    normal: {
                        lineStyle: {
                            color: 'pink'
                        }
                    }
                },
                data: []
            }
        ]
    };

    // 折线
    function getRecordList(userId, mydate) {
        $.ajax({
            url: url + "/report/getTestHistoryReport",
            type: 'post',
            dataType: 'json',
            data: {
                userId: userId,
                month: mydate,
                token: sessionStorage.getItem('token'),
                mobile: sessionStorage.getItem('id'),
            },
        }).done(function (res) {
            if (res.resultCode == "000000") {
                $("#lineMonth").val(mydate);
                $("#monthShow").html(mydate);
                if (res.resultObj == null || res.resultObj == "") {
                    $(".nullRecord").show();
                    $("#downExcel").attr('disabled', true);
                    $("#downExcel").css('background-color', '#ccc')
                    $("#mainMore").hide();
                    return;
                };
                $("#downExcel").attr('disabled', false);
                $("#downExcel").css('background-color', '#233379')
                $(".nullRecord").hide();
                $("#mainMore").show();
                var legends = [];    //x轴
                var series1 = [];
                var series2 = [];
                var series3 = [];
                var series4 = [];
                var series5 = [];
                for (var i = 0; i < res.resultObj.length; i++) {
                    legends.push(res.resultObj[i].date); //x 轴 
                    series1.push(res.resultObj[i].empty)  //空号数据
                    series2.push(res.resultObj[i].real);  //实号数据
                    series3.push(res.resultObj[i].silence);  //沉默数据
                    series4.push(res.resultObj[i].shut);  //风险数据
                    series5.push(res.resultObj[i].total);  //zong数据
                }
                option.xAxis.data = legends;
                option.series[0].data = series2;  //实号
                option.series[1].data = series3;  //沉默
                option.series[2].data = series1;  //空号
                option.series[3].data = series4;   //风险
                option.series[4].data = series5; //总
                myChart.setOption(option);// 重新加载图表  
            } else {
                toast(res.resultMsg)
            }
        }).fail(function (err) {
            toast('失败')
        })
    };
    // 月查询数据
    function getMonthTime(userId, mydate) {
        laydate.render({
            elem: '#lineMonth',
            type: 'month',  //可选择：年月日时分秒
            trigger: 'click', //采用click弹出
            min: '2017-09-14'
            , max: mydate,
            //  ready: function () {
            //     ins22.hint('日期可选值设定在 <br> 2016-10-14 到 ' + mydate);
            // },
            done: function (value) {
                if (value !== "") {
                    getRecordList(userId, value)
                }
            },
        });
    };
    // 下载折线数据
    $("#downExcel").off().on('click', function () {
        window.open(url + '/report/testHistoryReportExport?userId=' + userId + '&month=' + $("#lineMonth").val() + '&token=' + sessionStorage.getItem('token') + '&mobile=' + sessionStorage.getItem('id'))
    });

})
