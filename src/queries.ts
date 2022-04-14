import * as github from '@actions/github';
import { filterCommentsByUser, filterCommitsByAuthorAndCreation, filterPRsByAuthorAndCreation } from './queryFilters';
import { InputFields, QueryGroup, QueryType } from './shared.types';

const getCommitsForPR = async (inputFields: InputFields, username: string, sinceIso: string, pr: any) => {
    if (pr.user.login === username) {
        return;
    }

    const [repoUrl] = pr.html_url.split('/pull');
    const [_, repoName] = repoUrl.split('github.com/');

    const requestOwner = repoName.includes('/') ? repoName.split('/')[0] : inputFields.owner;
    const { data: allPrCommits } = await github.getOctokit(process.env.GH_TOKEN).request(pr.commits_url, {
        owner: requestOwner,
        repo: repoName,
    });
    return {
        repo: repoName,
        titleData: {
            identifier: pr,
            title: pr.title,
            url: pr.html_url,
            username: pr.user.login,
        },
        data: filterCommitsByAuthorAndCreation(allPrCommits, username, sinceIso, true),
        type: QueryType['commit'],
    }
}
export const getPRsCreated = async (inputFields: InputFields, username: string, sinceIso: string) => {
    const allRepos = inputFields.queried_repos.split(',');
    const allSecondaryPRs = [];

    const allCreatedPRs = await Promise.all(allRepos.map(async repo => {
        const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
        const { data: allRepoPRs } = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls', {
            owner: requestOwner,
            repo: repoName,
            state: 'closed'
        });

        allRepoPRs.forEach(async pr => {
            const secondaryContribution = await getCommitsForPR(inputFields, username, sinceIso, pr);
            if (secondaryContribution) {
                allSecondaryPRs.push(secondaryContribution);
            }
        });

        return {
            repo,
            data: filterPRsByAuthorAndCreation(allRepoPRs, username, sinceIso),
            type: QueryType['pr-created'],
        };
    }));
    return [...allCreatedPRs, ...allSecondaryPRs];
}

export const getIssuesCreatedInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {
    const allRepos = inputFields.queried_repos.split(',');
    const allIssues = await Promise.all(allRepos.map(async repo => {
        const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
        const { data: allRepoIssues } = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues', {
            owner: requestOwner,
            repo: repoName,
            since: sinceIso,
            creator: username,
        });
        return {
            repo,
            data: allRepoIssues,
            type: QueryType['issue-created'],
        };
    }));
    return allIssues;
}

export const getDiscussionsCreatedInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {

}

export const getPRCommentsInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {
    const allRepos = inputFields.queried_repos.split(',');
    const commentsGroupedByPr: { [key: string]: QueryGroup } = {
    };
    await Promise.all(allRepos.map(async repo => {
        const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
        const { data: allPRComments } = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls/comments', {
            owner: requestOwner,
            repo: repoName,
            since: sinceIso,
            state: 'closed'
        });

        const filteredComments = filterCommentsByUser(allPRComments, username);
        filteredComments.forEach(comment => {
            const [prUrl] = comment.html_url.split('#');
            const [repoUrl, prNumber] = prUrl.split('/pull/');
            const [_, repoName] = repoUrl.split('github.com/');
            if (!commentsGroupedByPr[prUrl]) {
                commentsGroupedByPr[prUrl] = {
                    repo: repoName,
                    data: [],
                    titleData: {
                        identifier: comment.html_url,
                        title: `#${prNumber} in ${repo}`,
                        url: prUrl,
                        username: comment.user.login,
                    },
                    type: QueryType['pr-comment-created'],
                }
            }
            commentsGroupedByPr[prUrl].data.push(comment);
        });

        return '';
    }));
    return Object.values(commentsGroupedByPr);
}

export const getIssueCommentsInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {
    const allRepos = inputFields.queried_repos.split(',');
    const commentsGroupedByIssue: { [key: string]: QueryGroup } = {
    };
    await Promise.all(allRepos.map(async repo => {
        const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
        const { data: allRepoIssueComments } = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues/comments', {
            owner: requestOwner,
            repo: repoName,
            since: sinceIso,
        });
        const filteredComments = filterCommentsByUser(allRepoIssueComments, username);
        filteredComments.forEach(comment => {
            const [issueUrl] = comment.html_url.split('#');
            const [repoUrl, issueNumber] = issueUrl.split('/issues/');
            const [_, repoName] = repoUrl.split('github.com/');
            if (!commentsGroupedByIssue[issueUrl]) {
                commentsGroupedByIssue[issueUrl] = {
                    repo: repoName,
                    data: [],
                    titleData: {
                        identifier: comment.html_url,
                        title: `#${issueNumber} in ${repo}`,
                        url: issueUrl,
                        username: comment.user.login,
                    },
                    type: QueryType['issue-comment-created'],
                }
            }
            commentsGroupedByIssue[issueUrl].data.push(comment);
        });
        return;
    }));
    return Object.values(commentsGroupedByIssue);
}

export const getDiscussionCommentsInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {

}
