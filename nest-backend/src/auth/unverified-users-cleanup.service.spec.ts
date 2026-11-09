import { Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import { UnverifiedUsersCleanupService } from "./unverified-users-cleanup.service.js";

describe("UnverifiedUsersCleanupService", () => {
    const executeRaw = vi.fn();
    let service: UnverifiedUsersCleanupService;
    let logError: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.resetAllMocks();
        logError = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
        vi.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);

        service = new UnverifiedUsersCleanupService({ $executeRaw: executeRaw } as unknown as PrismaService);
    });

    it("only targets old unverified password accounts with nothing attached", async () => {
        executeRaw.mockResolvedValue(0);

        await service.runCleanup();

        const sql = (executeRaw.mock.calls[0][0] as string[]).join("");

        expect(sql).toContain(`u."emailVerified" = false`);
        expect(sql).toContain(`interval '24 hours'`);
        expect(sql).toContain(`public."Chat"`);
        expect(sql).toContain(`"providerId" <> 'credential'`);
        expect(sql).toContain("neon_auth.session");
        expect(sql).toContain("neon_auth.member");
    });

    it("logs a failure instead of throwing, so it can't take down the API", async () => {
        executeRaw.mockRejectedValue(new Error("database unavailable"));

        await expect(service.runCleanup()).resolves.toBeUndefined();
        expect(logError).toHaveBeenCalled();
    });
});
