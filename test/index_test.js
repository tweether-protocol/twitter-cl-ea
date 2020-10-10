const assert = require('chai').assert
const createRequest = require('../index.js').createRequest
const URL = 'www.google.com'

describe('createRequest', () => {
  const jobID = '1'

  context('successful calls', () => {
    const requests = [
      {
        name: 'id not supplied',
        testData: { data: { url: URL } },
      },
      {
        name: 'url',
        testData: { id: jobID, data: { url: URL } },
      },
      {
        name: 'url, endpoint',
        testData: { id: jobID, data: { url: URL, endpoint: '/api/submit' } },
      },
    ]

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 200)
          assert.equal(data.jobRunID, jobID)
          assert.isNotEmpty(data.data)
          //assert.isAbove(Number(data.result), 0)
          //assert.isAbove(Number(data.data.result), 0)
          done()
        })
      })
    })
  })

  context('error calls', () => {
    const requests = [
      { name: 'empty body', testData: {} },
      { name: 'empty data', testData: { data: {} } },
      // TODO
    ]

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 500)
          assert.equal(data.jobRunID, jobID)
          assert.equal(data.status, 'errored')
          assert.isNotEmpty(data.error)
          done()
        })
      })
    })
  })
})
