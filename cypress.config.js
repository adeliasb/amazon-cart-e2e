const { defineConfig } = require("cypress");
const path = require("path");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://www.amazon.com.br",
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 1, // one extra attempt in CI
      openMode: 0,
    },
    video: true, // record video
    screenshotsFolder: "cypress/artifacts/screenshots",
    videosFolder: "cypress/artifacts/videos",
    setupNodeEvents(on) {
      // Ensure artifact folders exist before the run starts
      on("before:run", () => {
        const fs = require("fs");
        ["cypress/artifacts/screenshots", "cypress/artifacts/videos"].forEach(
          (p) => {
            if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
          }
        );
      });
    },
  },
  // relative path so it works on GitHub Actions
  downloadsFolder: path.join(__dirname, "cypress", "downloads"),
});
