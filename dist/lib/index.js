"use strict";function _defineProperty(n,e,t){return e in n?Object.defineProperty(n,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[e]=t,n}function assign(n,e){for(var t in e)if(hasOwnProperty.call(e,t)){var r=toString.call(n[t]).toLowerCase(),o=toString.call(e[t]).toLowerCase();if(r==o&&"[object object]"==o){assign(n[t],e[t]);continue}n[t]=e[t]}}function vueFunOn(n){pluginArr.push(n)}function vueFunInstall(n,e){Vue=n,e&&pluginArr.push(e)}function warn(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"before";console.warn(msgOpt[n]||n||"")}function vueFun(n){function e(n,e){void 0===e&&(e=this);for(var t=n.split("."),r=0;r<t.length&&null!=(e=e[t[r]]);r+=1);return e}function t(n){var e=n.resolve,t=n.key,r=n.args,o=n.reject,i=void 0;if("string"==typeof t?i=m[t]:"function"==typeof t&&(i=t),!i)return o&&o(null),null;var u=i.apply(m,r);return e&&e(u),u}function r(n){for(var e=arguments.length,r=Array(e>1?e-1:0),o=1;o<e;o++)r[o-1]=arguments[o];return function(){for(var e=arguments.length,o=Array(e),i=0;i<e;i++)o[i]=arguments[i];o.unshift.apply(o,r);var u={key:n,args:o};return m?t(u):new Promise(function(n,e){u.reject=e,u.resolve=n,b.push(u)})}}function o(n,t){if(!m)return null;if(void 0===n)return m;var r=e(n,m);return void 0===t?r:r.apply(m,t)}function i(n,e){Object.defineProperty(n,e,{get:function(){return(m||O)[e]},set:function(n){(m||O)[e]=n}})}function u(n,t,r){var o=m||n;if("string"==typeof t){if(void 0===r)return e(t,o);t=_defineProperty({},t,r)}var u={};return assign(n,t),Object.keys(t).forEach(function(n){i(u,n)}),Object.freeze(u)}function a(n,e){return u(O,n,e)}function f(n,e){return u(k,n,e)}function c(n,e,t){if($)return void warn();var r=void 0,o=void 0,i=void 0,u=void 0;n&&"string"!=typeof n&&(r=n.format,o=n.isFreeze,i=n.isBack,n.def&&(u=n.def),n=n.prot),o&&void 0===i&&(i=!0);var a=e;"string"==typeof e&&(a=_defineProperty({},e,t),t=null,e=null);var f=F[n];f||(f=F[n]=u||{});var c=i&&{}||null;for(var l in a)if(hasOwnProperty.call(a,l)&&(f[l]=a[l],c))if(r){var s=r({value:a[l],backData:c,key:l,opt:f});void 0!==s&&(c[l]=s)}else c[l]=a[l];return c&&o?Object.freeze(c):c}function l(n){var e=n.value;return"function"==typeof e?r(e):e}function s(n){return function(e,t){return c(n,e,t)}}function p(n,e){if($)return void warn();var t=void 0;return"string"!=typeof n&&n&&(t=n.format,n=n.prot),F[n]=e,t?t(e):e}function v(n){return function(e){return p(n,e)}}function d(){if($)return void warn();w.push.apply(w,arguments)}function y(n){return function(){for(var e=0;e<n.length;e+=1)n[e].apply(this,arguments)}}function g(){var n={},e={get:function(){return n},on:function(t,r){if("string"==typeof t){var o=n[t];return o||(o=n[t]=[]),void o.push(r)}for(var i in t)e.on(i,t[i]);return e},make:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e;"string"==typeof e&&((t=F[e])||(t=F[e]={}));for(var r in n)t[r]=y(n[r]);return t},emit:function(e){for(var t=n[e]||[],r=arguments.length,o=Array(r>1?r-1:0),i=1;i<r;i++)o[i-1]=arguments[i];for(var u=0;u<t.length;u+=1)t[u].apply(m,o)},currying:function(n){return function(t){return e.on(n,t)}},has:function(){for(var e in n)return!0;return!1}};return e}var h={},m=void 0,$=!1,b=[],O={},k={},F={data:function(){return O},setup:function(){return k}},w=[],j=g();j.on("beforeCreate",function(){for(m=this;b.length;)t(b.shift())}),j.on("created",function(){m=this}),j.on("destroyed",function(){m=null,$=!1;for(var n in h)0==n.indexOf("$handleT$")&&clearTimeout(h[n]),0==n.indexOf("$handleI$")&&clearInterval(h[n]),h[n]=void 0,delete h[n]});var P=r("$emit"),x={temp:h,options:F,data:O,setup:k,$setOpt:c,$setProt:p,$vm:o,$bindNext:r,$name:v("name"),$mixin:d,$components:s({prot:"components",sBack:!1}),$directives:s({prot:"directives",isBack:!1}),$props:s({prot:"props",isFreeze:!0,format:function(n){var e=n.backData,t=n.key,r=n.value,o={get:function(){return m?m[t]:null}},i="";"[object object]"==toString.call(r).toLowerCase()&&(i=r.setFn,i&&(o.set="function"!=typeof i?function(n){P(i,n)}:i),delete r.setFn),Object.defineProperty(e,t,o)}}),$data:a,$setup:f,$computed:s({prot:"computed",isFreeze:!0,format:function(n){var e=n.backData,t=n.key;Object.defineProperty(e,t,{get:function(){return m?m[t]:null},set:function(n){m&&(m[t]=n)}})}}),$filters:s({prot:"filters",isFreeze:!0,format:l}),$model:s({prot:"model",isBack:!1}),$watch:function(n,e){return function(){$?e.apply(void 0,arguments):n.apply(void 0,arguments)}}(s({prot:"watch",isBack:!1}),r("$watch")),$methods:s({prot:"methods",isFreeze:!0,format:l}),$lifecycle:j.on,$created:j.currying("created"),$mounted:j.currying("mounted"),$destroyed:j.currying("destroyed"),$emit:P,$nextTick:r("$nextTick")},A=[];return pluginArr.forEach(function(n){n({after:function(n){A.push(n)},fnArg:x,lifecycle:j,makeLifecycle:g,setOpt:s,setProt:v,fnToBindVM:l,quickVueNext:r})}),n&&n(x),A.forEach(function(n){n(x)}),j.make(F),w.length&&(F.mixins=w),$=!0,console.log(F),F}Object.defineProperty(exports,"__esModule",{value:!0}),exports.vueFunOn=vueFunOn,exports.vueFunInstall=vueFunInstall;var hasOwnProperty=Object.prototype.hasOwnProperty,toString=Object.prototype.toString,Vue=void 0,pluginArr=[],msgOpt={before:"vue已经初始化，请在初始化之前调用",after:"vue还没初始化，请在created之后调用"};vueFun.on=vueFunOn,vueFun.install=vueFunInstall,exports.default=vueFun;