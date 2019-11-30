export default function({ fnArg, setter, makeLifecycle, after, fnToBindVM, quickToVueFn, options }) {
    let life = makeLifecycle()

    let unicom = {
        ...setter({
            prot: 'unicom',
            isFreeze: true,
            format: fnToBindVM
        }),
        send: quickToVueFn('$unicom')
    }
    Object.defineProperty(unicom, 'id', {
        set(val) {
            options.unicomId = val
        },
        get() {
            return options.unicomId
        }
    })
    Object.defineProperty(unicom, 'name', {
        set(val) {
            options.unicomName = val
        },
        get() {
            return options.unicomName
        }
    })

    Object.assign(fnArg, {
        $graphql: setter({
            prot: 'graphql',
            isFreeze: true,
            format({ value }) {
                return joint.gql(value)
            }
        }).on,
        $unicom: Object.freeze(unicom),

        $life: life,
        $before: life.currying('before'),
        $ready: life.currying('ready')
    })

    after(function() {
        if (life.has()) {
            life.make('life')
        }

        // console.log("options", options)
    })
}
