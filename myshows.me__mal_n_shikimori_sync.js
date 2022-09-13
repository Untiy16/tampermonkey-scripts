
let jQueryModInterval = setInterval(function() { if(typeof jQueryMod !== 'undefined' && window?.$nuxt?._isMounted) { clearInterval(jQueryModInterval); (function($) {

    let isAnime = $('a[href*="/search/all/?genre=29"]').length || $('a[href*="/search/all/g-anime').length || $('.Note-content .Note-text').text() == 'anime' || $('.Note-content .Note-text').text()[0] == '[';
    let animeName = $('.ShowDetails .ShowDetails-original').text().trim();

    if(isAnime && animeName){


        // var seasonsStateDefault = getSeasonsState();
        var malShowsArray = $('.Note-content .Note-text');
            malShowsArray = malShowsArray.length && malShowsArray.text() == 'anime' ? false : (malShowsArray.length ? JSON.parse(htmlEntitiesDecode(malShowsArray.text()).trim()) : false);

        if(!malShowsArray)
            $('.Note-form textarea').val('')


        let $seasonsBlocks = $($('.episodes-by-season__season').get().reverse());
        if(malShowsArray){
            malShowsArray.forEach(function(season, index){
                if(index){
                    if(!Array.isArray(season)){
                        $seasonsBlocks.eq(index - 1).append(`<div data-malid="${season}" class="seasonScore_wrap seasonScore_wrap_hidden"><span>Оценка сезона</span><input type="number" class="seasonScore" min="1" max="10" value="0"></div>`);
                    }else{
                        season.forEach(function(part, partIndex){
                            if(part !== null){
                                $seasonsBlocks.eq(index - 1).append(`<div data-malid="${part.malId}" class="seasonScore_wrap seasonScore_wrap_hidden"><span>Оценка: сезон ${index} часть ${partIndex}</span><input type="number" class="seasonScore" min="1" max="10" value="0"></div>`);
                            }
                        });
                    }
                }
            });
        }

        $(document).on('change', '.seasonScore', function(){
            $(this).removeClass('seasonScore_conflict');
        });

        /* В этом блоке мы ищем текущее аниме на MAL и сохраняем в заметки id сезонов в правильном порядке  */
        if(!malShowsArray){

            function renderMALList(animeName) {
                let animeListOnMal = false;
                let animeListHtml = '';

                $.ajax({
                    // url: 'https://api.jikan.moe/v3/search/anime?q=' + animeName,
                    url: untiy16JikanHost + '/v4/anime?q=' + animeName,
                    type: 'GET',
                    async: false,
                    success: function( data ) {
                        animeListOnMal = data.data;
                    },
                     error: function( data ) {
                        alert('jikan api error');
                    },
                });

                if(animeListOnMal && animeListOnMal.length) {
                    animeListOnMal.forEach(function(item){
                        animeListHtml += `
                            <div class="mal-search-item">
                                <span class="mal-image" style="background-image: url('${item.images?.jpg.image_url}');"></span>
                                <a class="mal-name" href="${item.url}">${item.title}</a>
                                <div class="mal-checkbox-wrap">
                                    <span data-mal-anime-id="${item.mal_id}"></span>
                                    <label for="mal-anime${item.mal_id}"></label>
                                    <input id="mal-anime${item.mal_id}" data-mal-anime-id="${item.mal_id}" data-episodes-count="${item.episodes}" type="checkbox" class="mal-input">
                                </div>
                            </div>
                        `;
                    });
                } else {
                    alert('MAL search return empty result!');
                }

                return animeListHtml;
            }

            $(document).on('click', '.mal-modal_search button', function() {
                let q = $('.mal-modal_search input').val();
                if(q) {
                    $('.mal-search-items').html('').append(renderMALList($('.mal-modal_search input').val()));
                }
            });

            $('.ShowStatusBar-list .ShowStatusBar-option:contains("Смотрю")').on('click', function() {

                let animeListHtml = renderMALList(animeName);
                if(animeListHtml){

                    let shiftIsPressed = false;
                    let shiftCount = 0;
                    $(window).keydown(keyDownHandler);
                    $(window).keyup(keyUpHandler);

                    function keyDownHandler(event) {
                        if (event.key == "Shift") {
                            shiftIsPressed = true;
                        }
                    }

                    function keyUpHandler(event) {
                        if (event.key == "Shift") {
                            shiftIsPressed = false;
                        }
                    }

                    let $modal = $(`<div class="mal-modal"><div class="mal-modal_search"><input value="${animeName}"><button>Search</button></div><div class="mal-modal_specials"></div><button disabled class="mal-modal_save-specials">Save specials</button><button disabled class="mal-modal_save-seasons">Save seasons <br> (hold Shift to split season)</button><div class="mal-search-items">${animeListHtml}</div><button disabled class="mal-modal_save-specials">Save specials</button><button disabled class="mal-modal_save-seasons">Save seasons</button></div><div class="mal-modal-overlay"></div>`);
                    $('body').addClass('mal-modal-show').append($modal);

                    $('.mal-modal-overlay').on('click', function(){
                        $(this).remove();
                        $('.mal-modal').remove();
                    });

                    var seasonsCount = $('.episodes-by-season__season').length;
                    var checkedSeasons = 0;
                    var $specials = $('.episode-col:has(.special) .episode-col__title');
                    let result = [{}];
                    function seasonsCanBeSaved(input){
                        $(input).prop('checked', false);
                        alert('Все сезоны отмечены! Теперь вы можете сохранить результат.');
                    }
                    $(document).on('change', '.mal-modal input.mal-input', function(e){
                        if($(this).is(':checked')){
                            if(checkedSeasons < seasonsCount || shiftIsPressed){
                                if(shiftIsPressed){
                                    if(!shiftCount){
                                        if(checkedSeasons < seasonsCount){
                                            checkedSeasons++;
                                        }else{
                                            seasonsCanBeSaved(this);
                                            return false;
                                        }
                                    }
                                    $(this).data('multipart', true);
                                    $(this).data('multipart-order', ++shiftCount);
                                }else{
                                    shiftCount = 0;
                                    checkedSeasons++;
                                }
                                $(this).attr('data-mal-order', checkedSeasons);
                                $(this).prev('label').text(`Сезон: ${checkedSeasons}${$(this).data('multipart') ? ` часть ${shiftCount}` : '' }`);

                                if(checkedSeasons === seasonsCount){
                                    $('.mal-modal_save-seasons').prop('disabled', false);
                                }
                            }else{
                                seasonsCanBeSaved(this);
                            }
                        }else{
                            let order = parseInt($(this).data('mal-order'));
                            $('.mal-modal input.mal-input').each(function(){
                                if($(this).data('mal-order') >= order ){
                                    $(this).prop('checked', false).removeAttr('data-mal-order').removeData(['mal-order', 'multipart', 'multipart-order']).prev('label').text('');
                                }
                            });
                            checkedSeasons = order - 1;
                            shiftCount = 0;
                            $('.mal-modal_save-seasons').prop('disabled', true);
                        }
                    });


                    $('.mal-modal .mal-modal_save-seasons').on('click', function(){
                        $('.mal-modal .mal-modal_save-seasons').hide();
                        $('.mal-modal .mal-modal_save-specials').show();
                        let arrayInput = [];
                        let inputLength = $('.mal-modal input[data-mal-order]').length;
                        $('.mal-modal input[data-mal-order]').each(function(index, element){
                            if($(this).data('multipart') === undefined){
                                result[$(this).data('mal-order')] = $(this).data('mal-anime-id');
                                if(arrayInput.length){
                                    result[parseInt($(this).data('mal-order')) - 1] = arrayInput;
                                    arrayInput = [];
                                }
                            }else{
                                arrayInput[$(this).data('multipart-order')] = {malId: $(this).data('mal-anime-id'), episodesCount: $(this).data('episodes-count')};
                            }

                            if((index === (inputLength - 1)) && arrayInput.length){
                                result[parseInt($(this).data('mal-order'))] = arrayInput;
                                arrayInput = [];
                            }

                            $(this).parent('.mal-checkbox-wrap').parent('div').hide();
                        });


                        $('.mal-modal .mal-modal_save-specials').on('click', function(){
                            if(!$('.modal-special-input').length){
                                $('.Note-viewToggle span, .Note-contentControl:first-child').click();
                                let interval = setInterval(()=>{
                                    if($('.Note-form textarea').length){
                                        clearInterval(interval);
                                        $('.Note-form textarea').val(JSON.stringify(result))[0].dispatchEvent(new Event( 'input' ));
                                        $('.Note-form .FormButton.primary').click();
                                        $modal.remove();
                                        location.reload();
                                    }
                                }, 100)
                            }
                        })
                        $(document).on('dblclick', '.mal-modal.specials-mode', function() {
                            $('.mal-modal_specials').html('');
                            $('.mal-modal_save-specials').removeAttr('disabled')
                        });

                        if($specials.length){
                            $('.mal-modal').addClass('specials-mode');
                            let specialsHtml = '';
                            $specials.each(function(){
                                specialsHtml += `<div><input type="checkbox" class="modal-special-input" value="${$(this).attr('href').split('/').filter(item => item).pop()}"><label>${$(this).text()}</label></div>`;
                            });
                            $('.mal-modal_specials').append(specialsHtml);
                            dragBoxChecking();

                            $(document).on('click', '.mal-checkbox-wrap span', function(){

                                if(!$(this).hasClass('mal-span-used') || confirm('Вы уверены? Вы уже использовали этот тайтл раннее.') ){
                                    let $inputs = $('.modal-special-input:checked');
                                    let malId = $(this).data('mal-anime-id');
                                    if($inputs.length){
                                        if(result[0][malId] === undefined || !result[0][malId].length){
                                            result[0][malId] = $inputs.map(function(){ return this.value; }).toArray();
                                        }else{
                                            result[0][malId] = result[0][malId].concat($inputs.map(function(){ return this.value; }).toArray());
                                        }
                                        $inputs.parent('div').remove();
                                        $(this).addClass('mal-span-used');
                                        if(!$('.modal-special-input').length){
                                            $('.mal-modal_save-specials').prop('disabled', false);
                                        }
                                    }else if($('.modal-special-input').length){
                                        alert('Сначала нужно отметить нужные спешелы!');
                                    }else if(!$('.modal-special-input').length){
                                        alert('Все спешелы отмечены! Теперь вы можете сохранить результат.');
                                        $('.mal-modal_save-specials').prop('disabled', false);
                                    }
                                }
                            });

                        }else{
                            $('.mal-modal_save-specials').prop('disabled', false).first().click();
                        }
                    });
                }
            });
        }


        /* В этом блоке мы сохраняем изменения (если они были) на MAL */
        if(malShowsArray){

            $('.Header-left').append('<button class="custom-save custom-save_mal">Save on MAL & Shikimori</button>');

            $(document).on('episodestate:changed', function(){
                if($('.EpisodeWatchLabel_plus').length || $('.EpisodeWatchLabel_minus').length){
                    $('.custom-save_mal').css('display', 'flex');
                }else{
                    $('.custom-save_mal').removeClass('loader-inline').prop('disabled', false).hide();
                }
            });

            var malSpecialsIds = [];
            for(var key in malShowsArray[0]) {
                malSpecialsIds.push(key);
                malShowsArray[0][key].forEach(function(item){
                    $(`.episodes-by-season__episode:has(.episode-col__title[href="/view/episode/${item}/"]) .EpisodeWatchLabel`).attr('data-malid', key);
                });
            }

            malSpecialsIds.forEach(function(item){
                $(`.episodes-by-season__episode:has('.episode-col__label.special'):has(.EpisodeWatchLabel[data-malid="${item}"]) .Col.left.all:not(.episodes-by-season__number)`).first().after('<input type="number" class="seasonScore seasonScore_hidden seasonScore_special" min="1" max="10" value="0">');
            });


            var requestArray = [];

            $('.custom-save_mal').on('click', function(){
                let seasonsStateChanged = getSeasonsState();
                /* Season episodes */
                seasonsStateChanged.forEach( function(element, index) {
                    if(seasonsStateChanged[index].changed){

                        let seasonIndex = Math.abs(seasonsStateChanged[index].season - $('.episodes-by-season__season').length);
                        let $seasonEpisodes = $('.episodes-by-season__season').eq(seasonIndex).find('.episodes-by-season__episode:not(:has(.episode-col__label.special))');
                        let $scoreInput = $('.episodes-by-season__season').eq(seasonIndex).find('.seasonScore_wrap .seasonScore');
                        let episodesCount = $seasonEpisodes.length;
                        let episodesCheckCount = $seasonEpisodes.find('.EpisodeWatchLabel').filter(function(){return ($(this).hasClass('checked') || $(this).hasClass('EpisodeWatchLabel_plus')) && !$(this).hasClass('EpisodeWatchLabel_minus') }).length;
                        if( !Array.isArray(malShowsArray[seasonsStateChanged[index].season])){
                            requestArray = requestArray.filter(item => item.malId != malShowsArray[seasonsStateChanged[index].season]);
                            requestArray.push({
                                malId: malShowsArray[seasonsStateChanged[index].season],
                                status: episodesCount === episodesCheckCount ? 2 : 1,
                                status_text: episodesCount === episodesCheckCount ? 'completed' : 'watching',
                                score: parseInt($scoreInput.val()),
                                episodesWatched: episodesCheckCount,
                                episodesCount: episodesCount,
                                season: seasonsStateChanged[index].season,
                                type: 'season',
                                multipart: false,
                            });
                        }else{
                            let $seasonCheckedEpisodes = $seasonEpisodes.find('.EpisodeWatchLabel_plus').add($seasonEpisodes.find('.EpisodeWatchLabel_minus'));
                            $seasonEpisodes = $($seasonEpisodes.get().reverse());
                            let prevSeasonPartEpisodesCount = -1;
                            let multipartSeason = malShowsArray[seasonsStateChanged[index].season];
                            let checkedEpisonesIndexes = [];
                            $seasonCheckedEpisodes.each(function(){
                                let index = $seasonEpisodes.index($(this).closest('.Row.episodes-by-season__episode')) + 1;
                                checkedEpisonesIndexes.push(index);
                            });

                            multipartSeason.forEach(function(part, partIndex){
                                if(part !== null){
                                    requestArray = requestArray.filter(requestItem => requestItem.malId != part.malId);

                                    part.changed = false;
                                    part.start = (prevSeasonPartEpisodesCount === -1) ? 1 : prevSeasonPartEpisodesCount + 1;
                                    part.end   = (prevSeasonPartEpisodesCount === -1) ? part.episodesCount : (part.start + part.episodesCount - 1);
                                    part.changed = checkedEpisonesIndexes.some(index => (index >= part.start && index <= part.end));

                                    prevSeasonPartEpisodesCount = part.episodesCount;

                                    if(part.changed){
                                        part.watchedEpisodesCount = 0;

                                        for(let i = part.start - 1; i <= part.end - 1; i++){
                                            if( $seasonEpisodes.eq(i).find('.EpisodeWatchLabel_plus, .EpisodeWatchLabel.checked:not(.EpisodeWatchLabel_minus)').length) part.watchedEpisodesCount++;
                                        }

                                        requestArray.push({
                                            malId:           part.malId,
                                            status:          part.episodesCount === part.watchedEpisodesCount ? 2 : 1,
                                            status_text:     part.episodesCount === part.watchedEpisodesCount ? 'completed' : 'watching',
                                            score:           parseInt($(`.seasonScore_wrap[data-malid="${part.malId}"] input`).val()),
                                            episodesWatched: part.watchedEpisodesCount,
                                            episodesCount:   part.episodesCount,
                                            season:          seasonsStateChanged[index].season,
                                            type:            'season',
                                            multipart:       true,
                                            multipart_part:  partIndex
                                        });
                                    }
                                }
                            });
                        }
                    }

                });


                /* Specials episodes*/
                let $specials = $('.episodes-by-season__episode:has(.episode-col__label.special) .EpisodeWatchLabel.EpisodeWatchLabel_plus, .episodes-by-season__episode:has(.episode-col__label.special) .EpisodeWatchLabel.EpisodeWatchLabel_minus')
                let $specialsIds = [...new Set($specials.map((index, item)=>$(item).data('malid')))];

                $specialsIds.forEach( function(item, index) {
                    let malId = item;
                    let $seasonEpisodes = $(`.episodes-by-season__episode:has(.episode-col__label.special) .EpisodeWatchLabel[data-malid="${item}"]`);
                    let $scoreInput = $seasonEpisodes.first().parent().prev('.seasonScore');
                    let episodesCount = $seasonEpisodes.length;
                    let episodesCheckCount = $seasonEpisodes.filter(function(){return ($(this).hasClass('checked') || $(this).hasClass('EpisodeWatchLabel_plus')) && !$(this).hasClass('EpisodeWatchLabel_minus') }).length;
                    requestArray = requestArray.filter(item => item.malId != malId);
                    requestArray.push({
                        malId: malId,
                        status: episodesCount === episodesCheckCount ? 2 : 1,
                        status_text: episodesCount === episodesCheckCount ? 'completed' : 'watching',
                        score: parseInt($scoreInput.val()),
                        episodesWatched: episodesCheckCount,
                        episodesCount: episodesCount,
                        season: 'special-' + malId,
                        type: 'special',
                    });
                });

                let send = true;
                let ajaxResult = [];
                if(requestArray.length){
                    $.each(requestArray, function(index, item) {
                        if(item.episodesWatched === item.episodesCount && item.score === 0){
                            if(item.type == 'season'){
                                let $scoreInputWrap = $(`.seasonScore_wrap[data-malid="${item.malId}"]`);
                                $scoreInputWrap.removeClass('seasonScore_wrap_hidden');
                                $scoreInputWrap.find('input').addClass('seasonScore_conflict').show();
                                let $episodes = $scoreInputWrap.closest('.episodes-by-season__season').find('.episodes-by-season__episode:not(:has(.episode-col__label.special))');
                                let seasonRating = {count: 0, score: 0, rating: 0}
                                $episodes.each(function(){
                                    let $start = $(this).find('.ShowRating > .Rating .Rating-item');
                                    let score = $start.index($start.filter('.active').last()) + 1;
                                    if(score > 0){
                                        seasonRating.count++;
                                        seasonRating.score += score;
                                    }
                                });
                                seasonRating.rating = Math.ceil(seasonRating.score / seasonRating.count) * 2;
                                seasonRating.rating = seasonRating.rating > 10 ? 10 : seasonRating.rating;
                                $scoreInputWrap.find('input').val(seasonRating.rating);
                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $scoreInputWrap.offset().top - 250
                                }, 1000);
                            }else if(item.type == 'special'){
                                let $scoreInput = $(`.episodes-by-season__episode:has(.EpisodeWatchLabel[data-malid="${item.malId}"]) .seasonScore`);
                                $scoreInput.removeClass('seasonScore_hidden').addClass('seasonScore_conflict').show();
                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $scoreInput.offset().top - 250
                                }, 1000);
                            }
                            send = false;
                            return false
                        }
                    });
                }

                if(send){
                    let customHeaders = ['User-Agent'];
                    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
                        if (options.url.match(/^https?:/) && (options.url.indexOf('myanimelist.net') !== -1 || options.url.indexOf('shikimori.one') !== -1) && options.headers?.prefilter === 'sync' ) {
                            delete options.headers['prefilter'];
                            for (let key in options.headers) {
                                if(customHeaders.indexOf(key) !== -1){
                                    Object.defineProperty(options.headers, `custom-header-${key}`, Object.getOwnPropertyDescriptor(options.headers, key));
                                    delete options.headers[key];
                                }
                            }
                            options.headers['X-Proxy-URL'] = options.url;
                            options.url = untiy16Url + '/proxy';
                        }

                    });
                    var runRequests = function(ajaxIndex) {

                        if(ajaxIndex == requestArray.length){

                            let resultHtml = '';
                            let isError = false;
                            requestArray.forEach(function(item){
                                item.malResponse.siteName = 'MAL';
                                item.malResponse.siteUrl = 'https://myanimelist.net/anime';
                                item.shikimoriResponse.siteName = 'Shikimori';
                                item.shikimoriResponse.siteUrl = 'https://shikimori.one/animes';
                                let responseArray = [item.malResponse, item.shikimoriResponse];

                                responseArray.forEach(function(res){
                                    if(res.error) isError = true;
                                    Toastify({
                                        text: item.type == 'season' ? `${res.siteName}: ${animeName} Сезон: ${item.season}${item.multipart ? ` часть ${item.multipart_part}` : ''} — ${!res.error ? 'Успешно обновлено' : 'Произошла ошибка'}`
                                        :
                                        `${res.siteName}: ${animeName} Спешл ${item.malId} — ${!res.error ? 'Успешно обновлено' : 'Произошла ошибка'}`,

                                        destination: `${res.siteUrl}/${item.malId}`,
                                        duration: -1,
                                        close: true,
                                        className: !res.error ? 'info' : 'error',
                                        newWindow: true,
                                        offset: {
                                            y: 50
                                        },
                                    }).showToast();
                                });
                            });


                            $('.custom-save_mal').removeClass('loader-inline').prop('disabled', false).hide();

                            if(!isError){
                                $('.custom-save_myshows').prop('disabled', false).trigger('click');
                            }else{
                                alert('Произошла ошибка. Проверьте консоль. Результат не сохранен!')
                                console.log('******************** Произошла ошибка ********************');
                                console.log(requestArray);
                            }

                            requestArray = [];
                            return;
                        }

                        let doneRequestsCount = 0;
                        //////////////////////////////////////////////////////////////////////////////////
                        //ЗАПРОС НА MYANIMELIST
                        //////////////////////////////////////////////////////////////////////////////////
                        $.ajax({
                            url: `https://api.myanimelist.net/v2/anime/${requestArray[ajaxIndex].malId}/my_list_status`,
                            method: "PUT",
                            headers: {
                                "Authorization": `Bearer ${localStorage.getItem('mal_access_token')}`,
                                "Content-Type": "application/x-www-form-urlencoded",
                                "prefilter": 'sync'
                            },
                            data: {
                                status: requestArray[ajaxIndex].status_text,
                                score: requestArray[ajaxIndex].score,
                                num_watched_episodes: requestArray[ajaxIndex].episodesWatched
                            },
                            beforeSend: function() {
                               $('.custom-save_mal').addClass('loader-inline').prop('disabled', true);
                               $('.toast-close').click()
                            },
                            success: function(response){
                                response = JSON.parse(response);
                                requestArray[ajaxIndex].malResponse = response;
                                requestArray[ajaxIndex].malRestartRequest = undefined;
                                doneRequestsCount++;
                            },
                            error: function(xhr, status, error) {
                                let response = JSON.parse(xhr.responseText);
                                if(response.error === 'invalid_token' ){
                                    let client_id = '4af8eee0825570ac2d88ea0e12f7a86e';
                                    let client_secret = 'd926dbc9496ad1bb7d3fa7bab6be79476d56cac0035463efb92b4ed2b3c99db7';
                                    window.refreshTokenMal(client_id, client_secret, 'sync', ()=>{
                                            alert('Token successfully received! (myanimelist)');
                                            requestArray[ajaxIndex].malRestartRequest = 1;
                                            doneRequestsCount++;
                                    });
                                }else{
                                    console.log('MAL Api error! Check comsole!');
                                    console.log(xhr);
                                    console.log(response);

                                    requestArray[ajaxIndex].malResponse = JSON.parse(response);
                                    if(requestArray[ajaxIndex].malResponse.error === undefined){
                                        requestArray[ajaxIndex].malResponse.error = 1;
                                    }
                                    doneRequestsCount++;
                                }
                            }
                        });

                        //////////////////////////////////////////////////////////////////////////////////
                        //ЗАПРОС НА SHIKIMORI
                        //////////////////////////////////////////////////////////////////////////////////
                        $.ajax({
                            url: `https://shikimori.one/api/v2/user_rates`,
                            method: "post",
                            headers: {
                                "User-Agent": "Untiy16 api test",
                                "Authorization": `Bearer ${localStorage.getItem('shikimori_access_token')}`,
                                "prefilter": 'sync'
                            },
                            data: {
                                user_rate: {
                                    user_id: "732385",
                                    target_id: requestArray[ajaxIndex].malId,
                                    target_type: "Anime",
                                    status: requestArray[ajaxIndex].status_text,
                                    score: requestArray[ajaxIndex].score,
                                    episodes: requestArray[ajaxIndex].episodesWatched,
                               },
                            },
                            success: function(response){
                                 response = JSON.parse(response);
                                 requestArray[ajaxIndex].shikimoriResponse = response;
                                 requestArray[ajaxIndex].shikimoriRestartRequest = undefined;
                                 doneRequestsCount++;

                            },
                            error: function(xhr, status, error) {

                                let response = JSON.parse(xhr.responseText);
                                if(response.error === "invalid_token"){

                                    let client_id = 'WCQPD8EmCs5LLCXkfhdagV0db7iO1-QYm0h1b6TQ9Dw';
                                    let client_secret = 'rIy73bD3Egew1z8jnEnN6qXsMZUxJxwZ8vrgEpxc79k';
                                    window.refreshTokenShikimori(client_id, client_secret, 'sync', ()=>{
                                          alert('Token successfully refreshed! (shikimori)');
                                          requestArray[ajaxIndex].shikimoriRestartRequest = 1;
                                          doneRequestsCount++;
                                    });

                                }else{
                                    console.log('Shikimori Api error! Check comsole!');
                                    console.log(response);
                                    console.log(xhr);

                                    requestArray[ajaxIndex].shikimoriResponse = response;
                                    if(requestArray[ajaxIndex].shikimoriResponse.error === undefined){
                                        requestArray[ajaxIndex].shikimoriResponse.error = 1;
                                    }
                                    doneRequestsCount++;
                                }
                            }
                        });

                        let interval = setInterval(function(){
                            if(doneRequestsCount === 2){
                                clearInterval(interval);
                                setTimeout(function(){
                                   if(requestArray[ajaxIndex].malRestartRequest === undefined && requestArray[ajaxIndex].shikimoriRestartRequest === undefined) {
                                       ajaxResult.push(1);
                                       runRequests(++ajaxIndex);
                                   }else{
                                       runRequests(ajaxIndex);
                                   }
                                }, 1500);
                            }
                        }, 100);


                    };

                    runRequests(0);
                }

            });
        }

        /* Возвращавет начальное состояние эпизодов */
        function getSeasonsState(){
            let seasonsState = [];
            $('.episodes-by-season__season').each(function(index, el) {
                let hasChanges = Boolean($(this).find('.episodes-by-season__episode:not(:has(.episode-col__label.special)) .EpisodeWatchLabel.EpisodeWatchLabel_plus').length || $(this).find('.episodes-by-season__episode:not(:has(.episode-col__label.special)) .EpisodeWatchLabel.EpisodeWatchLabel_minus').length);
                let season = parseInt($(this).find('.title__main').text().trim());
                let $seasonEpisodes = $(this).find('.episodes-by-season__episode:not(:has(.episode-col__label.special)) .EpisodeWatchLabel');
                let episodesState = [];
                $seasonEpisodes.each(function(index, el) {
                    episodesState.push({id: $(this).data('episode-id'), state: ($(this).hasClass('checked') || $(this).hasClass('EpisodeWatchLabel_plus')) });
                });
                seasonsState.push({array: episodesState, season: season, changed: hasChanges });
            });

            return seasonsState;
        }

        function dragBoxChecking(){
            $('.mal-modal_specials > div input[type="checkbox"]').on('mousedown', function(e){
                $('mal-modal_specials > div input[type="checkbox"]').each(function(index){
                    $(this).data('state', $(this).prop('checked',))
                });

                let $this = $(this);
                let startCoordY = e.pageY;
                let finalCoordY = e.pageY;
                let direction = '';
                let $checkboxes = $('.mal-modal_specials > div input[type="checkbox"]');
                let $checkboxesUp = $($checkboxes.get().reverse());
                let $checkboxesDown = $checkboxes;

                $(this).one('mouseleave.hoverstate_modal', function(e){
                    $(this).click();
                    let state = $(this).prop('checked');
                    let thisIndexUp = $checkboxesUp.index($this[0]);
                    let thisIndexDown = $checkboxesDown.index($this[0]);

                    $(document).on('mousemove.hoverstate_modal', function(e){
                        direction = startCoordY >= e.pageY ? 'up' : 'down';
                        if(direction == 'up'){
                            $checkboxesUp.each(function(index){
                                if(index > thisIndexUp && thisIndexUp <= $checkboxesUp.length){
                                    if(e.pageY < $(this).offset().top ){
                                        $(this).prop('checked', state).data('changed', 1).attr('data-changed', 1);
                                    }else if($(this).data('changed') !== undefined && $(this).data('changed') == 1){
                                        $(this).prop('checked', $(this).data('state'));
                                    }
                                }
                            });
                        }else{
                            $checkboxesDown.each(function(index){
                                if(index > thisIndexDown && thisIndexDown <= $checkboxesDown.length){
                                    if(e.pageY > $(this).offset().top ){
                                        $(this).prop('checked', state).data('changed', 1).attr('data-changed', 1);
                                    }else if($(this).data('changed') !== undefined && $(this).data('changed') == 1){
                                        $(this).prop('checked', $(this).data('state'));
                                    }
                                }
                            });
                        }
                    });

                });
            });

            $(document).on('mouseup', function(){
                $('.mal-modal_specials > div input[type="checkbox"]').off('mouseover.hoverstate_modal').off('mouseleave.hoverstate_modal').data('changed', 0).removeAttr('data-changed');
                $(document).off('mousemove.hoverstate_modal');
            });
        }

        $(document).on('mouseup', '.toast-close', ()=>$('.toast-close').click());

        function htmlEntitiesDecode(str) {
            return String(str).replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"');
        }

        function htmlEntities(str) {
            return String(str).replaceAll(/&/g, '&amp;').replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/"/g, '&quot;');
        }


    }
})(jQueryMod); } }, 100);




GM_addStyle(`
    .custom-save_mal{
        background-color: #2f52a2;
        align-items: center;
        white-space: nowrap;
    }

    .mal-modal-show .mal-modal-overlay,
    .mal-modal-show .mal-modal{
        display: block;
    }

    .mal-modal-overlay{
        display: none;
        position: fixed;
        width: 100%;
        height: 100%;
        background: #0000009e;
        z-index: 10;
        top: 0;
        left: 0;
    }
    .mal-modal{
        display: none;
        padding: 15px 15px 0 15px;
        position: fixed;
        z-index: 11;
        width: 600px;
        max-height: 80%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        overflow-y: scroll;
    }
    .mal-modal > div:not(.mal-modal_specials){
        display: flex;
        align-items: center;
    }
    .mal-modal .mal-search-item{
        margin-bottom: 15px;
    }
    .mal-modal_specials:not(:empty){
        margin-bottom: 15px;
    }
    .mal-modal .mal-image{
        display: inline-block;
        height: 38px;
        min-width: 58px;
        background-position: center top;
        background-repeat: no-repeat;
        background-size: cover;
        border: #ebebeb 1px solid;
    }
    .mal-modal a{
        padding-left: 15px;
        padding-right: 15px;
    }
    .mal-modal label{
        margin-right: 5px;
        font-size: 12px;
        color: black;
        white-space: nowrap;
    }
    .mal-modal .mal-checkbox-wrap{
        display: flex;
        align-items: center;
        margin-left: auto;
    }
    .mal-modal button{
        width: 100%;
        margin-bottom: 15px;
    }
    .mal-modal button.mal-modal_save-specials{
        display: none;
    }
    
    mal-modal_search {
        margin-bottom: 15px;
    }
    .mal-modal_search button {
        margin: 0 0 0 11px;
        width: 70px;
    }

    .mal-modal_search input {
        flex-grow: 1;
    }

    .episodes-by-season__season{
        position: relative;
    }

    .seasonScore_wrap{
        display: flex;
        align-items: center;
        margin-left: auto;
        font-weight: 500;
        position: absolute;
        z-index: 2;
        right: 100px;
        top: 11px;
    }
    .seasonScore_wrap.seasonScore_wrap_hidden{
        display: none;
    }
    .seasonScore_wrap .seasonScore{
        margin-left: 15px;
    }
    .seasonScore.seasonScore_hidden{
        display: none;
    }
    .seasonScore{
        border-radius: 2px;
        border-width: 1px;
    }
    .seasonScore.seasonScore_conflict{
        border-color: red;
        box-shadow: 0px 0px 12px 2px #ff000042;
    }

    span.labe.bcFirmB .seasonScore.seasonScore_special{
        display: none;
        position: absolute;
        left: 100%;
        height: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-left: 10px;
    }
    span.labe.bcFirmB{
        position: relative;
    }

    .mal-update-popup{
        padding: 15px;
        padding-right: 40px;
        background: #252525;
        position: fixed;
        right: 30px;
        top: 30px;
        z-index: 100;
        box-shadow: 0 0 9px 2px #ffffff2e;
    }
    .mal-update-popup .iconNote._del{
        position: absolute;
        top: 10px;
        right: 10px;
    }
    .mal-update-popup .mal-update-item a{
        color: #f00;
        text-decoration: underline;
    }
    .mal-update-popup .mal-update-item.mal-update-item-200 a{
        color: #0c3;
    }
    .save-episodes-mal{display: flex; justify-content: center; align-items: center; background: rgb(0, 117, 255);}
    .save-episodes-mal b{white-space: nowrap;}

    .loader-inline::after {
      content: " ";
      display: inline-block;
      width: 0;
      height: 0;
      margin-left: 5px;
      border-radius: 50%;
      box-sizing: border-box;
      border: 10px solid #fff;
      border-color: #fff transparent #fff transparent;
      animation: loader-inline 1.2s infinite;
    }
    @keyframes loader-inline {
      0% {
        transform: rotate(0);
        animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
      }
      50% {
        transform: rotate(900deg);
        animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
      }
      100% {
        transform: rotate(1800deg);
      }
    }

    .mal-modal_special-name{
        font-size: 14px;
        color: black;
    }

    .mal-modal:not(.specials-mode) .mal-checkbox-wrap .span{display: none;}
    .mal-modal.specials-mode .mal-checkbox-wrap input{display: none;}
    .mal-modal.specials-mode .mal-checkbox-wrap label{display: none;}
    .mal-modal.specials-mode .mal-checkbox-wrap span{width: 15px; content: url('data:image/svg+xml; utf8, <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-plus fa-w-14 fa-3x"><path fill="dodgerblue" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" class=""></path></svg>'); cursor: pointer;}
    .mal-modal.specials-mode .mal-checkbox-wrap span.mal-span-used{content: url('data:image/svg+xml; utf8, <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-plus fa-w-14 fa-3x"><path fill="green" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" class=""></path></svg>');}
    .plateNote.withNoteControls{
        word-break: break-all;
    }
    footer .container{
        padding-bottom: 6rem;
    }



`);
