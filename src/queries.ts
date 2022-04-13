import * as github from '@actions/github';
import { filterCommentsByUser, filterCommitsByAuthorAndCreation, filterPRsByAuthorAndCreation } from './queryFilters';
import { InputFields, QueryType } from './shared.types';

const getCommitsForPR = async (inputFields: InputFields, username: string, sinceIso: string, pr: any) => {
    if (pr.user.login === username) {
        return;
    }

    const { data: allPrCommits } = await github.getOctokit(process.env.GH_TOKEN).request(pr.commits_url, {
        owner: inputFields.owner,
        repo: pr.repo.name,
    });
    return {
        repo: pr.repo.full_name,
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
        const { data: allRepoPRs } = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls', {
            owner: inputFields.owner,
            repo,
        });

        allRepoPRs.forEach(async pr => {
            console.log('repo pr', pr);
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
        const { data: allRepoIssues } = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues', {
            owner: inputFields.owner,
            repo,
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
    const allPRs = await Promise.all(allRepos.map(async repo => {
        const { data: allPRComments } = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls/comments', {
            owner: inputFields.owner,
            repo,
            since: sinceIso,
        });
        return {
            repo,
            data: filterCommentsByUser(allPRComments, username),
            type: QueryType['pr-comment-created'],
        };
    }));
    return allPRs;
}

export const getIssueCommentsInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {
    const allRepos = inputFields.queried_repos.split(',');
    const allIssueComents = await Promise.all(allRepos.map(async repo => {
        const { data: allRepoIssueComments } = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues/comments', {
            owner: inputFields.owner,
            repo,
            since: sinceIso,
        });
        return {
            repo,
            data: filterCommentsByUser(allRepoIssueComments, username),
            type: QueryType['issue-comment-created'],
        };
    }));
    return allIssueComents;
}

export const getDiscussionCommentsInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {

}
