const fs = require('fs');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://user:passwd@xxx.xxx.xxx.xxx',{clientId:"rockrobo"});//enter your mqtt-server credentials here

// Subscribe Topics
client.on('connect', () => {
	console.log("Connected");
    	client.publish("rockrobo/map/log", "Connected");//added log via mqtt
	client.subscribe('rockrobo/map/load');
	client.subscribe('rockrobo/map/save');
});

// Incoming MQTT message (payload is the desired 'map bundle' name -> /mnt/data/maploader/maps/<name>)
client.on('message', (topic, message) => {
	if(topic === 'rockrobo/map/load') {
		var source = '/mnt/data/maploader/maps/' + message + '/';
		var destination = '/mnt/data/rockrobo/';

		console.log("Received Load Request: " + message);

        	client.publish("rockrobo/map/log", "Received Load Request: " + message);//added log via mqtt
		copyFiles(source, destination);
	}

	if(topic === 'rockrobo/map/save') {
		var source = '/mnt/data/rockrobo/';
		var destination = '/mnt/data/maploader/maps/' + message + '/';

		console.log("Received Save Request: " + message);
        	client.publish("rockrobo/map/log", "Received Save Request: " + message);//added log via mqtt
		copyFiles(source, destination);
	}
});

// Backup or restore map files, destinations edited for v1-specific files
function copyFiles(source, destination) {
    const files = ['last_map', 'ChargerPos.data', 'StartPos.data'];

    if (!fs.existsSync(destination)){
        fs.mkdirSync(destination, { recursive: true });
        console.log('Created directory: ' + destination);
        client.publish("rockrobo/map/log", 'Created directory: ' + destination);
    }

    for (const file of files) {
        const srcFile = source + file;
        const destFile = destination + file;

        if (!fs.existsSync(srcFile)) {
            console.log('Error: ' + srcFile + ' not found');
            client.publish("rockrobo/map/log", 'Error: ' + file + ' not found');
        } else {
            fs.copyFileSync(srcFile, destFile);
            console.log('Copied ' + file + ' from ' + source + ' to ' + destination);
            client.publish("rockrobo/map/log", 'Copied ' + file + ' from ' + source + ' to ' + destination);
        }
    }
}
