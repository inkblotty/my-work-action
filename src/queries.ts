import * as github from '@actions/github';
import { filterCommentsByUser, filterPRsByAuthorAndCreation } from './queryFilters';
import { InputFields, QueryType } from './shared.types';

export const getPRsCreated = async (inputFields: InputFields, username: string, sinceIso: string) => {
    const allRepos = inputFields.queried_repos.split(',');
    const allPRs = await Promise.all(allRepos.map(async repo => {
        const allRepoPRs = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls', {
            owner: inputFields.owner,
            repo,
        });
        return {
            repo,
            // @ts-ignore
            data: filterPRsByAuthorAndCreation(allRepoPRs, username, sinceIso),
            type: QueryType['pr-created'],
        };
    }));
    return allPRs;
}

export const getIssuesCreatedInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {
    const allRepos = inputFields.queried_repos.split(',');
    const allIssues = await Promise.all(allRepos.map(async repo => {
        const allRepoIssues = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues', {
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
        const allPRComments = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls/comments', {
            owner: inputFields.owner,
            repo,
            since: sinceIso,
        });
        return {
            repo,
            // @ts-ignore
            data: filterCommentsByUser(allPRComments, username),
            type: QueryType['pr-comment-created'],
        };
    }));
    return allPRs;
}

export const getIssueCommentsInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {
    const allRepos = inputFields.queried_repos.split(',');
    const allIssueComents = await Promise.all(allRepos.map(async repo => {
        const allRepoIssueComments = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues/comments', {
            owner: inputFields.owner,
            repo,
            since: sinceIso,
        });
        console.log('allRepoIssueComments', allRepoIssueComments);
        return {
            repo,
            // @ts-ignore -- the type here is different than the docs
            data: filterCommentsByUser(allRepoIssueComments, username),
            type: QueryType['issue-comment-created'],
        };
    }));
    return allIssueComents;
}

export const getDiscussionCommentsInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {

}

// export const getCommitsInRange = async (inputFields: InputFields, username: string, sinceIso: string) => {
//     const allRepos = inputFields.queried_repos.split(',');
//     const allCommits = await Promise.all(allRepos.map(async repo => {
//         const allRepoCommits = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls', {
//             owner: inputFields.owner,
//             repo,
//             since: sinceIso,
//             author: username
//         });
//         return {
//             repo,
//             data: allRepoCommits,
//             type: QueryType['commit'],
//         };
//     }));
//     return allCommits;
// }