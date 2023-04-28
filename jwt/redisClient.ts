import { createClient } from "redis";

export const redisClient = createClient({ url: "redis://jwt_db:6379" });

redisClient.on("error", (err) => console.log("Redis Client Error", err));
