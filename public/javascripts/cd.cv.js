(function(){
    var
    print_btn = $('#cv-print'),
    download_btn = $('#cv-download');

    function doPrint(){
        print_btn.on('click', function(){
            //Ned to hide the menu button itself
            $('.cd-cv-menu').hide(1, function(){ 
                window.print();
                $(this).show();
            });
        });
    };

    doPrint();
}());
