import {witcher} from "../module/config.js";
import WitcherItemSheet from "../module/sheets/WitcherItemSheet.js";
import WitcherActorSheet from "../module/sheets/WitcherActorSheet.js";


async function preloadHandlebarsTemplates(){
    const templatePath =[
        "systems/TheWitcherTRPG/templates/partials/character-header.html",
        "systems/TheWitcherTRPG/templates/partials/tab-skills.html",
        "systems/TheWitcherTRPG/templates/partials/tab-profession.html",
        "systems/TheWitcherTRPG/templates/partials/tab-background.html",
        "systems/TheWitcherTRPG/templates/partials/tab-inventory.html",
        "systems/TheWitcherTRPG/templates/partials/tab-magic.html",
        "systems/TheWitcherTRPG/templates/partials/substances.html",
    ];
    return loadTemplates(templatePath); 
}


Hooks.once("init", function () {
    console.log("TheWItcherTRPG | init system");

    CONFIG.witcher = witcher

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("witcher", WitcherItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("witcher", WitcherActorSheet, {makeDefault: true});

    preloadHandlebarsTemplates();
});
