/**
 * Override print and printErr so we don't run into problems when terser removes console.log statements.
 */
var Module = {
  'print': function(text) { console.log(text) },
  'printErr': function(text) { console.warn(text) }
};