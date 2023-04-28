import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { redisClient } from "./redisClient.js";

const NODE_ENV = process.env["NODE_ENV"] as string;

const JWT_SECRET = process.env["JWT_SECRET"] as string;

const JWT_ACCESS_EXPIRE = parseInt(
	process.env["JWT_ACCESS_EXPIRE"] as string,
	10
);

const JWT_REFRESH_EXPIRE = parseInt(
	process.env["JWT_REFRESH_EXPIRE"] as string,
	10
);

export async function createAndSetTokens(res: Request, data: Object) {
	const accessToken = jwt.sign(data, JWT_SECRET, {
		expiresIn: JWT_ACCESS_EXPIRE,
	});

	const refreshToken = jwt.sign(data, JWT_SECRET, {
		expiresIn: JWT_REFRESH_EXPIRE,
	});

	await Promise.all([
		redisClient.set(accessToken, refreshToken, { PX: JWT_ACCESS_EXPIRE }),
		redisClient.set(refreshToken, accessToken, { PX: JWT_REFRESH_EXPIRE }),
	]);

	res.cookies("accessToken", accessToken, {
		httpOnly: true,
		path: "/api",
		maxAge: JWT_ACCESS_EXPIRE,
		sameSite: "strict",
	});

	res.cookies("refreshToken", refreshToken, {
		httpOnly: true,
		path: "/api/refresh",
		maxAge: JWT_REFRESH_EXPIRE,
		sameSite: "strict",
	});

	res.cookies("refreshToken", refreshToken, {
		httpOnly: true,
		path: "/api/signout",
		maxAge: JWT_REFRESH_EXPIRE,
		sameSite: "strict",
	});

	return [accessToken, refreshToken];
}

export async function jwtSignout(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { accessToken, refreshToken } = req?.cookies;

		for (const token1 of [accessToken, refreshToken]) {
			if (token1) {
				const token2 = await redisClient.get(token1);

				for (const token of [token1, token2]) {
					if (token && (await redisClient.exists(token))) {
						await redisClient.del(token);
					}
				}
			}
		}
	} catch (error) {
		if (NODE_ENV === "development") {
			console.log(error);
		}
	}

	next();
}
