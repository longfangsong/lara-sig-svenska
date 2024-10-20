# Lara sig svenska

A tool for learning swedish.

## Development

### Prerequest

You should have [node](https://nodejs.org/en) and [pnpm](https://pnpm.io/installation) installed on your development environment.

### Development environment setup

You should run `./scripts/setup_dev_env/setup_dev_env.sh` before you start the dev server for the first time.

Then you can use `pnpm run dev` to start the dev server.

### Enable node to bind to 443 port (Linux only)

If linux complain about permission issue when running `pnpm run dev`, try using this command to grant `node` to
bind to ports less than 1024.

```sh
sudo setcap 'cap_net_bind_service=+ep' <your node executable path>
```

### Test

#### Unit tests

These tests **does not need** to be executed when dev server is up.

```sh
pnpm run test
```

#### UI test

These tests **needs** to be executed when dev server is up.

```sh
pnpm run ui-test
```
