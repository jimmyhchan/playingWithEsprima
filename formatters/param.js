var rParamParts = /\@param\W+\{(.*)\}\W+(\w*)\W+(.*)/;
// this does not reflect optional values or mixed types

module.exports = (function(){
  var formatter = {},
      paramParts;
  formatter.format = function(commentText) {
    paramParts = commentText.match(rParamParts);

    if (paramParts) {
      return '|| name || type || description||\n|' + paramParts[2] + '|' + paramParts[1] + '|' + paramParts[3]+'|';
    }
  };

  return formatter;
})();
