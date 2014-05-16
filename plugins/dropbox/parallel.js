var parallel = function(commands, cb) {
  var res = []
    , anyErr = null
    , runAfter
    ;

  runAfter = function(command, times) {
    var _times = 1;
    return function() {
      if (_times < times) {
        _times++;
        return;
      }
      else {
        // console.log("Executing: ", command.toString(), anyErr, res)
        command(anyErr, res);
      }
    };
  };

  var exec = runAfter(cb, commands.length);

  commands.forEach(function(cmd) {
    cmd(function(err, results) {
      if (err) {
        anyErr = err;
        exec();
        return;
      }
      res = res.concat(results);
      exec();
    });
  });
};

module.exports = parallel;