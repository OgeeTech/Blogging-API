

require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

console.log("Starting server...");

connectDB()
    .then(() => {
        console.log(" DB Connected, now starting server...");
        app.listen(PORT, () => {
            console.log(` Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect DB:", err);
        process.exit(1);
    });
