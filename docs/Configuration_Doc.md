# Configuration "configuration.json"

Default Config: 
```json
{
    "ROOT_DBMUXEV": "../",
    "SAVE_DEBBUGING_DBMUXEV_FILE": false,

    "ENABLE_WEBSERVER": true,
    "ENABLE_API": true,
    "ENABLE_WEB_EDITING": true,
    "ENABLE_WEB_UI": true,
    "ENABLE_COLOR_LOGGING": true,
    "DISABLE_CONVERSION_ENDPOINTS": false,
    
    "STATIC_WEB_ROOT": "view",
    "WEB_PORT": 3000
}
```

## ROOT_DBMUXEV: Root directory for the dbmuxev database

This options needs to point to the base directory of the db. The base directory is the directory where architectures.yml is located.

This currently only officialy supports relative paths. Although on some operating systems absolute paths do work.

## SAVE_DEBBUGING_DBMUXEV_FILE: Save debbuging dbmuxev file in web/ directory

When this is true the data from the yaml to json conversion is saved in `web/debugging_dbmuxev.json` for development purposes.

## ENABLE_DBMUXEV_PARSING: Should the dbmuxev database be parsed

If this is `false` the programm will override the configvalue `ENABLE_API` to `false` since the api needs the db to function.

## ENABLE_WEBSERVER: Should the express.js webserver be enabled

If this is `false` the programm will close after parsing the database since there is nothing anymore to do.

## ENABLE_API: Enable API endpoints

If the API endpoint /api/ should be enabled or disabled.
This also gets overriden to `false` if `ENABLE_DBMUXEV_PARSING` is `false`

## ENABLE_WEB_UI: Enable the single page application

If this is is false the static host of `STATIC_WEB_ROOT` is disabled and `index.html` wont be automaticly sent for request `GET /*`

## ENABLE_WEB_EDITING: Enable editing of messages in the web ui

> [!IMPORTANT]  
> This feature is not yet available!

This config option decides if the `/api/v1/editing` enpoints will be active and if the web ui will show edit buttons.

## ENABLE_COLOR_LOGGING: Enable ansi codes in console logging

This decides if the console output will be in color, this option is recommended if your std::out is redirected to a file or journalctl / systemd since some file viewers do not parse ansi codes and they may increase the size of your logs

## DISABLE_CONVERSION_ENDPOINTS: Disable conversion /api/ endpoint

This controlls if the converters which convert the dbmuxev to f.e. dbc will be loaded and available through `GET /api/v1/converters` and  `POST /api/v1/convert/....` 

## STATIC_WEB_ROOT: Root for all the files surounding index.html

This is the directory where all the css / js / spa_pages are stored.
If this is invalid the web ui client will only be able to get `index.html` and/or the server does crash

## WEB_PORT: The port on which the web server will run

Port number for the express.js web server!