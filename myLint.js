/**
 * verifies Javascript source code
 */
var esprima = require('esprima'),
    docletParser = require('./lib/parseDoclets');


//public interface
module.exports = (function() {
  var api = {},
      messages = [];


  /**
   * Looks at the text and (currently) returns block comments
   * @param {string} text The Javascript text to look at
   * @return {object[]} the results array of comments
   */
  api.verify = function(text) {
    var ast, parseError;

    try {
      ast = esprima.parse(text, {comment: true});
    } catch(e) {
      messages.push({error:'true', message: 'parse error'});
      parseError = true;
    }

    if (!parseError && ast && ast.comments && ast.comments.length > 0) {
      ast.comments.forEach(function(comment) {
        var docletParts;
        if (comment.type === 'Block') {
          docletParts = docletParser.parse(comment.value);
          if (docletParts) {
            messages.push('Doclet Parts:\n' + docletParts.join('\n'));
          }
        }
      });
      
    }
    return messages.join('\n');
  };

  return api;
})();
