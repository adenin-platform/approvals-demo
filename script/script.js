'use strict';

module.exports = async (activity) => {
  try {
    switch (activity.Request.Path) {
    case 'approve':
      approve();
      break;
    case 'reject':
      reject();
      break;
    default:
      generate();
    }
  } catch (error) {
    let m = error.message;

    if (error.stack) m = m + ': ' + error.stack;

    activity.Response.ErrorCode = (error.response && error.response.statusCode) || 500;
    activity.Response.Data = {
      ErrorText: m
    };
  }

  function approve() {
    activity.Response.Data.success = true;
  }

  function reject() {
    activity.Response.Data.success = true;
  }

  function generate() {
    let p = parseInt(activity.Request.Query.page) || 1;
    let n = parseInt(activity.Request.Query.pageSize) || 20;

    if (
      activity.Request.Data &&
      activity.Request.Data.args &&
      activity.Request.Data.args._page &&
      activity.Request.Data.args._pageSize
    ) {
      p = parseInt(activity.Request.Data.args._page) || 2;
      n = parseInt(activity.Request.Data.args._pageSize) || 20;
    }

    const items = [];

    for (let i = (p - 1) * n; i < n; i++) {
      const id = (p * 100) + i + 1;

      items.push({
        id: id,
        title: `approval ${id}`
      });
    }

    activity.Response.Data.items = items;
  }
};
