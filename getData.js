// Requires
var Twitter = require('twitter-node-client').Twitter;
var fs = require('fs');
var https = require('https');

// Authetication keys
var genderAPIKey = "VhESjjsBTaEmQfRGdF";
var twitterConsumerKey = "wCmUmqbSjVGycHsBWNzLpY2hR";
var twitterConsumerSecret = "s4f69spm7IIHjXJmr5GsrebfPIHm1tajPbC9JeSKwBBwPpjwcJ";
var twitterAccessToken = "42741944-izY3RWhQVV5GOHrxSgqhTFkD3ucd0Bxd2QJV0qNAd";
var twitterAccessTokenSecret= "N7E36Us5hxFbi8LR5RxWU8UzOZrl9VxMeCQ2txkurt4g5";

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
  var name;

  for (var i = 0; i < data.length; i++) {
    // use a closure to avoid async errors
    (function(i) {
      name = data[i].user.name;

      // get their gender & save it
      getSplitGender(name, function (gender) {
        data[i].user.gender = gender;       
      });
    })(i);
  }

  // wait 5 secs
  setTimeout(function() {
    // then write to file
    fs.writeFile("data.json", JSON.stringify(data), function(err) {
      if (err) {
        throw err;
      }
    });
  }, 5000);
}

function getSplitGender(name, callback) {
  // console.log(name);
  var response = "";
  // use the split api
  var url = "https://gender-api.com/get?split=" + encodeURIComponent(name) + "&key=" + genderAPIKey;

  https.get(url, function(res) {
    res.on('data', function(chunk) {
      response += chunk;
    });
    res.on('end', function() {
      response = JSON.parse(response);;
      // if they only gave a first name or other error
      if (response.errmsg) {
        console.log(response.errno, name);
        // try the other API
        getGender(name, callback);
      } else {
        callback(response);
      }
    });
  });
}

function getGender(name, callback) {
  // console.log("alt: " + name);
  var response = "";
  // use the first name API
  https.get("https://gender-api.com/get?name=" + encodeURIComponent(name) + "&key=" + genderAPIKey, function(res) {
    res.on('data', function(chunk) {
      response += chunk;
    });
    res.on('end', function() {
      response = JSON.parse(response);
      console.log(response);
      callback(response);
    });
  });
}

// Make the twitter API call
var config = {
  "consumerKey": "wCmUmqbSjVGycHsBWNzLpY2hR",
  "consumerSecret": "s4f69spm7IIHjXJmr5GsrebfPIHm1tajPbC9JeSKwBBwPpjwcJ",
  "accessToken": "42741944-izY3RWhQVV5GOHrxSgqhTFkD3ucd0Bxd2QJV0qNAd",
  "accessTokenSecret": "N7E36Us5hxFbi8LR5RxWU8UzOZrl9VxMeCQ2txkurt4g5",
  "callBackUrl": "http://google.com"
}

var twitter = new Twitter(config);

twitter.getCustomApiCall('/statuses/retweets.json',{ id: '638769329903960064', count: 100 }, onError, onSuccess);
