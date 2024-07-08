# ![RanobeDB logo](./static/rndb_logo.png) RanobeDB

RanobeDB is a [light novel](https://en.wikipedia.org/wiki/Light_novel) database website.

Visit us at https://ranobedb.org

## Features

- Add/edit books, series, releases, staff, and publishers to the database
- Keep track of books you have read, want to read, finished, etc.

## Contributing

### Prerequisites

RanobeDB is written in SvelteKit and TypeScript and the database uses [PostgreSQL](https://www.postgresql.org/). You will need to install [Node.js](https://nodejs.org/en), [PostgreSQL](https://www.postgresql.org/) and [pnpm](https://pnpm.io/).

### Installation

1. Clone the repo or fork it on Github and then clone your own repo

```sh
git clone https://github.com/Blastose/ranobedb.git
```

or

```sh
git clone https://github.com/{YOUR_ACCOUNT_HERE}/ranobedb.git
```

2. Install npm packages with pnpm

```sh
pnpm install
```

3. Copy the `.env.example` file to `.env` and fill it out. If you are only running the site locally, you can skip filling out the `MAILGUN_DOMAIN` and `MAILGUN_API_KEY` fields

4. Create a PostgreSQL database with the same name as the one you put in the `DATABASE_URL` env variable, then run the database migration script

```sh
npx kysely migrate:latest
```

5. Seed the database (optional)

   - Add test users from `sql/test_users.sql` or
   - Populate the database with the test database dump `db-seed.dump`
   - Run the database migration script again

6. Start the development server

```sh
pnpm run dev
```

### Pull requests

For small fixes, like typos, you can create a branch and submit a pull request with your changes.

For larger fixes or feature requests, please discuss it on our [Discord server](https://discord.gg/ZeAnhGncFx) first.

## Acknowledgements

Thanks to:

- [vndb](https://vndb.org/) for inspiring and influencing this project
- [LNRelease](https://github.com/LNRelease/lnrelease.github.io) for compiling a list of English light novels
- [Ranobe Mori](https://ranobe-mori.net/) for compiling a list of Japanese light novels

## License

[AGPL-3.0](LICENSE.txt)
