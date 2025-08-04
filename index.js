const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const token = core.getInput("github_token");
    const prNumberInput = core.getInput("pr_number");
    const octokit = github.getOctokit(token);
    const context = github.context;

    // Determinar el número de PR a usar
    let prNumber;
    if (prNumberInput) {
      prNumber = parseInt(prNumberInput);
      console.log(`Usando PR número proporcionado: ${prNumber}`);
    } else if (context.payload.pull_request) {
      prNumber = context.payload.pull_request.number;
      console.log(`Usando PR número del evento: ${prNumber}`);
    } else {
      throw new Error(
        "No se pudo determinar el número de PR. Proporciona pr_number como input o ejecuta desde un evento de PR."
      );
    }

    // Obtener información del PR
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
    });

    // Obtener commits del PR
    const { data: commits } = await octokit.rest.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
    });

    // Obtener archivos modificados
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
    });

    // Obtener diff del PR
    const { data: diff } = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
      mediaType: {
        format: "diff",
      },
    });

    // Preparar información para GitHub Copilot
    const commitMessages = commits
      .map((c) => `- ${c.commit.message}`)
      .join("\n");
    const filesList = files
      .map((f) => `- ${f.filename} (${f.status})`)
      .join("\n");

    const prompt = `Basándote en la siguiente información de un Pull Request, genera release notes profesionales en español:

TÍTULO DEL PR: ${pullRequest.title}
DESCRIPCIÓN DEL PR: ${pullRequest.body || "Sin descripción"}

COMMITS:
${commitMessages}

ARCHIVOS MODIFICADOS:
${filesList}

DIFF DE CAMBIOS:
${
  diff.length > 3000
    ? diff.substring(0, 3000) + "\n...[diff truncado]..."
    : diff
}

Por favor, genera release notes que incluyan:
1. Un resumen de los cambios principales
2. Nuevas características agregadas
3. Correcciones de bugs
4. Mejoras de rendimiento (si aplica)
5. Cambios que podrían afectar a los usuarios

Formato la respuesta de manera profesional y clara.`;

    // Usar GitHub Copilot Chat API
    const copilotResponse = await octokit.request(
      "POST /copilot/chat/completions",
      {
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente especializado en generar release notes profesionales basándote en información de Pull Requests.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "gpt-4o",
        max_tokens: 1000,
      }
    );

    const releaseNotes = copilotResponse.data.choices[0].message.content;

    // Determinar el tag a usar
    const customVersion = core.getInput("version");
    let tagName;

    if (customVersion) {
      // Usar versión personalizada
      tagName = customVersion.startsWith("v")
        ? customVersion
        : `v${customVersion}`;
      console.log(`Usando versión personalizada: ${tagName}`);
    } else {
      // Generar tag basado en la fecha y hora actual
      const now = new Date();
      tagName = `v${now.getFullYear()}.${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${now.getDate().toString().padStart(2, "0")}-${now
        .getHours()
        .toString()
        .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;
      console.log(`Generando tag automático: ${tagName}`);
    }

    // Crear la release
    const release = await octokit.rest.repos.createRelease({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag_name: tagName,
      name: `Release ${tagName}`,
      body: releaseNotes,
      draft: false,
      prerelease: false,
    });

    console.log(`Release creada exitosamente: ${release.data.html_url}`);
    core.setOutput("release_url", release.data.html_url);
    core.setOutput("tag_name", tagName);
  } catch (error) {
    console.error("Error:", error);
    core.setFailed(error.message);
  }
}

run();
