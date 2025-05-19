const { defineConfig } = require('cypress');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.amazon.com.br',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 1,   // 1 tentativa extra em CI
      openMode: 0
    },
    video: true,                      // grava vídeo
    screenshotsFolder: 'cypress/artifacts/screenshots',
    videosFolder: 'cypress/artifacts/videos',
    setupNodeEvents(on) {
      // Garante que pastas de artefatos existam antes da execução
      on('before:run', () => {
        const fs = require('fs');
        ['cypress/artifacts/screenshots', 'cypress/artifacts/videos'].forEach((p) => {
          if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        });
      });
    }
  },
  // caminho relativo para funcionar no GitHub Actions
  downloadsFolder: path.join(__dirname, 'cypress', 'downloads')
});