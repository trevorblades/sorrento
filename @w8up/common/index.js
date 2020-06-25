const expand = require('expand-template')();
const pluralize = require('pluralize');

exports.createWelcomeMessage = (organization, peopleAhead) => {
  // this value is calculated based on an EWT equation found here
  // https://developer.mypurecloud.com/api/rest/v2/routing/estimatedwaittime.html#methods_of_calculating_ewt
  const estimatedWaitTime = Math.round(
    (organization.averageHandleTime * peopleAhead) / organization.activeAgents
  );

  return expand(organization.welcomeMessage, {
    QUEUE_MESSAGE: peopleAhead
      ? expand(organization.queueMessage, {
          IS: pluralize('is', peopleAhead),
          PERSON: pluralize(organization.person, peopleAhead, true),
          ESTIMATED_WAIT_TIME: estimatedWaitTime
        })
      : organization.queueEmptyMessage,
    KEYWORD: organization.keyword
  });
};
