"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hasOwnProperty = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
// 插件模式 存储
var pluginArr = [];
/**
 * 插件注册
 * @param initFn
 */
function vueFunOn(initFn) {
    pluginArr.push(initFn);
}
exports.vueFunOn = vueFunOn;
/**
 * 获取安全数据
 * @param key
 * @param opt
 */
function getSafe(key, opt) {
    if (opt === undefined) {
        opt = this;
    }
    var arr = key.split(".");
    for (var i = 0; i < arr.length; i += 1) {
        opt = opt[arr[i]];
        if (opt == null) {
            break;
        }
    }
    return opt;
}
/**
 * Vue 数据整合
 * @param data1
 * @param data2
 * @param vm
 */
function assignData(data1, data2, vm) {
    if (!vm) {
        if (data1.$set) {
            vm = data1;
        }
    }
    for (var n in data2) {
        if (hasOwnProperty.call(data2, n)) {
            if (vm && data1[n] == undefined && vm != data1) {
                vm.$set(data1, n, data2[n]);
                continue;
            }
            var type1 = toString.call(data1[n]).toLowerCase();
            var type2 = toString.call(data2[n]).toLowerCase();
            if (type1 == type2 && type2 == "[object object]") {
                assignData(data1[n], data2[n], vm);
                continue;
            }
            data1[n] = data2[n];
        }
    }
}
/**
 * vue install 函数
 * @param vue
 * @param initFn
 */
function vueFunInstall(vue, initFn) {
    if (initFn) {
        vueFunOn(initFn);
    }
}
exports.vueFunInstall = vueFunInstall;
// 错误提示
var msgOpt = {
    before: "vue已经初始化，请在初始化之前调用"
};
function warn(key, msg) {
    if (key === void 0) { key = ""; }
    if (msg === void 0) { msg = "before"; }
    console.warn(key, msgOpt[msg] || msg || "");
}
/**
 * 绑定方法的第一个参数
 * @param fn
 */
function $bind(fn) {
    if (typeof fn == "function") {
        var bind = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            args.unshift(getExt(this));
            // console.log("bind", this, getExt(this), args)
            return fn.apply(this, args);
        };
        bind.__$ext = true;
        return bind;
    }
    var type = toString.call(fn).toLowerCase();
    if (type == "[object object]") {
        var back = {};
        for (var n in fn) {
            back[n] = $bind(fn[n]);
        }
        return back;
    }
    if (type == "[object array]") {
        var back = [];
        for (var i = 0; i < fn.length; i += 1) {
            back[i] = $bind(fn[i]);
        }
        return back;
    }
    return fn;
}
// 生命周期
function lifecycleExec(fns) {
    return function () {
        for (var i = 0; i < fns.length; i += 1) {
            fns[i].apply(this, arguments);
        }
    };
}
function makeLifecycle(inits) {
    var lifecycles = {};
    if (inits) {
        inits.forEach(function (key) {
            lifecycles[key] = [];
        });
    }
    var back = {
        get: function () {
            return lifecycles;
        },
        on: function (key, fn, isBind) {
            if (isBind === void 0) { isBind = false; }
            if (typeof key == "string") {
                var lc = lifecycles[key];
                if (!lc) {
                    lc = lifecycles[key] = [];
                }
                lc.push(isBind ? $bind(fn) : fn);
                return;
            }
            for (var n in key) {
                back.on(n, key[n], fn);
            }
            return;
        },
        make: function (opt, exec) {
            if (opt === void 0) { opt = {}; }
            if (exec === void 0) { exec = lifecycleExec; }
            for (var n in lifecycles) {
                var fn = exec(lifecycles[n]);
                if (toString.call(opt[n]).toLowerCase() == "[object array]") {
                    opt[n].push(fn);
                }
                else {
                    opt[n] = fn;
                }
            }
            return opt;
        },
        emit: function (vm, type) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var fns = lifecycles[type] || [];
            for (var i = 0; i < fns.length; i += 1) {
                fns[i].apply(vm, args);
            }
        },
        currying: function (key) {
            if (lifecycles[key] === undefined) {
                lifecycles[key] = [];
            }
            return function (fn, isBind) {
                back.on(key, fn, isBind);
            };
        },
        has: function () {
            for (var n in lifecycles) {
                return true;
            }
            return false;
        }
    };
    return back;
}
var exts = new Map();
function getExt(vm) {
    return exts.get(vm) || null;
}
function assignExt(vm, opt) {
    if (typeof opt == "function") {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // args.unshift(getExt(vm))
            return opt.apply(vm, args);
        };
    }
    var type = toString.call(opt).toLowerCase();
    if (type == "[object object]") {
        var back = {};
        for (var n in opt) {
            back[n] = assignExt(vm, opt[n]);
        }
        return back;
    }
    if (type == "[object array]") {
        var back = [];
        for (var i = 0; i < opt.length; i += 1) {
            back[i] = assignExt(vm, opt[i]);
        }
        return back;
    }
    return opt;
}
function setExt(vm, opt) {
    // debugger
    var data = Object.assign({}, opt);
    var temp = data.temp;
    delete data.temp;
    var ext = assignExt(vm, opt);
    ext.vm = vm;
    ext.temp = temp;
    exts.set(vm, ext);
}
function removeExt(vm) {
    var data = getExt(vm);
    if (!data) {
        return;
    }
    var temp = data.temp;
    if (temp) {
        for (var n in temp) {
            if (/^\$T\$/.test(n)) {
                clearTimeout(temp[n]);
                temp[n] = -1;
                continue;
            }
            if (/^\$I\$/.test(n)) {
                clearInterval(temp[n]);
                temp[n] = -1;
                continue;
            }
            temp[n] = undefined;
            delete temp[n];
        }
    }
    exts.delete(vm);
}
function vueFun(initFn) {
    var initFlag = false;
    var options = {};
    var merges = {};
    // data 数据收集
    var optData = {};
    merges.data = function (val) {
        assignData(optData, val);
    };
    // 官方函数式编程
    var optSetup = {};
    merges.setup = function (val) {
        for (var n in val) {
            optSetup[n] = val[n];
        }
    };
    options.methods = {};
    merges.methods = function (key, val) {
        var _a;
        var methodObj = typeof key == "function" ? (_a = {}, _a[key] = val, _a) : key;
        var m = options.methods;
        var _loop_1 = function (n) {
            var fn = methodObj[n];
            var key_1 = n;
            if (!fn.__$ext) {
                key_1 = n.replace(/^:/, function () {
                    fn = $bind(fn);
                    return "";
                });
            }
            m[key_1] = fn;
        };
        for (var n in methodObj) {
            _loop_1(n);
        }
    };
    // mixins
    options.mixins = [];
    function $set(prot, val) {
        var _a;
        if (initFlag) {
            warn("[$set]");
            return;
        }
        if (!prot) {
            return options;
        }
        var opt = typeof prot == "string" ? (_a = {}, _a[prot] = val, _a) : prot;
        for (var n in opt) {
            var fn = merges[n];
            if (fn) {
                fn(opt[n]);
                continue;
            }
            var oVal = options[n];
            var oType = toString.call(oVal).toLowerCase();
            if (oVal) {
                if (oType == "[object object]") {
                    assignData(options[n], opt[n]);
                    continue;
                }
                if (oType == "[object array]") {
                    if (toString.call(opt[n]).toLowerCase() == "[object array]") {
                        oVal.push.apply(oVal, opt[n]);
                    }
                    else {
                        oVal.push(opt[n]);
                    }
                    continue;
                }
            }
            options[n] = opt[n];
        }
        return options;
    }
    function quickSet(prot, formatFn) {
        if (formatFn) {
            merges[prot] = formatFn;
        }
        return function (key, val) {
            var _a;
            var data = val !== undefined && typeof key === "string" ? (_a = {}, _a[key] = val, _a) : key;
            $set(prot, data);
        };
    }
    var lifecycle = makeLifecycle();
    // the Next
    var nextDoArr = [];
    function quickNext(key) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (initFlag) {
                warn("[" + key + "]");
                return;
            }
            nextDoArr.push([key, args]);
        };
    }
    var nextDoBind = "mounted";
    function quickNextExec() {
        lifecycle.on(nextDoBind, function () {
            var _this = this;
            nextDoArr.forEach(function (_a) {
                var key = _a[0], args = _a[1];
                _this[key].apply(_this, args);
            });
        });
    }
    var extData = {
        get: function (key) {
            return getSafe(key, this);
        },
        set: function (key, val) {
            var self = this;
            if (typeof key === "string") {
                var k_1;
                var pre = key.replace(/\.(.+?)$/, function (s0, s1) {
                    k_1 = s1;
                    return "";
                });
                if (!k_1) {
                    self[key] = val;
                    return;
                }
                var data = getSafe(pre, self);
                // console.log("-------------", data, this.touch, pre)
                if (!data) {
                    return;
                }
                if (data[k_1] === undefined) {
                    self.$set(data, k_1, val);
                    return;
                }
                data[k_1] = val;
                return;
            }
            assignData(self, key);
        },
        temp: {}
    };
    var fnArg = {
        // 通用
        $set: $set,
        $name: quickSet("name"),
        $mixins: quickSet("mixins"),
        $components: quickSet("components"),
        $directives: quickSet("directives"),
        // 参数
        $props: quickSet("props"),
        $data: function (key, val, vm) {
            var _a;
            var opt;
            if (typeof key == "string") {
                opt = (_a = {}, _a[key] = val, _a);
            }
            else {
                opt = key;
                vm = val;
            }
            assignData(vm || optData, opt);
        },
        $setup: function (key, val) {
            if (val !== undefined) {
                optSetup[key] = val;
                return;
            }
            for (var n in key) {
                optSetup[n] = key[n];
            }
        },
        $computed: quickSet("computed"),
        $filters: quickSet("filters"),
        $model: quickSet("model"),
        $watch: quickSet("watch"),
        $methods: quickSet("methods"),
        $lifecycle: lifecycle.on,
        $created: lifecycle.currying("created"),
        $mounted: lifecycle.currying("mounted"),
        $destroyed: lifecycle.currying("destroyed"),
        $nextTick: quickNext("$nextTick"),
        $emit: quickNext("$emit"),
        $: $bind,
        $getExt: getExt,
        $setExt: function (key, val) {
            var _a;
            var opt = typeof key == "string" ? (_a = {}, _a[key] = val, _a) : val;
            assignData(extData, opt);
        }
    };
    lifecycle.on("beforeCreate", function () {
        // console.log("beforeC", this)
        setExt(this, extData);
    });
    var afterArr = [];
    pluginArr.forEach(function (pluginFn) {
        pluginFn({
            after: function (afterFn) {
                afterArr.push(afterFn);
            },
            fnArg: fnArg,
            lifecycle: lifecycle,
            makeLifecycle: makeLifecycle,
            quickSet: quickSet,
            quickNext: quickNext,
            setQuickNextExec: function (key) {
                nextDoBind = key;
            },
            merges: merges,
            extData: extData
        });
    });
    function output() {
        if (initFlag) {
            // 防止多次执行
            return;
        }
        afterArr.forEach(function (afterFn) {
            afterFn(fnArg);
        });
        // 快捷 执行方式
        quickNextExec();
        options.data = function () {
            return optData;
        };
        options.setup = function () {
            return optSetup;
        };
        lifecycle.make(options);
        lifecycle.on("destroyed", function () {
            // console.log("destroyed", this)
            removeExt(this);
        });
        initFlag = true;
        // console.log("[options]", options)
        // fn && fn(options)
        // console.log("[options]", options, optData, optSetup)
        return options;
    }
    if (!initFn) {
        // output.options = options
        fnArg.$export = function (resolve, reject) {
            if (resolve) {
                if (reject) {
                    output();
                    resolve(options);
                    return;
                }
                // 异步模式
                var ept = function (fn) {
                    resolve(function () {
                        output();
                        fn(options);
                    });
                };
                ept.options = options;
                return ept;
            }
            output();
            return options;
        };
        fnArg.$export.options = options;
        return fnArg;
    }
    initFn && initFn(fnArg);
    return output();
}
vueFun.on = vueFunOn;
vueFun.install = vueFunInstall;
exports.default = vueFun;
//# sourceMappingURL=index.js.map