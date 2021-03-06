  $(function(){
    //判断是否需要显示操作提醒
    if 
    //不再提醒消息
    $('#i-konw').click(function () {
      $('#op-tips').hide(500);
    });

    $.ajax({
      type: "GET",
      url: "/api/Course/getAllCourses",
      dataType: "json",
      data: {
      },
      success: function(data) {
        var i;
        for(i in data) {
          $("#choice-table-body").append('<tr><td><input type="checkbox" name="xk_checkboxes[]" value="' + data[i].code + '"></td><td><a href="/courses/' + data[i].code + '">' + data[i].name + '</a></td><td>' + data[i].code + '</td><td><a href="/teachers/' + data[i].variable.teacher.id + '">' + data[i].variable.teacher.name + '</a></td><td>' + data[i].variable.time.display + '</td><td>' + data[i].variable.place.display + '</td><td>' + data[i].variable.credit + '</td><td>' + data[i].variable.selected + '/' + data[i].variable.total + '</td><td>' + data[i].variable.attr + '</td><td>' + data[i].variable.campus + '</td><td>' + data[i].variable.college + '</td></tr>');
        }
      },
      error: function(xhr) {
        $("#err-alert span").text(xhr.responseJSON);
        $("#err-alert").fadeIn();
      }
    });

    //阻止表格内的a元素触发的事件冒泡
    $('#choice-table-body').on('click', 'a', function(e) {
      e.stopPropagation(); 
    });

    //点击checkbox触发的加载和提交操作
    $('#choice-table-body').on('click', 'input',function(e) {
      var obj = $(this).closest('tr');
      var objInp = $(this);

      var flag = objInp.prop('checked');
      if (flag === true) {
        //取消勾选操作时执行
        objInp.prop('checked', false);
        obj.removeClass();
      } else if (flag === false) {
        //勾选时执行
        objInp.prop('checked', true);
        
        submitChoice(objInp.val(), e, function (err, data) {
          if (!!err) {
            obj.addClass('danger');
            obj.css({'-webkit-animation' : 'twinkling 0.5s infinite ease-in-out'});
            //将api返回的英文提示转换成中文，并弹出提示
            var msg = err.responseJSON === 'Already choosen.' ? '你已经选过此课啦，请勿重复选择。' : '出现了其他未知错误';
            showAlert(msg, 'danger', e.pageY, e.pageX);
            setTimeout(function () {
              //闪烁提示后，删除高亮并恢复控件状态
              objInp.prop('checked', false);
              obj.removeClass('danger');
              obj.css({'-webkit-animation' : 'none'});
            }, 1000);
          } else if (data === null) {
            obj.addClass('danger');
            showAlert('返回数据为空，未知异常。', 'danger', e.pageY, e.pageX);
            setTimeout(function () {
              //闪烁提示后，删除高亮并恢复控件状态
              objInp.prop('checked', false);
              obj.removeClass('danger');
              obj.css({'-webkit-animation' : 'none'});
            }, 1000);
          } else {
            obj.addClass('success');
          }
        });
      }

    });

    //当点击为此行时，触发加载并提交
    // TODO : 这两段可以合并为一段代码
    $('#choice-table-body').on('click', 'tr', function(e) {
      var obj = $(this);
      var objInp = $(this).find("input:first:checkbox");

      var flag = objInp.prop('checked');
      if (flag === true) {
        //取消勾选操作时执行
        objInp.prop('checked', false);
        obj.removeClass();
      } else if (flag === false) {
        //勾选时执行
        objInp.prop('checked', true);
        
        submitChoice(objInp.val(), e, function (err, data) {
          if (!!err) {
            obj.addClass('danger');
            obj.css({'-webkit-animation' : 'twinkling 0.5s infinite ease-in-out'});
            //将api返回的英文提示转换成中文，并弹出提示
            var msg = err.responseJSON === 'Already choosen.' ? '你已经选过此课啦，请勿重复选择。' : '出现了其他未知错误';
            showAlert(msg, 'danger', e.pageY, e.pageX);
            setTimeout(function () {
              //闪烁提示后，删除高亮并恢复控件状态
              objInp.prop('checked', false);
              obj.removeClass('danger');
              obj.css({'-webkit-animation' : 'none'});
            }, 1000);
          } else if (data === null) {
            obj.addClass('danger');
            showAlert('返回数据为空，未知异常。', 'danger', e.pageY, e.pageX);
            setTimeout(function () {
              //闪烁提示后，删除高亮并恢复控件状态
              objInp.prop('checked', false);
              obj.removeClass('danger');
              obj.css({'-webkit-animation' : 'none'});
            }, 1000);
          } else {
            var msg = '该门课程选择成功！';
            showAlert(msg, 'success', e.pageY, e.pageX);
            obj.addClass('success');
          }
        });
      }
    });

    var submitChoice = function (opts, e, callback) {
      //提交执行过程提示
      var msg = '提交中,请稍后...';
      showAlert(msg, 'info', e.pageY, e.pageX);
      
      $.ajax({
        type: "POST",
        url: "/api/Course/choice",
        dataType: "json",
        data: {
          username: <%= locals.user.username %>,
          choice: opts
        },
        success: function(data) {
          callback(null, data);
        },
        error: function(xhr) {
          callback(xhr, null);
        }
      });

    }

    var showAlert = function (info, status, pX, pY) {
      var status = arguments[1] ? arguments[1] : 'info';
      $('#track-alert-tip span').text('').attr('class','label');//重置为初始状态
      $('#track-alert-tip span').text(info).addClass('label-' + status);
      $('#track-alert-tip').css('top', pX);
      $('#track-alert-tip').css('left', pY);
      $('#track-alert-tip').show();
      setTimeout( function() {
          $('#track-alert-tip').fadeOut();
          // $('#track-alert-tip span').text('').attr('class','label'); //提示完成后重置为初始状态
        }, (2000)
      );
    }

    //$('#send-btn').click(function(){
      // 修改为多线程提交，防止一次提交过多内容可能导致的缓慢或失败
      // var opts = '';
      // $('#choice-table-body input[name^=xk_checkboxes]:checked').each(function() {
      //   var thisObj = $(this);
      //   opts += ',' + thisObj.val();
      // });
      
      // opts = opts.split(',').filter(function(n){return n});
      
      // $.ajax({
      //   type: "POST",
      //   url: "/api/Course/choice",
      //   dataType: "json",
      //   data: {
      //     username: <%= locals.user.username %>,
      //     choice: opts
      //   },
      //   success: function(data) {
      //     console.log(data);
      //   },
      //   error: function(xhr) {
      //     console.log(xhr);
      //     $("#err-alert span").text(xhr.responseJSON);
      //     $("#err-alert").fadeIn();
      //   }
      // });
    //});

  });
