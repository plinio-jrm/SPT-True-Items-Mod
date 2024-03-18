import { inject, injectable } from "tsyringe";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";

@injectable()
export class TrueStack {
    private config: any = require("../config/stackConfig.json");
    private items: any;
    private mult: number;

    private readonly FEATURE_NAME: string = "[True Stack]";
    private readonly MSG_CHANGING: string = "Changing";
    private readonly MSG_DONE: string = "Done";

    constructor(
        @inject("DatabaseServer") private db: DatabaseServer,
        @inject("WinstonLogger") private logger: ILogger
    ) {
        if (this.config.Active === false)
            return;
        
        this.items = db.getTables().templates.items;
        this.mult = Math.round(this.config.StackMult);

        this.Log(this.MSG_CHANGING);
        this.Clothing();
        this.Food();
        this.Medicals();
        this.Barter();
        this.PartsNMods();
        this.Log(this.MSG_DONE);
    }

    private Clothing(): void {
        const data: any = this.config.Clothing;
        this.ChangeByList(data);
    }

    private Food(): void {
        const data: any = this.config.Food;
        this.ChangeByList(data);
    }

    private Medicals(): void {
        const data: any = this.config.Medicals;
        this.ChangeByList(data, true);
    }

    private Barter(): void {
        const data: any = this.config.Barter;
        this.ChangeByList(data);
    }

    private PartsNMods(): void {
        this.Barrel();
        this.ChargingHandle();
        this.Foregrip();
        this.Muzzle();
        this.Auxiliary();
        this.TacticalDevice();
        this.GasBlock();
        this.Mount();
        this.Sight();
    }

    private ChangeByList(data: any, isMedical: boolean = false): void {
        if (this.IsDataEnable(data) === false)
            return;
        
        for (let infoIdx in data.List) {
            const info: any = data.List[infoIdx];

            for (let itemIdx in this.items) {
                const item: any = this.items[itemIdx];
    
                if (item._props === undefined)
                    continue;
                if (item._id != info._id)
                    continue;
                if (item._props.StackMaxSize === undefined)
                    continue;
                    
                if (isMedical === true) {
                    if (item._props.MaxHpResource === undefined)
                        continue;
                    if (item._props.MaxHpResource > 0)
                        continue;
                }

                item._props.StackMaxSize = info._props.StackMaxSize * this.mult;
                item._props.StackMinRandom = 1;
                break;
            }
        }
    }

    private Barrel(): void {
        const data: any = this.config.PartsNMods.Barrel;
        this.ChangeByParent(data);
    }

    private ChargingHandle(): void {
        const data: any = this.config.PartsNMods.ChargingHandle;
        this.ChangeByParent(data);
    }

    private Foregrip(): void {
        const data: any = this.config.PartsNMods.Foregrip;
        this.ChangeByParent(data);
    }

    private Muzzle(): void {
        const data: any = this.config.PartsNMods.Muzzle;
        this.ChangeByParent(data);
    }

    private Auxiliary(): void {
        const data: any = this.config.PartsNMods.Auxiliary;
        this.ChangeByParent(data);
    }

    private TacticalDevice(): void {
        const data: any = this.config.PartsNMods.TacticalDevice;
        this.ChangeByParent(data);
    }

    private GasBlock(): void {
        const data: any = this.config.PartsNMods.GasBlock;
        this.ChangeByParent(data);
    }

    private Mount(): void {
        const data: any = this.config.PartsNMods.Mount;
        this.ChangeByParent(data);
    }

    private Sight(): void {
        const data: any = this.config.PartsNMods.Sight;
        this.ChangeByParent(data);
    }

    private ChangeByParent(data: any) {
        if (this.IsDataEnable(data) === false)
            return;
        if (data._parent === undefined)
            return;
        if (data._parent.List === undefined)
            return;
        
        const stack: number = data._parent.StackMaxSize;
        for (let infoIdx in data._parent.List) {
            const info: any = data._parent.List[infoIdx];

            for (let itemIdx in this.items) {
                const item: any = this.items[itemIdx];
    
                if (item._props === undefined)
                    continue;
                if (item._parent != info._id)
                    continue;
                if (item._props.StackMaxSize === undefined)
                    continue;

                item._props.StackMaxSize = stack * this.mult;
                item._props.StackMinRandom = 1;
                break;
            }
        }
    }

    private IsDataEnable(data: any): boolean {
        if (data === undefined)
            return false;
        if (data.Enable === false)
            return false;

        return true;
    }

    private Log(message: string) {
        this.logger.logWithColor("[True Items]" + this.FEATURE_NAME + " " + message, "cyan");
    }
}