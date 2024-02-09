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
    projectItems?: ProjectItemForIssueOrPR[];
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

export type ProjectItemForIssueOrPR = {
    projectName: string;
    projectItemName: string;
}

export type ProjectItemsForIssuesOrPRs = Record<string, ProjectItemForIssueOrPR[]>;

export const getProjectItemsForPRs = (prs, prReviewsAndCommits) => {
  const projectItemsForPRs: ProjectItemsForIssuesOrPRs = getProjectItemsFromPRs(prs);
  const projectItemsForPRCommits: ProjectItemsForIssuesOrPRs = getProjectItemsFromPRs(prReviewsAndCommits);

  const allProjectItemsForPRs = {};
  for (const prUrl in projectItemsForPRs) {
    allProjectItemsForPRs[prUrl] = projectItemsForPRs[prUrl];
  }
  for (const prUrl in projectItemsForPRCommits) {
    if (!allProjectItemsForPRs.hasOwnProperty(prUrl)) {
      allProjectItemsForPRs[prUrl] = projectItemsForPRCommits[prUrl];
    } else {
        allProjectItemsForPRs[prUrl] = allProjectItemsForPRs[prUrl].concat(projectItemsForPRCommits[prUrl]);
    }
  }
  return allProjectItemsForPRs;
}

export const getProjectItemsForIssues = (issues) => {
    const projectItemsForIssues: Record<string, ProjectItemForIssueOrPR[]> = {};

    for (const issue of issues) {
        for (const projectItem of issue.projectItems.edges) {
            const projectName = projectItem.node.project.title;
            const projectItemName = projectItem.node.fieldValueByName && projectItem.node.fieldValueByName.name;
            if (projectName && projectItemName) {
                if (!projectItemsForIssues.hasOwnProperty(issue.url)) {
                    projectItemsForIssues[issue.url] = [];
                }
                projectItemsForIssues[issue.url].push({ projectName, projectItemName });
            }
        }
    }

    return projectItemsForIssues;
}

const getProjectItemsFromPRs = (prs) => {
    const projectItemsForPRs: Record<string, ProjectItemForIssueOrPR[]> = {};

    for (const pr of prs) {
      for (const closingReference of pr.closingIssuesReferences.edges) {
          for (const projectItem of closingReference.node.projectItems.edges) {
              const projectName = projectItem.node.project.title;
              const projectItemName = projectItem.node.fieldValueByName && projectItem.node.fieldValueByName.name;
              if (projectName && projectItemName) {
                  if (!projectItemsForPRs.hasOwnProperty(pr.url)) {
                      projectItemsForPRs[pr.url] = [];
                  }
                  projectItemsForPRs[pr.url].push({ projectName, projectItemName });
              }
          }
      }
    }

    return projectItemsForPRs;
}

 export const addProjectItemsToItems = (items: { url?: string }[], projectItems: ProjectItemsForIssuesOrPRs) => {
    return items.map(item => {
        const projectItemsForItem = projectItems[item.url];
        if (!projectItemsForItem) {
            return {
                ...item,
                projectItems: []
            }
        }
        return {
            ...item,
            projectItems: projectItemsForItem
        }
    })
 }
 