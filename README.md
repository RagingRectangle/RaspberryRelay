# RaspberryRelay Bot

## About
A Discord bot for controlling the GPIO pins on a Raspberry Pi to power cycle MAD devices.  Optional integration into MadGruber for automatic power cycling using noProto alerts.

Join the Discord server for any help and to keep up with updates: https://discord.gg/USxvyB9QTz

  
  
## Requirements
1: Node 16+ installed on Pi

2: Discord bot with:
  - Server Members Intent
  - Message Content Intent
  - Read/write perms in channels

 
  
## Install
```
git clone https://github.com/RagingRectangle/RaspberryRelay.git
cd RaspberryRelay
cp -r config.example config
npm install
```
 
  

## Optional Integration
- [MadGruber](https://github.com/RagingRectangle/MadGruber)

 
  

## Config Setup
- **botToken:** Discord bot token. (If using MadGruber this needs to use the same token).
- **prefix:** Used for manually power cycling a device. (If using MadGruber you'll probably want to use a different character).
- **relayMode:** "NO" (normally open) or "NC" (normally closed).
- **toggleTimeSeconds:** How long to keep device turned off before turning it back on.
- **admins:** IDs of Discord users who have permission to power cycle devices.
- **commandChannels:** IDs for the channels the bot will accept manual power cycle commands.
- **deleteResultsSeconds:** How long to wait until power cycle responses are deleted (Set to 0 to never delete).
- **noProtoAutoCycle:** Use MadGruber to power cycle noProto devices automatically (true/false).
- **noProtoChannels:** Channel IDs where MadGruber noProto warnings are sent.

  


## Device Setup
- Config file: */config/devices.json*
- **relay:** The relay number. Only used to help organize device list.
- **device:** The device name in MAD
- **gpio:** The GPIO number on the Raspbery Pi
  


## Usage
- Start bot with: `node relay.js`
- Manually power cycle devices by sending: `<prefix><device_name>`
  


## Example
![Close_View](https://i.imgur.com/iVovUMo.png)
![Full_view](https://i.imgur.com/fL3AUZB.png)