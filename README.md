# Simple Oracledb Wrapper
Have you ever found the node-oracle (oracledb) callback syntax taxing, or even just annoying?  Well, then this repo is for you.

The simple oracledb wrapper abstracts the node-oracle mess so that you can just write some SQL, send it in and get JSON out of the database just like in your dreams (if, like me, you dream of such things).

This works well for simple small transactions, if you need more complicated transaction handling, pull requests are always welcome!

*Note that you do have to have oracledb installed in your project for this to work, installing simple oracledb wrapper does not install node-oracle for you, since there are a bunch of environment differences that impact that project, I'm lazy and didn't want to try to tackle that here.*

### Usage

1. Installation

  So I haven't gotten the dependency stuff figured out yet so that you can npm install the module, but you can use it as-is.

  Do a `git clone https://github.com/CRREL/simple-oracledb-wrapper.git` into your project dirctory (not into node_modules).

  Then from your main project script, you can require('./simple-oracledb-wrapper') pointing to the folder that you just downloaded from GitHub.

2. Start up the pool!

  The wrapper is designed to start up a connection pool, then allow you to abuse that pool at will.  The easiest way to do this is to start up the pool when starting your server, in the example below I'm spinning up the pool, then starting the server in the callback to make sure that I've got a good connection to the db before allowing Express to start up.

  Don't worry about the config stuff, we'll get to that later.

  ```javascript
  var sow = require('simple-oracledb-wrapper');
  var config = requiure('./config');
  var app = require('express')();

  sow.createPool(config, function(err){
    if(!err){
      app.listen(3001, function(){
        console.log('Server running on port 3001, go for it');
      })
    }
  })
  ```

  ###### Configuration Options for `sow.createPool(Object options, Function callback)`

  `sow.createPool()` takes two arguments, an object containing options, some required, some not, and a callback function that will be called with an error if there happens to be one or nothing at all if everything goes as planned.

  | Option | Description |
  | ------ | ----------- |
  | username | REQUIRED - Database username |
  | password | REQUIRED - Database password |
  | connectString | REQUIRED - Connection to the database (see below) |
  | instantClientPath | OPTIONAL - Path to folder where the Oracle instant client is installed, useful when instant client is in a weird place |
  | tnsPath | OPTIONAL - Path to tnsnames.ora file, useful when connecting to a database using an SID vs a service name |

  *connectString can be an [Oracle connection string](https://github.com/oracle/node-oracledb/blob/master/doc/api.md#-81-connection-strings) or a reference to a connection defined in tnsnames.ora, which if you are using a database that has an SID instead of a service name, you must use the tnsnames.ora file to connect (in my experience)*

  So for example given a tnsnames.ora file that looks like this:

  ```
  myservice =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = blah.blah.data.base)(PORT = 1521))
    (CONNECT_DATA =
      (SID = xe)
    )
  )
  ```

  Your connect string only needs to be `"myservice"` and as long as you provide the `tnsPath` you should be good to go.


3. Use the pool in your routes!

  "Ok, that's all fine and good, how do I use the pool to get data?" is what you're thinking... well it's pretty easy!

  In your routes, you can grab `sow` and access the database methods.  Right now we've got a simple select method that returns the rows that are the result of a query as an array of objects, and an execute method that allows for simple insert and update statements, making sure to commit changes before returning the number of rows affected.

  #### `sow.select(STRING sql, ARRAY args, FUNCTION callback)`

  So we're basically passing your sql into the `.execute()` method provided by [oracledb](https://github.com/oracle/node-oracledb/blob/master/doc/api.md#-424-execute), but the basics are that you pass in a SQL statement and an array of bind arguments (use `?` in your sql statement for bindings) along with a callback that gets an error as the first argument if something goes wrong, or null as the first argument and an array of record objects as the second if the query went as planned.  For example here's a simple route getting user profile info and returning it to the client:

  ```javascript
  app.get('/users', function(req, res, next){
  oes.select('select * from user_profiles', [], function(err, result){
      if(err){
        console.log('Error: ', err, new Date())
        res.status(500).send(err);
      }else{
        res.status(200).json(result);
      }
    })
  })
  ```

  #### `sow.execute(STRING sql, ARRAY args, FUNCTION callback)`

  `sow.execute()` is similar to select with the difference that we run a commit after the query is run to make sure that everything get's saved.

### @TODO (This stuff isn't totally done yet)

Please feel free to submit pull requests, it's a team effort folks.

 - [ ] Better logging, for sure.
 - [ ] Better documentation
 - [ ] More sophisticated use of transactions
 - [ ] Better error checking and messaging
 - [ ] Add an issue if you run into anything
