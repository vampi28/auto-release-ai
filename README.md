# Auto Release with GitHub Copilot

GitHub Action que genera releases automáticas con descripciones inteligentes utilizando GitHub Copilot.

## Características

- 🤖 Genera release notes automáticas usando GitHub Copilot
- 📝 Analiza commits, archivos modificados y descripción del PR
- 🏷️ Crea tags automáticos con formato temporal
- 🔄 Se integra perfectamente con el flujo de trabajo de GitHub

## Uso

### Configuración Básica

```yaml
name: Auto Release
on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  release:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: read
    steps:
      - name: Create Release
        uses: ./
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Configuración Avanzada

```yaml
name: Auto Release
on:
  pull_request:
    types: [closed]
    branches: [main, develop]

jobs:
  release:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Create Release
        id: release
        uses: ./
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Print Release Info
        run: |
          echo "Release URL: ${{ steps.release.outputs.release_url }}"
          echo "Tag Name: ${{ steps.release.outputs.tag_name }}"
```

## Inputs

| Input          | Descripción                                         | Requerido | Default |
| -------------- | --------------------------------------------------- | --------- | ------- |
| `github_token` | Token de GitHub con permisos de Copilot y escritura | ✅        | N/A     |

## Outputs

| Output        | Descripción              |
| ------------- | ------------------------ |
| `release_url` | URL de la release creada |
| `tag_name`    | Nombre del tag generado  |

## Permisos Requeridos

El token de GitHub debe tener los siguientes permisos:

- `contents: write` - Para crear releases y tags
- `pull-requests: read` - Para leer información del PR
- Acceso a GitHub Copilot

## Cómo Funciona

1. **Recopilación de Datos**: Extrae información del PR incluyendo:

   - Título y descripción del PR
   - Lista de commits
   - Archivos modificados con su estado
   - Diff del código

2. **Análisis con Copilot**: Envía toda la información a GitHub Copilot para generar release notes profesionales que incluyen:

   - Resumen de cambios principales
   - Nuevas características
   - Correcciones de bugs
   - Mejoras de rendimiento
   - Impacto para usuarios

3. **Creación de Release**: Genera automáticamente:
   - Tag con formato temporal (`v2025.08.04-1430`)
   - Release con las notas generadas por IA

## Formato del Tag

Los tags se generan automáticamente con el formato: `vYYYY.MM.DD-HHMM`

Ejemplo: `v2025.08.04-1430`

## Ejemplo de Release Notes Generadas

```markdown
## 🚀 Nuevas Características

- Integración con GitHub Copilot para generación automática de release notes
- Análisis mejorado de commits y archivos modificados

## 🐛 Correcciones

- Corregido problema con la autenticación de tokens
- Mejorada la validación de entrada de datos

## 📈 Mejoras

- Optimizado el proceso de generación de tags
- Mejor formato de las release notes generadas
```

## Desarrollo

### Requisitos

- Node.js 18+
- GitHub token con acceso a Copilot

### Instalación

```bash
npm install
```

### Testing Local

```bash
# Simular el environment de GitHub Actions
export INPUT_GITHUB_TOKEN="your_token_here"
node index.js
```

## Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia Apache 2.0 - ver el archivo [LICENSE](LICENSE) para más detalles.

## Soporte

Si encuentras algún problema o tienes sugerencias, por favor [abre un issue](https://github.com/your-username/auto-release/issues).
