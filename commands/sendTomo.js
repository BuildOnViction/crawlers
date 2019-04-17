const web3Rpc = require('../models/web3rpc')
const config = require('config')
const logger = require('../helpers/logger')

let sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))
var nonce = 0

async function run (pkey, number) {
    const account = web3Rpc.eth.accounts.privateKeyToAccount(pkey)
    let coinbase = account.address
    web3Rpc.eth.accounts.wallet.add(account)
    web3Rpc.eth.defaultAccount = coinbase
    logger.info('Start process at %s', new Date())
    try {
        nonce = await web3Rpc.eth.getTransactionCount(coinbase)
        let tos = []
        for (let i = 1; i <= number; i ++) {
            tos.push(coinbase)
        }
        await sendTomo(coinbase, tos)
    } catch (e) {
        logger.error('Cannot start by error %s', String(e))
        process.exit(1)
    }
}

const send = function (obj) {
    return new Promise((resolve, reject) => {
        web3Rpc.eth.sendTransaction({
            nonce: obj.nonce,
            from: obj.from,
            to: obj.to,
            value: obj.value,
            gasLimit: obj.gasLimit,
            gasPrice: obj.gasPrice,
            chainId: config.get('blockchain.chainId')
        }, function (err, hash) {
            if (err) {
                logger.error(`Send error ${obj.to} nonce ${obj.nonce}`)
                logger.error(String(err))
                logger.error('Sleep 2 seconds and resend until done')
                return sleep(2000).then(() => {
                    return resolve(send(obj))
                })
            } else {
                logger.info('Done %s %s %s %s %s', obj.to, obj.value, hash, 'nonce', obj.nonce)
                return resolve()
            }
        }).catch(e => { logger.error(e) })
    })
}

async function sendTomo (coinbase, addrs) {
    for (let i in addrs) {
        let a = addrs[i]
        let item = {
            nonce: parseInt(nonce),
            from: coinbase,
            to: addrs[i],
            value: '10000000000000000',
            gasLimit: 21000,
            gasPrice: 250000000
        }

        logger.info('Start send %s to %s', item.value, item.to)
        await send(item)
        nonce = parseInt(nonce) + 1
    }
}

module.exports = { run }
