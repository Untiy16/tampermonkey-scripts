

let jQueryModInterval = setInterval(function() { if(typeof jQueryMod !== 'undefined' && window?.$nuxt?._isMounted) { clearInterval(jQueryModInterval); (function($) {
    'use strict';
    let shikimoriAccessToken = localStorage.getItem('shikimori_access_token');
    let shikimoriRefreshToken = localStorage.getItem('shikimori_refresh_token');
    let shikimoriExpiresInDate = localStorage.getItem('shikimori_expires_in_date');
    let shikimoriExpiresInDays = shikimoriExpiresInDate === null ? null : Math.floor((new Date(shikimoriExpiresInDate) - new Date()) / 1000/60/60);

    let time = new Date().getTime();

    let client_id = 'WCQPD8EmCs5LLCXkfhdagV0db7iO1-QYm0h1b6TQ9Dw';
    let client_secret = 'rIy73bD3Egew1z8jnEnN6qXsMZUxJxwZ8vrgEpxc79k';
    let redirect_uri = 'https://myshows.me/profile/shikimori-token-redirect';

    let customHeaders = ['User-Agent'];
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        if (options.url.match(/^https?:/) && options.url.indexOf('shikimori.one') !== -1 && options.headers?.prefilter === 'shikimori_access_token' ) {
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

    if(location.href.indexOf('myshows.me/view') !== -1 && (shikimoriAccessToken == null || shikimoriRefreshToken == null || shikimoriExpiresInDate == null || shikimoriExpiresInDays <= 3) ){

        if(shikimoriExpiresInDate !== null && shikimoriExpiresInDays <= 3 && shikimoriRefreshToken !== null){
            // refreshTokenShikimori(client_id, client_secret, 'shikimori_access_token', ()=> alert('Token successfully refreshed! (shikimori)'))
            refreshTokenShikimori(client_id, client_secret, 'shikimori_access_token', ()=> console.log('Token successfully refreshed! (shikimori)'))

        }else{
            let authorize_url = `https://shikimori.one/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=user_rates`;
            $('body').prepend(`<a class="shikimori-token-link" href="${authorize_url}" target="_blank">Get shikimori access token</a>`);
        }


    }else if(location.href.indexOf('myshows.me/profile/shikimori-token-redirect') !== -1){

        $('h1.title__main').text('Получение токена для shikimori');
        $('.NotFound-image').attr('src', 'https://cs11.pikabu.ru/post_img/2019/05/16/0/155795625316247472.jpg').removeAttr('srcset');
        $('title').text('Получение токена для shikimori');

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        if( urlParams.get('error') !== null ){
            alert(`Error: ${urlParams.get('error')}`); return;
        }

        $.ajax({
          url: "https://shikimori.one/oauth/token",
          method: "POST",
          headers: {
            "User-Agent": "Untiy16 api test",
            "prefilter": 'shikimori_access_token'
          },
          data: {
              grant_type: "authorization_code",
              client_id: client_id,
              client_secret: client_secret,
              code: urlParams.get('code'),
              redirect_uri: redirect_uri,
          },
          success: function(response){
              response = JSON.parse(response);

              localStorage.setItem('shikimori_access_token', response.access_token);
              localStorage.setItem('shikimori_refresh_token', response.refresh_token);
              localStorage.setItem('shikimori_expires_in', response.expires_in);
              localStorage.setItem('shikimori_expires_in_date', new Date(new Date().getTime() + parseInt(response.expires_in) * 1000) );

              alert('Token successfully received! (shikimori)');
            },
            error: function(xhr, status, error) {

              let response = xhr.responseText ? JSON.parse(xhr.responseText) : xhr;
              alert(`Error! Check console!`);
              console.log(`Token error:`);
              console.log(response);
            }

        });
    }

    function refreshTokenShikimori(client_id, client_secret, prefilter, callback) {
        $.ajax({
          url: "https://shikimori.one/oauth/token",
          method: "POST",
          timeout: 0,
          headers: {
            "User-Agent": "Untiy16 api test",
            "prefilter": prefilter
          },
          data: {
              grant_type: "refresh_token",
              client_id: client_id,
              client_secret: client_secret,
              refresh_token: localStorage.getItem('shikimori_refresh_token'),
          },
          success: function(response){
              response = JSON.parse(response);
              localStorage.setItem('shikimori_access_token', response.access_token);
              localStorage.setItem('shikimori_refresh_token', response.refresh_token);
              localStorage.setItem('shikimori_expires_in', response.expires_in);
              localStorage.setItem('shikimori_expires_in_date', new Date(new Date().getTime() + parseInt(response.expires_in) * 1000) );

              callback();

            },
            error: function(xhr, status, error) {
                let response = xhr.responseText ? JSON.parse(xhr.responseText) : xhr;

                if(response.error !== undefined || response.responseJSON?.error !== undefined ){
                  let error = response.error ? response.error : response.responseJSON?.error;
                  let error_description = response.error_description ? response.error_description : response.responseJSON?.error_description;
                  alert(`Error: ${error}. Message: ${error_description}.`);
                  if(confirm(' Попробовать получить токен заново вручную? (страница будет перезагружена, а текщий токен удален).')){
                      localStorage.removeItem('shikimori_access_token');
                      location.reload();
                   }
                   return;
              }
           }
        });
    }

    let refreshTokenShikimoriCode = `window.refreshTokenShikimori = ${refreshTokenShikimori}`;
    let refreshTokenShikimoriScpript = document.createElement('script');
    refreshTokenShikimoriScpript.innerText = refreshTokenShikimoriCode;
    document.body.appendChild(refreshTokenShikimoriScpript);

})(jQueryMod); } }, 100);

GM_addStyle(`

.shikimori-token-link{
    display: flex;
    height: 25px;
    width: 100%;
    background: #456;
    color: white;
    text-align: center;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    position: relative;
}
`);
