var doge = (function(){
    var dogeModal = $('<div><img src="images/doge.png"/><div></div></div>').addClass('doge');
    var cvBody = $('#cv');
    var praise = [
        'such skill', 'very tech', 'wow', 'so impressed', 'such embedded', 'much engineering',
        'much experience', 'many programming', 'so agile', 'such C/C++', 'bestest', 'wow candidate',
        'very GNU', 'such Linux'];


    var showDoge = function(x, y, i) {
        dogeModal
            .css('left', x)
            .css('top', y)
            .appendTo('body')
            .find('div')
            .text(praise[i])
    }

    var random = function(min, max){
        return Math.floor(Math.random() * (max-min)+min);
    }

    var doge = function() {
        var num = random(0, praise.length);
        var range = Math.random();
        var x, y;
        
        if (range > 0.5) {
            x = random(0, cvBody.position().left - 80)
        }else{
            x = random(cvBody.position().left + cvBody.width(), $(window).width() - 80)
        }
        y = random(0, $(window).height())
        showDoge(x, y, num);

        setTimeout(doge, 5000);
    }
    
    return { doge: doge }
}());
