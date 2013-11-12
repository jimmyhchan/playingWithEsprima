var esprima = require('esprima'),
    ast;


// @see http://esprima.org/

// simple parse ussage @see http://esprima.org/doc/index.html
ast = esprima.parse(
    [ '// a simple comment',
    'var answer = 42'
    ].join('\n'), 'comment', true);


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
        "kind": "var"
    }]
}

*/
