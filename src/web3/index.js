const { IceteaWeb3 } = require('@iceteachain/web3')
const envfile = require('envfile')
const { envPath } = require('../../scripts/mode')
const config = envfile.parseFileSync(envPath)

const tweb3 = new IceteaWeb3(config.REACT_APP_RPC)
const contract = tweb3.contract(config.REACT_APP_CONTRACT)


exports.addQuestion = async (question, from, value) => {
    try {
        await contract.methods.addQuestion(question).sendCommit({ from, payer: 'system.faucet', value })
    } catch (e) {
        //console.log('try to use money from sender...')
        try {
            contract.methods.addQuestion(question).sendCommit({ from, value })
        } catch (e) {
            throw e
        }

    }
}
exports.addAnswer = async (questionId, answer, from) => {
    try {
        await contract.methods.addAnswer(questionId, answer).sendCommit({ from })
    } catch (e) {
        // e - error object. It has 3 properties: name, message and stack!
        throw e
    }
}
exports.removeQuestion = async (id, from) => {
    const timestamp = Math.round(new Date().getTime() / 1000)
    try {
        await contract.methods.removeQuestion(id, timestamp).sendCommit({ from })
    } catch (e) {
        throw e
    }
}
exports.removeAnswer = async (id, from) => {
    const timestamp = Math.round(new Date().getTime() / 1000)
    try {
        await contract.methods.removeAnswer(id, timestamp).sendCommit({ from })
    } catch (e) {
        throw e
    }
}
exports.getAnswers = async (questionId) => {
    try {
        return await contract.methods.getAnswers(questionId).call()
    } catch (e) {
        throw e
    }
}
exports.getAllQuestion = async () => {
    try {
        return await contract.methods.getAllQuestion().call()
    } catch (e) {
        throw e
    }
}
exports.getQuestions = async (owner) => {
    try {
        return await contract.methods.getQuestions(owner).call()
    } catch (e) {
        throw e
    }
}
exports.sendReward = async (questionId, answerId, amount, from) => {
    try {
        await contract.methods.sendReward(questionId, answerId, amount).sendCommit({ from })
    } catch (e) {
        throw e
    }
}
exports.withdrawFromQuestion = async (questionId, from) => {
    const timestamp = Math.round(new Date().getTime() / 1000)
    try {
        await contract.methods.withdrawFromQuestion(questionId, timestamp).sendCommit({ from })
    } catch (e) {
        throw e
    }
}