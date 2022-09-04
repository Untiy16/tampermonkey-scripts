let jQueryModInterval = setInterval(function() { if(typeof jQueryMod !== 'undefined' && window?.$nuxt?._isMounted) { clearInterval(jQueryModInterval); (function($) {

    $('.User-showsMore').click();

    let interval = setInterval(function(){
        if(!$('.User-showsMore').length){
            clearInterval(interval);
            $('.Tabs-container .TabsItem').each(function(){
                $(this).replaceWith($(this).clone());
            });
            if( localStorage.mal_date === undefined || localStorage.mal_list === undefined || (Math.abs( new Date() - new Date(localStorage.mal_date) ) / 36e5) > 24 ){
                console.log('MAL animelist - from SITE!')
                localStorage.mal_date = new Date();
                $.ajax({
                    // url: 'https://api.jikan.moe/v3/user/untiy16/animelist/plantowatch',
                    url: untiy16JikanHost + '/v3/user/untiy16/animelist/plantowatch',
                    type: 'GET',
                    async: false,
                    success: function( data ) {
                        localStorage.mal_list = JSON.stringify(data.anime);
                    },
                    fail: function( data ) {

                        localStorage.mal_list = localStorage.mal_list ? localStorage.mal_list : JSON.stringify([]);
                    },
                    error: function( data ) {
                        localStorage.mal_list = localStorage.mal_list ? localStorage.mal_list : JSON.stringify([]);
                    }
                })
            }else{
                console.log('MAL animelist - from localStorage!')
            }


            let animeListArray = JSON.parse(localStorage.mal_list);
            let animeListHTML = '';
            animeListArray.forEach(function(item){
                animeListHTML += `
                    <div class="User-show UserShowItem">
                       <a href="${item.url}" class="UserShowItem-image" style="background-image:url(${item.image_url});"></a>
                       <div class="UserShowItem-content">
                          <div class="UserShowItem-details">
                             <div class="UserShowItem-header">
                                <div class="UserShowItem-header__top">
                                   <a href="${item.url}" class="UserShowItem-title">
                                   ${item.title}
                                   </a>
                                   <div class="ShowStatusLabel UserShowItem-status _new">
                                      <svg xmlns="http://www.w3.org/2000/svg" class="icon sprite-icons">
                                         <use href="/_nuxt/8c706c7ad170903529cca182d67e1f47.svg#i-show-status-new" xlink:href="/_nuxt/8c706c7ad170903529cca182d67e1f47.svg#i-show-status-new"></use>
                                      </svg>
                                   </div>
                                </div>
                                <div class="UserShowItem-header__bottom">
                                   <div class="UserShowItem-titleOriginal">
                                      ${item.title}
                                   </div>
                                </div>
                             </div>
                             <div class="ShowRating UserShowItem-rating">
                                <div class="Rating s">
                                   ${([1,2,3,4,5]).map(function(key) {
                                       return `<div title="" class="Rating-item ${key <= Math.round(item.score) ? 'active' : ''}">
                                                  <svg xmlns="http://www.w3.org/2000/svg" class="Rating-star icon sprite-icons">
                                                     <use href="/_nuxt/8c706c7ad170903529cca182d67e1f47.svg#i-star" xlink:href="/_nuxt/8c706c7ad170903529cca182d67e1f47.svg#i-star"></use>
                                                  </svg>
                                               </div>`;
                                   }).join("")}
                                </div>
                             </div>
                          </div>
                          <div class="Progress UserShowItem-progress m">
                             <div class="Progress-slots">
                                <div class="Progress-main"></div>
                                <div class="Progress-secondary"><span class="UserShowItem-watched">${item.watched_episodes}</span> из ${item.total_episodes}
                                </div>
                             </div>
                             <div class="Progress-container">
                                <div class="Progress-value" style="width:${item.watched_episodes / item.total_episodes}%;"></div>
                             </div>
                          </div>
                       </div>
                    </div>
                `;
            });

            $(`<div class="TabsItem TabsItem-mal"><div class="TabsItem-container"><div class="TabsItem-counter">${animeListArray.length}</div><div class="TabsItem-title TabsItem-description">Предстоящие (MAL)</div></div></div>`).insertAfter($('.Tabs-container .TabsItem').last());
            $(`<div title="Предстоящие (MAL)" style="display:none;" class="TabsContent-mal">
                   ${animeListHTML}
               </div>
            `).insertAfter($('.User-shows .Container > div').last());

            $('.User-shows .Container > div[style="display:none;"]').addClass('tabContentHidden').removeAttr('style');

            $('.Tabs-container .TabsItem').on('click', function(e){
                $('.Tabs-container .TabsItem').removeClass('active');
                let index = $('.Tabs-container .TabsItem').index($(this).addClass('active'));
                $('.User-shows .Container > div').addClass('tabContentHidden').eq(index).removeClass('tabContentHidden');
            });

            let malPlanToWatchCode = `unsafeWindow.MalPlnDone = true;`;
            let malPlanToWatchScript = document.createElement('script');
            malPlanToWatchScript.innerHTML = malPlanToWatchCode;
            document.body.appendChild(malPlanToWatchScript);

        }
    }, 300);


})(jQueryMod); } }, 100);

GM_addStyle(`
.tabs_head ul li > span, .tabs_head ul li > a{
    min-width: 8em !important;
    padding: 1rem 0.7em !important;
}

.tabContentHidden{
    display: none;
}

`);
