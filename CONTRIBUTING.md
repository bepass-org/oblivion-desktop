# Contribution Guide

Thank you for your interest in contributing to this project! We appreciate your help and support. Here are some guidelines to help you get started:

## Where you can help?

-   ### 💻 Development

    if you have programming skills that can be helpful:
    Pick up issues/tasks from issues page or the project board or suggest your own features, fixes, etc.  
    Before starting a new task, please coordinate with the collaborators to ensure no one else is working on it.

    -   #### Setup your development environment

        -   Fork the repository
        -   Follow the instructions in the [DOCS.md](DOCS.md) to set up your development environment and bring up your development server
        -   Make your changes and create a pull request (PR)

    -   #### Code Style Guide
        Follow the code style guidelines. Your PR should be free from type errors. We use Husky, Prettier, and TypeScript to maintain code quality, which should be automatically enabled when you run `npm install`. If not, set it up with `npm run prepare`. Husky will check your code style using `prettier` before each commit and possible type errors using `tsc` before every push. You can also manually fix code style errors by running `npm run format`.

-   ### 🌐 Translation

    The current translation is being done from Persian to other languages using AI. Contributions and feedback from native speakers are welcome.  
    To contribute, edit the files in the src/local directory directly. Some text may still be hardcoded and will be added to translation keys soon.

-   ### 💬 Discussions

    If you have any questions, suggestions, or concerns that are not addressed in this document, please feel free to open an issue or contact us directly. We are open to discussions related to the project.
