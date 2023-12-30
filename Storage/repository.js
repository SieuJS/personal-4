const { constants } = require("node:buffer");
const fs = require("node:fs");
const { stringify } = require("node:querystring");
const crypto = require("crypto");
const util = require('util')

const scrypt = util.promisify(crypto.scrypt);

module.exports = class Repository {
    constructor(fileName) {
        if (!fileName) {
            throw new Error("\nThere must be a directory to create data");
        }
        this.fileName = fileName;
        try {
            fs.accessSync(this.fileName, constants.F_OK);
            console.log('System: File legit')
        } catch (err) {
            // File does not exist, create a new file
            fs.appendFileSync(this.fileName, '[]');
            console.log("Created a new file");
        }
    }
    
    async create(adder){
        adder.id = this.randId();

        const records = await this.readFile();
        records.push(adder);
        await this.writeFile(records);
        return adder;
    }

    // File I/O : 
    async readFile(){
        const contents = await fs.promises.readFile(this.fileName,{encoding: 'utf-8'});     
        // parse the contents
        const data = JSON.parse(contents);
        return data;
    }

    async writeFile(record){
        const jsonContent = JSON.stringify(record, null, 2);
        const formattedContent = jsonContent.replace(/\n/g, '\r\n');
        await fs.promises.writeFile(this.fileName, formattedContent);
    }

    randId(){
        return crypto.randomBytes(4).toString("hex");
    }

    // Maniputlate on the data: 
    async getOne(id){
        const records = await this.readFile();
        return records.find(obj => obj.id === id);
    };

    async delete(id){
        const records = await this.readFile();
        await this.writeFile(records.filter(record => record.id!==id));
    }

    async update (id, attrs){
        const records = await this.readFile();
        const updateRecord = records.find(record => record.id === id);
        if(!updateRecord){
            throw new Error("Id not found");
        }
        Object.assign(updateRecord,attrs);
        await this.writeFile(records);
    }

    async getOneBy(filters){
        const records = await this.readFile();
        for(let record of records){
            let found = true;
            for(let key in filters){
                if(record[key] !== filters[key]){
                    found = false
                }
            }
            if(found) return record;
        }
        return undefined;
    }
}