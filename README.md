# ossinsight-cli

Open source intelligence CLI + agent skill for [OSSInsight](https://ossinsight.io) — powered by 6B+ GitHub events via TiDB Cloud.

Works with **Claude Code**, **OpenClaw**, **Codex**, **Cursor**, **Gemini CLI**, and [40+ agents](https://github.com/vercel-labs/skills#supported-agents).

All output is formatted as plain text tables, optimized for LLM consumption and analysis.

## Features

| Command | Description |
|---------|-------------|
| `trending` | Trending repos by language & period |
| `repo` | Full repo analysis (stars, contributors, countries, growth) |
| `compare` | Side-by-side comparison of two repos |
| `collections` | Browse 138+ curated open source collections |
| `ranking` | Collection leaderboard (stars, PRs, issues) |
| `stars` | Stargazer demographics (countries, orgs, history) |
| `contributors` | Contributor analysis (PR authors, issue reporters) |
| `ask` | Natural language questions (AI-powered SQL) |

## Install as Agent Skill (npx skills)

```bash
npx skills add kurom1ii/ossinsight-cli
```

This works with OpenClaw, Claude Code, Codex, Cursor, and all SKILL.md-compatible agents.

## Install as Claude Code Plugin

```
/plugin marketplace add kurom1ii/ossinsight-cli
/plugin install ossinsight@ossinsight-cli
```

## Install as Global CLI

```bash
npm install -g github:kurom1ii/ossinsight-cli
```

## Usage in Claude Code / OpenClaw

```
/ossinsight trending Python repos this week
/ossinsight analyze facebook/react
/ossinsight compare pytorch vs tensorflow
/ossinsight what are the fastest growing Rust projects?
```

## Standalone CLI Usage

```bash
git clone https://github.com/kurom1ii/ossinsight-cli
cd ossinsight-cli
npm install && npx tsc

# Trending repos
node dist/index.js trending -l Python -p past_week

# Full repo analysis
node dist/index.js repo facebook/react

# Compare repos
node dist/index.js compare facebook/react vuejs/vue

# Browse collections
node dist/index.js collections -s "AI"

# Collection ranking
node dist/index.js ranking 2 -m stars

# Star analysis
node dist/index.js stars torvalds/linux -t countries

# Contributor analysis
node dist/index.js contributors kubernetes/kubernetes -t prs

# AI-powered question
node dist/index.js ask "Which repos got the most stars in 2024?"
```

## Output Format

All commands output structured text tables designed for LLM analysis:

```
=== OSSInsight Trending Repositories ===
Language: Python | Period: past_week | Results: 100
Source: github-events-database (6B+ events) via TiDB Cloud

#   | Repository                             | Language     | Stars   | Forks   | PRs   | Score
----+----------------------------------------+--------------+---------+---------+-------+---------
  1 | NousResearch/hermes-agent              | Python       |   3,434 |     366 |   290 |  14895
  2 | safishamsi/graphify                    | Python       |   2,365 |     193 |     4 |  11279
  ...
```

## API Reference

This tool queries the OSSInsight public API (`https://api.ossinsight.io/v1`):

- No authentication required
- Rate limit: 600 req/hour per IP, 1000 req/min global
- Data source: 6B+ GitHub events analyzed by TiDB Cloud
- All numeric values in API responses are strings

## Requirements

- Node.js 18+
- npm

## License

MIT
