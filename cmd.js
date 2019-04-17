'use strict'

const commander = require('commander')
const _ = require('lodash')
const web3Rpc = require('./models/web3rpc')
const cmdEpoch = require('./commands/epoch')
const cmdSendTomo = require('./commands/sendTomo')

commander
    .version('1.0.0')
    .description('TomoChain Data Crawlers')

commander
    .command('epoch <epochNumber>')
    .action(async (epochNumber) => {
        await cmdEpoch.run(epochNumber)
    })

commander
    .command('sendTomo <pkey>')
    .alias('s')
    .description('Make TXs send TOMO')
    .option('-n, --number <number>', 'Number of TXs')
    .action(async (pkey, options) => {
        await cmdSendTomo.run(pkey, options.number || 1)
    })

commander.parse(process.argv)
