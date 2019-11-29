// 插件模式
let pluginArr = []
export function vueFunOn(fn) {
    pluginArr.push(fn)
}

export default function vueFun(fn) {
    // 一些临时字段，unload会自动清理
    let temp = {}

    // 运行环境
    let vm

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
    function $data(key, val) {
        let opt = vm || data
        if (typeof key == 'string') {
            if (val === undefined) {
                return getSafe(key, opt)
            }
            opt[key] = val
            return
        }

        Object.assign(opt, key)
    }
    let options = {
        data() {
            return data
        }
    }

    function targetToVMFn(val) {
        if (typeof val == 'function') {
            return function() {
                fn.apply(vm, arguments)
            }
        }
        return val
    }

    function setter(prot) {
        let opt = {}

        function setterOn(key, val) {
            if (!options[prot]) {
                options[prot] = opt
            }
            if (typeof key == 'string') {
                opt[key] = val
                return targetToVMFn(val)
            }
            let back = {}
            for (let n in key) {
                opt[n] = key[n]
                back[n] = targetToVMFn(key[n])
            }
            return back
        }

        return setterOn
    }

    function prot(prot) {
        return function(val) {
            options[prot] = val
            return targetToVMFn(val)
        }
    }

    let mixins = []
    function mixin(opt) {
        mixins.push(opt)
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

        return {
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
                    lifecycle(n, key[n])
                }

                return this
            },
            make(opt = {}) {
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
                return fn => this.on(key, fn)
            },
            has() {
                for (let n in lifecycles) {
                    return true
                }
                return false
            }
        }
    }

    let lifecycle = makeLifecycle()
    lifecycle.on('created', function() {
        vm = this
    })
    lifecycle.on('destroyed', function() {
        vm = null
    })

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

    let fnArg = {
        temp,
        // 参数
        options,
        // 数据
        data,
        $vm,
        $name: prot('name'),
        $mixin: mixin,
        $components: setter('components'),
        $directives: setter('directives'),

        // 参数
        $prop: setter('prop'),
        $data,
        $computed: setter('computed'),
        $watch: setter('watch'),
        $methods: setter('methods'),

        $lifecycle: lifecycle,
        $created: lifecycle.currying('created'),
        $mounted: lifecycle.currying('mounted'),
        $destroyed: lifecycle.currying('destroyed')
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
            setter,
            prot
        })
    })

    fn(fnArg)

    afterArr.forEach(function(afterFn) {
        afterFn(fnArg)
    })
    lifecycle.make(options)

    if (mixins.length) {
        options.mixins = mixins
    }

    return options
}
