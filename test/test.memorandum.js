const mongoose = require('mongoose')
const { assert } = require('chai')
const { Memorandum } = require('../models/memorandum')
const axios = require('axios')
const qs = require('qs')

const uri = 'mongodb://localhost:27017/test'
let a = null

before(async ()=>{
    await mongoose.connect(uri, {useNewUrlParser: true})
    await mongoose.connection.db.dropDatabase('test')
    a = new Memorandum({text: 'texto1', date: new Date('2019-09-05')})
    await a.save()
})

after(async ()=>{
    await mongoose.connection.close()
})

describe('suite get', ()=>{
    it('test get with dateInit, field text', async ()=>{
        ret = await axios.get('http://localhost:3000/api/memorandum', 
            {
                params: {
                    fields: ['text'],
                    dateInit: '2019-09-04'
                },
                paramsSerializer: params => {
                    return qs.stringify(params)
                }
            }
        )
        assert.deepEqual(ret.data, [{
            _id: '' + a._id,
            text: 'texto1'
        }])
    })

    it('test get with dateInit, return []', async ()=>{
        ret = await axios.get('http://localhost:3000/api/memorandum', 
            {
                params: {
                    fields: ['text'],
                    dateInit: '2019-09-10'
                },
                paramsSerializer: params => {
                    return qs.stringify(params)
                }
            }
        )
        assert.deepEqual(ret.data, [])
    })

})
