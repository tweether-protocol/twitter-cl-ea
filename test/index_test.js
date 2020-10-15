const assert = require('chai').assert
const createRequest = require('../index.js').createRequest
const STATUS = '#CHAINLINK IS GREAT'
const STATUS2 = 'We are testing this bot'
const STATUS3 = 'Wow Alex and Patrick are really cool'

describe('createRequest', () => {
  const jobID = '1'

  context('successful calls', () => {
    const requests = [
      {
        name: "id not supplied",
        testData: { data: { status: STATUS } },
      },
      {
        name: "status",
        testData: { id: jobID, data: { status: STATUS2 } },
      },
      {
        name: "status, endpoint",
        testData: {
          id: jobID,
          data: { status: STATUS3, endpoint: "statuses/update" },
        },
      },
    ];

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
