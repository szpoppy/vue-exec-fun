let hasOwnProperty = Object.prototype.hasOwnProperty
let toString = Object.prototype.toString
//
function assign(data1, data2) {
    for (let n in data2) {
        if (hasOwnProperty.call(data2, n)) {
            let type1 = toString.call(data1[n]).toLowerCase()
            let type2 = toString.call(data2[n]).toLowerCase()
            if (type1 == type2 && type2 == '[object object]') {
                assign(data1[n], data2[n])
                continue
            }

            data1[n] = data2[n]
        }
    }
}

// 插件模式
// eslint-disable-next-line
let Vue
let pluginArr = []
export function vueFunOn(initFn) {
    pluginArr.push(initFn)
}

export function vueFunInstall(vue, initFn) {
    Vue = vue
    if (initFn) {
        pluginArr.push(initFn)
    }
}

let msgOpt = {
    before: 'vue已经初始化，请在初始化之前调用',
    after: 'vue还没初始化，请在created之后调用'
}
function warn(msg = 'before') {
    console.warn(msgOpt[msg] || msg || '')
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
        let arr = key.split('.')
        for (let i = 0; i < arr.length; i += 1) {
            opt = opt[arr[i]]
            if (opt == null) {
                break
            }
        }

        return opt
    }

    let quickNextArr = []
    function doVueNext({ resolve, key, args, reject }) {
        let fn
        if (typeof key == 'string') {
            fn = vm[key]
        } else if (typeof key == 'function') {
            fn = key
        }

        if (!fn) {
            reject && reject(null)
            return null
        }

        let val = fn.apply(vm, args)
        if (resolve) {
            resolve(val)
        }

        return val
    }

    function quickVueNext(key, ...arg) {
        return function(...args) {
            args.unshift(...arg)
            let todo = {
                key,
                args
            }

            if (vm) {
                return doVueNext(todo)
            }
            return new Promise(function(resolve, reject) {
                todo.reject = reject
                todo.resolve = resolve
                quickNextArr.push(todo)
            })
        }
    }

    // 代理
    function $vm(key, args) {
        if (!vm) {
            return null
        }
        if (key === undefined) {
            return vm
        }

        let val = getSafe(key, vm)
        if (args === undefined) {
            return val
        }
        return val.apply(vm, args)
    }

    let optData = {}
    let optSetup = {}
    function dataProperty(back, key) {
        Object.defineProperty(back, key, {
            get() {
                let opt = vm || optData
                return opt[key]
            },
            set(val) {
                let opt = vm || optData
                // console.log("---------------", opt, key)
                opt[key] = val
            }
        })
    }

    function setData(data, key, val) {
        let opt = vm || data
        if (typeof key == 'string') {
            if (val === undefined) {
                return getSafe(key, opt)
            }
            key = { [key]: val }
        }
        let back = {}
        assign(data, key)
        Object.keys(key).forEach(function(n) {
            dataProperty(back, n)
        })
        // console.log(back)
        return Object.freeze(back)
    }

    function $data(key, val) {
        return setData(optData, key, val)
    }
    function $setup(key, val) {
        return setData(optSetup, key, val)
    }

    let options = {
        data() {
            // console.log("optData", optData)
            return optData
        },
        setup() {
            return optSetup
        }
    }

    function $setOpt(prot, key, val) {
        if (isInit) {
            warn()
            return
        }
        let format, isFreeze, isBack, def
        if (prot && typeof prot != 'string') {
            format = prot.format
            isFreeze = prot.isFreeze
            isBack = prot.isBack
            if (prot.def) {
                def = prot.def
            }
            prot = prot.prot
        }
        if (isFreeze && isBack === undefined) {
            isBack = true
        }
        let data = key
        if (typeof key == 'string') {
            data = { [key]: val }
            val = null
            key = null
        }

        let inOpt = options[prot]
        if (!inOpt) {
            inOpt = options[prot] = def || {}
        }

        let back = (isBack && {}) || null

        for (let n in data) {
            if (hasOwnProperty.call(data, n)) {
                inOpt[n] = data[n]
                if (back) {
                    if (format) {
                        let bkVal = format({ value: data[n], backData: back, key: n, opt: inOpt })
                        // console.log(prot, "bkVal", bkVal)
                        if (bkVal !== undefined) {
                            back[n] = bkVal
                        }
                    } else {
                        back[n] = data[n]
                    }
                }
            }
        }

        if (back && isFreeze) {
            return Object.freeze(back)
        }
        return back
    }

    function fnToBindVM({ value }) {
        if (typeof value == 'function') {
            return quickVueNext(value)
        }
        return value
    }

    function setOpt(prot) {
        return function(key, val) {
            return $setOpt(prot, key, val)
        }
    }

    function $setProt(prot, val) {
        if (isInit) {
            warn()
            return
        }

        let format
        if (typeof prot != 'string' && prot) {
            format = prot.format
            prot = prot.prot
        }

        options[prot] = val

        return format ? format(val) : val
    }

    function setProt(prot) {
        return function(val) {
            return $setProt(prot, val)
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
            get() {
                return lifecycles
            },
            on(key, fn) {
                if (typeof key == 'string') {
                    let lc = lifecycles[key]
                    if (!lc) {
                        lc = lifecycles[key] = []
                    }
                    lc.push(fn)
                    return
                }
                for (let n in key) {
                    back.on(n, key[n])
                }

                return back
            },
            make(prot = {}) {
                let opt = prot
                if (typeof prot == 'string') {
                    opt = options[prot]
                    if (!opt) {
                        opt = options[prot] = {}
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

    let lifecycle = makeLifecycle()
    lifecycle.on('beforeCreate', function() {
        vm = this
        while (quickNextArr.length) {
            doVueNext(quickNextArr.shift())
        }
    })
    lifecycle.on('created', function() {
        vm = this
    })
    lifecycle.on('destroyed', function() {
        vm = null
        isInit = false

        // 自动清理临时字段中数据
        for (let n in temp) {
            if (n.indexOf('$handleT$') == 0) {
                clearTimeout(temp[n])
            }
            if (n.indexOf('$handleI$') == 0) {
                clearInterval(temp[n])
            }
            temp[n] = undefined
            delete temp[n]
        }
    })

    function initOrLatter(fn1, fn2) {
        return function() {
            isInit ? fn2(...arguments) : fn1(...arguments)
        }
    }

    let $emit = quickVueNext('$emit')

    let fnArg = {
        temp,
        // 参数
        options,
        // 数据
        data: optData,
        setup: optSetup,

        // 通用
        $setOpt,
        $setProt,
        $vm,
        $bindNext: quickVueNext,
        $name: setProt('name'),
        $mixin: mixin,
        $components: setOpt({
            prot: 'components',
            sBack: false
        }),
        $directives: setOpt({
            prot: 'directives',
            isBack: false
        }),

        // 参数
        $props: setOpt({
            prot: 'props',
            isFreeze: true,
            format({ backData, key, value }) {
                let property = {
                    get() {
                        return vm ? vm[key] : null
                    }
                }
                let setFn = ''
                if (toString.call(value).toLowerCase() == '[object object]') {
                    setFn = value.setFn
                    if (setFn) {
                        if (typeof setFn != 'function') {
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
        }),
        $data,
        $setup,
        $computed: setOpt({
            prot: 'computed',
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
        }),
        $filters: setOpt({
            prot: 'filters',
            isFreeze: true,
            format: fnToBindVM
        }),
        $model: setOpt({
            prot: 'model',
            isBack: false
        }),
        $watch: initOrLatter(
            setOpt({
                prot: 'watch',
                isBack: false
            }),
            quickVueNext('$watch')
        ),
        $methods: setOpt({
            prot: 'methods',
            isFreeze: true,
            format: fnToBindVM
        }),

        $lifecycle: lifecycle.on,
        $created: lifecycle.currying('created'),
        $mounted: lifecycle.currying('mounted'),
        $destroyed: lifecycle.currying('destroyed'),

        // 快捷方法
        $emit,
        $nextTick: quickVueNext('$nextTick')
    }

    let afterArr = []
    pluginArr.forEach(function(pluginFn) {
        pluginFn({
            after: function(afterFn) {
                afterArr.push(afterFn)
            },
            fnArg,
            lifecycle,
            makeLifecycle,
            setOpt,
            setProt,
            fnToBindVM,
            quickVueNext
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
    console.log(options)
    return options
}

vueFun.on = vueFunOn
vueFun.install = vueFunInstall

export default vueFun
