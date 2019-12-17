"use strict";function _defineProperty(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function vueFunOn(e){pluginArr.push(e)}function beforeFn(){var e=this.$options[mergeKey];e&&beforeFns[e]&&beforeFns[e].call(this)}function vueFunInstall(e,n){Vue||(Vue=e,Vue.mixin({beforeCreate:beforeFn,created:beforeFn}),Vue.config.optionMergeStrategies[mergeKey]=function(e,n){return n},n&&pluginArr.push(n))}function warn(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"before";console.warn(e,msgOpt[n]||n||"")}function vueFun(e){function n(e,n){void 0===n&&(n=this);for(var t=e.split("."),r=0;r<t.length&&null!=(n=n[t[r]]);r+=1);return n}function t(e){var n=e.key,t=e.isEx,r=e.arg1,o=e.arg2;if(!n)return null;var i=F;if("string"==typeof n){for(var u=n.split("."),f=u.pop(),a=0;a<u.length&&null!=(i=i[u[a]]);a+=1);if(t&&0==o.length)return i;if(!i||!i[f])return null;n=i[f]}var c=r.concat(o);if("function"==typeof n){return n.apply(i,c)}return n}function r(e){for(var n=arguments.length,r=Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];var i=!1;return"string"==typeof e&&(e=e.replace(/\+(\w+)$/,function(e,n){return i=!0,"."+n})),function(){for(var n=arguments.length,o=Array(n),u=0;u<n;u++)o[u]=arguments[u];var f={isEx:i,key:e,arg1:r,arg2:o};return F?t(f):(warn(e,"after"),null)}}function o(e,t){if(!F)return null;if(void 0===e)return F;var r=n(e,F);return void 0===t?r:r.apply(F,t)}function i(e,n,t){Object.defineProperty(e,n,{get:function(){return(F||t)[n]},set:function(e){(F||t)[n]=e}})}function u(e,n){for(var t in n)if(hasOwnProperty.call(n,t)){if(F&&F!=e&&null==e[t]){F.$set(e,t,n[t]);continue}var r=toString.call(e[t]).toLowerCase(),o=toString.call(n[t]).toLowerCase();if(r==o&&"[object object]"==o){u(e[t],n[t]);continue}e[t]=n[t]}}function f(e,t){var r=F||k;if("string"==typeof e){if(void 0===t)return n(e,r);e=_defineProperty({},e,t)}u(r,e);var o={};return Object.keys(e).forEach(function(e){i(o,e,k)}),Object.freeze(o)}function a(e,t){if("string"==typeof e){if(void 0===t)return n(e,F||w);e=_defineProperty({},e,t)}if(O)return warn("after"),null;var r={};for(var o in e)w[o]=e[o],i(r,o,w);return Object.freeze(r)}function c(e,n,t){if(O)return void warn("[$setOpt]");var r=void 0,o=void 0,i=void 0,u=void 0;e&&"string"!=typeof e&&(r=e.format,o=e.isFreeze,i=e.isBack,e.def&&(u=e.def),e=e.prot),o&&void 0===i&&(i=!0);var f=n;"string"==typeof n&&(f=_defineProperty({},n,t),t=null,n=null);var a=x[e];a||(a=x[e]=u||{});var c=i&&{}||null;for(var l in f)if(hasOwnProperty.call(f,l)&&(a[l]=f[l],c))if(r){var s=r({value:f[l],backData:c,key:l,opt:a});void 0!==s&&(c[l]=s)}else c[l]=f[l];return c&&o?Object.freeze(c):c}function l(e){var n=e.value;return"function"==typeof n?r(n):n}function s(e){return function(n,t){return c(e,n,t)}}function p(e,n){if(O)return void warn("[$setProt]");var t=void 0;return"string"!=typeof e&&e&&(t=e.format,e=e.prot),x[e]=n,t?t(n):n}function v(e){return function(n){return p(e,n)}}function d(){if(O)return void warn("[mixin]");P.push.apply(P,arguments)}function y(e){return function(){for(var n=0;n<e.length;n+=1)e[n].apply(this,arguments)}}function g(){var e={},n={get:function(){return e},on:function(t,r){if("string"==typeof t){var o=e[t];return o||(o=e[t]=[]),void o.push(r)}for(var i in t)n.on(i,t[i]);return n},make:function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=n;"string"==typeof n&&((t=x[n])||(t=x[n]={}));for(var r in e)t[r]=y(e[r]);return t},emit:function(n){for(var t=e[n]||[],r=arguments.length,o=Array(r>1?r-1:0),i=1;i<r;i++)o[i-1]=arguments[i];for(var u=0;u<t.length;u+=1)t[u].apply(F,o)},currying:function(e){return function(t){return n.on(e,t)}},has:function(){for(var n in e)return!0;return!1}};return n}function m(e){return function(n){e($[n]),null==j[n]&&(j[n]=$[n],delete $[n],Object.defineProperty($,n,{get:function(){return j[n]},set:function(t){j[n]=t,F||e(t)}}))}}function h(){for(var e in $){var n=e.match(/^\$(w+)\$/);if(n&&_[n[1]])return void _[n[1]]($[e],e,$);$[e]=void 0,delete $[e]}}function b(){F=this}var $={},F=void 0,O=!1,k={},w={},x={data:function(){return k},setup:function(){return w}},P=[],j={},_={T:m(clearTimeout),I:m(clearInterval),D:function(e){$[e].destroy(),delete $[e]}},z=g(),A=x[mergeKey]=A="#"+execFunIndex++;Vue?beforeFns[A]=b:(z.on("beforeCreate",b),z.on("created",b));var I=r("$emit"),V={temp:$,tempFn:_,options:x,data:k,setup:w,$setOpt:c,$setProt:p,$vm:o,$bindNext:r,$name:v("name"),$mixin:d,$components:s({prot:"components",sBack:!1}),$directives:s({prot:"directives",isBack:!1}),$props:s({prot:"props",isFreeze:!0,format:function(e){var n=e.backData,t=e.key,r=e.value,o={get:function(){return F?F[t]:null}},i="";"[object object]"==toString.call(r).toLowerCase()&&(i=r.setFn,i&&(o.set="function"!=typeof i?function(e){I(i,e)}:i),delete r.setFn),Object.defineProperty(n,t,o)}}),$data:f,$setup:a,$computed:s({prot:"computed",isFreeze:!0,format:function(e){var n=e.backData,t=e.key;Object.defineProperty(n,t,{get:function(){return F?F[t]:null},set:function(e){F&&(F[t]=e)}})}}),$filters:s({prot:"filters",isFreeze:!0,format:l}),$model:s({prot:"model",isBack:!1}),$watch:function(e,n){return function(){O?n.apply(void 0,arguments):e.apply(void 0,arguments)}}(s({prot:"watch",isBack:!1}),r("$watch")),$methods:s({prot:"methods",isFreeze:!0,format:l}),$lifecycle:z.on,$created:z.currying("created"),$mounted:z.currying("mounted"),$destroyed:z.currying("destroyed"),$emit:I,$nextTick:r("$nextTick")},B=[];return pluginArr.forEach(function(e){e({after:function(e){B.push(e)},fnArg:V,lifecycle:z,makeLifecycle:g,setOpt:s,setProt:v,fnToBindVM:l,quickVueNext:r})}),e&&e(V),B.forEach(function(e){e(V)}),z.on("destroyed",function(){F=null,O=!1,h()}),z.make(x),P.length&&(x.mixins=P),O=!0,x}Object.defineProperty(exports,"__esModule",{value:!0}),exports.vueFunOn=vueFunOn,exports.vueFunInstall=vueFunInstall;var hasOwnProperty=Object.prototype.hasOwnProperty,toString=Object.prototype.toString,Vue=void 0,pluginArr=[],beforeFns={},execFunIndex=100,mergeKey="_#_exec_fun_#_",msgOpt={before:"vue已经初始化，请在初始化之前调用",after:"vue还没初始化，请在created之后调用"};vueFun.on=vueFunOn,vueFun.install=vueFunInstall,exports.default=vueFun;