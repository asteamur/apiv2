const mongoose = require('mongoose')
const { assert } = require('chai')
const { Memorandum } = require('../models/memorandum')
const axios = require('axios')
//axios.defaults.adapter = require('axios/lib/adapters/http');
const jwt = require('jsonwebtoken')
const qs = require('qs')

const uri = 'mongodb://localhost:27017/test'
let a = null

function createHeader(token){
    token = jwt.sign(token, 'secret')
    return {
        Authorization: "Bearer " + token
    }
}

before(async ()=>{
    await mongoose.connect(uri, {useNewUrlParser: true})
    await mongoose.connection.db.dropDatabase('test')
    a = new Memorandum({text: 'texto1', sede: 'cartagena', date: new Date('2019-09-05')})
    await a.save()
})

after(async ()=>{
    await mongoose.connection.close()
})

describe('suite get', ()=>{
    it('test get with dateInit, field text', async ()=>{
        const token = {
            userId: 'coord@k.es',
            role: 'coordinadora',
            sede: 'cartagena'
        }

        ret = await axios.get('http://localhost:3000/api/protected/memorandum', 
            {
                headers: createHeader(token),
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
        const token = {
            userId: 'coord@k.es',
            role: 'coordinadora',
            sede: 'cartagena'
        }

        ret = await axios.get('http://localhost:3000/api/protected/memorandum', 
            {
                headers: createHeader(token),
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

    it('test get with dateInit, field text, return [] because sede', async ()=>{
        const token = {
            userId: 'coord@k.es',
            role: 'coordinadora',
            sede: 'murcia'
        }

        ret = await axios.get('http://localhost:3000/api/protected/memorandum', 
            {
                headers: createHeader(token),
                params: {
                    fields: ['text'],
                    dateInit: '2019-09-04'
                },
                paramsSerializer: params => {
                    return qs.stringify(params)
                }
            }
        )
        assert.deepEqual(ret.data, [])
    })

})
