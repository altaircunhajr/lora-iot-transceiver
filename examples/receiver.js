var SX127x = require('../index'); // or require('sx127x')

var sx127x = new SX127x({
    frequency: 916e6,
    spreadingFactor: 7,
    preambleLength: 8,
    syncWord: 0x34,
    txPower: 7,
    dio0Pin: 22,
    resetPin: 26,
    signalBandwidth: 125e3
});

var count = 0;

// open the device
sx127x.open(function (err) {
    console.log('open', err ? err : 'success');

    if (err) {
        throw err;
    }

    // add a event listener for data events
    sx127x.on('data', function (data, rssi) {
        console.log('data:', '\'' + data.toString() + '\'', rssi);
    });

    // enable receive mode
    sx127x.receive(function (err) {
        console.log('receive', err ? err : 'success');
    });

});

process.on('SIGINT', function () {
    // close the device
    sx127x.close(function (err) {
        console.log('close', err ? err : 'success');
        process.exit();
    });
});
