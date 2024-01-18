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
    url?: string;
    created_at?: string;
    createdAt?: string;
    pushedDate?: string;
    user?: {
        login: string;
    };
    epics?: EpicForIssueOrPR[];
}
export const filterCreatedThingByCreation = (list: CreatedThing[], sinceIso: string) => {
    return list.filter(thing => {
        const createdDate = thing?.createdAt || thing?.pushedDate;
        const isWithinRange = getIsWithinRange(createdDate, sinceIso);
        return isWithinRange;
    })
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
  const filterCommitsByCurrentUser = commits.filter(commit => commit.pullRequest.author.login === currentUser)

  return filterCommitsByCurrentUser;
}

export type EpicForIssueOrPR = {
    projectName: string;
    epicName: string;
}

export type EpicsForIssuesOrPRs = Record<string, EpicForIssueOrPR[]>;

export const getEpicsForPRs = (prs, prReviewsAndCommits) => {
  const epicsForPRs: EpicsForIssuesOrPRs = getEpicsFromPRs(prs);
  const epicsForPRCommits: EpicsForIssuesOrPRs = getEpicsFromPRs(prReviewsAndCommits);

  const allEpicsForPRs = {};
  for (const prUrl in epicsForPRs) {
    allEpicsForPRs[prUrl] = epicsForPRs[prUrl];
  }
  for (const prUrl in epicsForPRCommits) {
    if (!allEpicsForPRs.hasOwnProperty(prUrl)) {
      allEpicsForPRs[prUrl] = epicsForPRCommits[prUrl];
    } else {
        allEpicsForPRs[prUrl] = allEpicsForPRs[prUrl].concat(epicsForPRCommits[prUrl]);
    }
  }
  return allEpicsForPRs;
}

export const getEpicsForIssues = (issues) => {
    const epicsForIssues: Record<string, EpicForIssueOrPR[]> = {};

    for (const issue of issues) {
        for (const projectItem of issue.projectItems.edges) {
            const projectName = projectItem.node.project.title;
            const epicName = projectItem.node.fieldValueByName && projectItem.node.fieldValueByName.name;
            if (projectName && epicName) {
                if (!epicsForIssues.hasOwnProperty(issue.url)) {
                    epicsForIssues[issue.url] = [];
                }
                epicsForIssues[issue.url].push({ projectName, epicName });
            }
        }
    }

    return epicsForIssues;
}

const getEpicsFromPRs = (prs) => {
    const epicsForPRs: Record<string, EpicForIssueOrPR[]> = {};

    for (const pr of prs) {
      for (const closingReference of pr.closingIssuesReferences.edges) {
          for (const projectItem of closingReference.node.projectItems.edges) {
              const projectName = projectItem.node.project.title;
              const epicName = projectItem.node.fieldValueByName && projectItem.node.fieldValueByName.name;
              if (projectName && epicName) {
                  if (!epicsForPRs.hasOwnProperty(pr.url)) {
                      epicsForPRs[pr.url] = [];
                  }
                  epicsForPRs[pr.url].push({ projectName, epicName });
              }
          }
      }
    }

    return epicsForPRs;
}

 export const addEpicsToItems = (items: { url?: string }[], epics: EpicsForIssuesOrPRs) => {
    return items.map(item => {
        const epicsForItem = epics[item.url];
        if (!epicsForItem) {
            return item;
        }
        return {
            ...item,
            epics: epicsForItem
        }
    })
 }