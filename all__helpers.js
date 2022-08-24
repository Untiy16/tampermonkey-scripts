/* Files */
// file:///F:/Projects/0Tampermonkey0/jquery-3.4.1-jQueryMod-noconflict.js
// https://raw.githubusercontent.com/Untiy16/links/master/jquery-3.4.1-jQueryMod-noconflict.js
// https://raw.githubusercontent.com/Untiy16/links/master/copyLinkText6.js?q=3

let jQueryModScript= document.createElement('script');
jQueryModScript.setAttribute('src','https://cdn.jsdelivr.net/gh/Untiy16/links@master/jquery-3.4.1-jQueryMod-noconflict.js');
document.head.appendChild(jQueryModScript);

var code = `window.c = console.log.bind(console); window.GM_addStyle = function(a){let b=document.getElementById("GM_addStyleBy8626")||function(){let a=document.createElement("style");return a.type="text/css",a.id="GM_addStyleBy8626",document.head.appendChild(a),a}();b.appendChild(document.createTextNode(a))}; window.untiy16Url = 'https://untiy16.s-host.net/api'; window.untiy16JikanHost = 'https://api.jikan.moe';`;
var script = document.createElement('script');
script.innerText = code;
document.body.appendChild(script);
console.log('********** jQuery $ loaded successfully **********');
