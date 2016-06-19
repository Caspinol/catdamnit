cd.editor = (function(){
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

    edit = function(content){
        tinymce.get('title').setContent(content);
    },

    handle = function(){
        $('.cd-editor-form').on('submit', function(e){
            e.preventDefault();
            validatePost($(this), function(err, form_data){
                if(err){
                    cd.update.error(err);
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
                cd.update.error(err.statusText);
            },
            success: function(data){
                cd.update.info(data.message);
            }
        });
    };

    function validatePost(form, cb){
        var
        fd = {};
        $.each(form.serializeArray(), (i, input)=>{
            fd[input.name] = input.value;
        });

        if(fd['post-title'] === undefined || fd['post-title'] === ''){
            var e = new Error("Title is missing");
            return cb(e);
        }
        if(fd['post-tag'] === undefined || fd['post-tag'] === ''){
            var e = new Error("Need to specyfy a tag");
            return cb(e);
        }
        cb(null, form.serialize());
    };

    return {
        show: show,
        edit: edit
    };
}());
