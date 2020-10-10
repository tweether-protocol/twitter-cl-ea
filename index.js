const { Requester, Validator } = require('@chainlink/external-adapter')
const Reddit = require('reddit')

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

const reddit = new Reddit({
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASSWORD,
  appId: process.env.REDDIT_API_KEY,
  appSecret: process.env.REDDIT_API_SECRET,
  userAgent: 'tweether',
})

// Reddit API documentation for endpoints
// https://www.reddit.com/dev/api/
// Reddit NPM package documentation
// https://www.npmjs.com/package/reddit
const customParams = {
  sr: false,
  kind: false,
  resubmit: false,
  title: false,
  text: false,
  endpoint: false,
  url: false,
}

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const endpoint = validator.validated.data.endpoint || '/api/submit'
  const sr = validator.validated.data.sr || 'testingground4bots'
  const kind = validator.validated.data.kind || 'self'
  const resubmit = validator.validated.data.resubmit || 'false'
  const title = validator.validated.data.title || 'Test Title Here!'
  const text = validator.validated.data.text || 'Test Text Here!'
  const url = validator.validated.data.url || 'https://twitter.com/TweethTweet'
  reddit
    .post(endpoint, {
      sr: sr,
      kind: kind,
      resubmit: resubmit,
      title: title,
      text: text,
      url: url,
    })
    .then((response) => {
      response.json.data.result = response.json.data.id
      response.json.status = 200
      callback(response.json.status, Requester.success(jobRunID, response.json))
    })
    .catch((error) => {
      callback(500, Requester.errored(jobRunID, error))
    })
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false,
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest

// Sample Call
// curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"title":"HELLO" }}'
