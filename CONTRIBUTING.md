# CONTRIBUTION GUIDE

Thank you for your interest in contributing to Oblivion Desktop! We appreciate your help and support. - We have tried our best to provide some documentation on how to contribute to this project; here are some guidelines:

## Where you can help?

- ### 💻 Contributing to the development

    if you have programming skills that can be helpful:
    Pick up issues/tasks from [issues page](https://github.com/bepass-org/oblivion-desktop/issues) or the [project board](https://github.com/orgs/bepass-org/projects/4) or suggest your own features, fixes, etc.  
     Before starting a new task, please coordinate with the collaborators to ensure no one else is working on it.
    - #### Setup your development environment
        - Fork this [repository](https://github.com/bepass-org/oblivion-desktop)
        - Follow the instructions in the [DOCS.md](DOCS.md) to set up your development environment and bring up your development server
        - Make your changes and create a pull request (PR)

    - #### Code Style Guide
        To maintain code quality, ensure your PR follows our TypeScript style guidelines and passes type checking (`tsc`) - we use Prettier (2 spaces, single quotes) for consistent formatting and Husky hooks (automatically installed via `npm install` or manually with `npm run prepare`) to run `prettier` on commit and type checking on push, while you can manually fix style issues with `npm run format`.

- ### 🌐 Translating to other languages

    The current translation is done from English to other languages. Persian and English are translated manually, while other languages are translated with the help of AI. Your contributions to improving the translation and providing feedback are welcome.
    - We prioritize translations for languages spoken in regions with systemic internet censorship that broadly restricts access to information, similar to the digital environments in Iran, China, and Russia. Our program focuses on supporting communities where:
      (a) Internet restrictions disproportionately impacts general freedoms of expression and access to information
      (b) Censorship extends beyond targeted law enforcement against illegal activities.
      For countries where online restrictions are primarily applied to combat criminal content (e.g., child exploitation materials, terrorist propaganda, or hate speech), English remains the supported interface language. This allows us to concentrate our limited resources where they can have the greatest impact in promoting open access to information. We evaluate all translation requests against these criteria to ensure alignment with our mission of fighting unjust censorship.
    - If you want to edit the translated text in this application, you can directly edit the files in the [src/localization](src/localization) directory.
    - If you're interested in translating markdown (.md) files for new languages, simply create the language file next to the original file. (We will take care of the directory structure if needed.)

- ### 💬 Discussions

    If you have any questions, suggestions, complaints, or concerns that are not addressed in our document(s), please feel free to open an [issue](https://github.com/bepass-org/oblivion-desktop/issues) or directory contact us as we are willing to discuss about this project at any time.

### ⚠️ Warning!

We recommend not to use your real legal name while contributing to this project; it may find you trouble in many countries that have problems with free circulation of information.
