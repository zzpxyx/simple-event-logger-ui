# Simple Event Logger UI

## Environment Variables

The following environment variables can be set in environment files like `.env.development.local` or `.env.production.local` under the project root.

### Base URL

Set the base URL of the Simple Event Logger service using `VITE_BASE_URL`.

### Presets

Set preset buttons for quicker event logging using `VITE_PRESETS`. Note that the value is comma-delimited. For example:

```
VITE_PRESETS=A,B,C
```

Then there will be 3 preset buttons available under the input form. Clicking a preset button will populate the input form with the current date time and the preset value as the event name. The memo is not populated.
