# Security Policy

## Supported Versions

Laradock is rolling-release: the latest `master` is the supported configuration. Before reporting a vulnerability, update to the latest commit and rebuild the affected image.

Maintained PHP release lines are rebuilt from their current upstream images. End-of-life PHP variants may receive a documented, SHA-verified compatibility backport for a specific vulnerability, but they do not have a complete upstream security lifecycle and should not be used for new production deployments.

## Reporting a Vulnerability

Please report security vulnerabilities **privately** — do not open a public issue.

- **Preferred:** open a [private security advisory](https://github.com/laradock/laradock/security/advisories/new) on GitHub, or
- **Email:** the maintainer at **mahmoud@zalt.me**.

Please include steps to reproduce and the affected component (for example, a specific service Dockerfile or .env option). We will acknowledge your report as soon as possible and keep you informed as we work on a fix.
