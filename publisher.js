#!/usr/bin/env node

var noble = require('noble');
var mqtt = require('mqtt');


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

  if (data[3] !== 0x15) {
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

var url = process.argv[2];
if (!url) {
  console.error('Must pass MQTT endpoint as argument');
  process.exit(1);
}

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
    console.log('Ignoring non-beacon advertisement from ' + p.id);
    return;
  }


  console.log('Publishing event for beacon: ', beacon);
  client.publish('beacon/observed', JSON.stringify(beacon));
});

