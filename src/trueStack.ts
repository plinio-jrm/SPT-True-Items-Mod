import { inject, injectable } from "tsyringe";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ItemParentSetting, ItemPropSettings, ParentSetting, Settings } from "./types";

@injectable()
export class TrueStack {
    private barterConfig: Settings = require("../config/barter.json");
    private clothingConfig: Settings = require("../config/clothing.json");
    private medicalConfig: Settings = require("../config/medicals.json");
    private partsnmodsConfig: ParentSetting = require("../config/partsnmods.json");
    private provisionsConfig: Settings = require("../config/provisions.json");

    private items: any;

    private readonly FEATURE_NAME: string = "[True Stack]";
    private readonly MSG_CHANGING: string = "Changing";
    private readonly MSG_DONE: string = "Done";

    constructor(
        @inject("DatabaseServer") private db: DatabaseServer,
        @inject("WinstonLogger") private logger: ILogger
    ) {
        this.items = db.getTables().templates.items;

        this.Log(this.MSG_CHANGING);
        this.ChangeSettings(this.clothingConfig);
        this.ChangeSettings(this.provisionsConfig);
        this.ChangeSettings(this.medicalConfig, true);
        this.ChangeSettings(this.barterConfig);
        this.ChangeParentSettings(this.partsnmodsConfig);
        this.Log(this.MSG_DONE);
    }

    private ChangeSettings(data: Settings, isMedical: boolean = false): void {
        if (!this.IsActive(data)) 
            return;

        for (let itemInfoIndex in data.List) {
            const itemInfo: ItemPropSettings = data.List[itemInfoIndex];
            this.ForEachItem(itemInfo._id, false, isMedical, itemInfo._props.StackMaxSize, data.StackMult);
        }
    }

    private ChangeParentSettings(data: ParentSetting): void {
        if (!this.IsActive(data))
            return;

        for (let ParentInfoIndex in data.ParentList) {
            const parentInfo: ItemParentSetting = data.ParentList[ParentInfoIndex];
            this.ForEachItem(parentInfo._id, true, false, parentInfo.StackMaxSize, data.StackMult);
        }
    }

    private ForEachItem(id: string, isParent: boolean = false, isMedical: boolean = false, StackMaxSize: number, StackMult: number): void {
        for (let itemDBIndex in this.items) {
            const item: any = this.items[itemDBIndex];

            // validations
            if (item._props === undefined)
                continue;
            if (isParent === true && item._parent != id) {
                continue;
            } else if (item._id != id)
                continue;
            if (item._props.StackMaxSize === undefined)
                continue;
            if (isMedical === true) {
                if (item._props.MaxHpResource === undefined)
                    continue;
                if (item._props.MaxHpResource > 0)
                    continue;
            }

            item._props.StackMaxSize = StackMaxSize * StackMult;
            item._props.StackMinRandom = 1;
            break;
        }
    }

    private IsActive(data: Settings) {
        if (data === undefined) 
            return false;
        if (data.Active === false) 
            return false;

        return true;
    }

    private Log(message: string) {
        this.logger.logWithColor("[True Items]" + this.FEATURE_NAME + " " + message, "cyan");
    }
}