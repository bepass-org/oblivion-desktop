# Contribution Guide

Thank you for your interest in contributing to Oblivion Desktop! We appreciate your help and support. Here are some guidelines to help you get started:

## Where you can help?

- ### 💻 Development

    if you have programming skills that can be helpful:
    Pick up issues/tasks from [issues page](https://github.com/bepass-org/oblivion-desktop/issues) or the [project board](https://github.com/orgs/bepass-org/projects/4) or suggest your own features, fixes, etc.  
     Before starting a new task, please coordinate with the collaborators to ensure no one else is working on it.

    - #### Setup your development environment

        - Fork the repository
        - Follow the instructions in the [DOCS.md](DOCS.md) to set up your development environment and bring up your development server
        - Make your changes and create a pull request (PR)

    - #### Code Style Guide
        Follow the code style guidelines. Your PR should be free from type errors. We use TypeScript, Prettier, and Husky to maintain code quality, which should be automatically enabled when you run `npm install`. If not, set it up with `npm run prepare`. Husky will run `prettier` before each commit to ensure code style, and `tsc` before every push to check for possible type errors. You can also manually fix code style errors by running `npm run format`.

- ### 🌐 Translation

    The current translation is done from English to other languages. Persian and English are translated manually, while other languages are translated with the help of AI. Your contributions to improving the translation and providing feedback are welcome.

    - Translations into new languages will only be accepted for countries and languages where internet filtering and violations of internet freedoms similar to Iran, China, and Russia exist. The goal of this program has never been to include all languages. For countries where government surveillance and filtering are used to combat cybercrime and restrict access to illegal content such as child pornography, terrorism, and racist content, English is sufficient as the standard language.
    - If you want to edit the translated text in the app, you can directly edit the files in the [src/localization](src/localization) folder.
    - If you're interested in translating markdown (.md) files for new languages, simply create the language file next to the original file. (We will take care of the folder structure if needed.)

- ### 💬 Discussions

    If you have any questions, suggestions, or concerns that are not addressed in this document, please feel free to open an [issue](https://github.com/bepass-org/oblivion-desktop/issues) or contact us directly. We are open to discussions related to the project.

### ⚠️ Warning

we recommend to not use your real name/account when contributing to this project. as it may cause you problem in some countries (that have problems with free circulation of information).
