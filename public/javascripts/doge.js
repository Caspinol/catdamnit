setTimeout(function(){
    var cvBody = $('#cv');
    var praise = [
        'such skill', 'very tech', 'wow', 'so impressed', 'such embedded', 'much engineering',
        'much experience', 'many programming', 'so agile', 'such C/C++', 'bestest', 'wow candidate',
        'very GNU', 'such Linux'];
    var count = 0;

    var showDoge = function(x, y, i, cb) {
        var dogeModal = $('<div><img src="images/doge.png"/><div></div></div>').addClass('doge');
        dogeModal
            .fadeIn(3000, "linear")
            .css('left', x)
            .css('top', y)
            .appendTo('body')
            .find('div')
            .text(praise[i])
        if (count++ > 6){
            dogeModal.fadeOut(3000, 'linear')
        }else{
            dogeModal.fadeOut(3000, 'linear', cb)
        }
    }

    var random = function(min, max){
        return Math.floor(Math.random() * (max-min)+min);
    }

    var doge = function() {
        var num = random(0, praise.length);
        var range = Math.random();
        var x, y;
        
        if (range > 0.5) {
            x = random(0, cvBody.position().left - 90)
        }else{
            x = random(cvBody.position().left + cvBody.width(), $(window).width() - 120)
        }
        y = random(0, $(window).height()-120)
        showDoge(x, y, num, doge);
    }
    
    doge();
}, 10000);
