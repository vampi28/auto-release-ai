require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 746:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 670:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(746);
const github = __nccwpck_require__(670);

// Función para generar release notes automáticas
function generateReleaseNotes(pullRequest, commits, files) {
  const features = [];
  const fixes = [];
  const chores = [];
  const others = [];
  
  // Analizar commits por tipo
  commits.forEach(commit => {
    const message = commit.commit.message.toLowerCase();
    const fullMessage = commit.commit.message;
    
    if (message.startsWith('feat:') || message.startsWith('feature:')) {
      features.push(fullMessage.replace(/^(feat:|feature:)\s*/i, ''));
    } else if (message.startsWith('fix:') || message.startsWith('bug:')) {
      fixes.push(fullMessage.replace(/^(fix:|bug:)\s*/i, ''));
    } else if (message.startsWith('chore:') || message.startsWith('docs:') || message.startsWith('style:')) {
      chores.push(fullMessage.replace(/^(chore:|docs:|style:)\s*/i, ''));
    } else {
      others.push(fullMessage);
    }
  });

  // Analizar archivos modificados
  const addedFiles = files.filter(f => f.status === 'added').map(f => f.filename);
  const modifiedFiles = files.filter(f => f.status === 'modified').map(f => f.filename);
  const deletedFiles = files.filter(f => f.status === 'removed').map(f => f.filename);

  // Generar release notes
  let releaseNotes = `# Release Notes\n\n`;
  
  // Información del PR
  if (pullRequest.title) {
    releaseNotes += `## ${pullRequest.title}\n\n`;
  }
  
  if (pullRequest.body && pullRequest.body.trim()) {
    releaseNotes += `${pullRequest.body}\n\n`;
  }

  // Nuevas características
  if (features.length > 0) {
    releaseNotes += `## 🚀 Nuevas Características\n\n`;
    features.forEach(feature => {
      releaseNotes += `- ${feature}\n`;
    });
    releaseNotes += `\n`;
  }

  // Correcciones
  if (fixes.length > 0) {
    releaseNotes += `## 🐛 Correcciones\n\n`;
    fixes.forEach(fix => {
      releaseNotes += `- ${fix}\n`;
    });
    releaseNotes += `\n`;
  }

  // Otros cambios
  if (others.length > 0) {
    releaseNotes += `## 📝 Otros Cambios\n\n`;
    others.forEach(change => {
      releaseNotes += `- ${change}\n`;
    });
    releaseNotes += `\n`;
  }

  // Tareas de mantenimiento
  if (chores.length > 0) {
    releaseNotes += `## 🔧 Mantenimiento\n\n`;
    chores.forEach(chore => {
      releaseNotes += `- ${chore}\n`;
    });
    releaseNotes += `\n`;
  }

  // Archivos modificados
  if (addedFiles.length > 0 || modifiedFiles.length > 0 || deletedFiles.length > 0) {
    releaseNotes += `## 📁 Archivos Afectados\n\n`;
    
    if (addedFiles.length > 0) {
      releaseNotes += `### ✅ Archivos Agregados\n`;
      addedFiles.forEach(file => {
        releaseNotes += `- \`${file}\`\n`;
      });
      releaseNotes += `\n`;
    }
    
    if (modifiedFiles.length > 0) {
      releaseNotes += `### 📝 Archivos Modificados\n`;
      modifiedFiles.forEach(file => {
        releaseNotes += `- \`${file}\`\n`;
      });
      releaseNotes += `\n`;
    }
    
    if (deletedFiles.length > 0) {
      releaseNotes += `### ❌ Archivos Eliminados\n`;
      deletedFiles.forEach(file => {
        releaseNotes += `- \`${file}\`\n`;
      });
      releaseNotes += `\n`;
    }
  }

  // Información adicional
  releaseNotes += `---\n\n`;
  releaseNotes += `**Total de commits:** ${commits.length}\n`;
  releaseNotes += `**Archivos afectados:** ${files.length}\n`;
  
  if (pullRequest.user) {
    releaseNotes += `**Autor:** @${pullRequest.user.login}\n`;
  }

  return releaseNotes;
}

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

    // Generar release notes automáticas sin IA
    const releaseNotes = generateReleaseNotes(pullRequest, commits, files);

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

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map