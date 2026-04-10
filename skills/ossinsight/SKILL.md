---
name: ossinsight
description: Query OSSInsight API for open source intelligence — trending repos, repo analysis, star demographics, contributor stats, collection rankings, and AI-powered GitHub questions. Works with Claude Code, OpenClaw, Codex, Cursor, and any SKILL.md-compatible agent.
argument-hint: "<command> [args] [options]"
allowed-tools: Bash(npm *) Bash(npx *) Bash(node *) Bash(ossinsight *)
---

# OSSInsight — Open Source Intelligence

Query OSSInsight's database of 6B+ GitHub events via TiDB Cloud. All output is pre-formatted as LLM-friendly text tables.

## Setup

Install the CLI globally (first time only):

```bash
npm install -g github:kurom1ii/ossinsight-cli
```

If the global install isn't available, you can also run directly:

```bash
npx github:kurom1ii/ossinsight-cli <command> [args]
```

## Commands

### 1. `trending` — Trending repositories
```bash
ossinsight trending                           # All languages, past week
ossinsight trending -l Python                 # Python repos only
ossinsight trending -l Rust -p past_month     # Rust repos, past month
ossinsight trending -l "C++" -p past_24_hours # C++ repos, last 24h
```
**Options:** `-l, --language <lang>` (All, JavaScript, TypeScript, Python, Go, Rust, Java, C++, C, C#, Ruby, PHP, Swift, Kotlin, etc.) | `-p, --period <period>` (past_24_hours, past_week, past_month, past_3_months)

### 2. `repo` — Full repository analysis
```bash
ossinsight repo facebook/react
ossinsight repo torvalds/linux
```
Returns: overview, star growth (12 months), top countries, top PR contributors, top issue reporters.

### 3. `compare` — Compare two repositories
```bash
ossinsight compare facebook/react vuejs/vue
ossinsight compare pytorch/pytorch tensorflow/tensorflow
```
Returns: side-by-side metrics, star growth comparison, country distribution, top contributors.

### 4. `collections` — Browse OSSInsight collections
```bash
ossinsight collections                  # List all 138+ collections
ossinsight collections -s database      # Search for "database"
ossinsight collections -s "AI"          # Search for AI-related
```

### 5. `ranking` — Collection leaderboard
```bash
ossinsight ranking 2                           # Database collection, by stars
ossinsight ranking 10098 -m prs               # AI Agent Frameworks, by PRs
ossinsight ranking 10005 -m issues -p past_month  # JS Frameworks, by issues
```
**Options:** `-m, --metric <metric>` (stars, prs, issues) | `-p, --period <period>` (past_28_days, past_month)

### 6. `stars` — Stargazer deep dive
```bash
ossinsight stars facebook/react              # Full analysis
ossinsight stars facebook/react -t countries  # Countries only
ossinsight stars facebook/react -t history    # Growth history only
ossinsight stars facebook/react -t orgs       # Organizations only
```

### 7. `contributors` — Contributor analysis
```bash
ossinsight contributors kubernetes/kubernetes         # Top PR contributors
ossinsight contributors kubernetes/kubernetes -t issues  # Top issue reporters
```

### 8. `ask` — Natural language questions (AI-powered)
```bash
ossinsight ask "Which repos got the most stars in 2024?"
ossinsight ask "Top Python projects by contributors this year"
ossinsight ask "What are the fastest growing Rust projects?"
```
Uses AI to generate SQL queries against the full GitHub events database.

## User Request

The user asked: `$ARGUMENTS`

Run the appropriate command. If the request is ambiguous, choose the most relevant command. For complex analytical questions, use `ask`.

After getting results, provide concise analysis:
- Highlight key findings and patterns
- Note surprising or notable data points
- Provide context for the numbers
