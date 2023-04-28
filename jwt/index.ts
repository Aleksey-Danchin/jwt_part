import { app } from "./app";
import { redisClient } from "./redisClient";

(async () => {
	await app.listen(80, () => console.log("JWT server started."));

	await redisClient
		.connect()
		.then(() => console.log("Redis client for jwt server started."));
})();
