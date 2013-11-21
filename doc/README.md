#Using Esprima to build a JS Linter

[Esprima](http://esprima.org/) is a Javascript parser. With Esprima, you can take a JS file--or any string that resembles Javascript-- and turn it into a [Syntax Tree](http://esprima.org/doc/index.html#ast)--which is how you and your editor think of the file, with line and column numbers, code blocks, loops, assignments, etc.


Parsers allows you to programatically *read* and *understand* source code based on the *grammar* rules of the language. The folks who built Esprima wrote a parser that allows you to programatically read Javascript based on the grammar rules specified in [ECMAScript 5.1](ECMA-international.org/ecma-262/5.1/)


So what? What's so useful about a JS parser? With a JS parser you can build some neat things. Here are some examples:

* **Syntax highlighting** -- those reserved keywords like `class` and `return` get a different color
* **Code completion** -- if you add a method to a module, your editor can pop up a list of methods whenever you start typing `myModule.` since it knows that dots usually indicate method calls.
* **Code validation** -- Because you can read and understand the code programatically, you can add another layer of rules and validations. The code may look like Javascript but some things, like using using reserved words for variable names, are not allowed. For most languages these validation tools are code `linters` or `lint`. `JSHint` has been a very popluar Javascript linter. `eslint` is another very recent linter.


## Example of Using Esprima
Let's look at a quick example based on the [Esprima Documentation](http://esprima.org/doc/index.html)

```js
var esprima = require('esprima'),
    ast;


// @see http://esprima.org/

// simple parse ussage @see http://esprima.org/doc/index.html
ast = esprima.parse(
    [ '// a simple comment',
    'var answer = 42'
    ].join('\n'), {comment: true});


console.log(JSON.stringify(ast));
/**
{
    "type": "Program",
    "body": [{
        "type": "VariableDeclaration",
        "declarations": [{
            "type": "VariableDeclarator",
            "id": {
                "type": "Identifier",
                "name": "answer"
            },
            "init": {
                "type": "Literal",
                "value": 42
            }
        }],
        "kind": "var",
    }],
    "comments": [{
        "type": "Line",
        "value": " a simple comment"
    }]
}

*/

```
## Building a js comment Linter
### Create a myLint.js module that pulls out block comments
We want to build a module with a simple API. 

this is `myLint.js`

```js
/**
 * verifies Javascript source code
 */
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

    if (!parseError && ast && ast.comments && ast.comments.length > 0) {
      ast.comments.forEach(function(comment) {
        if (comment.type === 'Block') {
          messages.push('Comment Block:\n' + comment.value);
        }
      });
      
    }
    return messages.join('\n');
  };

  return api;
})();

```


### Create a node commandline executable file in bin
Let's create an node commandline executable file and put it into a bin folder. This is a shell script with the opening hashbang set to node.

We are going to pull in the `optimist` module to help us build the commandline script. Let's install it locally and put them in package.json

```js
npm install optimist --save
```

this is `bin/myLint`

```js
#!/usr/bin/env node

var myLint = require('../myLint'),
    fs = require('fs'),
    path = require('path'),
    argv = require('optimist')
            .usage('$0 -f filename.js')
            .demand('f')
            .alias('f', 'file')
            .describe('f', 'File to lint')
            .argv;

function processFile(filename) {
  var text = fs.readFileSync(path.resolve(filename), "utf8"),
      output = myLint.verify(text);

  console.log(output);
}

processFile(argv.f);

```

running the script against myLint.js

```js
$ node bin/myLint -f myLint.js
Comment Block:
*
 * verifies Javascript source code

Comment Block:
*
   * Looks at the text and (currently) returns block comments
   * @param {string} text The Javascript text to look at
   * @return {object[]} the results array of comments
```

##Interpreting comments as JS Doclets
### Build a parser
With the comment block pulled out lets create a module that parses a jsdoc style doclet

```js
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

```

###Setting up formatters/rules
How do we imagine the code will scale? How do we keep things modular and extensible?

Let's add an `@example` formatter and a `@param` formatter

```js
module.exports = (function() {
  var formatter = {};
  formatter.format = function(commentText) {
    return '<pre><code>'+commentText+'</code></pre';
  };

  return formatter;
})();

```

```js
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

```

### Hooking it up
```js
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

```
