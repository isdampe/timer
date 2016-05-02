var exec = require('child_process').exec;
var fs = require('fs');

const BASE_FP = '/home/dampe/git/timer/docs/';

(function(){

  var timer = this;
  var data = {};

  timer.writeTimesheet = function( date, obj ) {
    var objJSON, uri;

    date = date.replace(/\//g,"-", date);
    uri = BASE_FP + date + '.json';
    try {
      objJSON = JSON.stringify(obj, null, 2);
    } catch(e) {
      return false;
    }


    fs.writeFile(uri, objJSON, {
      encoding: "utf8"
    });

  };

  timer.getWindowTitle = function(callback) {

    var child = exec('xdotool getwindowname $(xdotool getactivewindow)', function(err,out,serr){
      if ( err ) {
        console.log(err);
        callback(true);
        return false;
      }

      callback(false,out);

    });

  };

  timer.main = function() {

    //Main loop.
    var date = new Date();
    var cleanDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    var cleanTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    var unixTime = Math.round(date.getTime() / 1000,0);

    if (! data.hasOwnProperty(cleanDate) ) {
      data[cleanDate] = [];
    }

    timer.getWindowTitle(function(err,title){
      var obj = false;

      if ( err ) {
        console.log(err);
        return false;
      }

      obj = {
        date: date,
        cleanDate: cleanDate,
        cleanTime: cleanTime,
        unixTime: unixTime,
        windowTitle: title,
        duration: 0,
        finishTime: 0
      };

      //Check for a change.
      if ( data[cleanDate].length > 0 ) {

        var lastTitle = data[cleanDate][data[cleanDate].length -1].windowTitle;
        if ( lastTitle === title ) {

          //Update last entry.
          data[cleanDate][data[cleanDate].length -1].finishTime = unixTime;
          data[cleanDate][data[cleanDate].length -1].duration = unixTime - data[cleanDate][data[cleanDate].length -1].unixTime;
          return true;

        }

      }

      //Add it.
      if ( obj ) {
        data[cleanDate].push( obj );
      }

      timer.writeTimesheet(cleanDate, data[cleanDate]);

    });

  };

  setInterval(function(){
    timer.main();
  },1000);

  module.exports = this;

})();
