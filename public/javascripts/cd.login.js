cd.login = (function(){

    var setupLoginModal = function(){
        
        /* Activate close button */
        $(".cd-login-modal-head").on('click',function(){
            $(".cd-login-modal").css('opacity', 0).css('z-index', -100);
            $('.cd-content').removeClass('blur');
        });

        $('.cd-login-modal-form').on('submit', function(e){
            e.preventDefault();
            login($(this));
        });
  
        function login(form){
            $.ajax({
                type: 'POST',
                url: '/login',
                data: form.serialize(),
                error: function(err){
                    cd.update.error(err.statusText);
                },
                success: function(data){
                    if (typeof data.redirect == 'string'){
                        window.location.replace(
                            window.location.protocol
                                + "//" + window.location.host + data.redirect);
                    }
                }
            });
        };
    }
    return { setupLoginModal: setupLoginModal };
}());
