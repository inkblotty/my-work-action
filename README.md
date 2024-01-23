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

## Limitations
### Resource limits
If the resource limits are being hit, consider breaking up your workflow into individual users and/or separate grouping of repos.

## Required Fields
### Environment variables
- `GH_TOKEN`

### Input variables
- `owner`
The owner of the repo where the PR should be created. Often, either an organizaiton name or a user's handle.

- `queried_repos`
The repos that should be searched for relevant work, comma-separated.

- `repo`
The name of the repo where the PR should be created.

- `timespan` (optional)
Number of days to query, with today as the end date. Defaults to 7 days.

- `usernames`
Your user handle, or your list of teammates, comma-separated.
