#!/usr/bin/env node
require('dotenv').config();
var program = require('commander');
var arangojs = require('arangojs');
var mongo_client = require('mongodb').MongoClient;

program
    .usage('[options]')
    .option('-k, --key [key]', 'The attribute at the mongo collection to be used as the _key at the arango collection. '
                              +'If none is given, the Arango will give its default value.')
    .option('-m, --mongo-collection [collection]', 'The name of the mongo collection that will be copied.')
    .option('-a, --arango-collection [collection]', 'The name of the arango collection that will be filled.')
    .parse(process.argv);

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

process.on('unhandledRejection', (err, p) => { 
    console.error(p)
})

console.log("| Connecting to mongo...");
mongo_client.connect(m_url, function(err, m_db) {
    moveAllToArango(m_db, function() {
        m_dn.close();
    });
});

var moveAllToArango = function (m_db, callback) {

    console.log("| Connecting to arango...");
    var a_db = new arangojs.Database({
        url: a_url,
        databaseName: a_database
    });
    var m_col = m_db.collection(process.env.MONGO_COLLECTION);
    var a_col = a_db.collection( process.env.ARANGO_COLLECTION);
    var sc = 0;
    var rc = 0;
    var fc = 0;

    console.log("| Starting to copy documents...");
    m_col.find({}, function (err, cursor) {
        cursor.next(processItem);

        async function processItem(err, item) {
            if (item === null) return;
            try {
                rc += 1;            
                console.log(`=> Documents [Saved/Found/Read][${sc}/${fc}/:${rc}]`);            
                await a_col.document(item.DocNumber);
                fc += 1;
            } catch (ex) {
                let c = Object.assign({}, item)
                delete c._id;
                c._key = item.DocNumber;
                await a_col.save(c);
                sc += 1;
            }
            Promise.resolve().then(() => cursor.next(processItem));
        }
    });
};
