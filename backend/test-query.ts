import { getAllProducts } from "./src/db/queries";

async function main() {
    try {
        const products = await getAllProducts();
        console.log("Success:", products);
    } catch (e) {
        console.error("Query Error:", e);
    }
    process.exit(0);
}
main();
