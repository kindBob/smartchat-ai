import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { AuthenticatedRequest } from "./auth.types.js";
import { createRemoteJWKSet, jwtVerify } from "jose";

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly jwks;
    private readonly issuer: string;

    constructor() {
        const authUrl = process.env.NEON_AUTH_URL;
        const jwksUrl = process.env.NEON_AUTH_JWKS_URL;

        if (!authUrl || !jwksUrl) {
            throw new Error("Neon Auth environment variables are not configured");
        }

        this.jwks = createRemoteJWKSet(new URL(jwksUrl));
        this.issuer = new URL(authUrl).origin;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException("Missing authorization header");
        }

        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {
            throw new UnauthorizedException("Invalid authorization header");
        }

        try {
            const { payload } = await jwtVerify(token, this.jwks, {
                issuer: this.issuer,
            });

            if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
                throw new UnauthorizedException("Invalid token payload");
            }

            request.user = {
                id: payload.sub,
                email: payload.email,
            };

            return true;
        } catch (error) {
            console.error("JWT verification error:", error);

            throw new UnauthorizedException("Invalid or expired token");
        }
    }
}
