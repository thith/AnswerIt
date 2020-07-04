const envfile = require('envfile')
const fs = require('fs')
const { toPkey } = require('./mnemonic')
const { transpile } = require('@iceteachain/sunseed')
const { IceteaWeb3 } = require('@iceteachain/web3')

const { mode, envPath } = require('./mode')

if (['-h', '--help'].includes(mode)) {
  console.log('Purpose: Deploy contract then update .env file.')
  console.log('---------------')
  console.log('deploy         deploy contract using .env file')
  console.log('deploy prod    deploy contract using .env.production file')
  console.log('deploy dev     deploy contract using .env.development file')
  console.log('deploy [file]  deploy contract using [file]')
  return
}

// load config
console.log(`Load RPC endpoint from ${envPath}`)
const config = envfile.parseFileSync(envPath)
const endpoint = config.REACT_APP_RPC
const contractAlias =  'contract.answerit_official' 


// load source file
const src = fs.readFileSync('./contracts/answerit.js');

(async () => {

  // compile source
  const compiledSrc = await transpile(src, { prettier: true, context: './contracts/' })

  // connect to Icetea RPC
  const tweb3 = new IceteaWeb3(endpoint)
  console.log(`Connected to ${endpoint}.`)

  // create a private key
  let pkey = config.PKEY || process.env.PKEY
  console.log(pkey)
  if (!pkey) {
    const seed = config.MNEMONIC || process.env.MNEMONIC
    if (seed) {
        pkey = toPkey(seed)
    }
}

  let account
  if (pkey) {
    account = tweb3.wallet.importAccount(pkey)
  } else {
    account = tweb3.wallet.createBankAccount()
  }

  console.log(`Deploying from ${account.address}...`)

  tweb3.onError(console.error)

  // deploy the contract
  const r = await tweb3.deploy(compiledSrc, { from: account.address })
  console.log(`Contract created: ${r.address}`)

  // migrate data
  try {
    const contractAddr = await tweb3.contract('system.alias').methods.resolve(contractAlias).call()
    if (!contractAddr) {
      console.log(`${contractAlias} does not exist, no need to migrate data.`);
    } else {
      console.log('Trying to migrate data from ' + contractAlias);
      const newContract = tweb3.contract(r);
      await newContract.methods.migrateState(contractAlias, true).sendCommit({ from: account.address });
      // await newContract.methods.addAdmins([account.address]).sendCommit({ from: account.address });
      // await newContract.methods.migrateUsers().sendCommit({ from: account.address });
      // await newContract.methods.migrateChoices().sendCommit({ from: account.address });
      console.log('Data migration finished.');
    }
  } catch (e) {
    console.log('Fail to migrate data: ', e.message);
    console.log('Skip adding users and register alias.')
    process.exit(1)
  }

  // update .env
  // config.REACT_APP_CONTRACT = r.address
  // fs.writeFileSync(envPath, envfile.stringifySync(config)) 
  // console.log(`New contract address was updated to ${envPath}.`)

  // old contract is alias, re-register alias
  try {
    console.log(`Regiser new contract to alias ${contractAlias}`)
    await tweb3.contract('system.alias').methods.register(contractAlias.split('.')[1], r.address, true).sendCommit({ from: account.address });
    console.log('Alias registered.')
  } catch (e) {
    console.log('Fail to register alias: ', e.message)
    console.log(`You need to register ${r.address} to ${contractAlias} manually.`)
  }

  process.exit(0)

})();
