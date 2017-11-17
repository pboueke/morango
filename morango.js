#!/usr/bin/env node
require('dotenv').config();
var program = require('commander');
var arangojs = require('arangojs');
var mongo_client = require('mongodb').MongoClient;

process.on('unhandledRejection', (err, p) => { 
    console.error(p)
})

console.log("=> Parsing program options...");

program
    .usage('[options]')
    .option('-k, --key <key>', 'The attribute at the mongo collection to be used as the _key at the arango collection. '
            +'If none is given, the Arango will give its default value.')
    .option('-m, --mongo_collection <collection>', 'The name of the mongo collection that will be copied.')
    .option('-a, --arango_collection <collection>', 'The name of the arango collection that will be filled.')
    .option('-l, --log_frequency <n>', 'Frequency in which a status update will be displayed on the console, '
            + 'based on the number of documents read from mongo. Default is 1.', parseInt)    
    .parse(process.argv);

// defaut options
const log_frequency = program.log_frequency || 1;
const mongo_col = program.mongo_collection || function() {throw "A MongoDB collection name must be passed.";}();
const arango_col = program.arango_collection || function() {throw "A ArangoDB collection name must be passed.";}();

console.log("=> Parsing environment variables...")

const a_host = process.env.ARANGO_HOST;
const a_port = process.env.ARANGO_PORT;
const a_database = process.env.ARANGO_DATABASE;
const a_username = process.env.ARANGO_USER;
const a_password = process.env.ARANGO_PASSWORD;
const a_url = `http://${a_username}:${a_password}@${a_host}:${a_port}`;
const m_host = process.env.MONGO_HOST;
const m_port = process.env.MONGO_PORT;
const m_username = process.env.MONGO_USER;
const m_password = process.env.MONGO_PASSWORD;
const m_url = `mongodb://${m_username}:${m_password}@${m_host}:${m_port}/${process.env.MONGO_DATABASE}?authSource=admin`;

console.log(`| ArangoDb URL: ${a_url}`);
console.log(`| MongoDb Companies URL: ${m_url}`);

console.log("| Connecting to Mongo...");

mongo_client.connect(m_url, function(err, m_db) {
    moveAllToArango(m_db, function() {
        m_db.close();
    });
});

var moveAllToArango = function (m_db, callback) {

    console.log("| Connecting to Arango...");

    var a_db = new arangojs.Database({
            url: a_url,
            databaseName: a_database
        }),
        m_col = m_db.collection(mongo_col),
        a_col = a_db.collection(arango_col),
        sc = 0,
        rc = 0,
        fc = 0;

    console.log("| Starting to copy documents...");

    m_col.find({}, function (err, cursor) {

        cursor.next(processItem);

        async function processItem(err, item) {

            if (item === null) {
                console.log(`All Done. Documents [Saved/Found/Read][${sc}/${fc}/${rc}]`);
                return;
            }
            
            try {

                rc += 1;          
                if (rc%log_frequency === 0) console.log(`=> Documents [Saved/Found/Read][${sc}/${fc}/${rc}]`);            
                await a_col.document(item.DocNumber);
                fc += 1;
            
            } catch (ex) {

                let buf = Object.assign({}, item)
                delete buf._id;                
                if (program.key) buf._key = item[program.key];
                await a_col.save(buf);
                sc += 1;
            }

            Promise.resolve().then(() => cursor.next(processItem));
        }
    });
};
