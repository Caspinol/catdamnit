cd.comment = (function(){
    'use strict';
    
    var
    txt_field = $('.cd-post-comment textarea'),
    default_msg = txt_field.text(),
    form = $('.cd-post-comment form'),
    
    handle = function(){
        fancyfyCommentBox();
        
        form.on('submit', function(e){
            e.preventDefault();

            validateComment($(this), (e, form_data)=>{
                if(e){
                    cd.update.error(e);
                    return;
                }
                doSubmit(form_data);
            });
        });
    };

    function validateComment(form, cb){
        var
        fd = {};
        $.each(form.serializeArray(), (i, input)=>{
            fd[input.name] = input.value;
        });
        
        if(fd.comment_txt.lenght == 0 || fd.comment_txt === ""
           || fd.comment_txt.trim() === default_msg.trim()){
            var e = new Error("Stop messing around. Comment has no content");
            return cb(e);
        }
        if(fd.auth_name.lenght === 0 || fd.auth_name === ""){
            var e = new Error("I'm gonna need your name, your boots and your motocycle...");
            return cb(e);
        }
        cb(null, form);
    };

    function fancyfyCommentBox(){
        txt_field.focus(function(){
            if ($(this).val() == default_msg)
                $(this).val("");
        });
        txt_field.blur(function(){
            if ($(this).val() == "")
                $(this).val(default_msg);
        });
    };

    function doSubmit(form){
        $.ajax({
            type: 'POST',
            url: form.attr('action'),
            data: form.serialize(),
            error: function(err){
                cd.update.error(err.statusText);
            },
            success: function(data){
                cd.update.info(data.message);
            }
        });
    };
    
    return { handle: handle };
}());
