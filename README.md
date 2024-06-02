# Simple Event Logger UI

Simple Event Logger is a web application for logging events. Currently, it supports logging the date time, name, and memo of an event. The intended use case is for a single user to deploy it in a private network.

Simple Event Logger is mostly a toy and study project. The bare minimum functionality is here, but it is still under development.

This repo is the frontend code for Simple Event Logger. The backend code is located at [simple-event-logger-service](https://github.com/zzpxyx/simple-event-logger-service).

## Features

- Support preset buttons for quicker event logging.
- Incremental loading on the events list.

## Limitations and Areas for Improvement

- No authentication or access control.
- Only allow a single user.
- No unit tests.
- Need to refactor the code to make it more readable and maintainable.

## Environment Variables

The following environment variables can be set in environment files like `.env.development.local` or `.env.production.local` under the project root folder. The Vite dev server as well as the production build (see below) will pick up the settings in those environment variables.

### Base URL

Set the base URL of the Simple Event Logger service using `VITE_BASE_URL`. For example:

```
VITE_BASE_URL=http://192.168.1.100:3000
```

### Presets

Set preset buttons for quicker event logging using `VITE_PRESETS`. Note that the value is comma-delimited. For example:

```
VITE_PRESETS=A,B,C
```

Then there will be 3 preset buttons available under the input form. Clicking a preset button will populate the input form with the current date time and the preset value as the event name. The memo is not populated.

## Build, Run, and Deploy

The development is done and tested on Node.js v22, but recent Node.js LTS versions should also work.

Use `npm install` to install the dependencies during first-time setup as well as when there are changes to `package.json`.

For development, launch the Vite dev server using the following command:

```bash
npm run dev
```

The server will only listen on the `localhost` address. If you want to listen on all network interfaces, add the `--host` parameter:

```bash
npm run dev -- --host
```

Use the following command to generate a production build in the `dist` folder:

```bash
npm run build
```

Any HTTP web server will be able to serve the production build. For example, the Python 3 built-in one `python3 -m http.server` works just fine.
