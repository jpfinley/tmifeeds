/*
  Twits.js is my ghetto-sled widget for including a customizable Twitter feed
  on your web-page. It requires Prototype 1.6, available from 
  http://prototypejs.org
  
  Without code from the following URLS and their respective authors this script 
  would have taken about 3 days instead of 3 hours.
  
  http://www.drunkenfist.com/304/2007/08/12/json-feeds-for-fun-and-profit-part-2-callbacks-with-twitter/ (Rob Larsen)
  http://www.simonwhatley.co.uk/parsing-twitter-usernames-hashtags-and-urls-with-javascript (Simon Whatley)
  http://twitter.pbwiki.com/RelativeTimeScripts (Mike Demers)
  
  Usage: 
  
  Include the following scripts in your page's header:
  
  <script type="text/javascript" src="prototype-1.6.0.3.js" charset="utf-8"></script>
  <script type="text/javascript" src="twits.js" charset="utf-8"></script>
  <link rel="stylesheet" href="twits.css" type="text/css" media="screen" title="no title" charset="utf-8">
  
  The TwitsOptions hash contains the configuration info for the script:
    user: your twitter username (authentication is not supported, your feed must
    be public)
    
    div: the #ID of an element into which to insert your twitter list
    
    render: a function to render an individual tweet as a string.
  
  You can roll your own twits.css stylesheet to style the tweets as you please.

  - Josh 1/4/2009
*/

// This here is for your configuration!
var TwitsOptions = {
  // twitter username
  user: 'stringbot',

  // how many tweets?
  n: 20,
  
  // div to insert the tweets into
  div: 'tweets',

  // render function renders an individual tweet
  render: function(tweet) {
    var text = "<span class='text'>"+tweet.text.parseURL().parseUsername().parseHashtag()+"</span> ";
    text += "<span class='info'>"+linkToStatus(tweet.user.screen_name, tweet.id, new Date(Date.parse(tweet.created_at)).toRelativeTimeString());
    if (tweet.in_reply_to_status_id) {
      text += " "+replyToLink(tweet.in_reply_to_screen_name, tweet.in_reply_to_status_id);
    }
    text += "</span>";
    return text;
  }
}

function renderTweets(tweets) {
  var div = $(TwitsOptions.div);
  div.insert("<ul class='twitter_list'>");
  var list = div.down(".twitter_list")
  tweets.each(function(t) {
    var text = "<li class='tweet'>";
    text += TwitsOptions.render(t);
    text += "</li>";
    list.insert(text);
  });
}

function replyToLink(userName, statusId) {
  return linkToStatus(userName, statusId, "in reply to "+userName);
}

function linkToStatus(userName, statusId, text) {
  return "<a href='http://twitter.com/"+userName+"/status/"+statusId+"'>"+text+"</a>"
}

Event.observe(window, 'load', function() {
   var twitter_JSON = document.createElement("script");
   twitter_JSON.type="text/javascript"
   twitter_JSON.src="http://twitter.com/statuses/user_timeline/"+TwitsOptions.user+".json?callback=renderTweets&count="+TwitsOptions.n
   document.getElementsByTagName("head")[0].appendChild(twitter_JSON);
});


/* JavaScript extensions */

Object.extend(Date.prototype, {
  toRelativeTimeString: function() {
    var delta = parseInt((new Date().getTime() - this) / 1000);
    if(delta < 60) {
      return 'less than a minute ago';
    } else if(delta < 120) {
      return 'about a minute ago';
    } else if(delta < (45*60)) {
      return (parseInt(delta / 60)).toString() + ' minutes ago';
    } else if(delta < (90*60)) {
      return 'about an hour ago';
    } else if(delta < (24*60*60)) {
      var n = parseInt(delta / 3600);
      dur = n == 1 ? 'an hour' : n.toString() + ' hours';
      return 'about ' + dur + ' ago';
    } else if(delta < (48*60*60)) {
      return '1 day ago';
    } else {
      return (parseInt(delta / 86400)).toString() + ' days ago';
    }
  }
});

Object.extend(String.prototype, {
  parseURL: function() {
    return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/, function(url) {
      return url.link(url);
    });
  },
  parseUsername: function() {
    return this.replace(/[@]+[A-Za-z0-9-_]+/, function(u) {
      var username = u.replace("@","")
      return u.link("http://twitter.com/"+username);
    });
  },
  parseHashtag: function() {
    return this.replace(/[#]+[A-Za-z0-9-_]+/, function(t) {
      var tag = t.replace("#","%23")
      return t.link("http://search.twitter.com/search?q="+tag);
    });
  }
});

