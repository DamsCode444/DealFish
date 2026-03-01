import {drizzle} from "drizzle-orm/node-postgres"
import { Pool } from "pg";
import { ENV } from "../config/env";
import * as schema  from "./schema";

if(!ENV.DB_URL){
    throw new Error("DATABASE_URL is not defined in the environment variables")
}

// Create a connection pool to the PostgreSQL database using the connection string .
const pool = new Pool({
    connectionString: ENV.DB_URL,
});

pool.on("connect", () => {
    console.log("Connected to the database Successfully!");
});

pool.on("error", (err) => {
    console.error("Database connection error:", err);
});

export const db = drizzle({client:pool, schema})