const { Requester, Validator } = require('@chainlink/external-adapter')
const Twitter = require('twitter')

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

var twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Twitter API documentation for endpoints
// https://developer.twitter.com/en/portal/projects-and-apps
// Twitter NPM package documentation
// https://www.npmjs.com/package/twitter
const customParams = {
  endpoint: false,
  status: false,
  getorpost: false
}

// twitter.get('favorites/list', function(error, tweets, response) {
//   if(error) throw error;
//   console.log(tweets);  // The favorites.
//   //console.log(response);  // Raw response object.
// });

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const endpoint = validator.validated.data.endpoint || "statuses/update";
  const getorpost = validator.validated.data.getorpost || "post";
  const status = validator.validated.data.status || "We love #Chainlink";
  twitter.post(endpoint, { status: status}).then((response) => {
    console.log(response)
    response.data = {}
      response.data.result = response.id
      response.status = 200
      callback(response.status, Requester.success(jobRunID, response))
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
