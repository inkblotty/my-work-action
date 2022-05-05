export const getIsWithinRange = (date1: string, date2: string): boolean => {
    return (new Date(date1)).getTime() >= (new Date(date2)).getTime();
}

interface CreatedThing {
    author?: {
      login?: string;
      user?: {
        login: string;
      }
    };
    created_at?: string;
    createdAt?: string;
    pushedDate?: string;
    user?: {
        login: string;
    };
}
export const filterCreatedThingByAuthorAndCreation = (list: CreatedThing[], username: string, sinceIso, excludeUser?: boolean) => {
    return list.filter(thing => {
        const createdDate = thing?.createdAt || thing?.pushedDate;
        const isWithinRange = getIsWithinRange(createdDate, sinceIso);
        const userField = thing.author?.user?.login || thing.author?.login;
        const isAuthoredByUsername = excludeUser ? userField !== username : userField === username;
        return isAuthoredByUsername && isWithinRange;
    })
}
export const filterPRsByAuthorAndCreation = (prsList: CreatedThing[], username: string, sinceIso: string, excludeUser?: boolean) => {
    return prsList.filter(pr => {
        const isWithinRange = getIsWithinRange(pr.created_at || pr.createdAt, sinceIso);
        const userField = pr.user ? pr.user.login : pr.author.login;
        const isAuthoredByUsername = excludeUser ? userField !== username : userField === username;
        return isAuthoredByUsername && isWithinRange;
    });
}

export const filterCommitsByAuthorAndCreation = (commitsList: { commit: { author: { login: string, date: string }  }}[], username: string, sinceIso: string, excludeUser?: boolean) => {
    return commitsList.filter(({ commit }) => {
        const { date, login } = commit.author;
        const isWithinRange = getIsWithinRange(date, sinceIso);
        const isAuthoredByUsername = excludeUser ? login !== username : login === username;
        return isAuthoredByUsername && isWithinRange;
    });
}

interface ReviewComment {
    author: {
        login: string;
    };
    html_url: string;
    path?: string;
}
export const filterCommentsByUser = (commentsArr: ReviewComment[], username: string, excludeUser?: boolean): ReviewComment[] => {
    return commentsArr.filter(({ author }) => excludeUser ? author.login !== username : author.login === username);
}

// TODO: Refactor; can we use one of the existing filters instead?
// TODO: Add proper types and tests
export const filterCommitsFromOtherUserOnPR = (currentUser: String, commits) => {
  const filterPRsByOtherAuthors = commits.filter(commit => {
      const [filteredPRs] = commit.commit.associatedPullRequests.nodes.filter(node => !node.author.login.includes(currentUser));

    return filteredPRs
  });

  const filterCommitsByCurrentUser = filterPRsByOtherAuthors.filter(pr => pr.commit.author.user.login.includes(currentUser))

  return filterCommitsByCurrentUser;
}

// TODO: Refactor; can we use one of the existing filters instead?
// TODO: Add proper types and tests
export const filterCommentsFromOtherUserOnPR = (currentUser: String, reviews) => {
  const filterOtherAuthors = reviews.filter(review => review.pullRequest.author.login !== currentUser);
  const comments = filterOtherAuthors.map(item => item.comments.nodes).flat();

  return comments;
}
