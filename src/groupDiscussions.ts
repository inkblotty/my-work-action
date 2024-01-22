import { log } from "console";
import { OutputGroup, OutputGroupGroup, QueryGroup, QueryType } from "./shared.types";

const handleDiscussionGroups = (allDiscussionsCreated: QueryGroup[], allDiscussionComments: QueryGroup[]): OutputGroupGroup => {
    const finalDiscussions: OutputGroupGroup = {
        // primary, meaning directly authored
        primary: {
        },
        // secondary, meaning contributed to or reviewed
        secondary: {
        },
        // unknown, meaning the commits are unattached to a PR
        unknown: {
        }
    };

    for (const repoGroup of allDiscussionsCreated) {

        const { data, type } = repoGroup;
        if (type === QueryType['discussion-created'] && data[0]) {
            const [repoUrl] = data[0].url.split('/discussions');
            const [_, repoName] = repoUrl.split('github.com/');

            finalDiscussions.primary[repoName] = {
                groupTitle: `Discussion Created in [${repoName}](${repoUrl})`,
                artifacts: data.map(discussion => ({
                    title: discussion.title,
                    url: discussion.url,
                }))
            }
        }
    };

    for (const repoGroup of allDiscussionComments) {
        for (const comment of repoGroup.data) {
            const discussionUrl = comment.url.split('#')[0];

            // make sure that comment belongs to a group
            if (!finalDiscussions.secondary[discussionUrl]) {
                finalDiscussions.secondary[discussionUrl] = {
                    groupTitle: `Left comments on discussion: [${comment.discussion.title}](${discussionUrl})`,
                    artifacts: [],
                }
            }

            finalDiscussions.secondary[discussionUrl].artifacts.push({
                title: `Comment #${finalDiscussions.secondary[discussionUrl].artifacts.length + 1}`,
                url: comment.url,
            });
        }
    };
    return finalDiscussions as OutputGroupGroup;
}
export default handleDiscussionGroups;
