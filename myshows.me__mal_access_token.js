
let jQueryModInterval = setInterval(function() { if(typeof jQueryMod !== 'undefined') { clearInterval(jQueryModInterval); (function($) {
    'use strict';

    let malAccessToken = localStorage.getItem('mal_access_token');
    let malRefreshToken = localStorage.getItem('mal_refresh_token');
    let malExpiresInDate = localStorage.getItem('mal_expires_in_date');
    let malExpiresInDays = malExpiresInDate === null ? null : Math.floor((new Date(malExpiresInDate) - new Date()) / 1000/60/60/24);

    let time = new Date().getTime();

    let client_id = '4af8eee0825570ac2d88ea0e12f7a86e';
    let client_secret = 'd926dbc9496ad1bb7d3fa7bab6be79476d56cac0035463efb92b4ed2b3c99db7';
    let redirect_uri = 'https://myshows.me/profile/mal-token-redirect';

    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        if (options.url.match(/^https?:/) && options.url.indexOf('myanimelist.net') !== -1 && options.headers?.prefilter === 'myanimelist_access_token' ) {
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

    if(location.href.indexOf('myshows.me/view') !== -1 && (malAccessToken == null || malRefreshToken == null || malExpiresInDate == null || malExpiresInDays <= 3) ){

        if(malExpiresInDate !== null && malExpiresInDays <= 3){
            refreshTokenMal(client_id, client_secret, 'myanimelist_access_token', ()=> console.log('Token successfully refreshed! (myanimelist)'));
            // refreshTokenMal(client_id, client_secret, 'myanimelist_access_token', ()=> alert('Token successfully refreshed! (myanimelist)'));
        }else{
            function base64URLEncode(str) {
                return str.toString('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=/g, '');
            }

            function makeId(length) {
               let result           = '';
               let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
               let charactersLength = characters.length;
               for ( let i = 0; i < length; i++ ) {
                  result += characters.charAt(Math.floor(Math.random() * charactersLength));
               }
               return result;
            }


            let state = makeId(5);

            let code_verifier = base64URLEncode(makeId(64));
            let code_challenge = code_verifier;

            localStorage.setItem('mal_auth_state', state);
            localStorage.setItem('mal_auth_code_verifier', code_verifier);


            let authorize_url = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${client_id}&state=${state}&redirect_uri=${redirect_uri}&code_challenge=${code_challenge}&code_challenge_method=plain`;

            $('body').prepend(`<a class="mal-token-link" href="${authorize_url}" target="_blank">Get MAL access token</a>`);
        }


    }else if(location.href.indexOf('myshows.me/profile/mal-token-redirect') !== -1){

        $('h1.title__main').text('Получение токена для myanimelist');
        $('.NotFound-image').attr('src', 'https://cdn.myanimelist.net/images/mal-logo-large.png').removeAttr('srcset');
        $('title').text('Получение токена для myanimelist');


        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        if( localStorage.getItem('mal_auth_state') !== urlParams.get('state') ){
            alert('Authorization server returned an invalid state parameter'); return;
        }

        if( urlParams.get('error') !== null ){
            alert(`Error: ${urlParams.get('error')}`); return;
        }

        if( localStorage.getItem('mal_auth_code_verifier') === null ) {
            alert(`code_verifier is missing in localStorage`); return;
        }

        let code_verifier = localStorage.getItem('mal_auth_code_verifier');

        $.ajax({
            url: 'https://myanimelist.net/v1/oauth2/token',
            headers: {
                "prefilter": 'myanimelist_access_token'
            },
            method: 'post',
            data: {
                grant_type: 'authorization_code',
                code: urlParams.get('code'),
                redirect_uri: redirect_uri,
                client_id: client_id,
                client_secret: client_secret,
                code_verifier: code_verifier
            },
            success: function(response){
                response = JSON.parse(response);
                c(response)

                if(response.error !== undefined){
                    alert(`Error: ${response.error}. Message: ${response.message}`); return;
                }

                localStorage.setItem('mal_access_token', response.access_token);
                localStorage.setItem('mal_refresh_token', response.refresh_token);
                localStorage.setItem('mal_expires_in', response.expires_in);
                localStorage.setItem('mal_expires_in_date', new Date(new Date().getTime() + parseInt(response.expires_in) * 1000) );

                alert('Token successfully received! (myanimelist)');

            },
            error: function(xhr, status, error) {
                let response = JSON.parse(xhr.responseText);
                alert(`Error! Check console!`);
                console.log(`Token error:`);
                console.log(response);
            }

        });

    }


    function refreshTokenMal(client_id, client_secret, prefilter, callback) {
        $.ajax({
            url: 'https://myanimelist.net/v1/oauth2/token',
            method: 'post',
            headers: {
                "prefilter": prefilter
            },
            data: {
                grant_type: 'refresh_token',
                refresh_token: localStorage.getItem('mal_refresh_token'),
                client_id: client_id,
                client_secret: client_secret,
            },
            success: function(response){
                response = JSON.parse(response);
                c(response);

                callback();

                if(response.error !== undefined){
                    alert(`Error: ${response.error}. Message: ${response.message}.`);
                    if(confirm(' Попробовать получить токен заново вручную? (страница будет перезагружена, а текщий токен удален).')){
                        localStorage.removeItem('mal_access_token');
                        location.reload();
                    }
                    return;
                }

                localStorage.setItem('mal_access_token', response.access_token);
                localStorage.setItem('mal_refresh_token', response.refresh_token);
                localStorage.setItem('mal_expires_in', response.expires_in);
                localStorage.setItem('mal_expires_in_date', new Date(new Date().getTime() + parseInt(response.expires_in) * 1000) );


            }

        });
    }

    let refreshTokenMalCode = `window.refreshTokenMal = ${refreshTokenMal}`;
    let refreshTokenMalScpript = document.createElement('script');
    refreshTokenMalScpript.innerText = refreshTokenMalCode;
    document.body.appendChild(refreshTokenMalScpript);

})(jQueryMod); } }, 100);

GM_addStyle(`

.mal-token-link{
    display: flex;
    height: 25px;
    width: 100%;
    background: #4f74c8;
    color: white;
    text-align: center;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    position: relative;
}
`);
