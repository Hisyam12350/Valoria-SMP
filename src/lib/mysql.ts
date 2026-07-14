import mysql from "mysql2/promise";

let connection: mysql.Pool | null = null;

export async function getMysqlConnection() {
  try {
    if (!connection) {
      connection = await mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log("MySQL connected");
    }

    return connection;
  } catch (error) {
    console.error("MySQL connection error:", error);
    throw new Error("Gagal konek ke MySQL");
  }
}