interface InputFields {
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