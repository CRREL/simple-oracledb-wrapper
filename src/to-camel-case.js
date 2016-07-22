module.exports = function(str){
  return str.toLowerCase().replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
}
