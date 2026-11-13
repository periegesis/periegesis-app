# Periegesis

Periegesis is an app that helps you stumble across hidden gems on your travels. When you're out exploring a new city, Periegesis lets you save lists of places and alerts you when you're walking past one of them.

## How it works

- **Cities, neighborhoods and sights.** Places are organized by city, then by neighborhood. Each sight has a short description, travel notes, an optional photo and its coordinates.
- **Sight alerts.** Turn on the alert for a sight, or for a whole neighborhood, and Periegesis watches for you to come within 800 m of it, even while the app is closed. When you do, you get a notification that opens that sight.
- **Import your own lists.** Add a city from a `.json` file, or from a `.zip` file that holds the JSON plus its photos.
- **Maps.** On iOS each sight shows an embedded Apple Map. On every platform, **Open in Maps** hands the location to your maps app for directions.

Athens and Rome come preloaded as sample cities.

### Alert limits

The operating system limits how many places an app can monitor at once. That's **20 sight alerts on iOS** and **100 on Android**. Alerts aren't available on the web. In the future, this limit may be expanded

## City file format

A city is a single JSON file:

```json
{
  "name": "Athens",
  "description": "Birthplace of democracy, where ancient ruins sit among lively neighborhoods.",
  "photo": "photos/athens.jpg",
  "neighborhoods": [
    {
      "name": "Plaka",
      "description": "Winding lanes of neoclassical houses at the foot of the Acropolis.",
      "sights": [
        {
          "name": "Anafiotika",
          "description": "A tiny Cycladic-style village tucked under the Acropolis.",
          "details": "Whitewashed houses and narrow stairways; best explored on foot.",
          "photo": "photos/anafiotika.jpg",
          "latitude": 37.9724,
          "longitude": 23.7287
        }
      ]
    }
  ]
}
```

`photo` is optional on cities and sights. It can be a full URL (`https://…`) or a path to an image bundled with the city. To bundle images, put the JSON file and the images together in a `.zip` file. Paths are resolved relative to the JSON file. A plain `.json` import can only use photo URLs.

## Development

Periegesis is built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/). It uses native modules for background location, geofencing, maps and notifications that Expo Go doesn't include, so you need a [development build](https://docs.expo.dev/develop/development-builds/introduction/) to run it.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build and install the development build on a device or simulator:

   ```bash
   npm run ios
   ```

   ```bash
   npm run android
   ```

   You can also build in the cloud with `npx eas-cli@latest build --profile development`.

3. Next time, just start the dev server and open the installed build:

   ```bash
   npm start
   ```

To test alerts, grant location access **Always** (iOS) or **Allow all the time** (Android), and allow notifications.

Before committing, run:

```bash
npx expo lint
```

```bash
npx tsc --noEmit
```

### Project structure

| Path | Contents |
| --- | --- |
| `src/app/` | Screens (Expo Router): city list → city → sight |
| `src/components/` | Shared UI components |
| `src/geofencing/` | Background geofencing task, alert store and permissions |
| `src/import/` | Reading and validating `.json`/`.zip` city files |
| `src/storage/` | On-device storage and the sample cities |
| `src/hooks/` | Data hooks used by the screens |
| `src/types/` | The `City` / `Neighborhood` / `Sight` data model |
| `assets/` | App icon, splash screen and favicon |
