# Contributing Guide for [sreetamdas.com](https://sreetamdas.com)

Thanks so much for contributing to my website, [here's my favourite photo of dogs](https://www.theguardian.com/lifeandstyle/gallery/2018/jul/18/dog-photographer-of-the-year-2018-in-pictures#img-2) as a thank you!

This guide is also useful if you want to fork and use this project as a starting point for your own project.

## Issues

If you're unsure about where you can start contributing, check out the [issues](/../../issues) page for open issues. Issues are (usually) labelled and you can start with the [`good first issue`](https://github.com/sreetamdas/sreetamdas.com/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) label.

If you spot any typos, feel free to send a pull request! 🙂

> Please mention that you're working on an issue so that you can be assigned to it.

---

## Setting up locally

This project utilizes a _bunch_ of APIs for all kinds of different things: [Buttondown.email API](https://api.buttondown.email) for my newsletter statistics, [Supabase](https://supabase.io) for page view counts, etc.

In order to provide a more seamless experience, I've set up [Mock Service Worker](https://mswjs.io) which allows us to intercept and mock such requests at the network level. Pretty neat stuff!

### Default local setup

By default, mocking is enabled via the `NEXT_PUBLIC_API_MOCKING_ENABLED` environment variable set to `true` in `.env.example`. What this means is that you _should_ be able to clone the repo, run `npm i`, and start working without any additional setup!

#### Node version

Please check out the specific version of Node.js specified in `.nvmrc` (`16.5.0` as of 7th October, 2021). You can use a node version manager like [nvm](https://github.com/nvm-sh/nvm) or my personal choice [n](https://github.com/tj/n) (In my experience, `n` was _much_ faster than `nvm`).

#### Almost there

Once you have the specified version of Node.js installed, you can run `npm i` and `npm run dev` to get up and running.

```sh
npm i
npm run dev
```

---

### Setting up the `.env` variables

If you'd like to use your own API keys, open up `.env.example` and replace the `${VARIABLE_NAME}` with your corresponding details. And when you're ready, disable mock service worker by removing the `NEXT_PUBLIC_API_MOCKING_ENABLED` environment variable or setting it to `false`.

#### Notion

I'm using the [Notion API](https://developers.notion.com) to fetch data for my [Keebs](https://sreetamdas.com/keebs) page. Since this is a one off use case, You _probably_ don't need to use this token. If you do, check out the [docs](https://developers.notion.com/docs/getting-started)!

#### Buttondown.email

I use [Buttondown.email](https://buttondown.email) for my newsletter, and it supports queries for a bunch of things with [its API](https://api.buttondown.email) — you can retrieve your API key from your dashboard.

#### Supabase

You get an incredibly robust, flexible and intuitive solution for a Postgres database, authentication, storage and much more with [Supabase](https://supabase.io) — but personally I was most interested in working with a relational database.

Create a Supabase account, and create a new project. Create a (strong) database password and save it in a password manager (like [1password](https://1password.com)! or somewhere you won't forget.

Then, in your `.env` file, set the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables to the URL and password you just created.
