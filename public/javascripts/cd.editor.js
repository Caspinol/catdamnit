catdamnit.editor = (function(){
    'use strict';
    var
    show = function(){

        var plugins = ['preview', 'link', 'codesample', 'textcolor', 'image', 'wordcount',
                       'emoticons', 'media'];
        
        tinymce.init({
            selector: '#cd-post-editor',
            plugins: plugins,
            toolbar: 'undo redo | image link media | codesample textcolor preview | emoticons',
            height: 600,
            body_id: 'cd-editor',
            resize: true
        });
        
        handle();
    },

    handle = function(){
        $('.cd-editor-form').on('submit', function(e){
            e.preventDefault();
            validatePost($(this), function(err, form_data){
                if(err) {
                    return;
                }
                savePost(form_data);
            });
        });

        $('.cd-editor-cancel').on('click', function(){
            tinymce.remove('#cd-post-editor');
            window.location.replace(window.location.protocol
                                    + '//' + window.location.host);
        });

    };

    function savePost(form_data){

        $.ajax({
            type: 'POST',
            url: '/newpost',
            data: form_data,
            error: function(err){
                catdamnit.update.error(err.statusText);
            },
            success: function(data){
                catdamnit.update.info(data.message);
            }
        });
    };

    function validatePost(form, cb){
        var fd = form.serialize();
        console.log(fd);
        if(fd['post-title'] === undefined || fd['post-title'] === ''){
            
        }
        cb(null, form_data);
    };

    return { show: show };
    
}());
