Event.observe(window, 'load', function() {
  // tweets.init('tweets', 'stringbot', 10);
  // greader.init('greader', '01250286733713903147', 10);
  flickr.init('flickr', 'stringbot', 10);
});



var TMIFeed = Class.create({
  element: '',
  user: 'stringbot',
  count: 5,
  js_url: '',
  init: function(element, user, count) {
    this.element = element;
    this.user = user;
    this.count = count;
    this.js_url = this.buildUrl(user,count);
    this.fetch();
  },
  buildUrl: function(user,count) {
    return "http://override.me.dude/json_call?user="+user+"&n="+count;
  },
  fetch: function() {
    var twitter_JSON = document.createElement("script");
    twitter_JSON.type="text/javascript";
    twitter_JSON.src=this.js_url;
    document.getElementsByTagName("head")[0].appendChild(twitter_JSON);
  },
  getItems: function(feed) { return feed; },
  renderFeed: function(feed) {
    var items = this.getItems(feed);
    var html = [];
    var p = html.push;
    html.push("<ul>");
    items.each(function(item) {
      html.push("<li>");
      html.push(this.renderItem(item));
      html.push(" <span class='timestamp'>");
      html.push(this.renderTimeStamp(item));
      html.push("</span>");
      html.push("</li>");
    }.bind(this));
    html.push("</ul>");
    html.push(this.renderInfo());
    $(this.element).insert(html.join(''));
  },
  renderItem: function(item) {
    return item.toString();
  },
  renderTimeStamp: function(item) {
    return '';
  },
  renderInfo: function() {
    return '';
  }
});


// Twitter
var tweets = Object.extend(new TMIFeed(), {
  buildUrl: function(user,count) {
    var callback = 'tweets.renderFeed'; // TODO: this can be abstracted
    return "http://twitter.com/statuses/user_timeline/"+user+".json?callback="+callback+"&count="+count;
  },
  linkToStatus: function(userName, statusId, text) {
    return "<a href='http://twitter.com/"+userName+"/status/"+statusId+"'>"+text+"</a>"
  },
  replyToLink: function(userName, statusId) {
    return this.linkToStatus(userName, statusId, "in reply to "+userName);
  },
  renderItem: function(item) {
    return item.text.parseURL().parseUsername().parseHashtag();
  },
  renderTimeStamp: function(item) {
    var html = [];
    var date = new Date(Date.parse(item.created_at)).toRelativeTimeString();
    html.push(this.linkToStatus(item.user.screen_name, item.id, date));
    if (item.in_reply_to_status_id) {
      html.push(' ');
      html.push(this.replyToLink(item.in_reply_to_screen_name, item.in_reply_to_status_id));
    }
    return html.join('');
  }
});


// Google Reader
var greader = Object.extend(new TMIFeed(), {
  buildUrl: function(user,count){
    var callback = 'greader.renderFeed';
    return "http://www.google.com/reader/public/javascript/user/"+user+"/state/com.google/broadcast?n="+count+"&callback="+callback;
  },
  getItems: function(feed) {
    return feed.items;
  },
  renderItem: function(item) {
    var html = [];
    var title = item.title;
    var url = item.alternate.href;
    var summary = item.content && item.content.sub(/"/, '&quot;') || '';
    html.push("<a href='"+url+"' title=\""+summary+"\">");
    html.push(title);
    html.push("</a>");
    if (item.annotations) {
      item.annotations.each(function(annotation){
        html.push("<span class='annotation'>");
        html.push(annotation.content);
        html.push("</span>");
      });
    }
    return html.join('');
  },
  renderTimeStamp: function(item) {
    var dateString = new Date(item.published*1000).toRelativeTimeString();
    var sourceLink = "<a href='"+item.origin.htmlUrl+"'>"+item.origin.title+"</a>";
    return " "+dateString+" from "+sourceLink;
  }
});

/* Flick (via FriendFeed) */

// http://friendfeed.com/api/feed/user/stringbot?service=flickr
flickr = Object.extend(new TMIFeed(), {
  buildUrl: function(user, count){
    var callback = 'flickr.renderFeed';
    return "http://friendfeed.com/api/feed/user/"+user+"?service=flickr&num="+count+"&callback="+callback
  }, 
  getItems: function(feed) {
    return feed.entries;
  },
  renderItem: function(item) {
    var image_url = item.media[0].thumbnails[0].url;
    html = [];
    html.push(item.title);
    html.push("<img src='");
    html.push(image_url);
    html.push("'>")
    return html.join('');
  }
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