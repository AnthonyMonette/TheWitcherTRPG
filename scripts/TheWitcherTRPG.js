import WitcherItemSheet from "../module/sheets/WitcherItemSheet.js";

Hooks.once("init", function () {
    console.log("TheWItcherTRPG | init system");
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("witcher", WitcherItemSheet, {makeDefault: true});
});
