export const filterPRsByAuthorAndCreation = (prsList: { user: { login: string }, created_at: string }[], username: string, sinceIso: string) => {
    return prsList.filter(pr => {
        const isWithinRange = (new Date(pr.created_at)).getTime() >= (new Date(sinceIso)).getTime();
        const isAuthoredByUsername = pr.user.login === username;
        return isAuthoredByUsername && isWithinRange;
    });
}

export const filterCommentsByUser = (commentsArr: { user: { login: string  } }[], username: string) => {
    return commentsArr.filter(({ user }) => user.login === username);
}
