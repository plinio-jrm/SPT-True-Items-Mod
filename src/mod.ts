import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { DependencyContainer } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";

import { TrueStack } from "./trueStack";

class TrueItems implements IPreAkiLoadMod, IPostDBLoadMod {
    private trueStack: TrueStack;
    private logger: ILogger;

    private readonly PRELOAD_MSG: string = "Loading in memory";
    private readonly POSTLOAD_MSG: string = "Everything is ready! Make sure this mod loads after other mods that change items!";

    public preAkiLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.Log(this.PRELOAD_MSG);

        container.register<TrueStack>("TrueStack", TrueStack);
    }

    public postDBLoad(container: DependencyContainer): void {
        this.trueStack = container.resolve<TrueStack>("TrueStack");
        this.Log(this.POSTLOAD_MSG);
    }

    private Log(message: string): void {
        this.logger.logWithColor("[True Items] " + message, "cyan");
    }
}

module.exports = { mod: new TrueItems() }
