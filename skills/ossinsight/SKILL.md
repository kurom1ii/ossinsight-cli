---
name: ossinsight
description: Query OSSInsight API for open source intelligence — trending repos, repo analysis, star demographics, contributor stats, collection rankings, and AI-powered GitHub questions. Uses the ossinsight-cli tool.
argument-hint: "<command> [args] [options]"
allowed-tools: Bash(npm *) Bash(npx *) Bash(node *) Bash(cd *)
---

# OSSInsight — Open Source Intelligence

You have access to the `ossinsight` CLI tool that queries OSSInsight's database of 6B+ GitHub events via TiDB Cloud. All output is pre-formatted as text tables suitable for direct analysis.

## Setup (first time only)

The CLI lives inside this plugin directory. On first use, install dependencies:

```bash
cd ${CLAUDE_SKILL_DIR}/.. && npm install --silent 2>/dev/null && npx tsc 2>/dev/null
```

## How to Run

```bash
cd ${CLAUDE_SKILL_DIR}/.. && node dist/index.js <command> [args] [options]
```

If `dist/` doesn't exist yet, build first:
```bash
cd ${CLAUDE_SKILL_DIR}/.. && npm install --silent 2>/dev/null && npx tsc && node dist/index.js <command> [args] [options]
```

## Available Commands

### 1. `trending` — Trending repositories
```bash
node dist/index.js trending                           # All languages, past week
node dist/index.js trending -l Python                 # Python repos only
node dist/index.js trending -l Rust -p past_month     # Rust repos, past month
node dist/index.js trending -l "C++" -p past_24_hours # C++ repos, last 24h
```
**Options:**
- `-l, --language <lang>` — Filter: All, JavaScript, TypeScript, Python, Go, Rust, Java, C++, C, C#, Ruby, PHP, Swift, Kotlin, Dart, Shell, Elixir, Haskell, Scala, R, Lua, etc.
- `-p, --period <period>` — past_24_hours, past_week, past_month, past_3_months

### 2. `repo` — Full repository analysis
```bash
node dist/index.js repo facebook/react
node dist/index.js repo torvalds/linux
```
Returns: overview, star growth (12 months), top countries, top PR contributors, top issue reporters.

### 3. `compare` — Compare two repositories
```bash
node dist/index.js compare facebook/react vuejs/vue
node dist/index.js compare pytorch/pytorch tensorflow/tensorflow
```
Returns: side-by-side metrics, star growth comparison, country distribution, top contributors.

### 4. `collections` — Browse OSSInsight collections
```bash
node dist/index.js collections                  # List all 138+ collections
node dist/index.js collections -s database      # Search for "database"
node dist/index.js collections -s "AI"          # Search for AI-related
```

### 5. `ranking` — Collection leaderboard
```bash
node dist/index.js ranking 2                           # Database collection, by stars
node dist/index.js ranking 10098 -m prs               # AI Agent Frameworks, by PRs
node dist/index.js ranking 10005 -m issues -p past_month  # JS Frameworks, by issues
```
**Options:**
- `-m, --metric <metric>` — stars, prs, issues
- `-p, --period <period>` — past_28_days, past_month

### 6. `stars` — Stargazer deep dive
```bash
node dist/index.js stars facebook/react              # Full analysis
node dist/index.js stars facebook/react -t countries  # Countries only
node dist/index.js stars facebook/react -t history    # Growth history only
node dist/index.js stars facebook/react -t orgs       # Organizations only
```

### 7. `contributors` — Contributor analysis
```bash
node dist/index.js contributors kubernetes/kubernetes         # Top PR contributors
node dist/index.js contributors kubernetes/kubernetes -t issues  # Top issue reporters
```

### 8. `ask` — Natural language questions (AI-powered)
```bash
node dist/index.js ask "Which repos got the most stars in 2024?"
node dist/index.js ask "Top Python projects by contributors this year"
node dist/index.js ask "What are the fastest growing Rust projects?"
```
Uses AI to generate SQL queries against the full GitHub events database. Supports complex analytical questions.

## User Request

The user asked: `$ARGUMENTS`

Run the appropriate command based on what the user wants. If the request is ambiguous, choose the most relevant command. If the user asks a complex analytical question that doesn't map to a specific command, use the `ask` command.

Always `cd ${CLAUDE_SKILL_DIR}/..` before running commands.

After getting the results, analyze the data and provide insights:
- Highlight key findings and patterns
- Note any surprising or notable data points
- Provide context for the numbers when possible
- Keep analysis concise and actionable
