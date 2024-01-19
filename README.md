# My Work: An Action for Reflections

## Context
Review cycles can be time-consuming. You've got peers to review, your manager to review, yourself to review. You've got to think about each person's within the specified amount of time for the review, but not before that window of time, and you don't want to forget anything important.

With promotions, it can be just as difficult to summarize a period of time, focusing on the important highlights, and create a story about your growth and why you're ready for the next step.

Often, teams will encourage their members to keep a growing document that outlines personal accomplishments to help offset the difficulties of both reviews and promotion cycles. However, it's easy to forget to make note of the *big* things, and move on to the next task. Additionally, your peers, manager, and other team members may not have access to this document of your highlights.

The original idea of this action was to make review and promotion cycles easier.

However, this action is a tool for shorter periods of reflection too.

### Engineers
Use this action to help you pick out the important stuff you've accomplished. Show this to your bosses at reviews and promotions to make sure you're looking at the same evidence together.

### Managers & Direct Reports
Use this action as a tool to reflect on where your team member's time is spent. How much time do they contribute to their peers' success versus staying laser-focused on their own work? Are they pushing large chunks of work that are hard to review, or incremental changes that contribute to a larger story? Whatever workflows you prefer, use this tool to help.

## Required Fields
### Environment variables
- `GH_TOKEN`

### Input variables
- `output_repo`
The repo where the PR should be created. It should follow name-with-owner format, egz. github/docs

- `usernames`
Your user handle, or your list of teammates, comma-separated.

- `timespan` (optional)
Number of days to query, with today as the end date. Defaults to 7 days.

- `focused_orgs` (optional)
The orgs that should be searched for relevant work, comma-separated. When not specified, global data will be sourced.

- `focused_repos` (optional)
The repos that should be searched for relevant work, comma-separated. When not specified, results form all repos are going to be included.

- `excluded_repos` (optional)
The repos that should be exluded from the output, comma-separated. When not specified, results form all repos are going to be included.

## Limitation
Current implementation doesn't support pagination yet. For long time spanns, action may timeout. It is recommended to use `focused_orgs`, `focused_repos` & `excluded_repos` to mitigate this limitation.
