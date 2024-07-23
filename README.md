# Usage

## Use your own desk layout

Two desk layouts are provided in `static/` as examples, that you can replace
with your own, and then include in `static/home.ejs`. The requirements are:

* Bookable desks should be shapes with a `desk` class.
* Each of these shapes should have a unique `id` attribute. If you have
  several SVG files each `id` should be unique across all files.

One good option for editing SVG files is [Inkscape](https://inkscape.org/). You
can draw the shapes easily, and use Edit -> XML Editor to add the `desk` class
where needed. Please use the provided example files for guidance.

## Run locally for development

`./dev`

## Run in production

* To use Google-based authentication, you will need to setup OAuth at
   https://console.cloud.google.com/
* `export KOMORAZU_GOOGLE_CLIENT_ID=[...]`
* `export KOMORAZU_GOOGLE_CLIENT_SECRET=[...]`
* (Optional if you want to restrict logins to your domain) `KOMORAZU_DOMAIN=example.com`
* `export PORT=443` (or 80 without https)
* `./run`
