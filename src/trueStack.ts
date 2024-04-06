/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import { inject, injectable } from "tsyringe";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ItemParentSetting, ItemPropSettings, ParentSetting, Settings } from "./types";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

@injectable()
export class TrueStack {
    private barterConfig: Settings = require("../config/barter.json");
    private clothingConfig: Settings = require("../config/clothing.json");
    private medicalConfig: Settings = require("../config/medicals.json");
    private partsnmodsConfig: ParentSetting = require("../config/partsnmods.json");
    private provisionsConfig: Settings = require("../config/provisions.json");
    private keycardsConfig: ParentSetting = require("../config/keycards.json");
    private othersConfig: Settings = require("../config/others.json");

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
        this.changeSettings(this.clothingConfig);
        this.changeSettings(this.provisionsConfig);
        this.changeSettings(this.medicalConfig, true);
        this.changeSettings(this.barterConfig);
        this.changeParentSettings(this.partsnmodsConfig);
        this.changeParentSettings(this.keycardsConfig);
        this.changeSettings(this.othersConfig);
        this.Log(this.MSG_DONE);
    }

    private changeSettings(data: Settings, isMedical: boolean = false): void {
        if (!this.isActive(data)) 
            return;

        for (const itemInfoIndex in data.List) {
            const itemInfo: ItemPropSettings = data.List[itemInfoIndex];
            this.forEachItem(itemInfo._id, false, isMedical, itemInfo._props.StackMaxSize, data.StackMult);
        }
    }

    private changeParentSettings(data: ParentSetting): void {
        if (!this.isActive(data))
            return;

        for (const ParentInfoIndex in data.ParentList) {
            const parentInfo: ItemParentSetting = data.ParentList[ParentInfoIndex];
            this.forEachItem(parentInfo._id, true, false, parentInfo.StackMaxSize, data.StackMult);
        }
    }

    private forEachItem(id: string, isParent: boolean = false, isMedical: boolean = false, stackMaxSize: number, stackMult: number): void {
        for (const itemDBIndex in this.items) {
            const item: any = this.items[itemDBIndex];

            // validations to prevent errors
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

            item._props.StackMaxSize = stackMaxSize * stackMult;
            item._props.StackMinRandom = 1;
            break;
        }
    }

    private isActive(data: Settings) {
        if (data === undefined) 
            return false;
        if (data.Active === false) 
            return false;

        return true;
    }

    private Log(message: string) {
        this.logger.logWithColor("[True Items]" + this.FEATURE_NAME + " " + message, LogTextColor.CYAN);
    }
}