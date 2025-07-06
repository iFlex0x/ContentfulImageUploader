# contentful image uploader

a vencord plugin that lets you upload discord images straight to contentful with metadata. pretty handy if you're managing a content site and want to save images from discord conversations.

## what it does

- right-click any discord image and upload it to contentful
- automatically grabs the artist name from the discord message
- add stuff like image name, spoiler tags, and whether to show it on homepage
- works with contentful's content management api

## installation
https://discord.com/channels/1015060230222131221/1257038407503446176
## setup

you'll need to configure your contentful stuff first:

1. go to vencord settings → plugins → contentful image uploader
2. fill in these fields:
   - **space id**: your contentful space id
   - **cma token**: your contentful content management api token  
   - **model id**: the id of your content model for image entries

### getting your contentful credentials

1. **space id**: found in your contentful dashboard under settings → general settings
2. **cma token**: create a new api key in settings → api keys → content management tokens
3. **model id**: the id of your content model (found in content → content models)

## how to use

1. right-click on any discord message with an image
2. click "upload to contentful" from the menu
3. fill in the details:
   - **image name**: give it a good name
   - **artist**: should be auto-filled from the discord message
   - **has spoilers**: check if the image has spoilers
   - **display on homepage**: check if you want it featured
4. click "upload to contentful"

the plugin will:
1. download the image from discord
2. upload it to contentful as an asset
3. process the asset to get urls
4. create a content entry with your metadata
5. publish both the asset and entry

## requirements

- vencord discord client mod
- contentful account with content management api access
- properly configured content model in contentful

### vencord dev environment

follow the [vencord development guide](https://docs.vencord.dev/) for setup:
- clone the vencord repo
- install deps with `pnpm install`
- run `pnpm run build` to build vencord
- your plugin gets loaded from `src/userplugins/`

## license

gpl-3.0-or-later - see license file for details

## contributing

feel free to submit issues and prs to make it better 
