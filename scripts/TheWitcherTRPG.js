import {witcher} from "../module/config.js";
import WitcherItemSheet from "../module/sheets/WitcherItemSheet.js";
import WitcherActorSheet from "../module/sheets/WitcherActorSheet.js";
import WitcherItem from "../module/witcherItem.js";
import WitcherActor from "../module/witcherActor.js";
import * as Chat from "../module/chat.js";
import { registerSettings } from "../module/settings.js";


async function preloadHandlebarsTemplates(){
    const templatePath =[
        "systems/TheWitcherTRPG/templates/sheets/actor/character-sheet.html",
        "systems/TheWitcherTRPG/templates/sheets/actor/monster-sheet.html",
        "systems/TheWitcherTRPG/templates/sheets/actor/loot-sheet.html",
        "systems/TheWitcherTRPG/templates/partials/character-header.html",
        "systems/TheWitcherTRPG/templates/partials/tab-skills.html",
        "systems/TheWitcherTRPG/templates/partials/tab-profession.html",
        "systems/TheWitcherTRPG/templates/partials/tab-background.html",
        "systems/TheWitcherTRPG/templates/partials/tab-inventory.html",
        "systems/TheWitcherTRPG/templates/partials/tab-magic.html",
        "systems/TheWitcherTRPG/templates/partials/crit-wounds-table.html",
        "systems/TheWitcherTRPG/templates/partials/substances.html",
        "systems/TheWitcherTRPG/templates/partials/monster-skill-tab.html",
        "systems/TheWitcherTRPG/templates/partials/monster-inventory-tab.html",
        "systems/TheWitcherTRPG/templates/partials/monster-details-tab.html",
        "systems/TheWitcherTRPG/templates/partials/monster-spell-tab.html"
    ];
    return loadTemplates(templatePath); 
}


Hooks.once("init", function () {
    console.log("TheWItcherTRPG | init system");

    CONFIG.witcher = witcher
    CONFIG.Item.entityClass = WitcherItem;
    CONFIG.Actor.entityClass = WitcherActor;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("witcher", WitcherItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("witcher", WitcherActorSheet, {makeDefault: true});

    preloadHandlebarsTemplates();
    registerSettings();
});

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));


/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */


Hooks.once("ready", async function() {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on("hotbarDrop", (bar, data, slot) => createBoilerplateMacro(data, slot));
    
    if (game.settings.get("TheWitcherTRPG", "useWitcherFont")) {
        let els = document.getElementsByClassName("game")
        Array.prototype.forEach.call(els, function(el) {
            if (el) {el.classList.add("witcher-style")}
        });
        let chat = document.getElementById("chat-log")
        if (chat) {chat.classList.add("witcher-style")}
    }
  });

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createBoilerplateMacro(data, slot) { 
    if (data.type == 'Actor') {
        const actor = game.actors.get(data.id);
        if (!actor) {
            return;
        }
        const command = `game.actors.get('${data.id}')?.sheet.render(true)`;
        let macro =
            game.macros.entities.find(macro => macro.name === actor.name && macro.command === command);
    
        if (!macro) {
            macro = await Macro.create({
                name: actor.name,
                type: 'script',
                img: actor.data.img,
                command: command
            }, {renderSheet: false});
        }
        game.user.assignHotbarMacro(macro, slot);
        return false;
    }
    else if (!("item" in data)) {
        return ui.notifications.warn("You can only create macro buttons for owned Items");
    }
    else if(data.item.type == 'weapon'){
        const item = data.item;
        let foundActor = null
        game.actors.forEach(actor => {
            actor.items.forEach(item => {
                if(data.item._id == item._id) {
                    foundActor = actor
                }
            });
        });
        if (!foundActor) {
            return ui.notifications.warn("You can only create macro buttons with the original character");
        }
        const command = 
`let actor = game.actors.get('${foundActor._id}');
actor.rollItem("${item._id}")`;
        let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
        if (!macro) {
            macro = await Macro.create({
            name: item.name,
            type: "script",
            img: item.img,
            command: command,
            flags: { "boilerplate.itemMacro": true }
            });
        }
        game.user.assignHotbarMacro(macro, slot);
        return false;
    }
    else if(data.item.type == 'spell'){
        const item = data.item;
        let foundActor = null
        game.actors.forEach(actor => {
            actor.items.forEach(item => {
                if(data.item._id == item._id) {
                    foundActor = actor
                }
            });
        });
        if (!foundActor) {
            return ui.notifications.warn("You can only create macro buttons with the original character");
        }
        const command = 
`let actor = game.actors.get('${foundActor._id}');
actor.rollSpell("${item._id}")`;
        let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
        if (!macro) {
            macro = await Macro.create({
            name: item.name,
            type: "script",
            img: item.img,
            command: command,
            flags: { "boilerplate.itemMacro": true }
            });
        }
        game.user.assignHotbarMacro(macro, slot);
        return false;
    }
}