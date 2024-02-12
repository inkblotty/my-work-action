import { InputFields, OutputGroupGroup, QueryGroup } from "./shared.types";
import handlePRGroups from "./groupPRs";
import { getAllWorkForRepository } from "./queries";
import makeGroupsIntoMarkdown from "./makeGroupsIntoMarkdown";
import openBranch from "./openBranch";
import commitToBranch from "./commitToBranch";
import openPR from "./openPR";
import { createPRBodyText } from "./createPRContent";
import handleIssueGroups from "./groupIssues";
import { sleep } from './shared';
import handleDiscussionGroups from "./groupDiscussions";

async function handleSingleUser(inputFields: InputFields, username: string, startDate: Date) {
    const startDateIso = startDate.toISOString();

    const reposList = inputFields.queried_repos.split(',');
    const discussionComments: QueryGroup[] = [];
    const discussionsCreated: QueryGroup[] = [];
    const issuesCreated: QueryGroup[] = [];
    const issueComments: QueryGroup[] = [];
    const prComments: QueryGroup[] = [];
    const prCommits: QueryGroup[] = [];
    const prsCreated: QueryGroup[] = [];

    for (const repo of reposList) {
        const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
        // query all the things
        const repoData = await getAllWorkForRepository(requestOwner, repoName, username, startDateIso, inputFields.project_field);
        await sleep(1000);
        discussionComments.push(repoData.discussionComments);
        discussionsCreated.push(repoData.discussionsCreated);
        issuesCreated.push(repoData.issuesCreated);
        issueComments.push(repoData.issueComments);
        prComments.push(repoData.prComments);
        prCommits.push(repoData.prCommits);
        prsCreated.push(repoData.prsCreated);
    }

    // group all the things
    const prGroups = handlePRGroups(prsCreated, prComments, prCommits);
    const issueGroups = handleIssueGroups(issuesCreated, issueComments);
    const discussionGroups = handleDiscussionGroups(discussionsCreated, discussionComments);

    // format the groups into markdown
    const documentBody = makeGroupsIntoMarkdown([prGroups, issueGroups, discussionGroups], username, startDate, inputFields.project_field);

    // create a branch
    const { ref } = await openBranch(inputFields, username);

    // commit to branch
    await commitToBranch(inputFields, username, ref.id, ref.target.oid, documentBody);

    // open a PR
    const body = createPRBodyText(startDate, new Date(), username);

    return openPR(inputFields, username, ref.name, body);
}
export default handleSingleUser;
