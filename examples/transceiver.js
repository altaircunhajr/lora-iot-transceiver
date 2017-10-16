var winston = require('winston');
var { format } = require('winston');

const myFormat = format((info, opts) => {
  return `${info.timestamp}: ${info.message}`;
});

console.log(format);

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error', formatter: myFormat, json: false }),
    new winston.transports.File({ filename: 'combined.log', formatter: myFormat, json: false })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

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
sx127x.open(function (err) {
    
    logger.info("open " + (err ? err : "success" ));

    if (err) {
        throw err;
    }

    var ouvindoCanal = false;
    var intervalo = 100;

    var ouveCanal = function () {
        if (ouvindoCanal) {
            logger.info("já estou ouvindo o canal");
            return;
        }

        // enable receive mode
        sx127x.receive(function (err) {
            logger.info("receive " + (err ? err : "success"));
            logger.info("Ouvindo canal...");
            ouvindoCanal = true;
        });
    }

    var ultimaTentativa = new Date().getTime();

    // add a event listener for data events
    var preparaParaResponder = function (data, rssi, snr) {
            logger.info(`data: ${data.toString()} | rssi: ${rssi} | snr: ${snr} `);

        var agora = new Date().getTime();
        if ((agora - ultimaTentativa) < intervalo) {
            logger.info(agora - ultimaTentativa + " menor que " + intervalo);
            return;
        }

        ultimaTentativa = agora;
        var resposta = "(raspberry): Oi, sou a Raspberry Pi3. Envio autorizado. " + count++;
        
        logger.info(`Mandando resposta -> ${resposta}`);
        ouvindoCanal = false;
        sx127x.write(new Buffer(resposta), function(err) {
            logger.info("send: " + ( err ? err : "success" ) );
            logger.info("voltando a ouvir...");
            setTimeout( ouveCanal , 100);
    	 })
    };

    sx127x.on('data', function(data, rssi, snr) {

        var chamaCallback = function() {
            preparaParaResponder(data, rssi, snr);
        };

        setTimeout(chamaCallback, 800);
    });
    ouveCanal();

});


process.on('SIGINT', function () {
    // close the device
    sx127x.close(function (err) {
        logger.info("close " + (err ? err : "success" ) );
        process.exit();
    });
});
