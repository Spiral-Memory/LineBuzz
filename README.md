# **LineBuzz 🧵 Inline Code Collaboration in VS Code**

## **Overview 📘**

**LineBuzz** brings real-time, line-based code discussions directly into Visual Studio Code.
It lets you comment on any line, start focused threads, and collaborate inside your editor - no tabs, no switching, no noise.

Everything stays linked to the code itself, so your team’s conversations remain clear, contextual, and persistent across commits.

## **Features ✨**

* Inline, threaded discussions on any line of code
* Real-time sync and collaboration
* Conversations persist across files and branches
* Minimal, clean chat panel inside VS Code
* Secure backend built on Supabase

## **Installation ⚙️**

1. Clone the repository:

   ```bash
   git clone https://github.com/Spiral-Memory/LineBuzz.git
   ```
2. Open the project in **Visual Studio Code**:

   ```bash
   cd LineBuzz
   code .
   ```
3. Press **F5** to launch the extension in a new VS Code window (Extension Development Host).

That’s it -> LineBuzz will start running in the new window.

## **Usage 🔍**

1. Open any code file in the development host window.
2. Highlight a line or block of code and open the **LineBuzz** sidebar.
3. Start a new discussion or join an existing one.
4. Conversations appear instantly and stay linked to your code context.

## **Configuration 🧰**

Before you run the extension, set up your Supabase credentials:

```env
SUPABASE_API_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-anon-key>
```

These values connect LineBuzz to your project’s backend for authentication and data sync.

## **Roadmap 🛣️**

* **Team workspaces** with shared threads per project
* **Commit-aware threads** that track changes automatically
* **AI-generated summaries** of code changes and conversation threads
* **Mentions and notifications** for team discussions
* **Context-aware** linking between discussions and code changes

## **Contributing 🤝**

Contributions are always welcome.
Fork the repository, open it in VS Code, and use the built-in debugger to test your changes.

For significant updates, open an issue first to discuss your approach.