# Contributing to Laradock

Thank you for helping keep Laradock useful, secure, and current. Please read the full [contribution guide](https://laradock.io/contributing) before opening a pull request.

## Self-service builds

- Fork the repository, make your change, and open a pull request. Pull requests run the relevant build validation without access to publishing credentials.
- To add a PHP version, rebuild an image, or update a component, propose the Dockerfile, workflow, and documentation change in a pull request. Anyone can test the exact change in their fork before proposing it.
- Trusted maintainers can use the repository Actions **Run workflow** control to rebuild an approved image after it reaches the default branch. Official Docker Hub publishing is deliberately limited to trusted repository runs; secrets are never exposed to forks or pull requests.

## Getting help

For bugs and feature proposals, [open an issue](https://github.com/laradock/laradock/issues). For general questions and design discussion, use [GitHub Discussions](https://github.com/laradock/laradock/discussions). Please do not rely on personal maintainer email for ordinary support or rebuild requests.

## Becoming a maintainer

Sustained contributors can be invited with triage or write access so they can label, review, and merge routine work. Production credentials and release permissions remain restricted to the small set of trusted release maintainers, with protected-branch review and CI requirements.

## Security

For security vulnerabilities, see [SECURITY.md](SECURITY.md). Please report vulnerabilities privately rather than opening a public issue.
