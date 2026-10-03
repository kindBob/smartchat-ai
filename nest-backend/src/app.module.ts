import { Module } from "@nestjs/common";
import { ChatModule } from "./chat/chat.module.js";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { CustomThrottlerGuard } from "./common/guards/custom-throttler.guard.js";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60_000,
                limit: 5,
            },
        ]),
        ChatModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: CustomThrottlerGuard,
        },
    ],
})
export class AppModule {}
