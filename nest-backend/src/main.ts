import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    const port = Number(configService.getOrThrow<number>("PORT"));

    app.enableCors({
        origin: configService.getOrThrow<string>("FRONTEND_URL"),
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        })
    );

    await app.listen(port);
}
await bootstrap();
