const express = require('express');
const cors = require('cors');

// Neo4j driver connection
const { connectDriver } = require('./neo4j_db');

// Routes
// const poemPageRouter = require('./routes/poemPage.js');

// App and port
const app = express();
const port = process.env.PORT || 8000;

// Routes pathways
// const poemPagePath = '/poemPage';

// Connect to Neo4j
connectDriver();

// Middleware
app.use(cors());

// Hello World route
app.get('/', (req, res) => {
    res.send("<h1>Hello World!</h1>");
});

// Routes
// app.use(poemPagePath, poemPageRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});