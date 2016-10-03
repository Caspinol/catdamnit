var cd = (function(){    
    
    var
    pageSnapshot, 
    content = $('.cd-content-left'),
    setupModule = function(){
        /* Init the sticky navbar */
        cd.sticky.makeSticky();
        cd.login.setupLoginModal();
    },

    registerLinkHandlers = function(){
        /* Enable login modal */
        $('#cd-login').on('click', function(){
            $('.cd-login-modal').css('opacity', 1).css('z-index', 100);
            $('.cd-content').addClass('blur');
        });
        /* Editor handler */
        $('#cd-new-post').on('click', function(){
            loadPostEditor('/newpost');
        });
        
        $('#edit-post').on('click', function(e){
            e.preventDefault();
            loadPostEditor($(this).attr('href'));
        });
        cd.comment.handle();
    },

    loadPostEditor = function(url){
        $.ajax({
            type: 'GET',
            url: url,
            error: (err)=>{
                cd.update.error(err.statusText);
            },
            success: (data)=>{
                content.empty();
                content.html(data.editor);
                cd.editor.show();
            }
        });
    },
    
    makePageSnapshot = function(){
        pageSnapshot = content.html();
    },
    
    initModule = function(){
        setupModule();
        registerLinkHandlers();
    };

    return { initModule: initModule };
}());

