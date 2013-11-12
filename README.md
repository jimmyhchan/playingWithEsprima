playingWithEsprima
==================

## Setting up package.json
* `npm init`
* `npm install esprima --save`

## Start to code myLint.js
* check that we have a reference to esprima
* @see 29da278

## Try a simple parse example
* `esprima.parse(code, options)`

## Set options to {comment: true} to have the code output comments
* @see 3eb9dd7

## Convert the file to a module and setup a commandline script using optimist to take in a filename
* `npm install optimist --save`
* see node-optimist
* @see afd0565

## Look at the AST and output comment blocks
* @see 8883b0b
