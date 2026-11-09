import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";

// Daily rather than more often, because each run wakes the Neon compute if it's suspended
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class UnverifiedUsersCleanupService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(UnverifiedUsersCleanupService.name);
    private timer?: NodeJS.Timeout;

    constructor(private readonly prisma: PrismaService) {}

    onApplicationBootstrap() {
        void this.runCleanup();

        this.timer = setInterval(() => void this.runCleanup(), CLEANUP_INTERVAL_MS);
        this.timer.unref();
    }

    onApplicationShutdown() {
        clearInterval(this.timer);
    }

    // An abandoned sign-up keeps its email reserved and blocks the owner from signing in with Google.
    // Chat.userId has no foreign key to the user, so accounts that own chats must be skipped explicitly.
    async runCleanup(): Promise<void> {
        try {
            const deleted = await this.prisma.$executeRaw`
                DELETE FROM neon_auth."user" u
                WHERE u."emailVerified" = false
                    AND u."createdAt" < now() - interval '24 hours'
                    AND NOT EXISTS (SELECT 1 FROM public."Chat" c WHERE c."userId" = u.id::text)
                    AND NOT EXISTS (
                        SELECT 1 FROM neon_auth.account a
                        WHERE a."userId" = u.id AND a."providerId" <> 'credential'
                    )
                    AND NOT EXISTS (SELECT 1 FROM neon_auth.session s WHERE s."userId" = u.id)
                    AND NOT EXISTS (SELECT 1 FROM neon_auth.member m WHERE m."userId" = u.id)
            `;

            if (deleted > 0) {
                this.logger.log(`Deleted ${deleted} abandoned unverified account(s)`);
            }
        } catch (error) {
            this.logger.error("Could not clean up unverified accounts", error);
        }
    }
}
