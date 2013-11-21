module.exports = (function() {
  var parser = {},
      STAR = '*',
      OPENING_STAR = '*',
      rDocletParts = /\@([a-z]*)([^@]*)/g ;

  /**
   * ensures we are a doclet that we care about
   * @params {string} commentText - a comment block
   */
  var validateDoclet = function(commentText) {
    if (typeof commentText !== 'string') {
      return '';
    }
    if (commentText.indexOf(OPENING_STAR) !== 0) {
      return '';
    }
    return commentText;
  };

  /**
   * returns a cleaned up version of the comment block
   * @params {string} commentText - a comment block
   */
  var cleanDoclet = function(commentText) {
    var tmp = [], i, len;
    commentText = validateDoclet(commentText);
    if (commentText) {
      // remove opening star
      commentText = commentText.replace(OPENING_STAR, '');
      // trim excessive whitespace
      commentText = commentText.trim();
      // remove leading stars
      tmp = commentText.split(STAR);
      for (i=0, len = tmp.length; i<len; i++) {
        // trim excessive whitespace
        tmp[i] = tmp[i].trimRight();
      }
      commentText = tmp.join('');
    }
    return commentText;
  };
  parser.parse = function(commentText) {
    var docParts;
    commentText = cleanDoclet(commentText);
    docParts = commentText.match(rDocletParts);
    return docParts;
  };

  return parser;

})();


