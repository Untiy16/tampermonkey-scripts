

if(location.href.indexOf('/Untiy16') !== -1){
    let interval = setInterval(function(){
        if(document.body !== null){
           clearInterval(interval);
           document.body.classList.add('uloader_pre');
        }
    }, 20);
}


let jQueryModInterval = setInterval(function() { if(typeof jQueryMod !== 'undefined') { clearInterval(jQueryModInterval); (function($) {
    'use strict';

    let interval = setInterval(function(){
        $('.User-showsMore').click();

        if(!$('.User-showsMore').length){
            clearInterval(interval);
            var hasUpdates = false;
            var showsByIds = {};
            const showsIds = $('.User-shows .Container > div:not(.TabsContent-mal) .User-show.UserShowItem').map(function(index, item){ let showId = $(item).find('a.UserShowItem-title').attr('href').split('/').filter(item => item).pop(); showsByIds[showId] = item; return showId;}).toArray();
            var filter = JSON.parse(localStorage.getItem('filter'));

            if(filter === null){
                $.ajax({
                    url: untiy16Url + '/myshows',
                    method: "GET",
                    async: false,
                    success: function(response){
                        response = JSON.parse(response);
                        if(response.status === 200){
                            filter = JSON.parse( response.data );
                        }else{
                            filter = {};
                        }
                    },
                    fail:function(){
                        filter = {};
                    },
                    error:function(){
                        filter = {};
                    }
                });
            }

            showsIds.forEach(function(showId, index){
                if( filter[showId] === undefined){
                    hasUpdates = true;
                    $.ajax({
                        url: "https://api.myshows.me/v2/rpc/",
                        method: "POST",
                        async: false,
                        data: JSON.stringify({"jsonrpc":"2.0","method":"shows.GetById","params":{"showId":showId,"withEpisodes":false},"id":1}),
                        success: function(data){
                            data = data.result;
                            filter[showId] = data.genreIds;
                            c(`ajax #${index} to ${showId} success!`)
                        }
                    });
                }

            });


            var genres = JSON.parse(localStorage.getItem('genres'));
            if(hasUpdates || genres === null){
                var genresIds = [];
                genres = [];
                for (var showId in filter) {
                    genresIds.push(filter[showId]);
                }
                genresIds = [].concat.apply([], genresIds);
                genresIds = [...new Set(genresIds)];

                var allGenres = {};

                $.ajax({
                    url: "https://api.myshows.me/v2/rpc/",
                    method: "POST",
                    async: false,
                    headers: {'accept-language': 'ru'},
                    data: JSON.stringify({"jsonrpc":"2.0","method":"shows.Genres","params":{},"id":1}),
                    success: function(data){
                        allGenres = data.result;
                    }
                });

                genres = allGenres.filter(genre => genresIds.indexOf(genre.id) != -1);
                genres.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));

            }

            localStorage.setItem('filter', JSON.stringify(filter));
            localStorage.setItem('genres', JSON.stringify(genres));

            if(hasUpdates){
                //сохранение фильтров у себя на сервере
                $.ajax({
                    url: untiy16Url + '/myshows/save',
                    method: "post",
                    async: false,
                    data: {data: JSON.stringify(filter)},
                    success: function(response){
                        response = JSON.parse(response);
                        if(response.status === 200){
                            console.log('filters successfully updated on untiy16', response);
                        }
                    }
                });
            }

            let userGenresAndFilterCode = `window.filter = JSON.parse('${JSON.stringify(filter)}'); window.genres = JSON.parse('${JSON.stringify(genres)}');`;
            let userGenresAndFilterScript = document.createElement('script');
            userGenresAndFilterScript.innerHTML = userGenresAndFilterCode;
            document.body.appendChild(userGenresAndFilterScript);

            function sortByNestedText(parent, childSelector, keySelector) {
                $(parent).each(function(){
                    var items = $(this).children(childSelector).sort(function(a, b) {
                        var vA = $(keySelector, a).text().toUpperCase();
                        var vB = $(keySelector, b).text().toUpperCase();
                        return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
                    });
                    $(this).append(items);
                });

            }

            sortByNestedText('.User-shows .Container > div', '.User-show.UserShowItem', '.UserShowItem-content .UserShowItem-details .UserShowItem-header .UserShowItem-header__top .UserShowItem-title');

            $('.Tabs-container .TabsItem').eq(1).click();

            var filtersHtml = '<div class="genresFilter Container"><h3><div>Жанры: <input type="submit" class="filter-clear" value="Сброс"></div> <div class="radio-wrapper"><span><input checked value="1" name="filter-mode" id="radio-and" type="radio"><label for="radio-and">&&</label></span><span><input value="2" name="filter-mode" id="radio-or" type="radio"><label for="radio-or">||</label></span></div></h3><ul>';
            $.each(genres, function(i, genre){
                filtersHtml += `<li><input type="checkbox" id="genre${genre.id}" value="${genre.id}"><label for="genre${genre.id}">${genre.title}</label></li>`;
            });
            filtersHtml += '</ul>';

            var filterMode = 1;

            $(document).on('change', '.radio-wrapper input[name="filter-mode"]', function(e) {
                filterMode = $(this).val();
                $('.genresFilter input[type="checkbox"]').trigger('change');
            });

            $(filtersHtml).insertBefore($('.Tabs.User-tabs'));


            $('.filter-clear').on('click', function(){
                $('.genresFilter input[type="checkbox"]').prop('checked', false).first().trigger('change');
            });

            $('.genresFilter input[type="checkbox"]').on('change', function(e) {
                let checked = $.makeArray($('.genresFilter input[type="checkbox"]:checked').map(function() {
                    return parseInt($(this).val());
                }));

                if(checked.length){
                    $('.filter-clear').show();
                    $('.User-shows .Container > div:not(.TabsContent-mal)').each(function(){
                        $(this).find('.User-show.UserShowItem').each(function(){
                            let showId = $(this).find('a.UserShowItem-title').attr('href').split('/').filter(item => item).pop();
                            let filterMatches = filter[showId].filter(function(obj) { return checked.indexOf(obj) >= 0; }).length;

                            if( filterMatches >= (filterMode == 1 ? checked.length : 1) ){
                                $(this).removeClass('filterHidden');
                            }else {
                                $(this).addClass('filterHidden');
                            }



                        });
                    });
                }else{
                    $('.filter-clear').hide();
                    $('.User-shows .Container .User-show.UserShowItem').removeClass('filterHidden');
                }

                $('.Tabs-container .TabsItem:not(.TabsItem-mal)').each(function(i, el){
                    $(this).find('.TabsItem-counter').text($('.User-shows .Container > div:not(.TabsContent-mal)').eq(i).find('.User-show.UserShowItem:not(.filterHidden)').length)
                })
            });


            $('input[id*="genre"][value="29"]').prop('checked', true).trigger('change');

            $('.User-shows .Container > div').first().prepend('<span class="ongoing-wrapper"><input type="checkbox" id="ongoing"><label for="ongoing">ongoing</label></span>');

            $('#ongoing').on('change', function(){
                let $counter = $('.Tabs-container .TabsItem .TabsItem-counter').first();
                if($(this).is(':checked')){
                    $('.User-shows .Container > div').first().find('.User-show.UserShowItem:has(.Progress-value[style="width: 100%;"])').addClass('ongoingHidden');
                    $counter.text(parseInt($counter.text()) - $('.ongoingHidden').length);
                }else{
                    $counter.text(parseInt($counter.text()) + $('.ongoingHidden').length);
                    $('.ongoingHidden').removeClass('ongoingHidden');
                }
            });

            $('#ongoing').prop('checked', true).trigger('change');
            document.body.classList.remove('uloader_pre');

            /* Заметки с сервера */
            $.ajax({
                url: untiy16Url + '/myshows-notes/get-notes',
                method: "POST",
                data: {shows_ids: showsIds},
                success: function(response){
                    response = JSON.parse(response);
                    if(response.status === 200){
                        response.data.forEach(function(item){
                            $(showsByIds[item.id]).find('.UserShowItem-header__bottom').append(`<span class="show-note">${item.note}</span>`)
                        });

                    }
                }


            });

        }
    }, 300);

})(jQueryMod); } }, 100);



GM_addStyle(`

.ongoingHidden, .filterHidden{
    display: none !important;
}

.genresFilter input[type="submit"]{
    display: none;
    margin-right: 20px;
    padding: 7px 15px;
    font-size: 15px;
    font-weight: 700;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    background-color: var(--myshows-color);
}

.genresFilter ul{
    margin-top: 10px;
    list-style: none;
    column-count: 5;
}

.genresFilter ul li {
    display: flex;
    align-items: center;
    margin: 0;
    font-size: 14px;
}

.genresFilter ul li input{
    margin-right: 5px;
}

.genresFilter h3{
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.genresFilter .radio-wrapper{
    display: flex;
    align-items: center;

}

.genresFilter .radio-wrapper span{
    display: flex;
    align-items: center;
    font-size: 16px

}

.genresFilter .radio-wrapper span:first-child{
    margin-right: 20px;
}

.filter-clear{
    display: none;
    font-size: 16px
}

.ongoing-wrapper{
    display: inline-flex;
    align-items: center;
    padding-left: 20px;
}

.ongoing-wrapper label{
    font-size: 14px;
}

.show-note, .show-note *{
    display: block;
    margin-top: 5px;
    color: #f60;
    word-break: break-all;
}

.show-note a{
    display: inline;
    font-size: 10px;
    text-decoration: underline;
    padding-bottom: 5px;
}

.uloader_pre{position: relative;}
.uloader_pre::before,  .uloader_pre::after {
    position: absolute;
    z-index: 3;
    content: '';
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-repeat: no-repeat;
    background-position: center;
    background-color: #333333eb;
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzOCIgaGVpZ2h0PSIzOCIgdmlld0JveD0iMCAwIDM4IDM4IiBzdHJva2U9IiNmZmYiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMSAxKSIgc3Ryb2tlLXdpZHRoPSIyIj48Y2lyY2xlIHN0cm9rZS1vcGFjaXR5PSIuNSIgY3g9IjE4IiBjeT0iMTgiIHI9IjE4Ii8+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4Ij4gPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgMTggMTgiIHRvPSIzNjAgMTggMTgiIGR1cj0iMXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+IDwvcGF0aD4gPC9nPiA8L2c+PC9zdmc+);
    background-size: 150px;
}

`);
