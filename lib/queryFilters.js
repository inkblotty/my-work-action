"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterCommentsByUser = exports.filterCommitsByAuthorAndCreation = exports.filterPRsByAuthorAndCreation = void 0;
const filterPRsByAuthorAndCreation = (prsList, username, sinceIso, excludeUser) => {
    return prsList.filter(pr => {
        const isWithinRange = (new Date(pr.created_at)).getTime() >= (new Date(sinceIso)).getTime();
        const isAuthoredByUsername = excludeUser ? pr.user.login !== username : pr.user.login === username;
        return isAuthoredByUsername && isWithinRange;
    });
};
exports.filterPRsByAuthorAndCreation = filterPRsByAuthorAndCreation;
const filterCommitsByAuthorAndCreation = (commitsList, username, sinceIso, excludeUser) => {
    return commitsList.filter(({ commit }) => {
        const { date, login } = commit.author;
        const isWithinRange = (new Date(date)).getTime() >= (new Date(sinceIso)).getTime();
        const isAuthoredByUsername = excludeUser ? login !== username : login === username;
        return isAuthoredByUsername && isWithinRange;
    });
};
exports.filterCommitsByAuthorAndCreation = filterCommitsByAuthorAndCreation;
const filterCommentsByUser = (commentsArr, username, excludeUser) => {
    return commentsArr.filter(({ user }) => excludeUser ? user.login !== username : user.login === username);
};
exports.filterCommentsByUser = filterCommentsByUser;
//# sourceMappingURL=queryFilters.js.map