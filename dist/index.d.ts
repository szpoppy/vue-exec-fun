import Vue, { VueConstructor, ComponentOptions } from "vue";
/**
 * 插件注册
 * @param initFn
 */
export declare function vueFunOn(initFn: Function): void;
/**
 * vue install 函数
 * @param vue
 * @param initFn
 */
export declare function vueFunInstall(vue: VueConstructor, initFn: Function): void;
interface execOptions extends ComponentOptions<Vue> {
    [propName: string]: any;
}
interface exportFn extends Function {
    options?: execOptions;
}
interface fnArgs {
    $set: Function;
    $name: Function;
    $mixins: Function;
    $components: Function;
    $directives: Function;
    $props: Function;
    $data: Function;
    $setup: Function;
    $computed: Function;
    $filters: Function;
    $model: Function;
    $watch: Function;
    $methods: Function;
    $lifecycle: Function;
    $created: Function;
    $mounted: Function;
    $destroyed: Function;
    $nextTick: Function;
    $emit: Function;
    $: Function;
    $getExt: Function;
    $setExt: Function;
    $export?: exportFn;
}
declare function vueFun(initFn: Function): fnArgs | execOptions;
declare namespace vueFun {
    var on: typeof vueFunOn;
    var install: typeof vueFunInstall;
}
export default vueFun;
