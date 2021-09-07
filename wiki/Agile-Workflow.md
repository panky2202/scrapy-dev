This document describes how we do our Agile development. Feel free to make proposals on adjusting our workflow.

## Our goal

The goal is to produce max value for our customers, meanwhile, avoid burnout and stress for developers.

## Why do we need a workflow?

The amount of work is endless. You can spend 100 years developing software and still have things to do. Thus we need to
find a way to direct our effort towards the max value. Without a direction, we can spend hours and hours developing
software, but not actually moving forward.

- There is a higher chance to spend 20h on a feature, that will not bring much value
- Or miss a feature, that will bring HUGE value for 1h of work

We need a methodology to direct the team's effort in the most valuable direction.

## The basic Agile idea

The basic idea is simple:

- We have an endless backlog of things to do
- At the beginning of a week we take the most impactful (for business) and cheap to produce tasks from the backlog and
  give them to devs
- At the end of the week we show the working software to the business

Each week we have working software that brings value to the business. Each week we grow the working software. It's a
step-by-step process, where we have a functioning system each day.

## Agile manifesto

[Agile manifesto](https://en.wikipedia.org/wiki/Agile_software_development#The_Manifesto_for_Agile_Software_Development)
capturing the core values of the workflow. Please, read it, it 5-7 min max. Using these values dev team can decide,
which task do next, or how to communicate with each other.

- Individuals and interactions over processes and tools
- Working software over comprehensive documentation
- Customer collaboration over contract negotiation
- Responding to change over following a plan

## Agile software development principles

This is our ideal process, we try to get to it as close as possible.

1. Customer satisfaction by early and continuous delivery of valuable software.
2. Welcome changing requirements, even in late development.
3. Deliver working software frequently (weeks rather than months)
4. Close, daily cooperation between business people and developers
5. Projects are built around motivated individuals, who should be trusted
6. Face-to-face conversation is the best form of communication (co-location)
7. Working software is the primary measure of progress
8. Sustainable development, able to maintain a constant pace
9. Continuous attention to technical excellence and good design
10. Simplicity—the art of maximizing the amount of work not done—is essential
11. Best architectures, requirements, and designs emerge from self-organizing teams
12. Regularly, the team reflects on how to become more effective and adjusts accordingly

# How do we do Agile development?

We have a [Kanban board](https://airtable.com/tblOcA8wnp5CUOqWZ/viw49qPbzSuctGx33?blocks=hide) in Airtable. It has 3
main columns:

- BACKLOG - things that we can do
- WIP - Work In Progress. Things that are in progress for this week
- DONE IN SPRINT #x – Done things move from WIP to the corresponding DONE column. This way we can track our output
  sprint to sprint

The process:

- All our tasks first get into BACKLOG
- In the Backlog we prioritize tasks. To prioritize the tasks we need to know the business aspect of things, so we could
  choose the most valuable task to do
- Each week we take tasks from the backlog and assign them to devs, and move them into WIP
- At the end of the week we show the business work we have done and move tasks to DONE
- At the end of the week we analyze what has been done, and how can we improve

## What if we spend a week and could not finish a task assigned?

That is a normal situation. Before a team learns its capabilities we will encounter these situations often. Tasks like
this should be split into smaller tasks.

With time a team will know, how much it can do.

## How to name tasks

Use a verb:

- "New API method" - bad, no verb :x:
- "Add new API addBalance()" - good, has a verb and details :white_check_mark:

Verbs allow us easily understand tasks.

## How to prioritize tasks

More important tasks are on the top, less important are at the bottom. On the top should be tasks that are easy to
complete and that are bring huge value to the business.

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Agile-Workflow.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
