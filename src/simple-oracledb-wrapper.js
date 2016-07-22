var oracledb;
var enflate = require('./enflate-node-oracle-rows');
var connectionPool;

function createPool(options, callback){

  var username = options.username || '';
  var password = options.password || '';
  var connectString = options.connectString || '';

  if(username === '' || password === '' || connectString === '') return callback({"msg": "Must provide database credentials and connection info to use this module"});

  if(options.instantClientPath){
    process.env['PATH'] = options.instantClientPath + ';' + process.env['PATH'];
  }

  if(options.tnsPath){
    process.env['TNS_ADMIN'] = options.tnsPath;
  }

  try{
    oracledb = require('oracledb');
  }catch(){
    var prequire = require('parent-require')
    oracledb = prequire('oracledb');
  }

  oracledb.createPool({
    user          : username,
    password      : password,
    connectString : connectString
  }, function(err, pool){
    if(err) callback(err);
    connectionPool = pool;
    callback();
  })
}

function getPool(){
  return connectionPool;
}

function select(sql, args, callback){
  var pool = getPool();
  args = args || [];
  pool.getConnection(function(err, connection){
    if(err){
      return callback(err);
    }else{
      connection.execute(sql, args, function(err, result){
        if(err){
          connection.release(function(err){
            if(err) return callback(err);
          })
          return callback(err);
        }else{
          connection.release(function(err){
            if(err){
              return callback(err);
            }else{
              return callback(null, enflate(result, {camelCase:true}));
            }
          })
        }
      })
    }
  })
}

function execute(sql, args, callback){
  var pool = getPool();
  pool.getConnection(function(err, connection){
    if(err){
      return callback(err);
    }else{
      connection.execute(sql, args, function(err, result){
        if(err){
          connection.release(function(err){
            if(err) return callback(err);
          })
          return callback(err);
        }else{
          connection.commit(function(err){
            if(err){
              return callback(err);
            }else{
              connection.release(function(err){
                if(err){
                  return callback(err);
                }else{
                  return callback(null, result.rowsAffected);
                }
              })
            }
          })
        }
      })
    }
  })
}

module.exports.createPool = createPool;
module.exports.getPool = getPool;
module.exports.select = select;
module.exports.execute = execute;
