var GReader = {
  show: function(shared) {
    var element = $(GReaderOptions.elementId);
    var html = [];
    html.push("<ul class='glist'>");
    shared.items.each(function(item) {
      html.push(GReaderOptions.render(item));
    });
    html.push("</ul>");
    element.insert(html.join(''));
  }
}

var GReaderOptions = {
  userId: '01250286733713903147',
  n: 5, 
  elementId: 'greader',
  render: function(item) {
    var html = [];
    var title = item.title;
    var url = item.alternate.href;
    var summary = item.content && item.content || '';
    html.push("<li class='gitem'>");
    html.push("<a href='"+url+"' title=\""+summary+"\">");
    html.push(title);
    html.push("</a></li>");
    return html.join('');
  }, 
  callback: 'GReader.show'
}

Event.observe(window, 'load', function() {
   var tw = document.createElement("script");
   tw.type="text/javascript"
   tw.src="http://www.google.com/reader/public/javascript/user/"+GReaderOptions.userId+"/state/com.google/broadcast?n="+GReaderOptions.n+"&callback="+GReaderOptions.callback;
   document.getElementsByTagName("head")[0].appendChild(tw);
});

