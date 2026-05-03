import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();
import { connectDatabase } from "./database/db";
import config from "./config/index";
import { server } from "./app";

const PORT = config.port ? Number(config.port) : 8000;

connectDatabase()
  .then(() => {
    server.listen(config.port, () => {
      console.log(chalk.green(`Server running at http://localhost:${PORT}`));
      
      // Start self-ping cron job to prevent Render from sleeping
      const pingUrl = config.backendUrl 
        ? `${config.backendUrl}/api/v1/ping`
        : `http://localhost:${PORT}/api/v1/ping`;

      setInterval(async () => {
        try {
          const res = await fetch(pingUrl);
          if (res.ok) console.log(chalk.blue(`[CRON] Self-ping successful: ${new Date().toISOString()}`));
        } catch (err) {
          console.error(chalk.yellow(`[CRON] Self-ping failed`), err);
        }
      }, 8 * 60 * 1000); // 8 minutes
    });
  })
  .catch((error: unknown) => {
    console.error(chalk.red("Database connection failed!!"), error);
    process.exit(1);
  });
