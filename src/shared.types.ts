import { EpicForIssueOrPR } from "./queryFilters";

export enum QueryType {
    'commit',
    'discussion-created',
    'discussion-comment-created',
    'issue-created',
    'issue-comment-created',
    'pr-created',
    'pr-comment-created',
    'pr-commit',
};

export interface QueryGroup {
    repo: string;
    titleData?: {
        identifier: string;
        title: string;
        url: string;
        username?: string;
    };
    data: any[]; // this will be the array of comments, commits, prs, etc.
    type: QueryType;
}

export interface OutputGroup {
    [repoOrEventString: string]: {
        groupTitle: string;
        itemType: string;
        artifacts: {
            title: string;
            url: string;
            epics: EpicForIssueOrPR[];
        }[];
    };
}
export interface OutputGroupGroup {
    primary: OutputGroup;
    secondary: OutputGroup;
    unknown: OutputGroup;
}

export interface InputFields {
    owner: string;
    queried_repos: string;
    repo: string;
    timespan: number;
    usernames: string;
}

type WorkItemType = 'pull-request' | 'discussion' | 'issue' | 'review' | 'commit' | 'comment';

interface WorkItem {
    organization: string;
    ownership: 'primary' | 'secondary';
    repo: string;
    title: string;
    type: WorkItemType;
    url: string;
}

// helpful to summarize many similar items; children must share the same type and repo
interface WorkItemGroup {
    children: WorkItem[];
    groupName: string;
    organization: string;
    repo: string;
    type: WorkItemType;
}