(function() {
    'use strict';

    let originalUrl = location.href;

    if (window.onurlchange === null) {
        window.addEventListener('urlchange', function(info){
            if(originalUrl !== info.url){
                location.reload();
            }
        });
    }
})();
