const { assert } = require('chai')
const { populate } = require('../restify')

describe('test suite for populate', ()=>{
    it('test undefined', ()=>{
        let req = {
            restify: {},
            querymen: {
                select: {a: 1}
            }
        }
        populate(req, {}, ()=>{})
        assert.deepEqual(req.restify.populate, undefined)
    })

    it('test simple', () => {
        let req = {
            restify: {},
            querymen: {
                select: {a: 1, 'b.a': 1, 'b.b': 1, c: 0}
            }
        }
        populate(req, {}, ()=>{})
        assert.deepEqual(req.restify.populate, [{path: 'b', select: 'a b'}])
    })

    it('test with 0', () => {
        let req = {
            restify: {},
            querymen: {
                select: {a: 1, 'b.a': 1, 'b.b': 0, c: 0}
            }
        }
        populate(req, {}, ()=>{})
        assert.deepEqual(req.restify.populate, [{path: 'b', select: 'a'}])
    })

    it('test with several', () => {
        let req = {
            restify: {},
            querymen: {
                select: {a: 1, 'b.a': 1, 'b.b': 1, c: 0, 'd.x': 1, 'd.y': 1, 'd.z': 0}
            }
        }
        populate(req, {}, ()=>{})
        assert.deepEqual(req.restify.populate, [
            {path: 'b', select: 'a b'}, 
            {path: 'd', select: 'x y'}
        ])
    })
})