"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../shared");
const createPRContent_1 = require("./createPRContent");
const startDate = new Date((new Date()).getTime() - (shared_1.oneDayMs * 7));
const endDate = new Date();
describe('createPRContent', () => {
    test('createPRBodyText', () => {
        const username = 'beepboop';
        const output = `\
## @${username}'s Work for Week of ${(0, shared_1.formatDate)(startDate)} - ${(0, shared_1.formatDate)(endDate)}}

### Description
This PR aggregates everything you've done in asssociated repos within the last week.

### Next Steps for @${username}
1. Review the PR
    - If you notice missing information, add it in and ping @inkblotty to update the script
2. Merge the PR
3. Add any Highlights to your Highlights file
4. In your next meeting with your manager, if there are any trends you want to discuss, bring up this document
`;
        expect((0, createPRContent_1.createPRBodyText)(startDate, endDate, username)).toEqual(output);
    });
    test('createPRObj', () => {
        const currentUsername = 'boopbeep';
        const inputObj = {
            owner: 'org-123',
            repo: 'repo-abc',
        };
        const prData = {
            destinationBranch: 'main',
            endDate,
            startDate,
            tempBranch: 'temp/automated-thing',
            title: `@${currentUsername}'s Work`
        };
        const output = Object.assign(Object.assign({ body: (0, createPRContent_1.createPRBodyText)(startDate, endDate, currentUsername), base: prData.destinationBranch, head: prData.tempBranch }, inputObj), { title: prData.title });
        const result = (0, createPRContent_1.default)(inputObj, currentUsername, prData);
        expect(result.body).toEqual(output.body);
        expect(result.base).toEqual(output.base);
        expect(result.head).toEqual(output.head);
        expect(result.owner).toEqual(output.owner);
        expect(result.title).toEqual(output.title);
        expect(result.repo).toEqual(output.repo);
    });
});
//# sourceMappingURL=createPRContent.test.js.map