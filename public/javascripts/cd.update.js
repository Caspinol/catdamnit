catdamnit.update = (function(){
    'use strict';

    var
    modal = $('.cd-update-modal'),

    showMessage = function(message, type){
        var color = (type==='ERROR')? 'red': 'green';
        
        modal
            .css('color', color)
            .animate({'opacity': 1, 'z-index': 100}, 2000)
            .text(message).delay(2000)
            .animate({'opacity': 0, 'z-index': -10}, 2000);
    },
    
    error = function(err){
        
        var message = err;
        if(err instanceof Error){
            message = err.message;
        }
            
        showMessage(message, 'ERROR');
    },

    info = function(message){
        
        showMessage(message, 'INFO');
    };
    
    return {
        error: error,
        info: info
    };
}());
