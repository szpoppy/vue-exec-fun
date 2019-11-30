let hasOwnProperty = Object.prototype.hasOwnProperty
let toString = Object.prototype.toString
// 插件模式
// eslint-disable-next-line
let Vue
let pluginArr = []
function vueFunOn(initFn) {
    pluginArr.push(initFn)
}

export function vueFunInstall(vue, initFn) {
    Vue = vue
    if (initFn) {
        pluginArr.push(initFn)
    }
}

let msgOpt = {
    before: "vue已经初始化，请在初始化之前调用",
    after: "vue还没初始化，请在created之后调用"
}
function warn(msg = "before") {
    console.warn(msgOpt[msg] || msg || "")
}

function vueFun(initFn) {
    // 一些临时字段，unload会自动清理
    let temp = {}

    // 运行环境
    let vm

    let isInit = false

    function getSafe(key, opt) {
        if (opt === undefined) {
            opt = this
        }
        let arr = key.split(".")
        for (let i = 0; i < arr.length; i += 1) {
            opt = opt[arr[i]]
            if (opt == null) {
                break
            }
        }

        return opt
    }

    function $bind(fn, ...arg) {
        return function() {
            if (!vm) {
                warn("after")
                return
            }
            fn.apply(vm, arg.concat(arguments))
        }
    }

    // 代理
    function $vm(key, arg) {
        if (!vm) {
            return null
        }
        if (key === undefined) {
            return vm
        }

        let val = getSafe(key, vm)
        if (arg === undefined) {
            return val
        }
        return val.call(vm, arg)
    }

    let data = {}
    function dataProperty(back, key) {
        Object.defineProperty(back, key, {
            get() {
                let opt = vm || data
                return opt[key]
            },
            set(val) {
                let opt = vm || data
                // console.log("---------------", opt, key)
                opt[key] = val
            }
        })
    }
    function $data(key, val) {
        let opt = vm || data
        if (typeof key == "string") {
            if (val === undefined) {
                return getSafe(key, opt)
            }
            key = { [key]: val }
        }

        let back = {}
        for (let n in key) {
            if (hasOwnProperty.call(key, n)) {
                opt[n] = key[n]
                dataProperty(back, n)
            }
        }
        // console.log(back)
        return Object.freeze(back)
    }
    let options = {
        data() {
            // console.log("data", data)
            return data
        }
    }

    function fnToBindVM({ value }) {
        if (typeof value == "function") {
            return $bind(value)
        }
        return value
    }

    function setter({
        // options 属性
        prot,
        format,
        isFreeze,
        isBack = true
    }) {
        let opt = {}

        function setterOn(key, val) {
            if (isInit) {
                warn()
                return
            }
            if (prot && !options[prot]) {
                options[prot] = opt
            }
            let back = (isBack && {}) || null
            if (typeof key == "string") {
                key = { [key]: val }
            }
            for (let n in key) {
                // console.log(prot, key, n, hasOwnProperty.call(key, n), back, format)
                if (hasOwnProperty.call(key, n)) {
                    opt[n] = key[n]
                    if (back) {
                        if (format) {
                            let bkVal = format({ value: key[n], backData: back, key: n, opt })
                            // console.log(prot, "bkVal", bkVal)
                            if (bkVal !== undefined) {
                                back[n] = bkVal
                            }
                        } else {
                            back[n] = val
                        }
                    }
                }
            }
            if (back && isFreeze) {
                return Object.freeze(back)
            }
            return back
        }

        return {
            data: opt,
            on: setterOn
        }
    }

    function setProt(prot, format) {
        return function(val) {
            if (isInit) {
                warn()
                return
            }
            options[prot] = val
            return format ? format(val) : val
        }
    }

    let mixins = []
    function mixin(...arg) {
        if (isInit) {
            warn()
            return
        }
        mixins.push(...arg)
    }

    function lifecycleExec(fns) {
        return function() {
            for (let i = 0; i < fns.length; i += 1) {
                fns[i].apply(this, arguments)
            }
        }
    }
    function makeLifecycle() {
        let lifecycles = {}

        let back = {
            on(key, fn) {
                if (typeof key == "string") {
                    let lc = lifecycles[key]
                    if (!lc) {
                        lc = lifecycles[key] = []
                    }
                    lc.push(fn)
                    return
                }
                for (let n in key) {
                    lifecycle(n, key[n])
                }

                return back
            },
            make(opt) {
                if (typeof opt == "string") {
                    if (options[opt]) {
                        opt = options[opt]
                    } else {
                        opt = options[opt] = {}
                    }
                }
                for (let n in lifecycles) {
                    opt[n] = lifecycleExec(lifecycles[n])
                }
                return opt
            },
            emit(type, ...args) {
                let fns = lifecycles[type] || []
                for (let i = 0; i < fns.length; i += 1) {
                    fns[i].apply(vm, args)
                }
            },
            currying(key) {
                return fn => back.on(key, fn)
            },
            has() {
                for (let n in lifecycles) {
                    return true
                }
                return false
            }
        }

        return back
    }

    /**
        beforeCreate
        created
        beforeMount
        mounted
        beforeUpdate
        updated
        beforeDestroy
        destroyed
        beforeCreate
        beforeRouterEnter
        beforeRouterUpdate
        beforeRouteLeave
    */

    let quickNextArr = []
    function quickToVueFn(key) {
        // let vKey = key.replace(/^\$+/, "")
        return function() {
            let vl = vm
            // if (!vl && Vue && typeof Vue[vKey] == "function") {
            //     key = vKey
            //     vl = Vue
            // }
            if (!vl) {
                quickNextArr.push({
                    key: key,
                    args: arguments
                })
                return
            }
            return vl[key](...arguments)
        }
    }

    let lifecycle = makeLifecycle()
    lifecycle.on("beforeCreate", function() {
        vm = this
        while (quickNextArr.length) {
            let toDo = quickNextArr.shift()
            vm[toDo.key](...toDo.args)
        }
    })
    lifecycle.on("created", function() {
        vm = this
    })
    lifecycle.on("destroyed", function() {
        vm = null
        isInit = false
    })

    function initOrLatter(fn1, fn2) {
        return function() {
            isInit ? fn2(...arguments) : fn1(...arguments)
        }
    }

    let $emit = quickToVueFn("$emit")

    let fnArg = {
        temp,
        // 参数
        options,
        // 数据
        data,
        $vm,
        $bind,
        $name: setProt("name"),
        $mixin: mixin,
        $components: setter({
            prot: "components",
            sBack: false
        }).on,
        $directives: setter({
            prot: "directives",
            isBack: false
        }).on,

        // 参数
        $props: setter({
            prot: "props",
            isFreeze: true,
            format({ backData, key, value }) {
                let property = {
                    get() {
                        return vm ? vm[key] : null
                    }
                }
                let setFn = ""
                if (toString.call(value).toLowerCase() == "[object object]") {
                    setFn = value.setFn
                    if (setFn) {
                        if (typeof setFn != "function") {
                            property.set = function(val) {
                                $emit(setFn, val)
                            }
                        } else {
                            property.set = setFn
                        }
                    }
                    delete value.setFn
                }
                Object.defineProperty(backData, key, property)
            }
        }).on,
        $data,
        $computed: setter({
            prot: "computed",
            isFreeze: true,
            format({ backData, key }) {
                Object.defineProperty(backData, key, {
                    get() {
                        return vm ? vm[key] : null
                    },
                    set(val) {
                        if (vm) {
                            vm[key] = val
                        }
                    }
                })
            }
        }).on,
        $filters: setter({
            prot: "filters",
            isFreeze: true,
            format: "fnToBindVM"
        }).on,
        $model: setter({
            prot: "model",
            isBack: false
        }).on,
        $watch: initOrLatter(
            setter({
                prot: "watch",
                isBack: false
            }).on,
            quickToVueFn("$watch")
        ),
        $methods: setter({
            prot: "methods",
            isFreeze: true,
            format: fnToBindVM
        }).on,

        $lifecycle: lifecycle,
        $created: lifecycle.currying("created"),
        $mounted: lifecycle.currying("mounted"),
        $destroyed: lifecycle.currying("destroyed"),

        // 快捷方法
        $emit,
        $nextTick: quickToVueFn("$nextTick")
    }

    let afterArr = []
    pluginArr.forEach(function(pluginFn) {
        pluginFn({
            temp,
            // 参数
            options,
            // 数据
            data,
            $vm,
            after: function(afterFn) {
                afterArr.push(afterFn)
            },
            fnArg,
            lifecycle,
            makeLifecycle,
            setter,
            fnToBindVM,
            quickToVueFn,
            setProt
        })
    })

    initFn && initFn(fnArg)

    afterArr.forEach(function(afterFn) {
        afterFn(fnArg)
    })
    lifecycle.make(options)

    if (mixins.length) {
        options.mixins = mixins
    }

    isInit = true
    return options
}

vueFun.on = vueFunOn
vueFun.install = vueFunInstall

export default vueFun
