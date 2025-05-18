# Contributing to Sanza TV App QuickPoll

Thank you for your interest in contributing to the Sanza TV App QuickPoll project! This document provides guidelines and instructions for contributing to make the process smooth and effective for everyone involved.

## Table of Contents

1. [Our Commitment to Inclusivity](#our-commitment-to-inclusivity)
2. [Code of Conduct](#code-of-conduct)
3. [How to Contribute](#how-to-contribute)
4. [Development Workflow](#development-workflow)
5. [Accessibility Guidelines](#accessibility-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Community Resources](#community-resources)

## Our Commitment to Inclusivity

The Sanza TV App QuickPoll project is committed to providing an inclusive and welcoming environment for all contributors, regardless of background, identity, or experience level. We believe that a diverse community creates better software and a more enriching experience for everyone.

We actively welcome contributions from:
- People of all backgrounds, cultures, ethnicities, and nationalities
- All gender identities and expressions
- People of all sexual orientations
- People with disabilities
- People of all ages, experience levels, and educational backgrounds
- Community members who speak different languages

Our goal is to build both technology and community that enables everyone to participate in interactive TV experiences.

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md), which outlines our expectations for participant behavior and the consequences for unacceptable behavior.

Key principles:
- **Be respectful and inclusive**
- **Exercise consideration and empathy**
- **Focus on what is best for the community**
- **Give and gracefully accept constructive feedback**
- **Accept responsibility and apologize when needed**

## How to Contribute

There are many ways to contribute to the QuickPoll project:

### Code Contributions
- Fix bugs in the existing codebase
- Implement new features
- Improve performance or accessibility
- Add tests and improve test coverage

### Documentation
- Improve technical documentation
- Write tutorials or guides
- Create or enhance API documentation
- Translate documentation to other languages

### Design
- Create UI assets and icons
- Improve user interface designs
- Design accessible interface elements
- Create templates for poll experiences

### Quality Assurance
- Test the application and report bugs
- Verify fixed issues
- Suggest usability improvements
- Test on different devices and platforms

### Community Support
- Answer questions in discussions
- Help new contributors get started
- Participate in feature planning
- Share your experience using QuickPoll

## Development Workflow

### Setting Up Your Development Environment

1. **Fork the repository**
   ```
   git clone https://github.com/your-username/Sanza-TV-App_QuickPoll.git
   cd Sanza-TV-App_QuickPoll
   ```

2. **Install dependencies**
   ```
   pnpm install
   ```

3. **Set up local configuration**
   ```
   cp .env.example .env.local
   ```
   Edit `.env.local` with your local settings.

4. **Start the development server**
   ```
   pnpm dev
   ```

### Branch Naming Convention

Please name your branches according to this convention:
- `feature/short-description` - For new features
- `bugfix/issue-number-description` - For bug fixes
- `docs/what-you-are-documenting` - For documentation
- `test/what-you-are-testing` - For test additions or changes

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

Types include:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Changes that don't affect code behavior
- **refactor**: Code changes that neither fix bugs nor add features
- **perf**: Performance improvements
- **test**: Adding or correcting tests
- **chore**: Changes to build process or tools

Example:
```
feat(polls): add ability to customize poll appearance

This adds a theme property to polls that allows content providers
to match polls to their branding.

Closes #123
```

## Accessibility Guidelines

QuickPoll is committed to creating an accessible experience for all users. All contributions should adhere to these accessibility principles:

### Remote Control Navigation
- All interactive elements must be navigable using a standard TV remote (directional pad and select)
- Focus states must be clearly visible with high contrast
- Navigation paths should be logical and predictable
- No functionality should require a keyboard, mouse, or touch input

### Visual Design
- Maintain a minimum contrast ratio of 4.5:1 for all text
- Do not rely on color alone to convey information
- Text should be a minimum of 24px on TV interfaces
- Provide sufficient spacing between interactive elements (minimum 16px)

### Timing and Interaction
- Allow sufficient time for users to read and respond to polls
- Provide clear feedback when actions are taken
- Ensure animation and transitions can be disabled
- Design for different user response times

### Testing
- Test with screen readers and assistive technology
- Verify remote-only navigation works fully
- Confirm all UI is visible at standard TV resolutions
- Check for colorblind-friendly design

## Pull Request Process

1. **Create an issue first** to discuss proposed changes
2. **Update documentation** to reflect any changes
3. **Include tests** for new functionality
4. **Ensure all tests pass** locally before submitting
5. **Submit your pull request** with a clear description:
   - What the PR accomplishes
   - Any issues it addresses
   - Testing you've performed
   - Screenshots for UI changes

### Review Process

1. At least one core team member will review your PR
2. Automated tests must pass
3. Feedback will be provided as comments on the PR
4. You may need to make requested changes
5. Once approved, a maintainer will merge your PR

## Community Resources

- **Community Forum**: [community.senza.tv](https://community.senza.tv)
- **Discord Server**: [discord.gg/senzatv](https://discord.gg/senzatv)
- **Issue Tracker**: [GitHub Issues](https://github.com/senza/quickpoll/issues)
- **Documentation**: [docs.senza.tv/quickpoll](https://docs.senza.tv/quickpoll)
- **Developer Blog**: [developers.senza.tv/blog](https://developers.senza.tv/blog)

### Regular Community Calls

We hold open community calls every two weeks to discuss development, share updates, and answer questions:

- **When**: Every other Tuesday at 10:00 AM Pacific Time
- **Where**: [Zoom Link](https://zoom.us/j/123456789)
- **Calendar**: [Google Calendar](https://calendar.google.com/calendar/...)
- **Archives**: [YouTube Playlist](https://youtube.com/playlist?list=...)

---

## Recognition and Thanks

Contributors are the backbone of our project. We recognize contributions in several ways:

- All contributors are listed in our [CONTRIBUTORS.md](CONTRIBUTORS.md) file
- Significant contributions are highlighted in release notes
- Regular contributors may be invited to join the core team
- We celebrate contributions through our social media channels

---

Thank you for being part of the Sanza TV App QuickPoll community! Your contributions help make interactive TV experiences more engaging, accessible, and inclusive for everyone.

---

© 2025 AllPro.Enterprises Novus | Nexum Labs. All rights reserved. 