$(function () {
    //  已经登录成功
    isLogin(function () {
        loginHref();  //登录成功后，跳转对应的页面
    });
    getUserId(function () {
        getnewList();
        idreadInfonum(); //获取未读消息个数
    })


    // 删除选中的
    $("#delSelect").on('click', function () {
        var ids = ' ';
        var flag = false;
        // console.log($(".singleCheck:checked").length)
        $(".singleCheck:checked").each(function () { // 遍历选中的checkbox
            ids += $(this).attr('data-id') + ',';
            ids = ids.trim();
            flag = true;
        });

        if (flag) {
            ids = (ids.substring(ids.length - 1) == ',') ? ids.substring(0, ids.length - 1) : ids
            delHistory(ids);
            // console.log(ids)
        } else {
            toast('请至少选择一条数据');
        };
    });


    //全选
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



    // 获取value值  筛选已读和未读
    $("#test").change(function () {
        var options = $("#test option:selected"); //获取选中的项
        getnewList(1, 10, options.val())
        // alert(options.val()); //拿到选中项的值
        // alert(options.text()); //拿到选中项的文本
    })

    // 获取消息列表
    function getnewList(currentPage, numPerPage, isRead) {
        $.ajax({
            url: url + '/message/messageList',
            method: 'post',
            dataType: 'json',
            data: {
                userId: userId,
                token: sessionStorage.getItem('token'),
                userPhone: sessionStorage.getItem('id'),
                pageNo: currentPage || 1,
                pageSize: numPerPage || 10,
                isRead: isRead
            }
        }).done(function (res) {
            if (res.resultObj == null) {
                $(".hisRecordList").html('<p style="text-align: center">暂无数据</p>');
                // $(".new-list").css({
                //     'margin-bottom':'140px',
                //     'padding-bottom':'130px'
                // })
                return;
            }
            if (res.resultCode == "000000") {
                $(".new-list").css('margin-bottom','100px')
                // $("#footer").removeClass('footerChange');
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
                                getnewList(obj.curr);
                            }
                        }
                    });
                });
                var html = "";
                for (var i = 0; i < res.resultObj.tlist.length; i++) {
                    var isread;
                    var isreadCode = res.resultObj.tlist[i].isread;
                    switch (isreadCode) {
                        case "1":
                            isread = "unread";
                            break;
                        case "0":
                            isread = "read";
                            break;
                    };
                    var type;
                    var typeCode = res.resultObj.tlist[i].type;
                    switch (typeCode) {
                        case "1":
                            type = "系统消息";
                            break;
                        case "2":
                            type = "活动通知";
                            break;
                        case "3":
                            type = "故障通知";
                            break;
                        case "4":
                            type = "更新通知";
                            break;
                    };
                    html += '<li data-id="' + res.resultObj.tlist[i].id + '">'
                        + '<div class="title fl remarks">'
                        + '<input type="checkbox" id="singlesCheck' + res.resultObj.tlist[i].id + '"  class="checkbox singleCheck" style="display:none" data-id="' + res.resultObj.tlist[i].id + '">'
                        + '<label for="singlesCheck' + res.resultObj.tlist[i].id + '"></label>'
                        + '<span class=" ident ' + isread + '"></span>'
                        + '<span class="titleClick">【' + type + '】</span>'
                        + '<span class="remarks titleClick" title="' + res.resultObj.tlist[i].title + '">' + res.resultObj.tlist[i].title + '</span>'
                        + '</div>'
                        + '<div class="time fr">'
                        + '<p>' + timeToDate(res.resultObj.tlist[i].createtime) + '</p>'
                        + '</div>'
                        + '</li>'
                }
                $(".hisRecordList").html(html);

                // if ($(".new-list").height() < 391) {
                   
                //     $("#footer").addClass('footerChange');
                // } else {
                //     if ($("#footer").hasClass('footerChange')) {
                //         $("#footer").removeClass('footerChange')
                //     }
                // }
                // 反选
                $(".singleCheck").on('change', function () {
                    if ($(".singleCheck:checked").length == $(".singleCheck").length) {
                        $("#checkAll").prop('checked', true);
                    } else {
                        $("#checkAll").prop('checked', false);
                    };
                    // event.stopPropagation();    //  阻止事件冒泡
                });
                // 点击列表的时候，查看详情
                $(".hisRecordList .titleClick").off().on('click', function () {
                    var id = $(this).parent().parent().data('id');
                    $(".new-list").hide();  //消息列表隐藏
                    $(".newDetails").show();
                    $("#titleName").html('消息详情');
                    // 改变当前列表的颜色
                    var dd = $(this).parent().children(".ident")
                    if (dd.hasClass('read')) {
                        dd.removeClass('read');
                        dd.addClass('unread')
                    }
                    getListDetail(id);
                });
            }
        }).fail(function (err) {
            console.log(res);
        })
    }

    // 获取列表详情
    function getListDetail(id) {
        $.ajax({
            url: url + '/message/readMessage',
            method: 'post',
            dataType: 'json',
            data: {
                userId: userId,
                message_id: id,
                token: sessionStorage.getItem('token'),
                userPhone: sessionStorage.getItem('id'),
            }
        }).done(function (res) {
            var message = res.ret_msg.message;
            // 将换行符和空格进行转义
            var mess = message.replace(/\n/g, '<br>').replace(/\s/g, '&nbsp');
            $(".details-title .title").html(res.ret_msg.title);
            var html = "";
            html += '<ul>'
                + '<li>'
                + '<span>' + mess + '</span>'
                + '</li>'
                + '</ul>'
            $(".newsDatail-list").html(html);

            // 判断显示高度，设置底部的显示方式
            if ($(".newDetails").height() < 380) {
                $("#footer").addClass('footerChange');
            } else {
                if ($("#footer").hasClass('footerChange')) {
                    $("#footer").removeClass('footerChange')
                }
            }
        }).fail(function (res) {
            // toast()
        })

    };

    // 删除选中的列表
    function delHistory(ids) {
        $.ajax({
            url: url + '/message/deleteMessage',
            method: 'post',
            dataType: 'json',
            data: {
                message_ids: ids,
                userId: userId,
                userPhone: sessionStorage.getItem('id'),
                token: sessionStorage.getItem('token')
            }
        }).done(function (res) {
            if (res.ret_code == 0) {
                toast('删除成功')
                location.reload();
            } else {
                toast('删除失败')
            }
        }).fail(function () {
            toast('系统异常')
        })
    }
    // 点击消息详情里面的返回，返回到列表页面
    $(".newDetails #return").off().on('click', function () {
        $(".new-list").show();  //消息列表隐藏
        $(".newDetails").hide();
        $("#titleName").html('消息列表');
        idreadInfonum(); //获取未读消息个数
        if ($(".new-list").height() < 380) {
            $("#footer").addClass('footerChange');
        } else {
            if ($("#footer").hasClass('footerChange')) {
                $("#footer").removeClass('footerChange')
            }
        }

    });

})