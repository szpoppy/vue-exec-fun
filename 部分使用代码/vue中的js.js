import inMsg from "./cps/cps"
import vueFuns from "vue-exec-fun"
export default vueFuns(function({ $components, $data, $graphql, $methods, $mounted, $before, $ready, $vm, $computed, $watch, $nextTick, $unicom }) {

    $components({ inMsg })

    let uni = $unicom.on({
        unicom_first({ data }) {
            // eslint-disable-next-line
            console.log("[unicom_first]", data)
        }
    })

    // eslint-disable-next-line
    console.log("[unicom]", uni, $unicom)

    let dd = $data({
        imgs: {
            test: require("./res/how-2.png")
        },
        msg: "mmmm",
        a: {
            b: "bbbbb"
        }
    })

    $methods({
        setMsg(val) {
            dd.msg = val
        }
    })

    $watch("msg", function(val, oVal) {
        // eslint-disable-next-line
        console.log("[watch] = msg", val, oVal)
    })

    let cd = $computed({
        cMsg: {
            get() {
                return dd.msg
            },
            set(val) {
                dd.msg = val
            }
        }
    })

    // 下面方式下，可以使用 this.$gql.test
    // console.log($graphql("test", require("./gql/test.graphql")).test)
    let gqlTest = $graphql("test", require("./gql/test.graphql")).test

    $methods({
        loading() {
            this.$loading.show()
            setTimeout(() => {
                this.$loading.hide()
            }, 3000)
        }
    })

    $mounted(function() {
        // dd.msg = "msg-2"
        // dd.a.b = "bbb-2"
        // $ajax 无任何拦截器和配置

        // graphql 测试
        gqlTest(function(res) {
            // eslint-disable-next-line
            console.log("[graphql]", res)
        })

        // ajax获取数据测试
        this.$request.load(
            "<get>webapi:getconfig.html",
            res => {
                if (res.data) {
                    res.data.config = JSON.parse(res.getData("ConfigValue") || {})
                }
                // eslint-disable-next-line
                console.log("[request]", res, res.getDate())
            },
            {
                Key: "IconConfig"
            }
        )

        // 狮子座静态文案
        this.$leo("LEONIS_CONCAT_CHILD", function(res) {
            // eslint-disable-next-line
            console.log("[leo]", res)
        })
    })

    $ready(function() {
        // eslint-disable-next-line
        console.log("[ready] ...")
    })

    $before(function({ then }) {
        // eslint-disable-next-line
        console.log("[before] ...")
        then(function() {
            // eslint-disable-next-line
            console.log("[then] ...", $vm())

            cd.cMsg = "msg-3"
            dd.a.b = "bbb-3"
        })
    })

    $nextTick(function() {
        // eslint-disable-next-line
        console.log("[nextTick].......")
    })
})