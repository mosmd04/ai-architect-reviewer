import * as github from '@actions/github';
import * as core from '@actions/core';

const SIGNATURE = "<!-- AI-Architect-Reviewer-Signature -->";

export async function getPRDetails(octokit: ReturnType<typeof github.getOctokit>) {
  const { context } = github;
  
  if (context.eventName !== 'pull_request') {
    throw new Error(`This action only runs on pull_request events. Current event: ${context.eventName}`);
  }

  const pr = context.payload.pull_request;
  if (!pr) {
    throw new Error('Pull request payload is missing.');
  }

  const { owner, repo } = context.repo;
  const pull_number = pr.number;
  const title = pr.title;
  const description = pr.body || '';

  // Fetch the exact code diff
  const response = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: {
      format: 'diff'
    }
  });

  // The GitHub API returns the raw diff string when format is 'diff'
  const diff = response.data as unknown as string;

  return { owner, repo, pull_number, title, description, diff };
}

export async function createOrUpdateComment(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  issue_number: number,
  body: string
) {
  const commentBody = `${body}\n\n${SIGNATURE}`;

  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number
  });

  const existingComment = comments.find(comment => 
    comment.body?.includes(SIGNATURE)
  );

  if (existingComment) {
    core.info(`Updating existing comment (ID: ${existingComment.id})...`);
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existingComment.id,
      body: commentBody
    });
  } else {
    core.info('Creating new comment...');
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body: commentBody
    });
  }
}
