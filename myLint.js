/**
 * verifies Javascript source code
 */
var esprima = require('esprima'),
    docletParser = require('./lib/parseDoclets');


//public interface
module.exports = (function() {
  var api = {},
      messages = [],
      // we should load everything in the formatters folder instead
      formatters = {
        '@example': require('./formatters/example'),
        '@param': require('./formatters/param')
      };


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
            docletParts.forEach(function(part) {
              var docletType = part.match(/\@[a-zA-Z_\-$]*/);
              if (formatters[docletType]) {
                messages.push(formatters[docletType].format(part));
              }
            });
          }

        }
      });
      
    }
    return messages.join('\n');
  };

  return api;
})();
