'use strict'

const web3Rpc = require('../models/web3rpc')
const config = require('config')
const logger = require('../helpers/logger')
const ethUtils = require('ethereumjs-util')
const BlockHeader = require('ethereumjs-block/header')

async function scan (blockNumber) {
    try {
        let block = await web3Rpc.eth.getBlock(blockNumber)
        let { m1, m2 } = getM1M2(block)
        logger.info(`block number ${block.number} hash ${block.hash} m1 ${m1} m2 ${m2}`)
        return {
            number: block.number,
            hash: block.hash,
            m1: m1,
            m2: m2
        }
    } catch (e) {
        logger.error('scan error %s %s', blockNumber, e)
        return scan(blockNumber)
    }
}

function getM1M2 (block) {
    const dataBuff = ethUtils.toBuffer(block.extraData)
    const sig = ethUtils.fromRpcSig(dataBuff.slice(dataBuff.length - 65, dataBuff.length))

    block.extraData = '0x' + ethUtils.toBuffer(block.extraData).slice(0, dataBuff.length - 65).toString('hex')

    const headerHash = new BlockHeader({
        parentHash: ethUtils.toBuffer(block.parentHash),
        uncleHash: ethUtils.toBuffer(block.sha3Uncles),
        coinbase: ethUtils.toBuffer(block.miner),
        stateRoot: ethUtils.toBuffer(block.stateRoot),
        transactionsTrie: ethUtils.toBuffer(block.transactionsRoot),
        receiptTrie: ethUtils.toBuffer(block.receiptsRoot),
        bloom: ethUtils.toBuffer(block.logsBloom),
        difficulty: ethUtils.toBuffer(parseInt(block.difficulty)),
        number: ethUtils.toBuffer(block.number),
        gasLimit: ethUtils.toBuffer(block.gasLimit),
        gasUsed: ethUtils.toBuffer(block.gasUsed),
        timestamp: ethUtils.toBuffer(block.timestamp),
        extraData: ethUtils.toBuffer(block.extraData),
        mixHash: ethUtils.toBuffer(block.mixHash),
        nonce: ethUtils.toBuffer(block.nonce)
    })

    const pub = ethUtils.ecrecover(headerHash.hash(), sig.v, sig.r, sig.s)
    const m1 = ethUtils.addHexPrefix(ethUtils.pubToAddress(pub).toString('hex'))

    const dataBuffM2 = ethUtils.toBuffer(block.validator)
    const sigM2 = ethUtils.fromRpcSig(dataBuffM2.slice(dataBuffM2.length - 65, dataBuffM2.length))
    const pubM2 = ethUtils.ecrecover(headerHash.hash(), sigM2.v, sigM2.r, sigM2.s)
    const m2 = ethUtils.addHexPrefix(ethUtils.pubToAddress(pubM2).toString('hex'))

    return { m1, m2 }
}

async function report (data) {
    let m1 = {}
    let m2 = {}
    data.forEach(it => {
        m1[it.m1] = (m1[it.m1] || 0) + 1
        m2[it.m2] = (m2[it.m2] || 0) + 1
    })

    let map = {}
    for (let k in m1) {
        map[k] = {}
        map[k].m1 = m1[k]
    }

    for (let j in m2) {
        map[j] = map[j] || {}
        map[j].m2 = m2[j]
    }

    for (let addr in map) {
        logger.info(`addr ${addr} m1 ${map[addr].m1} m2 ${map[addr].m2}`)
    }
}

async function run (epochNumber) {
    let start = (epochNumber - 1) * 900 + 1
    let end = epochNumber * 900

    let data = []
    for (let i=start; i<=end; i++) {
        let it = await scan(i) 
        data.push(it)
    }

    await report(data)
    return process.exit(0)
}

module.exports = { run }
