const commandLineArgs = require("command-line-args");

const optionDefinitions = [
    { name: 'info', alias: 'i', defaultOption: true, type: String, defaultValue: undefined },
    { name: 'parts', alias: 'p', type: Number, defaultValue: undefined },
];
console.log(commandLineArgs(optionDefinitions));
