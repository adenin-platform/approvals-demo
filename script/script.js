'use strict';

module.exports = async (activity) => {
  try {
    switch (activity.Request.Path) {
    // approve action callback
    case 'approve':
      approve();
      break;
    // reject action callback
    case 'reject':
      reject();
      break;
    // request of approvals list
    default:
      generate();
    }
  } catch (error) {
    // standard error handling
    let m = error.message;

    if (error.stack) m = m + ': ' + error.stack;

    activity.Response.ErrorCode = (error.response && error.response.statusCode) || 500;
    activity.Response.Data = {
      ErrorText: m
    };
  }

  function approve() {
    // fetch the ID of the approved item
    const id = activity.Request.Data.model.id;

    // here we would implement logic to approve the item with above ID in an API call

    // send a success response
    activity.Response.Data = {
      id: id,
      success: true
    };
  }

  function reject() {
    // fetch the ID of the rejected item
    const id = activity.Request.Data.model.id;

    // here we would implement logic to reject the item with above ID in an API call

    // send a success response
    activity.Response.Data = {
      id: id,
      success: true
    };
  }

  function generate() {
    // Find the pagination parameters from request, or set defaults
    let action = 'firstpage';
    let page = parseInt(activity.Request.Query.page) || 1;
    let pageSize = parseInt(activity.Request.Query.pageSize) || 20;

    // if it is a request for the next page, fetch those values (or defaults)
    if (
      activity.Request.Data &&
      activity.Request.Data.args &&
      activity.Request.Data.args.atAgentAction === 'nextpage'
    ) {
      action = 'nextpage';
      page = parseInt(activity.Request.Data.args._page) || 2;
      pageSize = parseInt(activity.Request.Data.args._pageSize) || 20;
    }

    // correct any invalid pagination values
    if (page < 0) page = 1;
    if (pageSize < 1 || pageSize > 99) pageSize = 20;

    const items = [];

    // loop from first to last index of current page
    for (let i = (page - 1) * pageSize; i < page * pageSize; i++) {
      // genarate some random items, where we would normally fetch from API
      const id = (page * 100) + i + 1 - ((page - 1) * pageSize);

      items.push({
        id: id,
        title: `approval ${id}`,
        description: 'PTO Request',
        date: new Date()
      });
    }

    // attach items to the response
    activity.Response.Data.items = items;

    // Title of card
    activity.Response.Data.title = 'My Approvals';

    // Footer link and label
    activity.Response.Data.link = 'https://my-approvals.app/';
    activity.Response.Data.linkLabel = 'All Approvals';

    // capture how many approvals we have
    const value = items.length;

    // card isn't actionable if we have no approvals
    activity.Response.Data.actionable = value > 0;

    // set description text for initial overview
    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.description = value > 1 ? `You have ${value} approvals` : 'You have 1 approval';
    } else {
      activity.Response.Data.description = 'You have no approvals.';
    }

    // let the card know we want the next page next time, and current position
    activity.Response.Data._action = action;
    activity.Response.Data._page = page;
    activity.Response.Data._pageSize = pageSize;
  }
};
