"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../shared");
const queryFilters_1 = require("./queryFilters");
const now = (new Date());
const lastWeek = new Date(now.getTime() - (shared_1.oneDayMs * 7));
const twoWeeksAgo = new Date(lastWeek.getTime() - (shared_1.oneDayMs * 7));
const username = 'boopbeep';
const testArr = [
    // first one is too old for PR, but will stick around for Comments filter
    {
        user: { login: username },
        created_at: twoWeeksAgo.toISOString(),
    },
    // second one has different user
    {
        user: { login: 'someone-else' },
        created_at: now.toISOString(),
    },
    {
        user: { login: username },
        created_at: lastWeek.toISOString(),
    }
];
describe('queryFilters', () => {
    test('filterPRsByAuthorAndCreation', () => {
        const result = (0, queryFilters_1.filterPRsByAuthorAndCreation)(testArr, username, lastWeek.toISOString());
        expect(result.length).toEqual(1);
        expect(result[0].created_at).toEqual(lastWeek.toISOString());
        expect(result[0].user.login).toEqual(username);
    });
    test('filterCommentsByUser', () => {
        const result = (0, queryFilters_1.filterCommentsByUser)(testArr, username);
        expect(result.length).toEqual(2);
        expect(result[0].user.login).toEqual(username);
        expect(result[1].user.login).toEqual(username);
    });
});
//# sourceMappingURL=queryFilters.test.js.map