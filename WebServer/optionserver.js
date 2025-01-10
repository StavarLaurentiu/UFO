const express = require('express');
const cors = require('cors');
const optionsRoutes = require('./routes/options');

const app = express();
const PORT = 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/users', optionsRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});