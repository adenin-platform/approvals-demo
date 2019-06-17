const got = require('got');

module.exports = async function (activity) {

  try {
    
    const response = await got('https://httpbin.org/ip', {
      json: true
    });
    
    // copy response data
    activity.Response.Data = response.body;

  } catch (error) {

    // return error response
    var m = error.message;    
    if (error.stack) m = m + ": " + error.stack;

    activity.Response.ErrorCode = (error.response && error.response.statusCode) || 500;
    activity.Response.Data = { ErrorText: m };

  }

};
