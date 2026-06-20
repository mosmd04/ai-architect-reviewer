import * as core from '@actions/core';
import * as github from '@actions/github';
import { getPRDetails, createOrUpdateComment } from './github.js';
import { analyzeDiff } from './ai.js';
import { verifyLicense } from './license.js';

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true });
    const llmApiKey = core.getInput('llm-api-key', { required: true });
    const licenseKey = core.getInput('license-key');
    const model = core.getInput('model') || 'gpt-4o-mini';

    core.info('Initializing Octokit...');
    const octokit = github.getOctokit(token);

    // Verify license before fetching the diff or calling AI
    const { owner, repo } = github.context.repo;
    const repoFullName = `${owner}/${repo}`;
    
    const prNumber = github.context.payload.pull_request?.number;
    if (!prNumber) {
      throw new Error('Could not find pull request number in payload. Ensure this action runs on pull_request events.');
    }

    core.info('Verifying license...');
    const licenseCheck = await verifyLicense(licenseKey, repoFullName);

    if (!licenseCheck.valid) {
      core.warning(`License verification failed: ${licenseCheck.reason}`);
      
      const skippedMessage = `🔒 **Architectural Review Skipped.** You have exceeded the free tier or provided an invalid license. Please upgrade to a Pro License to enable AI Architectural reviews for your team: [Upgrade Here](https://your-store.com/pricing)`;
      
      await createOrUpdateComment(octokit, owner, repo, prNumber, skippedMessage);
      
      // Exit gracefully without failing the build, as the review is just skipped
      core.info('Action exiting early due to missing/invalid license.');
      return;
    }

    core.info('License is valid. Fetching PR details and code diff...');
    const prDetails = await getPRDetails(octokit);

    core.info(`Analyzing diff with AI-Architect-Reviewer using model ${model}...`);
    const reviewMarkdown = await analyzeDiff(
      prDetails.title,
      prDetails.description,
      prDetails.diff,
      llmApiKey,
      model
    );

    core.info('Posting review comment to PR...');
    await createOrUpdateComment(
      octokit,
      prDetails.owner,
      prDetails.repo,
      prDetails.pull_number,
      reviewMarkdown
    );

    core.info('Action completed successfully.');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Action failed with error: ${error.message}`);
    } else {
      core.setFailed('Action failed with an unknown error.');
    }
  }
}

// Start the action
run();
