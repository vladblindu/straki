const {putEnvVault, getEnvVault, undeclaredEnvKey, putEnv, getConfig, putConfig} = require('./utils')

/**
 * @name add
 * @description adds an entry to the env-vault
 * @param {string} key
 * @param {string} val
 */
const add = (key, val) => {
    if (!key || !val) throw new Error('No proper key/value pair provided. Exiting.')
    const env = getEnvVault()
    if (env[key]) {
        console.log(`A ${key}/${env[key]} env key/value pair already exists and it's.
            Use update flag (-u) to update the existing value`)
    }
    env[key] = val
    putEnvVault(env)
}

/**
 * @name list
 * @description list an entry if key is present or all
 * entries of the env-vault otherwise
 * @param {string?} [key]
 */
const list = key => {
    const env = getEnvVault()
    if (key && env[key]) {
        console.log(`Content of env-vault: \n${key} = ${env[key]}`)
        return
    }
    if (key && !env[key]) throw new Error(`No env-vault entries found for key ${key}`)
    const lst = Object.keys(env).reduce((acc, k, i) => {
        return `${acc}\n${i + 1}. ${k} = ${env[k]}`
    }, 'Content of env-vault :')
    console.log(lst)
}

/**
 * @name remove
 * @description removes an entry to the env-vault
 * @param {string} key
 */
const
    remove = (key) => {
        if (!key) throw new Error('No key provided. Exiting.')
        const env = getEnvVault()
        if (!env[key]) throw new Error(`No ${key} present in env-vault. Exiting.`)
        delete env[key]
        putEnvVault(env)
    }

/**
 * @name update
 * @description updates an entry to the env-vault
 * @param {string} key
 * @param {string} val
 */
const update = (key, val) => {
    if (!key || !val) {
        console.error('No proper key/value pair provided. Exiting.')
        return 0
    }
    const env = getEnvVault()
    if (!env[key]) {
        console.log(`No ${key} present in env-vault. Exiting.`)
        process.exit(0)
    }
    env[key] = val
    putEnvVault(env)
}

/**
 * @name createEnv
 * @description creates a .env file out of the keys specified
 * in the staki.config.js file from the values in the env-vault.json file
 */
const createEnv = async (root = process.cwd()) => {
    const pkg = getConfig(root)
    const envVault = getEnvVault()
    const env = await Promise.all(
        pkg['staki'].env.map(
            async k => {
                if (!envVault[k]) {
                    const queryData = await undeclaredEnvKey(k)
                    if (queryData['save']) add(k, queryData['value'])
                    return `${k}=${queryData['value']}`
                } else
                    return Promise.resolve(`${k}=${envVault[k]}`)
            }
        ))
    putEnv(
        `# Environment variables\n #for ${pkg.name}\n`.concat(env.join('\n'))
    )
}

const updateConfig = key => {
    const pkg = getConfig()
    if(pkg['staki'].env[key])
        pkg['staki'].env.push(key)
    putConfig(pkg)
}

module.exports = {
    add,
    list,
    remove,
    update,
    createEnv,
    updateConfig
}