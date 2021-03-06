const { middleware: query } = require('querymen')

function securize(req, res, next){
    req.querymen.query = {$and: [req.querymen.query, req.restify.authResult]}
    next()
}

function populate(req, res, next){
    let path = null
    let field = null
    let splitted = []
    const select = Object.keys(req.querymen.select).reduce((obj, v)=>{ 
        splitted = v.match(/(.+)\.(.+)/)
        if(splitted === null) return obj
        //splitted = v.split('.')
        path = splitted[1]
        field = splitted[2]
        if(//path && field && 
            req.querymen.select[v] === 1){
            obj[path] = {...obj[path], [field]: 1}
        }
        return obj
    }, {})

    let aux = null
    const result = Object.keys(select).reduce((arr, v)=>{
        aux = Object.keys(select[v])
        arr.push({path: v, select: aux.join(' ')})
        return arr
    }, [])
    if(result.length > 0){
        req.restify.populate = result
    }
    next()
}

function injectionMiddleware(method, f){
    let payload = { method, authResult: {} }
    if(typeof f === 'function'){
        payload = {...payload, ...f(method)}
    }else{
        payload = {...payload, ...f}
    }
    return function(req, res, next){
        try{
            req.restify = {method, payload}
            next()
        }catch(err){
            next(err)
        }
    }
}

function createApi({router, auth, path, injection, Model, querySchema}){
    router.get(path, injectionMiddleware('get', injection), auth, query(querySchema), securize, async function(req, res, next){
        try{
            const {query, select, cursor} = req.querymen
            const ret = await Model.find(query, select, cursor).lean()
            res.json(ret)
        }catch(err){
            console.log(err)
            next(err)
        }
    })

    router.get(path + '/:_id', injectionMiddleware('getOne', injection), auth, query(), populate, async function(req, res, next){
        try{
            const {select} = req.querymen
            let ret = await Model.findById(req.params._id, select) //, {lean: true}
            const populate = req.restify.populate
            if(populate){
                await ret.populate(populate).execPopulate()
            }
            res.json(ret)
        }catch(err){
            next(err)
        }
    })

    router.post(path, injectionMiddleware('post', injection), auth, async function(req, res, next){
        try{
            const m = new Model(req.body)
            await m.save()
            res.json({_id: m._id})
        }catch(err){
            next(err)
        }
    })

    router.patch(path + '/:_id', injectionMiddleware('patch', injection), auth, async function(req, res, next){
        try{
            await Model.updateOne({_id: req.params._id}, req.body)
            res.end()
        }catch(err){
            next(err)
        }
    })
}

module.exports = { createApi, populate }