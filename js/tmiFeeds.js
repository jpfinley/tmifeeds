var TMIFeed = Class.create({
  element: '',
  fetch: function(js_url, element) {
    this.element = element;
    var twitter_JSON = document.createElement("script");
    twitter_JSON.type="text/javascript"
    twitter_JSON.src=js_url
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
    $(this.element).insert(html.join(''));
  },
  renderItem: function(item) {
    return item.toString();
  },
  renderTimeStamp: function(item) {
    return '';
  }
});


// Twitter
var tweets = new TMIFeed();
Object.extend(tweets, {
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
var greader = new TMIFeed();
Object.extend(greader, {
  getItems: function(feed) {
    return feed.items;
  },
  renderItem: function(item) {
    var html = [];
    var title = item.title;
    var url = item.alternate.href;
    var summary = item.content && item.content || '';
    html.push("<a href='"+url+"' title=\""+summary+"\">");
    html.push(title);
    html.push("</a>");
    return html.join('');
  },
  renderTimeStamp: function(item) {
    var dateString = new Date(item.published*1000).toRelativeTimeString();
    var sourceLink = "<a href='"+item.origin.htmlUrl+"'>"+item.origin.title+"</a>";
    return " "+dateString+" from "+sourceLink;
  }
});




Event.observe(window, 'load', function() {
  tweets.fetch("http://twitter.com/statuses/user_timeline/stringbot.json?callback=tweets.renderFeed&count=5", "tweets");
  greader.fetch("http://www.google.com/reader/public/javascript/user/01250286733713903147/state/com.google/broadcast?n=5&callback=greader.renderFeed", "greader");
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