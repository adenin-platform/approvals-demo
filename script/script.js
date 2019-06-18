'use strict';

const got = require('got');

module.exports = async (activity) => {
  try {
    switch (activity.Request.Path) {
    // approve action callback
    case 'approve':
      await approve();
      break;

    // reject action callback
    case 'reject':
      await reject();
      break;

    // request of approvals list
    default:
      await generate();
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

  async function approve() {
    // fetch the ID of the approved item
    const id = activity.Request.Data.model.id;

    const response = await got.put(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      body: activity.Request.Data.model,
      json: true
    });

    // send a success response
    activity.Response.Data = {
      id: id,
      success: response.statusCode === 200
    };
  }

  async function reject() {
    // fetch the ID of the rejected item
    const id = activity.Request.Data.model.id;

    const response = await got.put(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      body: activity.Request.Data.model,
      json: true
    });

    // send a success response
    activity.Response.Data = {
      id: id,
      success: response.statusCode === 200
    };
  }

  async function generate() {
    // Find the pagination parameters from request, or set defaults
    let action = 'firstpage';
    let page = parseInt(activity.Request.Query.page) || 1;
    let pageSize = parseInt(activity.Request.Query.pageSize) || 20;

    // if it is a request for the next page, fetch those values (or defaults)
    if (activity.Request.Data && activity.Request.Data.args && activity.Request.Data.args.atAgentAction === 'nextpage') {
      action = 'nextpage';
      page = parseInt(activity.Request.Data.args._page) || 2;
      pageSize = parseInt(activity.Request.Data.args._pageSize) || 20;
    }

    // correct any invalid pagination values
    if (page < 0) page = 1;
    if (pageSize < 1 || pageSize > 99) pageSize = 20;

    // let the card know we want the next page next time, and current position
    activity.Response.Data._action = action;
    activity.Response.Data._page = page;
    activity.Response.Data._pageSize = pageSize;

    const response = await got('https://jsonplaceholder.typicode.com/posts/');
    const items = JSON.parse(response.body);

    const paginatedItems = [];

    // loop from first to last index of current page
    for (let i = (page - 1) * pageSize; i < page * pageSize; i++) {
      const item = items[i];

      // if there's no item, we've reached the last one
      if (!item) break;

      // genarate some random items, where we would normally fetch from API
      paginatedItems.push({
        id: item.id,
        title: `approval ${item.id}`,
        description: 'PTO Request',
        date: new Date()
      });
    }

    // attach items to the response
    activity.Response.Data.items = paginatedItems;

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
  }
};
