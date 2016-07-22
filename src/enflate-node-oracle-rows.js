var toCamelCase = require('./to-camel-case');

module.exports = function(results, options){
  if(!options) options = {};
  if(results.metaData && results.rows){
    var metaData = results.metaData,
        rows = results.rows,
        outRow = {},
        output = [],
        cc = options.camelCase ? true : false;

    for(var i = 0; i < rows.length; i++){
      outRow = {};
      rows[i].forEach(function(column, idx){
        var key = cc ? toCamelCase(metaData[idx].name) : metaData[idx].name;
        outRow[key] = column;
      });
      output.push(outRow);
    }

    return output;

  }else{
    throw new Error('Not a valid node-oracle results dataset');
  }
}
