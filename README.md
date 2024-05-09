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
This action requires using a [legacy Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#personal-access-tokens-classic) with following scopes:
  - repo: read + write
  - discussions: read

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

- `project_field` (optional)
A ([single select](https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-single-select-fields)) project field to display for issues and pull requests. This is usually a column (on Table views) from a GitHub Project, such as Status or Iteration. 

- `destination_branch` (optional)
Defaults to 'main'. The branch that PRs should be created against.

## Local Development

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org). 20.x or later should work!

### Install dependencies

   ```bash
   npm install
   ```

### Run tests

   ```bash
   npm test
   ```

### Build dist

   ```bash
   npm run build
   ```

   > [!IMPORTANT]
   > This step is important! It will run [`ncc`](https://github.com/vercel/ncc)
   > to build the final JavaScript action code with all dependencies included.
   > If you do not run this step, the action will not work correctly when it is
   > used in a workflow.

### Format, test, and build

   ```bash
   npm run all
   ```

### Validating changes

To validate changes outside of the automated tests, you can:

1. Add the workflow to a test repo of your choice
1. Point workflow to inkblotty/my-work-action@your-branch
1. Trigger workflow run. See [these docs](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow) for more information about workflow triggers. 
   
   ```yml
   name: "My Work: @monalisa"

   # Set one or more options for triggering workflow runs. Some common examples included below.
   on:
     # Allows you to run this workflow manually from the Actions tab 
     workflow_dispatch:

     # Triggers the workflow on push or pull request events, but only for specific branch
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

     # Schedules workflow runs. See https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule for syntax.
     schedule:
       # Every Tuesday at 5 AM UTC (12 AM ET)
       - cron: "0 7 * * 2"

   jobs:
     my_work:
       name: "My Work"
       runs-on: ubuntu-latest
       env:
         REPOS_TO_QUERY: "foo/bar,baz/qux"
       steps:
         - name: Run my-work action
           uses: inkblotty/my-work-action@your-branch
           with:
             owner: monalisa
             repo: smile
             queried_repos: ${{ env.REPOS_TO_QUERY }}
             usernames: "monalisa"
           env:
             GH_TOKEN: ${{ secrets.GH_TOKEN }}
   ```
