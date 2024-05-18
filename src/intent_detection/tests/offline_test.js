const config = require("./test_data.js")

const IntentDetection = require("../IntentDetection.js")



detector = new IntentDetection()


var readline = require('readline');
var log = console.log;

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var recursiveAsyncReadLine = function () {
    rl.question('Command: ', function (command) {
        if (command == 'exit') {
            return rl.close();
        }
        const result = detector.runDetection(command, config)
        console.log(result)
        recursiveAsyncReadLine();
    });
};

recursiveAsyncReadLine(); //we have to actually start our recursion somehow