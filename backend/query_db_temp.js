const db = require('./config/database');

async function main() {
    try {
        console.log("--- Querying thuoc_tinh_khau_vi ---");
        const [flavors] = await db.query("SELECT * FROM thuoc_tinh_khau_vi");
        console.log(flavors);

        console.log("\n--- Querying preference_tags ---");
        const [tags] = await db.query("SELECT * FROM preference_tags");
        console.log(tags);
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        process.exit(0);
    }
}
main();
