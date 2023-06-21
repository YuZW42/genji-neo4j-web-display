const neo4j = require('neo4j-driver');
require('dotenv').config();

const DB_URI = process.env.REACT_APP_NEO4J_URI;
const DB_USER = process.env.REACT_APP_NEO4J_USERNAME;
const DB_PASSWORD = process.env.REACT_APP_NEO4J_PASSWORD;

let driver;

const connectDriver = async () => {
    try {
        driver = neo4j.driver(DB_URI, neo4j.auth.basic(DB_USER, DB_PASSWORD));
        await driver.verifyConnectivity();
        console.log('Connected to Neo4j DB');
    } catch (err) {
        console.log('Error connecting to Neo4j DB', err);
    }
};

const closeDriver = async () => {
    if (driver) {
        await driver.close();
        console.log('Closed Neo4j DB connection');
    }
};

module.exports = { connectDriver, closeDriver, driver };