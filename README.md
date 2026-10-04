# Top Models Ranked Matrix Dashboard

A comprehensive, full-stack application to track, rank, and evaluate free AI models available on OpenRouter using BYOK (Bring Your Own Key) architecture.

## Features
- **6-Tier Hierarchical Matrix**: Automatically ranks models based on Context Window, Coding Index, Agentic Index, and more.
- **LLM Safety Estimation**: Uses an AI Safety Expert LLM to dynamically estimate and sort model refusal rates for reverse-engineering and modding tasks.
- **Full-Stack Accessibility**: Run the dashboard natively in your browser, or fetch the latest JSON data directly from your terminal using the CLI.
- **BYOK Security**: All API keys are stored locally on your device (`localStorage` for the browser, `config.json` for the CLI) and are never sent anywhere except directly to OpenRouter.

## Installation

```bash
# Clone or download the repository
cd Top_Models

# Install globally to enable the 'models' CLI command
npm link
# OR if you prefer to install directly from the package:
# npm install -g .
```

## Usage: Browser Dashboard

To view the matrix in your browser:

1. Start a local HTTP server:
```bash
python3 -m http.server 8080
```
2. Open your browser and navigate to `http://localhost:8080`.
3. Paste your OpenRouter API Key into the input field and click **Refresh**.

## Install as Mobile App (PWA)

The dashboard is fully installable as a Progressive Web App (PWA) for a native mobile experience.

1. Open `https://anonymous5-coder.github.io/Top_Models/` in Google Chrome on your Android device (or Safari on iOS).
2. Tap the three-dot menu (or share button on iOS).
3. Select **"Add to Home screen"** (or "Install app").
4. Launch the dashboard directly from your home screen.

## Building for Android (Capacitor)

The project is configured for native Android deployment via Capacitor.
Before any Capacitor build step, you must synchronize the web assets to the `www/` folder:

```bash
npm run build:web
```

*Note:* Because the Android SDK and Gradle are not easily accessible within a native Termux environment, the final APK build is designed to be handled in the cloud via GitHub Actions.

## Building the APK (Cloud)

You can build the Android APK effortlessly on GitHub's servers using the pre-configured workflow:

1. Push your code to GitHub.
2. Go to the **Actions** tab on your repository.
3. Select the **Build Android APK** workflow on the left sidebar.
4. Click **Run workflow** (run it on the `main` branch).
5. Once the build finishes successfully, download the `app-debug.apk` file from the **Artifacts** section at the bottom of the run page.

## Usage: Command Line Interface (CLI)

The Node.js CLI allows you to fetch, estimate, and export data directly from the terminal without opening a browser. It uses `termux-clipboard-set` to copy output on Termux.

1. **Enter your API Key** (Only needed once):
```bash
models keys "YOUR_OPENROUTER_API_KEY"
```

2. **Refresh the data**:
```bash
models refresh
```

3. **Estimate Refusal Rates via LLM**:
```bash
models estimate
```

4. **Copy the Ranked Matrix JSON to your clipboard**:
```bash
models fetch
```

## Security Note
This project heavily utilizes the OpenRouter API. Because this is a client-side and local CLI application, your API key is strictly stored locally. Do not commit your `config.json` or any `.env` files to source control.
