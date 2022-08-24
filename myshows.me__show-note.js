
console.log('note');
let jQueryModInterval = setInterval(function() { if(typeof jQueryMod !== 'undefined') { clearInterval(jQueryModInterval); (function($) {
    'use strict';

    let showId = location.href.match('view\/[0-9]+/$')[0].split('/')[1];

    $(`<div class="custom-note"><textarea class="custom-note-text" placeholder="leave few words about this show"></textarea><div class="custom-note-content"></div><button class="custom-note-save">Save</button></div>`).insertAfter('.ShowDetails-original');

    let $saveBtn  = $('.custom-note-save');
    let $textarea = $('.custom-note-text');
    let $content = $('.custom-note-content');

    $.ajax({
        url: untiy16Url + '/myshows-notes/get-note',
        method: "POST",
        data: {show_id: showId},
        success: function(response){
            response = JSON.parse(response);
            if(response.status === 200){
                console.log(response.data);
                $textarea.val(response.data);
                $content.html(response.data);
            }else{
                $textarea.show();
                $content.hide();
            }

            $textarea[0].style.height = "5px";
            $textarea[0].style.height = $textarea[0].scrollHeight + "px";
        }
    });

    $content.on('click', function(e) {
        if (e.detail === 3) {
            if($textarea.val()[$textarea.length - 1] != '\n'){
                $textarea.val($textarea.val() + '\n');
            }
            $textarea.show();
            $textarea.focus();
            $textarea[0].style.height = "5px";
            $textarea[0].style.height = $textarea[0].scrollHeight + "px";

            $saveBtn.show();
            $content.hide();
        }
    });


    $textarea.on('input paste change', function(){
        this.style.height = "5px";
        this.style.height = (this.scrollHeight)+"px";
        $saveBtn.show();
    });

    $saveBtn.on('click', function(){
        $textarea.val($textarea.val().replace(/(?<!("|>))(https|http)(\S*)(?=\s|$)/gim, '<a target="_blank" href="$&">$&</a>'));

        let $html = $(`<div class="temp-wrapper">${$textarea.val()}</div>`);
        let blankLinksCount = $html.find('a:contains(link)').length;
        $html.find('a:contains(http)').each(function(index){
            $(this).text('link' + (blankLinksCount + index + 1));
        });
        $textarea.val($html.html());

        $.ajax({
            url: untiy16Url + '/myshows-notes/save',
            method: "POST",
            data: {show_id: showId, note: $textarea.val()},
            beforeSend: function(){
                $('.custom-note').addClass('uloader uloader40');
            },
            success: function(response){
                response = JSON.parse(response);
                if(response.status === 200){
                    $saveBtn.hide();
                    $textarea.hide();
                    $content.html($textarea.val()).show();
                    $('.custom-note').removeClass('uloader uloader40');
                }


            }
        });
    });



})(jQueryMod); } }, 100);

GM_addStyle(`


.custom-note{
    display: flex;
    margin-bottom: 15px;
}

.custom-note-text{
    display: none;
    flex-grow: 1;
    height: 30px;
    min-height: 30px;
    resize: none;
    overflow: hidden;
    margin-right: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.custom-note-save{
    display: none;
    font-size: 14px;
    background-color: #c00;
    border: none;
    color: #fff;
    border-radius: 4px;
}

.custom-note-content{
    width: 100%;
    white-space: pre-wrap;
}
`);
