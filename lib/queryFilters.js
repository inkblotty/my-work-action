"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterCommitsFromOtherUserOnPR = exports.filterCommentsByUser = exports.filterCommitsByAuthorAndCreation = exports.filterPRsByAuthorAndCreation = exports.filterCreatedThingByAuthorAndCreation = exports.getIsWithinRange = void 0;
const getIsWithinRange = (date1, date2) => {
    return (new Date(date1)).getTime() >= (new Date(date2)).getTime();
};
exports.getIsWithinRange = getIsWithinRange;
const filterCreatedThingByAuthorAndCreation = (list, username, sinceIso, excludeUser) => {
    return list.filter(thing => {
        var _a, _b, _c;
        const createdDate = (thing === null || thing === void 0 ? void 0 : thing.createdAt) || (thing === null || thing === void 0 ? void 0 : thing.pushedDate);
        const isWithinRange = (0, exports.getIsWithinRange)(createdDate, sinceIso);
        const userField = ((_b = (_a = thing.author) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.login) || ((_c = thing.author) === null || _c === void 0 ? void 0 : _c.login);
        const isAuthoredByUsername = excludeUser ? userField !== username : userField === username;
        return isAuthoredByUsername && isWithinRange;
    });
};
exports.filterCreatedThingByAuthorAndCreation = filterCreatedThingByAuthorAndCreation;
const filterPRsByAuthorAndCreation = (prsList, username, sinceIso, excludeUser) => {
    return prsList.filter(pr => {
        const isWithinRange = (0, exports.getIsWithinRange)(pr.created_at || pr.createdAt, sinceIso);
        const userField = pr.user ? pr.user.login : pr.author.login;
        const isAuthoredByUsername = excludeUser ? userField !== username : userField === username;
        return isAuthoredByUsername && isWithinRange;
    });
};
exports.filterPRsByAuthorAndCreation = filterPRsByAuthorAndCreation;
const filterCommitsByAuthorAndCreation = (commitsList, username, sinceIso, excludeUser) => {
    return commitsList.filter(({ commit }) => {
        const { date, login } = commit.author;
        const isWithinRange = (0, exports.getIsWithinRange)(date, sinceIso);
        const isAuthoredByUsername = excludeUser ? login !== username : login === username;
        return isAuthoredByUsername && isWithinRange;
    });
};
exports.filterCommitsByAuthorAndCreation = filterCommitsByAuthorAndCreation;
const filterCommentsByUser = (commentsArr, username, excludeUser) => {
    return commentsArr.filter(({ author }) => excludeUser ? author.login !== username : author.login === username);
};
exports.filterCommentsByUser = filterCommentsByUser;
// TODO: Refactor; can we use one of the existing filters instead?
// TODO: Add proper types and tests
const filterCommitsFromOtherUserOnPR = (currentUser, commits) => {
    const filterCommitsByCurrentUser = commits.filter(commit => commit.pullRequest.author.login === currentUser);
    return filterCommitsByCurrentUser;
};
exports.filterCommitsFromOtherUserOnPR = filterCommitsFromOtherUserOnPR;
//# sourceMappingURL=queryFilters.js.map