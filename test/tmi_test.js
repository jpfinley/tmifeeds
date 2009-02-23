load(__DIR__ + "/../vendor/shudder/vendor/prototype-minor/prototype.js");
load(__DIR__ + "/../js/tmiFeeds.js");

TestCase.define("TMI", function(){
  this.should("should load in browserless JavaScript context", function() {
    this.assert(TMIFeed);
  });

  this.context("Extended Date class", function() {
    this.setup(function(){
      this.test_date = new Date();
    });

    this.should("have a toRelativeTimeString function", function() {
      this.assert(Date.prototype['toRelativeTimeString']);
    });

    this.should("indicate a time less than a minute ago as such", function() {
      [1, 10, 30, 45].each(function(n) {
        this.assertEqual("less than a minute ago", this.test_date.earlier(n).toRelativeTimeString());
      }.bind(this));
    });

    this.should("indicate a time about a minute ago as such", function() {
      [65, 80, 90, 110].each(function(n) {
        this.assertEqual("about a minute ago", this.test_date.earlier(n).toRelativeTimeString());
      }.bind(this));
    });

    this.should("indicate n minutes ago properly", function() {
      this.assertEqual("5 minutes ago", this.test_date.earlier(5 * 60).toRelativeTimeString());
    });

    this.should("pluralize 'hours' properly", function() {
      this.assertEqual("about an hour ago", this.test_date.earlier(65 * 60).toRelativeTimeString());
      this.assertEqual("about 2 hours ago", this.test_date.earlier(2 * 60 * 60).toRelativeTimeString());
    });

    this.should("indicate less than two days as a day", function() {
      [24, 36, 47].each(function(n) {
        this.assertEqual("1 day ago", this.test_date.earlier(n * 60 * 60).toRelativeTimeString());
      }.bind(this));
    });

    this.should("number days when two or more days have passed", function() {
      [2, 3, 6, 12].each(function(n) {
        this.assertEqual(n + " days ago", this.test_date.earlier(n * 24 * 60 * 60).toRelativeTimeString());
      }.bind(this));
    });

    this.should("have an earlier function for testing", function() {
      this.assertEqual(this.test_date.getTime() - 10000, this.test_date.earlier(10).getTime());
    });
  });

  this.context("Extended String class", function() {
    this.setup(function() {
      this.test_string = "@userid http://url.com/link_text some text that doesn't link"
    });

    this.should("convert @userid text to a link to the user's twitter page", function() {
      var munged = this.test_string.parseUsername();
      this.assert(munged.match(/twitter.com\/userid/));
    });

    this.should("convert a text url to a link", function() {
      var munged = this.test_string.parseURL();
      this.assert(munged.match(/href=.http:\/\/url\.com\/link_text./));
    });
  });

});

Object.extend(Date.prototype, {
  earlier: function(seconds) {
    return new Date(this.getTime() - (seconds * 1000));
  }
})