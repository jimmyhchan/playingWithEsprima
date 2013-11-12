var esprima = require('esprima');


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

    if (!parseError) {
      return JSON.stringify(ast);
    }
  };

  return api;
})();
