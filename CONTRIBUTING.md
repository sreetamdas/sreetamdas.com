# Contributing Guide for [sreetamdas.com](https://sreetamdas.com)

Thanks so much for contributing to my website, [here's my favourite photo of dogs](https://www.theguardian.com/lifeandstyle/gallery/2018/jul/18/dog-photographer-of-the-year-2018-in-pictures#img-2) as a thank you!

This guide is also useful if you want to fork and use this project as a starting point for your own project.

## Issues

If you're unsure about where you can start contributing, check out the [issues](/../../issues) page for open issues. Issues are (usually) labelled and you can start with the [`good first issue`](https://github.com/sreetamdas/sreetamdas.com/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) label.

If you spot any typos, feel free to send a pull request! 🙂

> Please mention that you're working on an issue so that you can be assigned to it.

---

## Setting up locally

This project utilizes a _bunch_ of APIs for all kinds of different things: [Buttondown.email API](https://api.buttondown.email) for newsletter data, Cloudflare D1 for page view counts, and more.

To keep local development smooth, most integrations have fallbacks/mocks so you can run the app without configuring every external API up front.

### Default local setup

By default, you should be able to clone the repo, run `pnpm i`, and start working without adding API keys. If you want to use real integrations locally, copy `.env.example` to `.env` and fill in only the values you need.

#### Node version

Please check out the specific version of Node.js specified in `.nvmrc`. You can use a node version manager like [nvm](https://github.com/nvm-sh/nvm) or my personal choice [n](https://github.com/tj/n) (In my experience, `n` was _much_ faster than `nvm`).

#### Almost there

Once you have the specified version of Node.js installed, make sure you've [setup `pnpm`](https://pnpm.io/installation) and then you can run the following to get up and running.

```sh
pnpm i
pnpm dev
```

---

### Setting up the `.env` variables

If you'd like to use your own API keys, open `.env.example` and replace the `${VARIABLE_NAME}` placeholders with your details.

#### Notion

I'm using the [Notion API](https://developers.notion.com) to fetch data for my [Keebs](https://sreetamdas.com/keebs) page. Since this is a one off use case, You _probably_ don't need to use this token. If you do, check out the [docs](https://developers.notion.com/docs/getting-started)!

#### Buttondown.email

I use [Buttondown.email](https://buttondown.email) for my newsletter, and it supports queries for a bunch of things with [its API](https://api.buttondown.email) — you can retrieve your API key from your dashboard.

#### Cloudflare D1

Page views are stored in Cloudflare D1.

For local development, make sure you've created the local D1 schema by running:

```sh
pnpm db:migrate:local
```

This uses Wrangler's local D1 database under `.wrangler/`.
