# ossinsight-cli

CLI tool + Claude Code skill for querying [OSSInsight](https://ossinsight.io) — open source intelligence powered by 6B+ GitHub events via TiDB Cloud.

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

## Install

```bash
git clone https://github.com/YOUR_USERNAME/ossinsight-cli.git
cd ossinsight-cli
chmod +x install.sh
./install.sh
```

This will:
1. Install npm dependencies
2. Build TypeScript
3. Symlink the skill into `~/.claude/skills/ossinsight`

## Usage

### As Claude Code Skill

```
/ossinsight trending Python repos this week
/ossinsight analyze facebook/react
/ossinsight compare pytorch vs tensorflow
/ossinsight what are the fastest growing Rust projects?
```

### As Standalone CLI

```bash
# Trending repos
npx tsx src/index.ts trending -l Python -p past_week

# Full repo analysis
npx tsx src/index.ts repo facebook/react

# Compare repos
npx tsx src/index.ts compare facebook/react vuejs/vue

# Browse collections
npx tsx src/index.ts collections -s "AI"

# Collection ranking
npx tsx src/index.ts ranking 2 -m stars

# Star analysis
npx tsx src/index.ts stars torvalds/linux -t countries

# Contributor analysis
npx tsx src/index.ts contributors kubernetes/kubernetes -t prs

# AI-powered question
npx tsx src/index.ts ask "Which repos got the most stars in 2024?"
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
