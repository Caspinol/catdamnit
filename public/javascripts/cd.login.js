catdamnit.login = (function(){

    var setupLoginModal = function(){
        
        /* Activate close button */
        $(".cd-login-modal-head").on('click',function(){
            $(".cd-login-modal").css('opacity', 0);
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
                    catdamnit.update.error(err);
                },
                success: function(data){
                    $('.cd-login-modal-update').css('color', 'green').slideDown('fast')
                        .text(data.message).delay(1000)
                        .slideUp('fast', function(){
                            $("body").removeClass("cd-login-modal-open");
                            if (typeof data.redirect == 'string'){
                                window.location.replace(
                                    window.location.protocol
                                        + "//" + window.location.host + data.redirect);
                            }
                        });
                }
            });
        };
    }

    return { setupLoginModal: setupLoginModal };
}());
