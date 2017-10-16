var SX127x = require('../index'); // or require('sx127x')

var sx127x = new SX127x({
    frequency: 916e6,
    spreadingFactor: 7,
    preambleLength: 8,
    syncWord: 0x34,
    txPower: 17,
    dio0Pin: 22,
    resetPin: 26,
    signalBandwidth: 125e3
});

var count = 0;

// open the device
sx127x.open(function(err) {
  console.log('open', err ? err : 'success');

  if (err) {
    throw err;
  }

  // send a message every second
  setInterval(function() {
    console.log('write: hello ' + count);
    sx127x.write(new Buffer('hello. Eu sou a raspberry pi3. Aumentando o tamanho da mensagem para facilitar visualizacao. ' + count++), function(err) {
      console.log('\t', err ? err : 'success');
    });
  }, 2000);
});

process.on('SIGINT', function() {
  // close the device
  sx127x.close(function(err) {
    console.log('close', err ? err : 'success');
    process.exit();
  });
});
