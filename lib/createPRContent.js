"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPRBodyText = void 0;
const shared_1 = require("./shared");
const createPRBodyText = (startDate, endDate, username) => `\
## @${username}'s Work for Week of ${(0, shared_1.formatDate)(startDate)} - ${(0, shared_1.formatDate)(endDate)}

### Description
This PR aggregates everything you've done in asssociated repos within the last week.

### Next Steps for @${username}
1. Review the PR
    - If you notice missing information, add it in and ping @inkblotty to update the script
2. Merge the PR
3. Add any Highlights to your Highlights file
4. In your next meeting with your manager, if there are any trends you want to discuss, bring up this document
`;
exports.createPRBodyText = createPRBodyText;
// object to be submitted for PR creation
// see https://docs.github.com/en/rest/reference/pulls#create-a-pull-request
const createPRObj = ({ owner, repo }, currentUsername, prData) => {
    return {
        body: (0, exports.createPRBodyText)(prData.startDate, prData.endDate, currentUsername),
        base: prData.destinationBranch,
        head: prData.tempBranch,
        owner,
        repo,
        title: prData.title,
    };
};
exports.default = createPRObj;
//# sourceMappingURL=createPRContent.js.map