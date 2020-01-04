let hasOwnProperty = Object.prototype.hasOwnProperty
let toString = Object.prototype.toString

// 插件模式
// eslint-disable-next-line
let Vue
let pluginArr = []
export function vueFunOn(initFn) {
    pluginArr.push(initFn)
}

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

function assignData(data1, data2, vm) {
    if (!vm) {
        if (data1.$set) {
            vm = data1
        }
    }
    for (let n in data2) {
        if (hasOwnProperty.call(data2, n)) {
            if (vm && data1[n] == undefined && vm != data1) {
                vm.$set(data1, n, data2[n])
                continue
            }
            let type1 = toString.call(data1[n]).toLowerCase()
            let type2 = toString.call(data2[n]).toLowerCase()
            if (type1 == type2 && type2 == '[object object]') {
                assignData(data1[n], data2[n], vm)
                continue
            }

            data1[n] = data2[n]
        }
    }
}

export function vueFunInstall(vue, initFn) {
    if (Vue) {
        return
    }
    Vue = vue

    if (initFn) {
        pluginArr.push(initFn)
    }
}

let msgOpt = {
    before: 'vue已经初始化，请在初始化之前调用'
}
function warn(key = '', msg = 'before') {
    console.warn(key, msgOpt[msg] || msg || '')
}

function $bind(fn) {
    if (typeof fn == 'function') {
        let bind = function(...args) {
            args.unshift(getExt(this))
            // console.log("bind", this, getExt(this), args)
            return fn.apply(this, args)
        }
        bind.__$ext = true
        return bind
    }

    let type = toString.call(fn).toLowerCase()
    if (type == '[object object]') {
        let back = {}
        for (let n in fn) {
            back[n] = $bind(fn[n])
        }
        return back
    }

    if (type == '[object array]') {
        let back = []
        for (let i = 0; i < fn.length; i += 1) {
            back[i] = $bind(fn[i])
        }
        return back
    }

    return fn
}

// 生命周期
function lifecycleExec(fns) {
    return function() {
        for (let i = 0; i < fns.length; i += 1) {
            fns[i].apply(this, arguments)
        }
    }
}
function makeLifecycle(inits) {
    let lifecycles = {}
    if (inits) {
        inits.forEach(function(key) {
            lifecycles[key] = []
        })
    }
    let back = {
        get() {
            return lifecycles
        },
        on(key, fn, isBind = false) {
            if (typeof key == 'string') {
                let lc = lifecycles[key]
                if (!lc) {
                    lc = lifecycles[key] = []
                }
                lc.push((isBind && $bind(fn)) || fn)
                return
            }
            for (let n in key) {
                back.on(n, key[n])
            }

            return back
        },
        make(opt = {}, exec = lifecycleExec) {
            for (let n in lifecycles) {
                let fn = exec(lifecycles[n])
                if (toString.call(opt[n]).toLowerCase() == '[object array]') {
                    opt[n].push(fn)
                } else {
                    opt[n] = fn
                }
            }
            return opt
        },
        emit(vm, type, ...args) {
            let fns = lifecycles[type] || []
            for (let i = 0; i < fns.length; i += 1) {
                fns[i].apply(vm, args)
            }
        },
        currying(key) {
            if (lifecycles[key] === undefined) {
                lifecycles[key] = []
            }
            return function(fn, isBind) {
                return back.on(key, fn, isBind)
            }
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

let exts = new Map()

function getExt(vm) {
    return exts.get(vm)
}

function assignExt(vm, opt) {
    if (typeof opt == 'function') {
        return function(...args) {
            // args.unshift(getExt(vm))
            return opt.apply(vm, args)
        }
    }
    let type = toString.call(opt).toLowerCase()
    if (type == '[object object]') {
        let back = {}
        for (let n in opt) {
            back[n] = assignExt(vm, opt[n])
        }
        return back
    }

    if (type == '[object array]') {
        let back = []
        for (let i = 0; i < opt.length; i += 1) {
            back[i] = assignExt(vm, opt[i])
        }
        return back
    }
    return opt
}

function setExt(vm, opt) {
    // debugger
    let data = Object.assign({}, opt)
    let temp = data.temp
    delete data.temp
    let ext = assignExt(vm, opt)
    ext.vm = vm
    ext.temp = temp
    exts.set(vm, ext)
}
function removeExt(vm) {
    let data = getExt(vm)
    if (!data) {
        return
    }

    let temp = data.temp
    if (temp) {
        for (let n in temp) {
            if (/^\$T\$/.test(n)) {
                clearTimeout(temp[n])
                temp[n] = -1
                continue
            }
            if (/^\$I\$/.test(n)) {
                clearInterval(temp[n])
                temp[n] = -1
                continue
            }

            temp[n] = undefined
            delete temp[n]
        }
    }

    exts.delete(vm)
}

function vueFun(initFn) {
    let initFlag = false
    let options = {}
    let merges = {}

    // data 数据收集
    let optData = {}
    merges.data = function(val) {
        assignData(optData, val)
    }

    // 官方函数式编程
    let optSetup = {}
    merges.setup = function(val) {
        for (let n in val) {
            optSetup[n] = val[n]
        }
    }
    options.methods = {}
    merges.methods = function(val) {
        if (typeof val == 'function') {
            val = { [val.name]: val }
        }
        let m = options.methods
        for (let n in val) {
            let fn = val[n]
            let key = n
            if (!fn.__$ext) {
                key = n.replace(/^:/, function() {
                    fn = $bind(fn)
                    return ''
                })
            }
            m[key] = fn
        }
    }

    // mixins
    options.mixins = []

    function $set(prot, val) {
        if (initFlag) {
            warn('[$set]')
            return
        }
        if (!prot) {
            return options
        }
        let opt = prot
        if (typeof prot == 'string') {
            opt = { [prot]: val }
        }

        for (let n in opt) {
            let fn = merges[n]
            if (fn) {
                fn(opt[n])
                continue
            }

            let oVal = options[n]
            let oType = toString.call(oVal).toLowerCase()
            if (oVal) {
                if (oType == '[object object]') {
                    assignData(options[n], opt[n])
                    continue
                }
                if (oType == '[object array]') {
                    if (toString.call(opt[n]).toLowerCase() == '[object array]') {
                        oVal.push(...opt[n])
                    } else {
                        oVal.push(opt[n])
                    }

                    continue
                }
            }

            options[n] = opt[n]
        }

        return options
    }

    function quickSet(prot, formatFn) {
        if (formatFn) {
            merges[prot] = formatFn
        }
        return function(key, val) {
            let data = key
            if (val !== undefined && typeof key === 'string') {
                data = { [key]: val }
            }

            $set(prot, data)
        }
    }

    let lifecycle = makeLifecycle()
    // the Next
    let nextDoArr = []
    function quickNext(key) {
        return function(...args) {
            if (initFlag) {
                warn('[' + key + ']')
                return
            }
            nextDoArr.push([key, args])
        }
    }

    let nextDoBind = 'mounted'
    function quickNextExec() {
        if (nextDoBind) {
            let type = typeof nextDoBind
            if (type == 'string') {
                lifecycle.on('mounted', function() {
                    nextDoArr.forEach(([key, args]) => {
                        this[key](...args)
                    })
                })
                return
            }
            if (type == 'functions') {
                nextDoArr(nextDoArr)
                return
            }
        }
    }

    let extData = {
        get(key) {
            return getSafe(key, this)
        },
        set(key, val) {
            if (typeof key === 'string') {
                let k
                let pre = key.replace(/\.(.+?)$/, function(s0, s1) {
                    k = s1
                    return ''
                })
                if (!k) {
                    this[key] = val
                    return
                }
                let data = getSafe(pre, this)
                // console.log("-------------", data, this.touch, pre)
                if (!data) {
                    return
                }
                if (data[k] === undefined) {
                    this.$set(data, k, val)
                    return
                }
                data[k] = val
                return
            }
            assignData(this, key)
        },
        temp: {}
    }

    let fnArg = {
        // 通用
        $set,
        $name: quickSet('name'),
        $mixin: quickSet('mixin'),
        $components: quickSet('components'),
        $directives: quickSet('directives'),

        // 参数
        $props: quickSet('props'),
        $data: function(key, val, vm) {
            let opt
            if (typeof key == 'string') {
                opt = { [key]: val }
            } else {
                opt = key
                vm = val
            }
            assignData(vm || optData, opt)
        },
        $setup: function(key, val) {
            if (val !== undefined) {
                optSetup[key] = val
                return
            }
            for (let n in key) {
                optSetup[n] = key[n]
            }
        },
        $computed: quickSet('computed'),
        $filters: quickSet('filters'),
        $model: quickSet('model'),
        $watch: quickSet('watch'),
        $methods: quickSet('methods'),

        $lifecycle: lifecycle.on,
        $created: lifecycle.currying('created'),
        $mounted: lifecycle.currying('mounted'),
        $destroyed: lifecycle.currying('destroyed'),

        $nextTick: quickNext('$nextTick'),
        $emit: quickNext('$emit'),

        $: $bind,
        $getExt: getExt,
        $setExt(opt) {
            if (typeof opt == 'function') {
                assignData(extData, { [opt.name || '']: opt })
                return
            }
            assignData(extData, opt)
        }
    }

    lifecycle.on('beforeCreate', function() {
        // console.log("beforeC", this)
        setExt(this, extData)
    })

    let afterArr = []
    pluginArr.forEach(function(pluginFn) {
        pluginFn({
            after: function(afterFn) {
                afterArr.push(afterFn)
            },
            fnArg,
            lifecycle,
            makeLifecycle,
            quickSet,
            quickNext,
            setQuickNextExec(key) {
                nextDoBind = key
            },
            merges,
            extData
        })
    })

    function output() {
        if (initFlag) {
            // 防止多次执行
            return
        }
        afterArr.forEach(function(afterFn) {
            afterFn(fnArg)
        })

        // 快捷 执行方式
        quickNextExec()

        options.data = function() {
            return optData
        }
        options.setup = function() {
            return optSetup
        }

        lifecycle.make(options)

        lifecycle.on('destroyed', function() {
            // console.log("destroyed", this)
            removeExt(this)
        })

        initFlag = true
        // console.log("[options]", options)
        // fn && fn(options)
        // console.log("[options]", options, optData, optSetup)
        return options
    }

    if (!initFn) {
        // output.options = options
        fnArg.$export = function(resolve, reject) {
            if (resolve) {
                if (reject) {
                    output()
                    resolve(options)
                    return
                }
                // 异步模式
                let ept = function(fn) {
                    resolve(function() {
                        output()
                        fn(options)
                    })
                }
                ept.options = options
                return ept
            }
            output()
            return options
        }
        fnArg.$export.options = options
        return fnArg
    }

    initFn && initFn(fnArg)

    return output()
}

vueFun.on = vueFunOn
vueFun.install = vueFunInstall

export default vueFun
