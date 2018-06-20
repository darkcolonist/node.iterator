var moment = require('moment');

var helper = {
  /**
   * [log description]
   * @param  {[type]} message [description]
   * @param  {[type]} level   [info,error]
   * @return {[type]}         [description]
   */
  log(message, level){
    if(level === undefined) level = "info";

    if(typeof(message) === 'object')
      message = JSON.stringify(message);

    console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - ["+ level +"] - " + message);
  }
};

helper.log('helper.log loaded');

module.exports = helper;