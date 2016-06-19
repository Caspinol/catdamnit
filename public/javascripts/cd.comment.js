cd.comment = (function(){
    'use strict';
    
    var
    txt_field = $('.cd-post-comment textarea'),
    default_msg = txt_field.text(),
    form = $('.cd-post-comment form'),
    
    handle = function(){
        setupNewComment();
        
        form.on('submit', function(e){
            e.preventDefault();
            doSubmit($(this));
        });
    };

    function setupNewComment(){
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
