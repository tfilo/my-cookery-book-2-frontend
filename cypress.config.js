import { defineConfig } from 'cypress';
import coverage from '@cypress/code-coverage/task.js';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',
        setupNodeEvents(on, config) {
            coverage(on, config);
            on('before:browser:launch', async (browser, launchOptions) => {
                // Solves problem with firefox in tests
                if (browser.family === 'firefox') {
                    launchOptions.preferences['network.proxy.testing_localhost_is_secure_when_hijacked'] = true;
                }
                return launchOptions;
            });

            // implement node event listeners here
            return config;
        }
    },
    reporter: 'mocha-junit-reporter',
    reporterOptions: {
        // Mocha report pre gitlab
        mochaFile: 'cypress/results/[suiteName].xml',
        jenkinsMode: true
    }
});
