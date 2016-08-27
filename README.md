## beacon-publisher

A small utility for publishing iBeacon advertisements to MQTT

### Installation

Install from GitHub with `npm install -g snorp/beacon-publisher`

### Usage

`beacon-publish --url mqtt://<your_broker> [--name <name>]`

The MQTT message is JSON-formatted, and looks like this:

```
{
  "name": "MyBeacon",
  "uuid": "2f234454cf6d4a0fadf2f4911ba9ff",
  "major": 1,
  "minor": 1,
  "rssi": -72,
  "observer": "unknown"
}
```

If the `name` option is specified, the `observer` field will be set to that ("unknown" otherwise). This is useful if you have multiple observers and care about which one of them saw the advertisement.

### Run at startup

If you want to run this at startup in Linux, the following `systemd` service works well for me on the [CHIP](https://nextthing.co/pages/chip)

```
[Unit]
Description=Beacon Publisher

[Service]
ExecStart=/usr/local/bin/beacon-publisher --url mqtt://broker
Restart=always
User=chip
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```