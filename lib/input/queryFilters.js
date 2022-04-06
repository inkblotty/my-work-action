"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterCommentsByUser = exports.filterPRsByAuthorAndCreation = void 0;
const filterPRsByAuthorAndCreation = (prsList, username, sinceIso) => {
    return prsList.filter(pr => {
        const isWithinRange = (new Date(pr.created_at)).getTime() >= (new Date(sinceIso)).getTime();
        const isAuthoredByUsername = pr.user.login === username;
        return isAuthoredByUsername && isWithinRange;
    });
};
exports.filterPRsByAuthorAndCreation = filterPRsByAuthorAndCreation;
const filterCommentsByUser = (commentsArr, username) => {
    return commentsArr.filter(({ user }) => user.login === username);
};
exports.filterCommentsByUser = filterCommentsByUser;
//# sourceMappingURL=queryFilters.js.map