# unturned2-panel


Tested with Node v10.16.3 & tsc Version 3.5.3

##dev

```
git clone https://github.com/fr34kyn01535/unturned2-panel.git
cd unturned2-panel
npm install #install dependencies
tsc #transpile
node index.js run
```

##production
```
npm init
npm install unturned2-panel --save
```
Install plugins just by installing their corresponding npm package (for example [unturned2-panel-ext-example-plugin](https://github.com/fr34kyn01535/unturned2-panel-ext-example-plugin))
```
npm install unturned2-panel-ext-example-plugin
```

##configuration
```
HTTP_PORT=2080
STEAM_API_KEY=ASASASASASSASASASASASAS #required for steam login (retrieve at https://steamcommunity.com/dev/apikey)
DOMAIN=localhost #used in steam login callback
#for automatic SSL certificate retrieval (letsencrypt) supply your e-mail address
HTTPS_PORT=2443
EMAIL=
```
