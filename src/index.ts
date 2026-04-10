#!/usr/bin/env node

import { Command } from "commander";
import { trending } from "./commands/trending.js";
import { repo } from "./commands/repo.js";
import { compare } from "./commands/compare.js";
import { collections } from "./commands/collections.js";
import { ranking } from "./commands/ranking.js";
import { stars } from "./commands/stars.js";
import { contributors } from "./commands/contributors.js";
import { ask } from "./commands/ask.js";

const program = new Command();

program
  .name("ossinsight")
  .description("OSSInsight CLI — Open source intelligence powered by 6B+ GitHub events. Outputs LLM-friendly text.")
  .version("1.0.0");

program
  .command("trending")
  .description("Show trending repositories")
  .option("-l, --language <lang>", "Filter by language (e.g. Python, Go, Rust)", "All")
  .option("-p, --period <period>", "Time period: past_24_hours, past_week, past_month, past_3_months", "past_week")
  .action(async (opts) => {
    console.log(await trending(opts.language, opts.period));
  });

program
  .command("repo <owner/repo>")
  .description("Full analysis of a repository (stars, contributors, countries, growth)")
  .action(async (repoPath: string) => {
    console.log(await repo(repoPath));
  });

program
  .command("compare <repo1> <repo2>")
  .description("Compare two repositories side-by-side")
  .action(async (repo1: string, repo2: string) => {
    console.log(await compare(repo1, repo2));
  });

program
  .command("collections")
  .description("List all OSSInsight collections")
  .option("-s, --search <keyword>", "Filter collections by keyword")
  .action(async (opts) => {
    console.log(await collections(opts.search));
  });

program
  .command("ranking <collection-id>")
  .description("Show collection ranking (stars, PRs, or issues)")
  .option("-m, --metric <metric>", "Ranking metric: stars, prs, issues", "stars")
  .option("-p, --period <period>", "Time period: past_28_days, past_month", "past_28_days")
  .action(async (id: string, opts) => {
    console.log(await ranking(id, opts.metric, opts.period));
  });

program
  .command("stars <owner/repo>")
  .description("Analyze stargazer demographics (countries, history, organizations)")
  .option("-t, --type <type>", "Sub-view: all, countries, history, orgs", "all")
  .action(async (repoPath: string, opts) => {
    console.log(await stars(repoPath, opts.type));
  });

program
  .command("contributors <owner/repo>")
  .description("Analyze contributors (PR authors or issue reporters)")
  .option("-t, --type <type>", "Contributor type: prs, issues", "prs")
  .action(async (repoPath: string, opts) => {
    console.log(await contributors(repoPath, opts.type));
  });

program
  .command("ask <question>")
  .description("Ask a natural language question about GitHub (AI-powered SQL generation)")
  .action(async (question: string) => {
    console.log(await ask(question));
  });

program.parseAsync();
