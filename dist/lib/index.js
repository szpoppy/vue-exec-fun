"use strict";function _toConsumableArray(t){if(Array.isArray(t)){for(var n=0,e=Array(t.length);n<t.length;n++)e[n]=t[n];return e}return Array.from(t)}function _defineProperty(t,n,e){return n in t?Object.defineProperty(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t}function vueFunOn(t){pluginArr.push(t)}function getSafe(t,n){void 0===n&&(n=this);for(var e=t.split("."),r=0;r<e.length&&null!=(n=n[e[r]]);r+=1);return n}function assignData(t,n,e){e||t.$set&&(e=t);for(var r in n)if(hasOwnProperty.call(n,r)){if(e&&void 0==t[r]&&e!=t){e.$set(t,r,n[r]);continue}var o=toString.call(t[r]).toLowerCase(),i=toString.call(n[r]).toLowerCase();if(o==i&&"[object object]"==i){assignData(t[r],n[r],e);continue}t[r]=n[r]}}function vueFunInstall(t,n){Vue||(Vue=t,n&&pluginArr.push(n))}function warn(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"before";console.warn(t,msgOpt[n]||n||"")}function $bind(t){if("function"==typeof t){var n=function(){for(var n=arguments.length,e=Array(n),r=0;r<n;r++)e[r]=arguments[r];return e.unshift(getExt(this)),t.apply(this,e)};return n.__$ext=!0,n}var e=toString.call(t).toLowerCase();if("[object object]"==e){var r={};for(var o in t)r[o]=$bind(t[o]);return r}if("[object array]"==e){for(var i=[],a=0;a<t.length;a+=1)i[a]=$bind(t[a]);return i}return t}function lifecycleExec(t){return function(){for(var n=0;n<t.length;n+=1)t[n].apply(this,arguments)}}function makeLifecycle(t){var n={};t&&t.forEach(function(t){n[t]=[]});var e={get:function(){return n},on:function(t,r){if("function"==typeof t&&(r=t,t=r.name.replace(/^\$/,"")),"string"==typeof t){var o=n[t];return o||(o=n[t]=[]),0==r.name.indexOf("$")&&(r=$bind(r)),void o.push(r)}for(var i in t)e.on(i,t[i]);return e},make:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:lifecycleExec;for(var r in n)t[r]=e(n[r]);return t},emit:function(t,e){for(var r=n[e]||[],o=arguments.length,i=Array(o>2?o-2:0),a=2;a<o;a++)i[a-2]=arguments[a];for(var u=0;u<r.length;u+=1)r[u].apply(t,i)},currying:function(t){return void 0===n[t]&&(n[t]=[]),function(n){return e.on(t,n)}},has:function(){for(var t in n)return!0;return!1}};return e}function getExt(t){return exts.get(t)}function assignExt(t,n){if("function"==typeof n)return function(){for(var e=arguments.length,r=Array(e),o=0;o<e;o++)r[o]=arguments[o];return n.apply(t,r)};var e=toString.call(n).toLowerCase();if("[object object]"==e){var r={};for(var o in n)r[o]=assignExt(t,n[o]);return r}if("[object array]"==e){for(var i=[],a=0;a<n.length;a+=1)i[a]=assignExt(t,n[a]);return i}return n}function setExt(t,n){var e=n.temp;delete n.temp;var r=assignExt(t,n);r.vm=t,r.temp=e,exts.set(t,r)}function removeExt(t){var n=getExt(t);if(n){var e=n.temp;if(e)for(var r in e)/^\$T\$/.test(r)?(clearTimeout(e[r]),e[r]=-1):/^\$I\$/.test(r)?(clearInterval(e[r]),e[r]=-1):(e[r]=void 0,delete e[r]);exts.delete(t)}}function vueFun(t){function n(t,n){if(a)return void warn("[$set]");var e=t;"string"==typeof t&&(e=_defineProperty({},t,n));for(var r in e){var o=f[r];if(o)o(e[r]);else{var i=u[r],c=toString.call(i).toLowerCase();if(i){if("[object object]"==c){assignData(u[r],e[r]);continue}if("[object array]"==c){"[object array]"==toString.call(e[r]).toLowerCase()?i.push.apply(i,_toConsumableArray(e[r])):i.push(e[r]);continue}}u[r]=e[r]}}}function e(t,e){return e&&(f[t]=e),function(e,r){var o=e;void 0!==r&&"string"==typeof e&&(o=_defineProperty({},e,r)),n(t,o)}}function r(t){return function(){if(a)return void warn("["+t+"]");for(var n=arguments.length,e=Array(n),r=0;r<n;r++)e[r]=arguments[r];v.push([t,e])}}function o(){if(p){var t=void 0===p?"undefined":_typeof(p);if("string"==t)return void l.on("mounted",function(){var t=this;v.forEach(function(n){var e=_slicedToArray(n,2),r=e[0],o=e[1];t[r].apply(t,_toConsumableArray(o))})});if("functions"==t)return void v(v)}}function i(){return g.forEach(function(t){t(d)}),o(),u.data=function(){return c},u.setup=function(){return s},l.make(u),l.on("destroyed",function(){removeExt(this)}),a=!0,u}var a=!1,u={},f={},c={};f.data=function(t){assignData(c,t)};var s={};f.setup=function(t){for(var n in t)s[n]=t[n]},u.methods={},f.methods=function(t){"function"==typeof t&&(t=_defineProperty({},t.name,t));var n=u.methods;for(var e in t)!function(e){var r=t[e],o=e;r.__$ext||(o=e.replace(/^\$/,function(){return r=$bind(r),""})),n[o]=r}(e)},u.mixins=[];var l=makeLifecycle(),v=[],p="mounted",y={get:function(t){return getSafe(t,this)},set:function(t,n){if("string"==typeof t){var e=void 0,r=t.replace(/\.(.+?)$/,function(t,n){return e=n,""});if(!e)return void(this[t]=n);var o=getSafe(r,this);if(!o)return;return void 0===o[e]?void this.$set(o,e,n):void(o[e]=n)}assignData(this,t)},temp:{}},d={options:u,$set:n,$name:e("name"),$mixin:e("mixin"),$components:e("components"),$directives:e("directives"),$props:e("props"),$data:function(t,n,e){var r=void 0;"string"==typeof t?r=_defineProperty({},t,n):(r=t,e=n),assignData(e||c,r)},$setup:function(t,n){if(void 0!==n)return void(s[t]=n);for(var e in t)s[e]=t[e]},$computed:e("computed"),$filters:e("filters"),$model:e("model"),$watch:e("watch"),$methods:e("methods"),$lifecycle:l.on,$created:l.currying("created"),$mounted:l.currying("mounted"),$destroyed:l.currying("destroyed"),$nextTick:r("$nextTick"),$emit:r("$emit"),$bind:$bind,$getExt:getExt,$setExt:function(t){if("function"==typeof t)return void assignData(y,_defineProperty({},t.name||"",t));assignData(y,t)}};l.on("beforeCreate",function(){setExt(this,y)});var g=[];return pluginArr.forEach(function(t){t({after:function(t){g.push(t)},fnArg:d,lifecycle:l,makeLifecycle:makeLifecycle,quickSet:e,quickNext:r,setQuickNextExec:function(t){p=t},merges:f,extData:y})}),t?(t&&t(d),i()):(i.options={},d.$output=i,d)}Object.defineProperty(exports,"__esModule",{value:!0});var _slicedToArray=function(){function t(t,n){var e=[],r=!0,o=!1,i=void 0;try{for(var a,u=t[Symbol.iterator]();!(r=(a=u.next()).done)&&(e.push(a.value),!n||e.length!==n);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&u.return&&u.return()}finally{if(o)throw i}}return e}return function(n,e){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return t(n,e);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};exports.vueFunOn=vueFunOn,exports.vueFunInstall=vueFunInstall;var hasOwnProperty=Object.prototype.hasOwnProperty,toString=Object.prototype.toString,Vue=void 0,pluginArr=[],msgOpt={before:"vue已经初始化，请在初始化之前调用"},exts=new Map;vueFun.on=vueFunOn,vueFun.install=vueFunInstall,exports.default=vueFun;