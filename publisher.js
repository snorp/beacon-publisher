#!/usr/bin/env node

'use strict'

var noble = require('noble');
var mqtt = require('mqtt');
var minimist = require('minimist');

function parseBeacon(p) {
  var data = p.advertisement.manufacturerData;

  if (!data || data.length !== 25) {
    return null;
  }

  if (data.readUInt16BE(0) !== 0x4c00) {
    return null;
  }

  if (data[2] !== 0x02) {
    return null;
  }

  if (data[3] !== 21) {
    return null;
  }

  return {
    name: p.advertisement.localName || '',
    uuid: data.slice(4, 19).toString('hex'),
    major: data.readUInt16BE(20),
    minor: data.readUInt16BE(22),
    rssi: p.rssi
  }
}

var argv = require('minimist')(process.argv.slice(2));

var url = argv.u || argv.url;
if (!url) {
  console.error('Must pass MQTT endpoint as argument');
  process.exit(1);
}

var observerName = argv.n || argv.name || 'unknown';

var client = mqtt.connect(url);
client.on('connect', function() {
  console.log('MQTT connected');
});

noble.on('stateChange', function(state) {
  if (state !== 'poweredOn') {
    return;
  }

  console.log('Bluetooth initialized, scanning for beacons');
  noble.startScanning([], true);
});

noble.on('discover', function(p) {
  var beacon = parseBeacon(p);
  if (!beacon) {
    console.log('Ignoring non-beacon advertisement from ' + (p.advertisement.localName || p.id));
    return;
  }

  beacon.observer = observerName;

  console.log('Publishing event for beacon: ', beacon);
  client.publish('beacon/observed', JSON.stringify(beacon));
});

