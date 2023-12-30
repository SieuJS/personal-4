const { constants } = require("node:buffer");
const fs = require("node:fs");
const { stringify } = require("node:querystring");
const crypto = require("crypto");
const util = require('util')

const scrypt = util.promisify(crypto.scrypt);
const Repository = require('./repository');

class UserRepository extends Repository {
    async create(adder){
        if(!adder.id) {
            adder.id = this.randId();
        }
        let records;
        let hashedBuf;
        if(adder.password)
        {
        const salt = crypto.randomBytes(8).toString('hex');
        hashedBuf = await scrypt(adder.password, salt,64);
        }
        records = await this.readFile();
        const record = {
            ...adder,
            ... (hashedBuf ? {password: `${hashedBuf.toString('hex')}.${salt}`} : {})
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

    async login(email, password) {
    const user = await this.getOneBy({ email });
    if (user) {
        const auth = await this.comparePassword(user.password, password);
        if (auth) {
        return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
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