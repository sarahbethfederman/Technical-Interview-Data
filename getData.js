// Requires
var Twitter = require('twitter-node-client').Twitter;
var fs = require('fs');
var https = require('https');
var async = require('async'); 
var keys = require('./config');

// Authetication keys
var genderAPIKey = keys.genderAPIKey;
var twitterConsumerKey = keys.twitterConsumerSecret;
var twitterConsumerSecret = keys.twitterConsumerSecret;
var twitterAccessToken = keys.twitterAccessToken;
var twitterAccessTokenSecret= keys.twitterAccessTokenSecret;

// Callback functions
function onError(err, response, body) {
  console.log('ERROR [%s]', err);
}

function onSuccess(data) {
  // parse the JSON
  data = JSON.parse(data);

  // add the user.gender fields
  getGenders(data);
}

function getGenders(data) {
  async.mapSeries(data, function(record, callback) {
    getSplitGender(record.user.name, callback, record);
  }, function(err, result) {
      if (err) {
        console.log('Error: ' + err);
      }
      else {
        console.log('Finished: ' + result);

        fs.writeFile("data.json", JSON.stringify(result), function(err) {
          if (err) throw err;
        });
      }
  });
}

function getSplitGender(name, callback, record) {
  var response = "";
  var url = "https://gender-api.com/get?split=" + encodeURIComponent(name) + "&key=" + genderAPIKey;

  // send the request to split API
  https.get(url, function(res) {
    res.on('data', function(chunk) {
      response += chunk;
    });
    res.on('error', function(err) {
      console.log("error: " + err.message);
    })
    // when it finishes
    res.on('end', function() {
      response = JSON.parse(response);

      // if there was only a first name or other error
      if (response.errmsg) {
        // try the other API
        getGender(name, callback, record);
      } else {
        // save it to record
        record.user.gender = response;

        // and continue
        callback(null, record);
      }
    });
  });
}

function getGender(name, callback, record) {
  var response = "";
  var url = "https://gender-api.com/get?name=" + encodeURIComponent(name) + "&key=" + genderAPIKey;
  // use the first name API
  https.get(url, function(res) {
    res.on('data', function(chunk) {
      response += chunk;
    });
    res.on('end', function() {
      response = JSON.parse(response);

      // save it to record
      record.user.gender = response;

      // continue
      callback(null, record);
    });
  });
}

// Make the twitter API call
var config = {
  "consumerKey": twitterConsumerKey,
  "consumerSecret": twitterConsumerSecret,
  "accessToken": twitterAccessToken,
  "accessTokenSecret": twitterAccessTokenSecret,
  "callBackUrl": "http://google.com"  // irrelevant url
}

var twitter = new Twitter(config);

twitter.getCustomApiCall('/statuses/retweets.json',{ id: '638769329903960064', count: 100 }, onError, onSuccess);
