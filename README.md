# Simple Event Logger UI

## Presets

Use the environment variable to set up preset buttons for quicker event logging. For example, create a file `.env.development.local` under the project root with the following content. Note that the value is comma-delimited.

```
VITE_PRESETS=A,B,C
```

Then there will be 3 preset buttons available when running the Vite dev server. Clicking a preset button will populate the input form with the current date time and the preset value as the event name. The memo is not populated.
