const mongoose = require('mongoose')
const { assert } = require('chai')
const { A, B } = require('../model')
const axios = require('axios')
const qs = require('qs')

const uri = 'mongodb://localhost:27017/test'
let a = null
let b = null

before(async ()=>{
    await mongoose.connect(uri, {useNewUrlParser: true})
    await mongoose.connection.db.dropDatabase('test')
    a = new A({a: 'yahoo!', c: 0})
    b = new B({b1: 'game over', b2: 3})
    await b.save()
    a.b = b
    await a.save()
    let c = new A({a: 'google!', c: 1})
    await c.save()
    c = new A({a: 'bingo!', c: 2})
    await c.save()
    c = new A({a: 'insert coin', c: 3})
    await c.save()
})

after(async ()=>{
    await mongoose.connection.close()
})

describe('suite get', ()=>{
    it('test get a, field a', async ()=>{
        //ret = await axios.get('http://localhost:3000/api/a/' + a._id + '/?fields=a')
        ret = await axios.get('http://localhost:3000/api/a/' + a._id, 
            {
                params: {
                    fields: ['a']
                },
                paramsSerializer: params => {
                    return qs.stringify(params)
                }
            }
        )
        assert.deepEqual(ret.data, {
            _id: '' + a._id,
            a: 'yahoo!'
        })
    })

    it('test get a, field a, b populate b field b1', async ()=>{
        //ret = await axios.get('http://localhost:3000/api/a/' + a._id + '/?fields=a,b,b%2Eb1,b%2Eb2',
        ret = await axios.get('http://localhost:3000/api/a/' + a._id,
            {
                params: {
                    fields: ['a', 'b', 'b.b1', 'b.b2']
                },
                paramsSerializer: params => {
                    return qs.stringify(params)
                }
            }
        )
        assert.deepEqual(ret.data, {
            _id: '' + a._id,
            a: 'yahoo!',
            b: {
                _id: '' + b._id,
                b1: 'game over',
                b2: 3
            }
        })
    })

    it('test get several a, field a, c', async ()=>{
        ret = await axios.get('http://localhost:3000/api/a',
            {
                params: {
                    fields: ['a', 'c']
                },
                paramsSerializer: params => {
                    return qs.stringify(params)
                }
            }
        )
        assert.deepEqual(ret.data.map((x) => {
            return {a: x.a, c: x.c}
        }), [{a: 'yahoo!', c: 0}, {a: 'google!', c: 1}, {a: 'bingo!', c: 2}, {a: 'insert coin', c: 3}])
    })

    it('test get several a, regex', async ()=>{
        //ret = await axios.get('http://localhost:3000/api/a/?a=oo&fields=a,c',
        ret = await axios.get('http://localhost:3000/api/a',
        {
            params: {
                fields: ['a', 'c'],
                a: 'oo'
            },
            paramsSerializer: params => {
                return qs.stringify(params)
            }
        })
        assert.deepEqual(ret.data.map((x) => {
            return {a: x.a, c: x.c}
        }), [{a: 'yahoo!', c: 0}, {a: 'google!', c: 1}])
    })

    it('test get several a, field a, c, sort -c, page 1, limit 2', async ()=>{
        //ret = await axios.get('http://localhost:3000/api/a/?page=1&limit=2&sort=-c&fields=a,c', {
        ret = await axios.get('http://localhost:3000/api/a', {
            params: {
                page: 1,
                limit: 2,
                sort: '-c',
                fields: ['a', 'c']
            },
            paramsSerializer: params => {
                return qs.stringify(params)
            }
        })
        assert.deepEqual(ret.data.map((x) => {
            return {a: x.a, c: x.c}
        }), [{a: 'insert coin', c: 3}, {a: 'bingo!', c: 2}])
    })

})

describe('suite patch', ()=>{
    it('test simple patch', async ()=>{
        const body = {a: 'insert coin', c: 1}
        ret = await axios.patch('http://localhost:3000/api/a/' + a._id, body)
        const a_ = await A.findById(a._id)
        assert.deepEqual({a: a_.a, c: a_.c }, {a: 'insert coin', c: 54321}) 
    })
})

describe('suite post', ()=>{
    it('test simple post', async ()=>{
        const body = {a: 'game over', c: 1}
        ret = await axios.post('http://localhost:3000/api/a', body)
        const p = await A.findById(ret.data._id)
        assert.deepEqual({a: p.a, c: p.c, author: p.author }, {a: 'game over', c: 54321, author: 'miguel'}) 
    })
})