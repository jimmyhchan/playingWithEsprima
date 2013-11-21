module.exports = (function() {
  var formatter = {};
  formatter.format = function(commentText) {
    return '<pre><code>'+commentText+'</code></pre';
  };

  return formatter;
})();
