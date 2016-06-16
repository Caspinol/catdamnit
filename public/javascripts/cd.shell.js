var catdamnit = (function(){    
    
    var
    pageSnapshot, 
    content = $('.cd-content-left'),
    setupModule = function(){
        /* Init the sticky navbar */
        catdamnit.sticky.makeSticky();
        catdamnit.login.setupLoginModal();
    },

    registerLinkHandlers = function(){
        /* Enable login modal */
        $("#cd-login").on('click', function(){
            $(".cd-login-modal").css('opacity', 1);
            $('.cd-content').addClass('blur');
        });
        /* Editor handler */
        $("#cd-new-post").on('click', function(){
            loadPostEditor();
        });
    },

    loadPostEditor = function(){
        $.ajax({
            type: 'GET',
            url: '/newpost',
            error: function(err){
                catdamnit.update.error(err.statusText);
            },
            success: function(data){
                content.empty();
                content.html(data);
                catdamnit.editor.show();
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

