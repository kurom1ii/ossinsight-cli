---
name: ossinsight
description: Query OSSInsight API for open source intelligence — trending repos, repo analysis, star demographics, contributor stats, collection rankings, and AI-powered GitHub questions. Uses the ossinsight-cli tool.
argument-hint: "<command> [args] [options]"
allowed-tools: Bash(npx *) Bash(tsx *) Bash(node *)
---

# OSSInsight — Open Source Intelligence

You have access to the `ossinsight` CLI tool that queries OSSInsight's database of 6B+ GitHub events via TiDB Cloud. All output is pre-formatted as text tables suitable for direct analysis.

## How to Run

The CLI is located at `~/work/mywork/ossinsight-skills/`. Run commands using:

```bash
cd ~/work/mywork/ossinsight-skills && npx tsx src/index.ts <command> [args] [options]
```

## Available Commands

### 1. `trending` — Trending repositories
```bash
npx tsx src/index.ts trending                           # All languages, past week
npx tsx src/index.ts trending -l Python                 # Python repos only
npx tsx src/index.ts trending -l Rust -p past_month     # Rust repos, past month
npx tsx src/index.ts trending -l "C++" -p past_24_hours # C++ repos, last 24h
```
**Options:**
- `-l, --language <lang>` — Filter: All, JavaScript, TypeScript, Python, Go, Rust, Java, C++, C, C#, Ruby, PHP, Swift, Kotlin, Dart, Shell, Elixir, Haskell, Scala, R, Lua, etc.
- `-p, --period <period>` — past_24_hours, past_week, past_month, past_3_months

### 2. `repo` — Full repository analysis
```bash
npx tsx src/index.ts repo facebook/react
npx tsx src/index.ts repo torvalds/linux
npx tsx src/index.ts repo pingcap/tidb
```
Returns: overview, star growth (12 months), top countries, top PR contributors, top issue reporters.

### 3. `compare` — Compare two repositories
```bash
npx tsx src/index.ts compare facebook/react vuejs/vue
npx tsx src/index.ts compare pytorch/pytorch tensorflow/tensorflow
npx tsx src/index.ts compare deno/deno nodejs/node
```
Returns: side-by-side metrics, star growth comparison, country distribution, top contributors.

### 4. `collections` — Browse OSSInsight collections
```bash
npx tsx src/index.ts collections                  # List all 138+ collections
npx tsx src/index.ts collections -s database      # Search for "database"
npx tsx src/index.ts collections -s "AI"          # Search for AI-related
```

### 5. `ranking` — Collection leaderboard
```bash
npx tsx src/index.ts ranking 2                           # Database collection, by stars
npx tsx src/index.ts ranking 10098 -m prs               # AI Agent Frameworks, by PRs
npx tsx src/index.ts ranking 10005 -m issues -p past_month  # JS Frameworks, by issues
```
**Options:**
- `-m, --metric <metric>` — stars, prs, issues
- `-p, --period <period>` — past_28_days, past_month

### 6. `stars` — Stargazer deep dive
```bash
npx tsx src/index.ts stars facebook/react              # Full analysis
npx tsx src/index.ts stars facebook/react -t countries  # Countries only
npx tsx src/index.ts stars facebook/react -t history    # Growth history only
npx tsx src/index.ts stars facebook/react -t orgs       # Organizations only
```

### 7. `contributors` — Contributor analysis
```bash
npx tsx src/index.ts contributors kubernetes/kubernetes         # Top PR contributors
npx tsx src/index.ts contributors kubernetes/kubernetes -t issues  # Top issue reporters
```

### 8. `ask` — Natural language questions (AI-powered)
```bash
npx tsx src/index.ts ask "Which repos got the most stars in 2024?"
npx tsx src/index.ts ask "Top Python projects by contributors this year"
npx tsx src/index.ts ask "What are the fastest growing Rust projects?"
npx tsx src/index.ts ask "Compare star growth of React vs Vue vs Svelte"
```
Uses AI to generate SQL queries against the full GitHub events database. Supports complex analytical questions.

## User Request

The user asked: `$ARGUMENTS`

Run the appropriate command based on what the user wants. If the request is ambiguous, choose the most relevant command. If the user asks a complex analytical question that doesn't map to a specific command, use the `ask` command.

After getting the results, analyze the data and provide insights:
- Highlight key findings and patterns
- Note any surprising or notable data points
- Provide context for the numbers when possible
- Keep analysis concise and actionable
