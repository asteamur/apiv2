const mongoose = require('mongoose')
const { assert } = require('chai')
const { A, B } = require('../model')
const axios = require('axios')

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
    let c = new A({a: 'yahoo!', c: 1})
    await c.save()
    c = new A({a: 'yahoo!', c: 2})
    await c.save()
    c = new A({a: 'yahoo!', c: 3})
    await c.save()
})

after(async ()=>{
    await mongoose.connection.close()
})

describe('suite get', ()=>{
    it('test get a, field a', async ()=>{
        //ret = await axios.get('http://localhost:3000/api/kitten/5d668358b808865b43e43c2f/?human=name&fields=name,human,human-2')
        //ret = await axios.get('http://localhost:3000/api/kitten/5d668358b808865b43e43c2f/?fields=name,human,human-name')
        ret = await axios.get('http://localhost:3000/api/a/' + a._id + '/?fields=a')
        assert.deepEqual(ret.data, {
            _id: '' + a._id,
            a: 'yahoo!'
        })
    })

    it('test get a, field a, b populate b field b1', async ()=>{
        ret = await axios.get('http://localhost:3000/api/a/' + a._id + '/?fields=a,b,b-b1')
        assert.deepEqual(ret.data, {
            _id: '' + a._id,
            a: 'yahoo!',
            b: {
                _id: '' + b._id,
                b1: 'game over'
            }
        })
    })

    it('test get several a, field a, c', async ()=>{
        ret = await axios.get('http://localhost:3000/api/a/?fields=a,c')
        assert.deepEqual(ret.data.map((x) => {
            return {a: x.a, c: x.c}
        }), [{a: 'yahoo!', c: 0}, {a: 'yahoo!', c: 1}, {a: 'yahoo!', c: 2}, {a: 'yahoo!', c: 3}])
    })


    it('test get several a, field a, c, sort -c, page 1, limit 2', async ()=>{
        ret = await axios.get('http://localhost:3000/api/a/?page=1&limit=2&sort=-c&fields=a,c')
        assert.deepEqual(ret.data.map((x) => {
            return {a: x.a, c: x.c}
        }), [{a: 'yahoo!', c: 3}, {a: 'yahoo!', c: 2}])
    })

})
