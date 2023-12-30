const { constants } = require("node:buffer");
const fs = require("node:fs");
const { stringify } = require("node:querystring");
const crypto = require("crypto");
const util = require('util')

const scrypt = util.promisify(crypto.scrypt);
const Repository = require('./repository');

class UserRepository extends Repository {
    async create(adder){
        adder.id = this.randId();

        const salt = crypto.randomBytes(8).toString('hex');
        const hashedBuf = await scrypt(adder.password, salt,64);
        
        const records = await this.readFile();
        const record = {
            ...adder,
            password: `${hashedBuf.toString('hex')}.${salt}`
        };
        records.push(record);
        this.writeFile(records);
        return adder;
    }

    async comparePassword(encrp, raw){
        const [hashed, salt] = encrp.split('.');
        const hashedBuf  = await scrypt(raw, salt, 64);
        return (hashedBuf.toString('hex') === hashed);
    }
}; 

const test = async ()=>{
    const repo = await new UserRepository('user.json');
    
    // await repo.create({email: 'g@g.com', password : 'password'});
    // console.log(await repo.delete('961b93fd'))
    await repo.update("bfab5eae", {password: "HoHO"})
    const ff =  await repo.readFile();
    console.log(ff);
}

module.exports = new UserRepository('users.json');