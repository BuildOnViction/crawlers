'use strict'

const commander = require('commander')
const _ = require('lodash')
const web3Rpc = require('./models/web3rpc')
const cmdEpoch = require('./commands/epoch')

commander
    .version('1.0.0')
    .description('TomoChain Data Crawlers')

commander
    .command('epoch <epochNumber>')
    .action(async (epochNumber) => {
        await cmdEpoch.run(epochNumber)
    })

commander.parse(process.argv)
