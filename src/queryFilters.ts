export const filterPRsByAuthorAndCreation = (prsList: { user: { login: string }, created_at: string }[], username: string, sinceIso: string, excludeUser?: boolean) => {
    return prsList.filter(pr => {
        const isWithinRange = (new Date(pr.created_at)).getTime() >= (new Date(sinceIso)).getTime();
        const isAuthoredByUsername = excludeUser ? pr.user.login !== username : pr.user.login === username;
        return isAuthoredByUsername && isWithinRange;
    });
}

export const filterCommitsByAuthorAndCreation = (commitsList: { commit: { author: { login: string, date: string }  }}[], username: string, sinceIso: string, excludeUser?: boolean) => {
    return commitsList.filter(({ commit }) => {
        const { date, login } = commit.author;
        const isWithinRange = (new Date(date)).getTime() >= (new Date(sinceIso)).getTime();
        const isAuthoredByUsername = excludeUser ? login !== username : login === username;
        return isAuthoredByUsername && isWithinRange;
    });
}

export const filterCommentsByUser = (commentsArr: { user: { login: string  } }[], username: string, excludeUser?: boolean) => {
    return commentsArr.filter(({ user }) => excludeUser ? user.login !== username : user.login === username);
}
