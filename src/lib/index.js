let hasOwnProperty = Object.prototype.hasOwnProperty
let toString = Object.prototype.toString

// 插件模式
// eslint-disable-next-line
let Vue
let pluginArr = []
export function vueFunOn(initFn) {
    pluginArr.push(initFn)
}
let beforeFns = {}
let execFunIndex = 100
let mergeKey = '_#_exec_fun_#_'
function beforeFn() {
    let key = this.$options[mergeKey]
    key && beforeFns[key] && beforeFns[key].call(this)
}
export function vueFunInstall(vue, initFn) {
    if (Vue) {
        return
    }
    Vue = vue
    Vue.mixin({
        beforeCreate: beforeFn,
        created: beforeFn
    })
    Vue.config.optionMergeStrategies[mergeKey] = function(pVal, nVal) {
        return nVal
    }

    if (initFn) {
        pluginArr.push(initFn)
    }
}

let msgOpt = {
    before: 'vue已经初始化，请在初始化之前调用',
    after: 'vue还没初始化，请在created之后调用'
}
function warn(key = '', msg = 'before') {
    console.warn(key, msgOpt[msg] || msg || '')
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

    function doVueNext({ key, isEx, arg1, arg2 }) {
        if (!key) {
            return null
        }

        let parent = vm
        if (typeof key == 'string') {
            let arr = key.split('.')
            let method = arr.pop()
            for (let i = 0; i < arr.length; i += 1) {
                parent = parent[arr[i]]
                if (parent == null) {
                    break
                }
            }

            if (isEx && arg2.length == 0) {
                return parent
            }

            if (!parent || !parent[method]) {
                return null
            }

            key = parent[method]
        }

        let args = arg1.concat(arg2)

        if (typeof key == 'function') {
            // 函数
            let val = key.apply(parent, args)

            return val
        }
        return key
    }

    function quickVueNext(key, ...arg1) {
        let isEx = false
        if (typeof key == 'string') {
            key = key.replace(/\+(\w+)$/, function(s0, s1) {
                isEx = true
                return '.' + s1
            })
        }
        return function(...arg2) {
            let todo = {
                isEx,
                key,
                arg1,
                arg2
            }

            if (vm) {
                return doVueNext(todo)
            }
            warn(key, 'after')
            return null
        }
    }

    let optData = {}
    let optSetup = {}
    function dataProperty(back, key, data) {
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

    function assignData(data1, data2) {
        for (let n in data2) {
            if (hasOwnProperty.call(data2, n)) {
                if (vm && vm != data1 && data1[n] == null) {
                    vm.$set(data1, n, data2[n])
                    continue
                }
                let type1 = toString.call(data1[n]).toLowerCase()
                let type2 = toString.call(data2[n]).toLowerCase()
                if (type1 == type2 && type2 == '[object object]') {
                    assignData(data1[n], data2[n])
                    continue
                }

                data1[n] = data2[n]
            }
        }
    }

    function $data(key, val) {
        let opt = vm || optData
        if (typeof key == 'string') {
            if (val === undefined) {
                return getSafe(key, opt)
            }
            key = { [key]: val }
        }
        assignData(opt, key)
        let back = {}
        Object.keys(key).forEach(function(n) {
            dataProperty(back, n, optData)
        })
        // console.log(back)
        return Object.freeze(back)
    }
    function $setup(key, val) {
        if (typeof key == 'string') {
            if (val === undefined) {
                return getSafe(key, vm || optSetup)
            }
            key = { [key]: val }
        }
        if (isInit) {
            warn('after')
            return null
        }
        let back = {}
        for (let n in key) {
            optSetup[n] = key[n]
            dataProperty(back, n, optSetup)
        }
        return Object.freeze(back)
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
            warn('[$setOpt]')
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
            warn('[$setProt]')
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
            warn('[mixin]')
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

    // 清理
    let tempTI = {}
    function setTempTI(fn) {
        return function(n) {
            fn(temp[n])
            if (tempTI[n] == null) {
                tempTI[n] = temp[n]
                delete temp[n]
                Object.defineProperty(temp, n, {
                    get() {
                        return tempTI[n]
                    },
                    set(val) {
                        tempTI[n] = val
                        if (!vm) {
                            // 不在可运行范围 设置延时
                            fn(val)
                        }
                    }
                })
            }
        }
    }
    let tempFn = {
        T: setTempTI(clearTimeout),
        I: setTempTI(clearInterval),
        D(n) {
            temp[n].destroy()
            delete temp[n]
        }
    }
    function clearTemp() {
        for (let n in temp) {
            let val = n.match(/^\$(w+)\$/)
            if (val && tempFn[val[1]]) {
                tempFn[val[1]](temp[n], n, temp)
                return
            }
            temp[n] = undefined
            delete temp[n]
        }
    }

    let lifecycle = makeLifecycle()
    function getVM() {
        vm = this
    }
    let execFunKey = (options[mergeKey] = execFunKey = '#' + execFunIndex++)
    if (Vue) {
        // 只是为了 提前会的 this
        beforeFns[execFunKey] = getVM
    } else {
        lifecycle.on('beforeCreate', getVM)
        lifecycle.on('created', getVM)
    }

    function initOrLatter(fn1, fn2) {
        return function() {
            isInit ? fn2(...arguments) : fn1(...arguments)
        }
    }

    let $emit = quickVueNext('$emit')

    function $(key) {
        if (!vm) {
            warn('after')
            return
        }
        return vm.$refs[key]
    }

    Object.defineProperty($, 'vm', {
        get() {
            return vm || null
        }
    })

    function bindTo$(key) {
        if (typeof key == 'string') {
            Object.defineProperty($, key, {
                get() {
                    return (vm && vm['$' + key]) || null
                },
                set() {}
            })
            return
        }

        key.forEach(bindTo$)
    }

    bindTo$(['router', 'route', 'store'])

    let fnArg = {
        temp,
        tempFn,
        // 参数
        options,
        // 数据
        data: optData,
        setup: optSetup,

        // 通用
        $setOpt,
        $setProt,
        // 一些常规的获取属性
        $,
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
            bindTo$,
            setVM(_) {
                vm = _
            },
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

    lifecycle.on('destroyed', function() {
        vm = null
        isInit = false

        // 自动清理临时字段中数据
        clearTemp()
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
