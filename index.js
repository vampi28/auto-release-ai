const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
  try {
    const token = core.getInput('github_token');
    const openaiKey = core.getInput('openai_api_key');
    const octokit = github.getOctokit(token);
    const context = github.context;

    const { data: commits } = await octokit.rest.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number,
    });

    const commitMessages = commits.map(c => c.commit.message).join('\n');

    const aiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Genera una descripción de release basada en estos commits:' },
        { role: 'user', content: commitMessages }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const releaseNotes = aiResponse.data.choices[0].message.content;

    await octokit.rest.repos.createRelease({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag_name: `v${Date.now()}`,
      name: 'Release automática',
      body: releaseNotes,
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
