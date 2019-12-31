<p align="center">
   <a href="https://www.npmjs.com/package/vue-exec-fun">
   		<img src="https://img.shields.io/npm/v/vue-exec-fun.svg?style=flat" alt="npm">
   </a>
   <a href="https://www.npmjs.com/package/vue-exec-fun">
   		<img src="https://img.shields.io/npm/dm/vue-exec-fun.svg?style=flat" alt="npm">
   </a>
</p>

# vue-exec-fun

-   外挂方式
-   提供另一种方式的函数式方式写 vue 代码
-   与 vue-funciton-api 不冲突 -\_-

> 以下文档不适用于 2.0.0，由于之前设计缺陷，导致无法解决bug，重新设计

## 先来一段简单代码

```html
<template>
    <div></div>
</template>
<style></style>
<script>
    import vueExecFun from "vue-exec-fun"
    export default vueExecFun(function({...}){

    })
</script>
```

> 从上述代码中，我们可以看到，通过 vueExecFun()来生成 vue 的 options 参数

## API

### 临时变量

`temp`

-   存放在这里的数据，在 vue 销毁的时候，也会自动销毁
-   $T$打头的变量，销毁时会自动调用 clearTimeout
-   $I$打头的变量，销毁时会自动调用 clearInterval
-   $D$打头的变量，销毁时会自动调用 存入值的 destroy

`tempFn`

-   存放 T I D 格式化函数的对象，需要新的清理函数，可以在这里定义

### 最终返回的值

`options`

-   通过其他的各种方法，一般最终的数据都会作用在这个对象上
-   用户可以通过对本值的设置，达到补全缺失功能

### 绑定数据

`data`

-   最终通过 option 的 data 函数输出

`setup`

-   最终通过 option 的 setup 函数输出

### 获取当前 vue 的对象 vm

`$.vm`

-   最早请在 beforeCreate 钩子函数触发之后使用，否则返回 null

### 获取当前 vue-router 的对象 \$router

`$.router`

-   最早请在 beforeCreate 钩子函数触发之后使用，否则返回 null

### 获取当前 vue-router 的对象 \$route

`$.store`

-   最早请在 beforeCreate 钩子函数触发之后使用，否则返回 null

### 获取当前 vuex 的对象 \$store

`$.route`

-   最早请在 beforeCreate 钩子函数触发之后使用，否则返回 null

### 绑定函数的 this 为 vm

`$bindNext(fn:function:string, ...args):function`

-   同 function 的 bing 类似，只是 this 已经指向 vm
-   fn 如果为字符串，实际调用 vm 上的方法
-   返回函数直接 return 值

### 生成 name

`$name(name:string)`

-   同 options 的 name 属性

### 混合

`$mixin(...arg[:options])`

-   同 options 的 mixin

### 组件

`$components({...})`

-   同 options 的 components

### 自定义指令

`$directives({...})`

-   同 options 的 directives

### 组件入参

`$props({...}):obj`

-   同 options 的 props
-   支持参数 setFn，表示设置入参的值的方法
-   返回同\$props 入参对应的对象数据

```js
let pv = $props({
    value: {
        type: String,
        default: "",
        setFn: "input"
    }
})

// 上下写法效果相同

let pv = $props({
    value: {
        type: String,
        default: "",
        setFn(val){
            $emit("input", val)
        }
    }
})

// 设置value的值
pv.value = "value set"

// 以下是传统写法
{
    props: {
        value: {
            type: String,
            default: ""
        }
    }
}

this.$emit("input", "value set")
```

### 数据设置

`$data({...}):obj`

-   同 options 的 data
-   返回同\$data 入参对应的对象数据

```js
let dd1 = $data({
    val1: "val1",
    val2: "val2"
})
let dd2 = $data({
    val3: "val3",
    val4: "val4"
})

dd1.val1 = "val1 - 1"
dd2.val3 = "val3 - 1"

// 以下为传统写法

{
    data () {
        val1: "val1",
        val2: "val2",
        val3: "val3",
        val4: "val4"
    }
}

this.val1 = "val1 - 1"
this.val3 = "val3 - 1"

```

### 原生函数式 setup 中数据输出

`$setup({...}):obj` Vue3.0

-   同 options 的 setup
-   返回同\$setup 入参对应的对象数据

### 计算属性设置

`$computed({...}):obj`

-   同 options 的 computed
-   返回同\$computed 入参对应的对象数据

```js
let cd1 = $computed({
    cVal1() {
        // 尽量使用 this，要不然要引起无法自动计算问题
        return this.val1
    },
    cVal2: {
        get () {
            return this.val2
        },
        set (val) {
            // set 中没关系
            dd1.val2 = val
        }
    }
})

cd1.cVal2 = "cVal2 - 2"

// 以下为传统写法

{
    computed: {
        cVal1() {
            // 尽量使用 this，要不然要引起无法自动计算问题
            return this.val1
        },
        cVal2: {
            get () {
                return this.val2
            },
            set (val) {
                // set 中没关系
                dd1.val2 = val
            }
        }
    }
}

this.cVal2 = "cVal2 - 2"

```

### 筛选格式化

`$filters({...}):obj`

-   同 options 的 filters
-   返回同\$filters 入参对应的对象数据

```js
let ft1 = $filters({
    filter1 (...) {

    }
})
// 能保证 filter1 中this指向当前VM
ft1.filter1(...)

// 以下为传统写法

{
    filters: {
        filter1 (...) {

        }
    }
}

```

### 双向绑定设定

`$model({...})`

-   同 options 的 model
-   无返回

```js
$model({
    prop: 'checked',
    event: 'change'
})

// 以下为传统写法

{
    model: {
        prop: 'checked',
        event: 'change'
    }
}
```

### 监控

`$watch({...})`

-   同 options 的 watch, 无返回
-   同 this.\$watch，返回一致

```js
$watch({
    val1(newVal, oldVal) {
        // ...
    }
})

$mounted(function() {
    let stop = $watch('val2', function() {})
    // 同
    let stop = this.$watch('val2', function() {})
})
```

### 方法注册

`$methods({...}):obj`

-   同 options 的 methods
-   返回同\$methods 入参对应的对象数据

```js
let ms = $methods({
    m1 () {

    },
    m2() {

    }
})
// 保证m1方法的this指向VM
ms.m1()
// 同

{
    methods: {
        m1 () {

        },
        m2() {

        }
    }
}
this.m1()

```

### 生命周期函数注册

`$lifecycle({...})`

> 多次注册同一个钩子函数同时生效

```js
$lifecycle("mounted", function(){})
$lifecycle("created", function(){})

// 同

$lifecycle({
    mounted (){

    },
    created() {

    }
})

// 同
{
    mounted (){

    },
    created() {

    }
}

```

-   $created(funciton(){}) 同 $lifecycle("created", function(){})
-   $mounted(funciton(){}) 同 $lifecycle("mounted", function(){})
-   $destroyed(funciton(){}) 同 $lifecycle("destroyed", function(){})
-   其他请使用注册函数

### 事件触发

`$emit(...)`

-   同 this.\$emit(...)

### nextTick

`$nextTick(fun:function)`

-   不限使用时机
-   this.\$nextTick(fun:function)

### 设置 options 中下级属性

`$setOpt(prot:string:obj, data:obj)`

-   `prot:string` 作为 options 的属性值
-   `prot:obj`
    -   `prot.prot` 作为 options 的属性值
    -   `prot.format` 作为 data 中的值的格式化函数
    -   `prot.isFreeze` 返回值是否只读
    -   `prot.isBack` 是否有返回值
    -   `prot.def` options\[prot\] 的默认值
-   data options\[prot\]中的的值

```js
// ==> {unicom: {setName(){}}}
$setOpt('unicom', {
    setUserName() {}
})

$setOpt(
    {
        prot: 'unicom',
        // 无返回值
        isBack: false
    },
    {
        setUserName() {}
    }
)
```

### 设置 options 的属性

`$setProt(prot:string:obj, data)`

-   `prot:string` 作为 options 的属性值
-   `prot:obj`
    -   `prot.prot` 作为 options 的属性值
    -   `prot.format` 作为 data 中的值的格式化函数
-   data options\[prot\]中的的值

```js
// ==> {name: "page-index"}
$setProt('name', 'page-index')
```

### 其他插件模式提供的方法

-   通过 vueExecFun.on 注册的其他方法

## 注册插件 I

```js
import Vue from "Vue"
import vueExecFun from "vue-exec-fun"
Vue.use(vueExecFun.install, function({...}){

})
```

### 绑定方法的 this 为 VM

`$bindNext(fun:function, ...args)`

### 在实例函数执行完成后运行

`after(fun:function)`

```js
after(function() {
    // 这里执行时，已经完成 vueExecFun 方法的执行了
})
```

### vueExecFun 方法参数

`fnArg`

-   通过次参数属性增加，可以增加 vueExecFun 中回调函数的参数
-   注意：after 之后设置，会导致在参数无法获取到

### 生命周期函数绑定

`lifecycle({...})`

-   同 \$lifecycle

### 自定义插件中的生命周期函数绑定

`makeLifecycle`

```js
// 新增life周期属性
let life = makeLifecycle()
// fnArg 新增属性 $life $before $ready
Object.assign(fnArg, {
    $life: life.on,
    $before: life.currying('before'),
    $ready: life.currying('ready')
})

after(function() {
    if (life.has()) {
        // 如果有钩子函数，就绑定到options
        life.make('life')
    }

    // console.log("options", options)
})
```

### 制作新的方法

`setOpt({...})`

```js
// 不会讲述，来两个实例吧

fnArg.$props = setOpt({
    // 绑定options 属性 为 props
    prot: 'props',
    // 返回值属性只读
    isFreeze: true,
    // 键值对
    format({ backData, key, value }) {
        let property = {
            get() {
                return vm ? vm[key] : null
            }
        }
        let setFn = ''
        if (toString.call(value).toLowerCase() == '[object object]') {
            // 增加对 setFn 键值的支持
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
})

fnArg.$components = setOpt({
    // 绑定options 属性 为 components
    prot: 'components',
    // 无需返回任何值
    sBack: false
})

fnArg.$methods = setOpt({
    prot: 'methods',
    isFreeze: true,
    format({ value }) {
        if (typeof value == 'function') {
            // 如果是funciton 绑定函数的this
            return $bindNext(value)
        }
        return value
    }
})

// setOpt 和 $setOpt 实现方式
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

function setOpt(prot) {
    return function(key, val) {
        return $setOpt(prot, key, val)
    }
}
```

### setOpt 常用 format 方法

`fnToBindVM({value})`

> 如果传入的 value 值为函数，将此函数 this 绑定为当前 vue 的 vm

### 快速定位到 vue 的原型方法

> 如果没初始化完成，会自动延后触发

`quickVueNext(key:string):function`

```js
fnArg.$nextTick = quickVueNext('$nextTick')
```

> 如果 Vue 没初始化，会暂存，知道初始化完成后在自动出发

### options 的属性设置

`setProt`

```js
fnArg.$name = setProt('name')
```
