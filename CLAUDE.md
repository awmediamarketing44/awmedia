# CLAUDE.md — AW Media Marketing

## Repository Overview

This is the content repository for **AW Media Marketing**, a digital marketing brand focused on helping business owners, entrepreneurs, and marketers with actionable marketing strategies. The repo stores markdown-based content assets (ideas, guides, strategies) used across social media platforms and blogs.

## Repository Structure

```
awmedia/
├── CLAUDE.md              # This file — guidance for AI assistants
├── content-ideas.md       # Marketing content ideas with implementation guides
└── .git/
```

This is a lightweight, content-only repository — no build tools, dependencies, or application code. All content is written in Markdown.

## Content Conventions

- **Format:** All content files use GitHub-flavored Markdown (`.md`)
- **Audience:** Business owners, entrepreneurs, and marketers
- **Tone:** Direct, actionable, no-fluff. Uses bold statements, contrarian hooks, and real-world examples
- **Structure:** Content files use H2 (`##`) for individual items, horizontal rules (`---`) for separation, and bold labels (`**Format:**`, `**Hook angle:**`, etc.) for metadata
- **Attribution:** Files end with an italicized generation note including the brand name and date (e.g., `*Generated for AW Media Marketing — March 2026*`)

## Platforms Targeted

Content is created for: Instagram (Reels, Carousels), TikTok, LinkedIn, X (Twitter), YouTube Shorts, Blogs, Email, and Newsletters.

## Git Workflow

- **Default branch:** `master`
- **Feature branches:** Use `claude/` prefix for AI-assisted work
- Content is added via feature branches and merged into `master`

## Guidelines for AI Assistants

1. **Match the existing tone** — direct, punchy, scroll-stopping. Avoid generic or corporate-sounding language
2. **Use the established format** — when adding content ideas, follow the pattern in `content-ideas.md` (title, format, explanation, hook angle)
3. **Include implementation details** — prioritization tables, platform recommendations, and effort levels are expected
4. **Keep it actionable** — every piece of content should give the reader something they can use immediately
5. **No code or tooling changes** — this repo is content-only; do not add package.json, configs, or build systems unless explicitly asked
6. **Commit messages** — use clear, descriptive messages that summarize the content added or changed
