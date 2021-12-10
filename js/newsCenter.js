$(function () {
    //  已经登录成功
    isLogin(function () {
        $(".fistNav a").attr('href', '../html/empty.html');  //登录成功后，首页调转到检测的首页
    });
    getUserId(function () {
        // getNewsList();
        idreadInfonum(); //获取未读消息个数
    })

    //    ================================================================
    getData(1, 10);  //初始化

    function getData(currentPage, numPerPage) {
        $.ajax({
            type: "post",
            url: url + '/news/newsList',
            dataType: 'json',
            data: {
                pageNo: currentPage || 1,
                pageSize: numPerPage || 10,
                domain: document.domain
            },
        }).done(function (res) {
            if (res.resultObj == null) {
                $("#newslistmsj").html('<p style="text-align: center">暂无数据</p>');
                return;
            }
            console.log(res)
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
                            getData(obj.curr);
                        }
                    }
                });
            });

            insertDiv(res);
            // 点击标题
            $(".newTitle").off().on('click', function () {
                var moreId = $(this).parent().parent().data('id');
                // 把id存储起来，以便查看详情时使用
                sessionStorage.setItem('moreId', moreId)
                location.href = "./newsDetails.html";
            })

        }).fail(function () {
            toast('系统异常')
        })
    }
    function insertDiv(res) {
        var html = "";
        for (var i = 0; i < res.resultObj.tlist.length; i++) {
            html += '<li data-id="' + res.resultObj.tlist[i].id + '">'
                + '<div>'
                + '<h2>' + res.resultObj.tlist[i].days + '</h2>'
                + '<p>' + res.resultObj.tlist[i].months + '</p>'
                + '</div>'
                + '<div class="newContent">'
                + '<h3 class="newTitle">' + res.resultObj.tlist[i].title + '</h3>'
                + '<p>' + (typeof (res.resultObj.tlist[i].premessage) == 'undefined' ? "" : (res.resultObj.tlist[i].premessage)) + '</p>'
                + '</div>'
                + ' </li>'
        }
        $("#newslistmsj").html(html);
    }


})