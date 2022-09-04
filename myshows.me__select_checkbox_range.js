


let jQueryModInterval = setInterval(function() { if(typeof jQueryMod !== 'undefined' && window?.$nuxt?._isMounted) { clearInterval(jQueryModInterval); (function($) {
    'use strict';

    $('.episodes-by-season__season .episodes-by-season__episode').each(function() {
        this.outerHTML = this.outerHTML;
    });

    let debounce = (function(){
        var timer = 0;
        return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
        };
    })();

    function markEpisode(episode, state){
        $(episode).attr('data-changed', 1).data('changed', 1);
        if(!state){
            $(episode).removeClass('EpisodeWatchLabel_plus EpisodeWatchLabel_minus').addClass('EpisodeWatchLabel_plus')
        }else{
            $(episode).removeClass('EpisodeWatchLabel_plus EpisodeWatchLabel_minus').addClass('EpisodeWatchLabel_minus')
        }
        debounce(() => $(document).trigger('episodestate:changed'), 500);
    }

    function unmarkEpisode(episode){
        $(episode).removeClass('EpisodeWatchLabel_plus EpisodeWatchLabel_minus');
    }

    $('.Header-left').append('<button class="custom-save custom-save_myshows">Save</button>');
    $('.custom-save_myshows').on('click', function(e){
        let checkedIds = $('.EpisodeWatchLabel_plus').map((i, item) => $(item).data('episode-id')).toArray();
        let unCheckedIds = $('.EpisodeWatchLabel_minus').map((i, item) => $(item).data('episode-id')).toArray();

        if(checkedIds.length || unCheckedIds.length){
            $(this).addClass('loader-inline').prop('disabled', true);
            $.ajax({
                 url: 'https://myshows.me/v3/rpc/',
                 method: 'post',
                 data:  JSON.stringify({jsonrpc: "2.0", id: 2, method: "manage.SyncEpisodesDelta", params: {showId: location.pathname.split('/').filter(item => item).pop(), checkedIds: checkedIds, unCheckedIds: unCheckedIds}}),
                 contentType:"application/json",
                 headers: {Authorization2: `Bearer ${window.__NUXT__.state.auth.token}`},
                 success: (response) => {
                     if(response.result != true){
                         alert('Error! Check console!');
                         c(response, 'success callback');
                     }else{
                         $('.EpisodeWatchLabel_plus, .EpisodeWatchLabel_minus').each(function(){
                             if($(this).hasClass('EpisodeWatchLabel_plus')){
                                 $(this).addClass('checked').html('<svg width="13" height="9" class="Icon"><use xlink:href="/sprite.svg?5#episode_check"></use></svg>').parents('.episodes-by-season__episode').find('.episode-col').addClass('muted');
                             }else if($(this).hasClass('EpisodeWatchLabel_minus')){
                                 $(this).removeClass('checked').html('').parents('.episodes-by-season__episode').find('.episode-col.muted').removeClass('muted');
                             }
                             $(this).removeClass('EpisodeWatchLabel_plus EpisodeWatchLabel_minus');
                         });
                         $('.custom-save_myshows').removeClass('loader-inline').prop('disabled', false).hide();
                     }
                 },
                 error: (response) => {
                     alert('Error! Check console!');
                     c(response, 'error callback');
                 },

             });
        }else{
            $('.custom-save_myshows').hide();
        }
    });

    $('.episodes-by-season__episode .EpisodeWatchLabel').each(function(){
        this.addEventListener("click", function(event){
            event.stopPropagation();
            let state = $(this).hasClass('checked');
            if(!$(this).hasClass('EpisodeWatchLabel_plus') && !$(this).hasClass('EpisodeWatchLabel_minus')){
                markEpisode(this, state);
            }else{
                $(this).removeClass('EpisodeWatchLabel_plus EpisodeWatchLabel_minus').removeAttr('data-changed').data('changed', undefined);
                $(document).trigger('episodestate:changed')
            }
        }, true);
    });

    $('.episodes-by-season__episode').each(function(){
        let episodeId = $(this).find('.episode-col a').attr('href').split('/').filter(item => item).pop();
        $(this).find('.EpisodeWatchLabel').attr('data-episode-id', episodeId);
    });

    $('.episodes-by-season__episode .EpisodeWatchLabel').on('mousedown', function(e){
        $('body').css('user-select', 'none');
        let state = $(this).hasClass('checked') || $(this).hasClass('EpisodeWatchLabel_plus');
        let $this = $(this);
        let startCoordY = e.pageY;
        let finalCoordY = e.pageY;
        let direction = '';
        let $checkboxes = $this.parents('.episodes-by-season__season').find('.episodes-by-season__episode .EpisodeWatchLabel');
        let $checkboxesUp = $($checkboxes.get().reverse());
        let $checkboxesDown = $checkboxes;


        $(this).one('mouseleave.hoverstate', function(e){
            $(this).removeClass('EpisodeWatchLabel_plus EpisodeWatchLabel_minus').addClass(!state ? 'EpisodeWatchLabel_plus' : 'EpisodeWatchLabel_minus');
            let thisIndexUp = $checkboxesUp.index($this[0]);
            let thisIndexDown = $checkboxesDown.index($this[0]);

            $(document).on('mousemove.hoverstate', function(e){
                direction = startCoordY >= e.pageY ? 'up' : 'down';
                if(direction == 'up'){
                    $checkboxesUp.each(function(index){
                        if(index > thisIndexUp && thisIndexUp <= $checkboxesUp.length){
                            if(e.pageY < $(this).offset().top ){
                                markEpisode(this, state)
                            }else if($(this).data('changed') !== undefined && $(this).data('changed') == 1){
                                unmarkEpisode(this);
                            }
                        }
                    });
                }else{
                    $checkboxesDown.each(function(index){
                        if(index > thisIndexDown && thisIndexDown <= $checkboxesDown.length){
                            if(e.pageY > $(this).offset().top ){
                                markEpisode(this, state)
                            }else if($(this).data('changed') !== undefined && $(this).data('changed') == 1){
                                unmarkEpisode(this);
                            }
                        }
                    });
                }
            });

        });
    });

    $(document).on('mouseup', function(){
        $('.episodes-by-season__episode .EpisodeWatchLabel').off('mouseover.hoverstate').off('mouseleave.hoverstate').data('changed', 0).removeAttr('data-changed');
        $(document).off('mousemove.hoverstate');
        $('body').css('user-select', 'auto');
    });

    $(document).on('episodestate:changed', function(){
        if($('.EpisodeWatchLabel_plus').length || $('.EpisodeWatchLabel_minus').length){
            $('.custom-save_myshows').css('display', 'flex').show();
        }else{
            $('.custom-save_myshows').hide();
        }
    });

    $('.ShowDetails-section:last-child').addClass('ShowDetails-collapsed');
    $('.ShowDetails-collapsed').on('click', function(){
        $(this).removeClass('ShowDetails-collapsed');
    });

})(jQueryMod); } }, 100);

GM_addStyle(`

        .custom-save{
        display: none;
        margin-right: 20px;
        padding: 5px 20px;
        font-size: 17px;
        font-weight: 700;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    }

    .custom-save_myshows{
        background-color: var(--myshows-color);
    }

    .EpisodeWatchLabel{
        position: relative;
    }

    .EpisodeWatchLabel::before{
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        position: absolute;
        top: 0;
        left: 0;
        background-size: 60%;
        filter: invert(1);
    }

    .EpisodeWatchLabel_plus::before{
        background-image: url('data:image/svg+xml; base64, PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhbCIgZGF0YS1pY29uPSJwbHVzIiByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDM4NCA1MTIiIGNsYXNzPSJzdmctaW5saW5lLS1mYSBmYS1wbHVzIGZhLXctMTIgZmEtM3giIHN0eWxlPSIKICAgIHdpZHRoOiAxMDAlO21heC13aWR0aDogMTAwJTsKIj48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0zNzYgMjMySDIxNlY3MmMwLTQuNDItMy41OC04LTgtOGgtMzJjLTQuNDIgMC04IDMuNTgtOCA4djE2MEg4Yy00LjQyIDAtOCAzLjU4LTggOHYzMmMwIDQuNDIgMy41OCA4IDggOGgxNjB2MTYwYzAgNC40MiAzLjU4IDggOCA4aDMyYzQuNDIgMCA4LTMuNTggOC04VjI4MGgxNjBjNC40MiAwIDgtMy41OCA4LTh2LTMyYzAtNC40Mi0zLjU4LTgtOC04eiIgY2xhc3M9IiI+PC9wYXRoPjwvc3ZnPg==');
    }

    .EpisodeWatchLabel_minus::before{
        background-image: url('data:image/svg+xml; base64, PHN2ZyBzdHlsZT0iCiAgICB3aWR0aDogMTAwJTttYXgtd2lkdGg6IDEwMCU7CiIgYXJpYS1oaWRkZW49InRydWUiIGZvY3VzYWJsZT0iZmFsc2UiIGRhdGEtcHJlZml4PSJmYWwiIGRhdGEtaWNvbj0ibWludXMiIHJvbGU9ImltZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzg0IDUxMiIgY2xhc3M9InN2Zy1pbmxpbmUtLWZhIGZhLW1pbnVzIGZhLXctMTIgZmEtM3giPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTM3NiAyMzJIOGMtNC40MiAwLTggMy41OC04IDh2MzJjMCA0LjQyIDMuNTggOCA4IDhoMzY4YzQuNDIgMCA4LTMuNTggOC04di0zMmMwLTQuNDItMy41OC04LTgtOHoiIGNsYXNzPSIiPjwvcGF0aD48L3N2Zz4=');
    }

    .EpisodeWatchLabel[class*="EpisodeWatchLabel_"]{
        border-color: var(--myshows-color) !important;
        background-color: var(--myshows-color) !important;
        border: none !important;
    }

    .EpisodeWatchLabel[class*="EpisodeWatchLabel_"] svg{
        display: none;
    }

    .ShowDetails-poster{
        max-width: 50%;
        margin: 0 auto;
    }

    .ShowDetails-section.ShowDetails-collapsed{
        max-height: 88px;
        padding: 0;
        overflow: hidden;
        position: relative;
        cursor: pointer;
    }

    .ShowDetails-section.ShowDetails-collapsed:after {
        content: '';
        display: block;
        width: 100%;
        height: 50%;
        background: linear-gradient(180deg, rgba(255,255,255,0) 0, rgba(255,255,255,1) 70%);
        position: absolute;
        bottom: 0;
        left: 0;
    }

    .ShowDetails-section.ShowDetails-collapsed:before {
        content: '';
        display: block;
        width: 100%;
        height: 18px;
        position: absolute;
        bottom: -3px;
        left: 0;
        z-index: 1;
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='chevron-down' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' class='svg-inline--fa fa-chevron-down fa-w-14 fa-2x'%3E%3Cpath fill='%23cb0000' d='M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z' class=''%3E%3C/path%3E%3C/svg%3E");
        background-size: 100% 100%;
        background-repeat: no-repeat;

    }




`);
