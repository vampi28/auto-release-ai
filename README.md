# Auto Release with Hugging Face AI

GitHub Action que genera releases automáticas con descripciones inteligentes utilizando Hugging Face AI.

## Características

- Genera release notes automáticas usando Hugging Face AI
- Analiza commits, archivos modificados y descripción del PR
- Crea tags automáticos con formato temporal
- Se integra perfectamente con el flujo de trabajo de GitHub
- Respaldo automático sin IA si no se proporciona token

## Uso

Esta action se ejecuta únicamente de forma manual. Debes especificar el número de PR y la versión.

### Configuración del Workflow

```yaml
name: Auto Release

on:
  workflow_dispatch:
    inputs:
      pr_number:
        description: "Número del Pull Request para generar la release"
        required: true
        type: string
      version:
        description: "Versión de la release (ej: v1.2.3, 2.0.0)"
        required: true
        type: string

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: read
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Create Release
        uses: ./
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          huggingface_token: ${{ secrets.HUGGINGFACE_TOKEN }}
          pr_number: ${{ github.event.inputs.pr_number }}
          version: ${{ github.event.inputs.version }}
```

### Cómo Ejecutar

1. Ve a la pestaña "Actions" en tu repositorio
2. Selecciona el workflow "Auto Release"
3. Haz clic en "Run workflow"
4. Introduce el número del PR
5. Introduce la versión deseada (ej: v1.2.3)
6. Ejecuta el workflow

## Inputs

| Input               | Descripción                                          | Requerido | Default |
| ------------------- | ---------------------------------------------------- | --------- | ------- |
| `github_token`      | Token de GitHub (usar `${{ secrets.GITHUB_TOKEN }}`) | ✅        | N/A     |
| `huggingface_token` | Token de Hugging Face para IA (opcional)             | ❌        | N/A     |
| `pr_number`         | Número del Pull Request                              | ✅        | N/A     |
| `version`           | Versión de la release (ej: v1.2.3, 2.0.0)            | ✅        | N/A     |

## Outputs

| Output        | Descripción              |
| ------------- | ------------------------ |
| `release_url` | URL de la release creada |
| `tag_name`    | Nombre del tag generado  |

## Permisos Requeridos

El `GITHUB_TOKEN` debe tener los siguientes permisos configurados en el workflow:

### Configuración Necesaria

```yaml
permissions:
  contents: write # Requerido - Para crear releases y tags
  pull-requests: read # Requerido - Para leer información del PR
```

### Configuración de Tokens

**GitHub Token**: No necesitas configurar nada especial. Usa `${{ secrets.GITHUB_TOKEN }}` que GitHub proporciona automáticamente.

**Hugging Face Token** (opcional para IA):

- Ve a [Hugging Face Settings](https://huggingface.co/settings/tokens)
- Crea un token gratuito
- Agrégalo como secret `HUGGINGFACE_TOKEN` en tu repositorio
- Si no lo configuras, la action generará release notes automáticamente sin IA

## Configuración Rápida

**Para usar solo con generación automática (sin IA):**

- No necesitas configurar ningún token adicional
- Usa `${{ secrets.GITHUB_TOKEN }}` que GitHub proporciona automáticamente

**Para usar con IA de Hugging Face:**

- Crea un token gratuito en [Hugging Face](https://huggingface.co/settings/tokens)
- Agrégalo como secret `HUGGINGFACE_TOKEN` en tu repositorio

## Cómo Funciona

1. **Recopilación de Datos**: Extrae información del PR incluyendo:

   - Título y descripción del PR
   - Lista de commits
   - Archivos modificados con su estado
   - Diff del código

2. **Análisis con IA**: Si se proporciona token de Hugging Face, envía la información a la API para generar release notes profesionales que incluyen:

   - Resumen de cambios principales
   - Nuevas características
   - Correcciones de bugs
   - Mejoras de rendimiento
   - Impacto para usuarios

   Si no hay token, genera automáticamente release notes basándose en análisis de commits.

3. **Creación de Release**: Genera automáticamente:
   - Tag con formato temporal (`v2025.08.04-1430`)
   - Release con las notas generadas por IA

## Ejemplo de Release Notes Generadas

```markdown
## Nuevas Características

- Integración con Hugging Face para generación automática de release notes
- Análisis mejorado de commits y archivos modificados

## Correcciones

- Corregido problema con la autenticación de tokens
- Mejorada la validación de entrada de datos

## Mejoras

- Optimizado el proceso de generación de tags
- Mejor formato de las release notes generadas
```

## Desarrollo

### Requisitos

- Node.js 18+
- GitHub token (automático)
- Hugging Face token (opcional para IA)

### Instalación

```bash
npm install
```

### Testing Local

```bash
# Simular el environment de GitHub Actions
export INPUT_GITHUB_TOKEN="your_github_token_here"
export INPUT_HUGGINGFACE_TOKEN="your_huggingface_token_here"
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
