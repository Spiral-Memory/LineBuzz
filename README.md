# LineBuzz 🧵 Inline Code Collaboration in VS Code

## Overview 📘

LineBuzz is a VS Code extension for real-time, line-based code discussions. It lets you comment on code, start threads, and collaborate directly inside the editor - no context switching.

Currently works with Rocket.Chat as the backend. Support for Slack, Google Workspace, and others is planned.

## Features ✨

* Threaded discussions linked to code lines
* Real-time messaging in-editor
* Comments persist across sessions and commits
* Clean chat UI in the sidebar

## Installation ⚙️

To use LineBuzz, follow these steps:

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/Spiral-Memory/LineBuzz.git
   ```

2. Move to the repository directory:

   ```bash
   cd LineBuzz
   ```

3. Open the code sample in Visual Studio Code.

4. Press `F5` to start the extension.

## Usage 🔍

Once the extension is up and running, follow these steps to utilize its features:

1. You'll be logged in directly to the GENERAL channel, where you can start chatting with your teammates.
2. To discuss a specific code segment, open any project in VSCode, select the code segment you want to discuss.

3. A popup will open, allowing you to have a chat conversation about that specific code segment with your teammates.

## Prerequisites 🧰

Before using this extension, ensure that you have the following:

* Rocket Chat server running locally on port 3000 or change the required code in extension.

  * If you don't have Rocket Chat installed, you can set it up by following the instructions on the [Rocket Chat website](https://developer.rocket.chat/open-source-projects/server/server-environment-setup).
  * Make sure the Rocket Chat server is running and accessible at [http://localhost:3000](http://localhost:3000).

## Roadmap 🛣️

* [ ] Multi-platform chat: add native support for Slack and Google Chat
* [ ] Git-smart threads: auto-link discussions to commits, branches, and PRs
* [ ] AI-powered discussion: surface code summaries and intelligent fix suggestions within threads

## Contributing 🤝

Contributions are welcome! Feel free to fork the repository, make your changes, and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

