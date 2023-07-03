import { witcher } from "../module/config.js";
import WitcherItemSheet from "../module/sheets/WitcherItemSheet.js";
import WitcherActorSheet from "../module/sheets/WitcherActorSheet.js";
import WitcherItem from "../module/witcherItem.js";
import WitcherActor from "../module/witcherActor.js";
import * as Chat from "../module/chat.js";
import { registerSettings } from "../module/settings.js";


async function preloadHandlebarsTemplates() {
    const templatePath = [
        "systems/TheWitcherTRPG/templates/sheets/actor/character-sheet.html",
        "systems/TheWitcherTRPG/templates/sheets/actor/monster-sheet.html",
        "systems/TheWitcherTRPG/templates/sheets/actor/loot-sheet.html",
        "systems/TheWitcherTRPG/templates/partials/character-header.html",
        "systems/TheWitcherTRPG/templates/partials/tab-skills.html",
        "systems/TheWitcherTRPG/templates/partials/tab-profession.html",
        "systems/TheWitcherTRPG/templates/partials/tab-background.html",
        "systems/TheWitcherTRPG/templates/partials/tab-inventory.html",
        "systems/TheWitcherTRPG/templates/partials/tab-inventory-diagrams.html",
        "systems/TheWitcherTRPG/templates/partials/tab-inventory-valuables.html",
        "systems/TheWitcherTRPG/templates/partials/tab-inventory-mounts.html",
        "systems/TheWitcherTRPG/templates/partials/tab-inventory-runes-glyphs.html",
        "systems/TheWitcherTRPG/templates/partials/tab-magic.html",
        "systems/TheWitcherTRPG/templates/partials/crit-wounds-table.html",
        "systems/TheWitcherTRPG/templates/partials/substances.html",
        "systems/TheWitcherTRPG/templates/partials/monster-skill-tab.html",
        "systems/TheWitcherTRPG/templates/partials/monster-inventory-tab.html",
        "systems/TheWitcherTRPG/templates/partials/monster-details-tab.html",
        "systems/TheWitcherTRPG/templates/partials/monster-spell-tab.html",
        "systems/TheWitcherTRPG/templates/partials/skill-display.html",
        "systems/TheWitcherTRPG/templates/partials/monster-skill-display.html",
        "systems/TheWitcherTRPG/templates/partials/loot-item-display.html",
        "systems/TheWitcherTRPG/templates/partials/item-header.html",
        "systems/TheWitcherTRPG/templates/partials/item-image.html",
        "systems/TheWitcherTRPG/templates/partials/associated-item.html",
        "systems/TheWitcherTRPG/templates/sheets/verbal-combat.html",
        "systems/TheWitcherTRPG/templates/sheets/weapon-attack.html"
    ];
    return loadTemplates(templatePath);
}

Hooks.once("init", function () {
    console.log("TheWitcherTRPG | init system");

    CONFIG.witcher = witcher
    CONFIG.Item.documentClass = WitcherItem;
    CONFIG.Actor.documentClass = WitcherActor;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("witcher", WitcherItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("witcher", WitcherActorSheet, { makeDefault: true });

    preloadHandlebarsTemplates();
    registerSettings();
});

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));


/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */


Hooks.once("ready", async function () {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on("hotbarDrop", (bar, data, slot) => createBoilerplateMacro(data, slot));

    if (game.settings.get("TheWitcherTRPG", "useWitcherFont")) {
        let els = document.getElementsByClassName("game")
        Array.prototype.forEach.call(els, function (el) {
            if (el) { el.classList.add("witcher-style") }
        });
        let chat = document.getElementById("chat-log")
        if (chat) { chat.classList.add("witcher-style") }
    }

    // Override custom effects with HUD effects from the compendium
    if (game.settings.get("TheWitcherTRPG", "loadCustomStatusesFromCompendium")) {
        let result = await WitcherItem.prototype.getGameEffects();
        if (result && result.length > 0) {
            CONFIG.statusEffects = result;
        }
    }
});

Hooks.once("dragRuler.ready", (SpeedProvider) => {
    class FictionalGameSystemSpeedProvider extends SpeedProvider {
        get colors() {
            return [
                { id: "walk", default: 0x00FF00, name: "my-module-id.speeds.walk" },
                { id: "dash", default: 0xFFFF00, name: "my-module-id.speeds.dash" },
                { id: "run", default: 0xFF8000, name: "my-module-id.speeds.run" }
            ]
        }

        getRanges(token) {
            let baseSpeed = token.actor.system.stats.spd.current
            // A character can always walk it's base speed and dash twice it's base speed
            let moveSpeed = baseSpeed % 2 == 0 ? baseSpeed : baseSpeed + 1;
            let runspeed = (baseSpeed * 3) % 2 == 0 ? baseSpeed * 3 : baseSpeed * 3 + 1;
            const ranges = [
                { range: moveSpeed, color: "walk" },
                { range: runspeed, color: "dash" }
            ]
            return ranges
        }
    }

    dragRuler.registerSystem("TheWitcherTRPG", FictionalGameSystemSpeedProvider)
})

Hooks.once("polyglot.init", (LanguageProvider) => {
    class FictionalGameSystemLanguageProvider extends LanguageProvider {
        get originalAlphabets() {
            return {
                "common": "130% Thorass",
                "dwarven": "120% Dethek",
                "elder": "150% Espruar",
            };
        }
        get originalTongues() {
            return {
                "_default": "common",
                "common": "common",
                "dwarven": "dwarven",
                "elder": "elder",
            };
        }

        getUserLanguages(actor) {
            let known_languages = new Set();
            let literate_languages = new Set();
            known_languages.add("common")
            if (actor.system.skills.int.eldersp.isProffession || actor.system.skills.int.eldersp.isPickup || actor.system.skills.int.eldersp.isLearned || actor.system.skills.int.eldersp.value > 0) {
                known_languages.add("elder")
            }
            if (actor.system.skills.int.dwarven.isProffession || actor.system.skills.int.dwarven.isPickup || actor.system.skills.int.dwarven.isLearned || actor.system.skills.int.dwarven.value > 0) {
                known_languages.add("dwarven")
            }
            if (actor.system.skills.int.commonsp.isProffession || actor.system.skills.int.commonsp.isPickup || actor.system.skills.int.commonsp.isLearned || actor.system.skills.int.commonsp.value > 0) {
                known_languages.add("common")
            }
            return [known_languages, literate_languages];
        }
    }
    polyglot.registerSystem("TheWitcherTRPG", FictionalGameSystemLanguageProvider)
})

Hooks.on("getChatLogEntryContext", Chat.addChatMessageContextOptions);

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
                img: actor.system.img,
                command: command
            }, { renderSheet: false });
        }
        game.user.assignHotbarMacro(macro, slot);
        return false;
    }
    else if (!("item" in data)) {
        return ui.notifications.warn("You can only create macro buttons for owned Items");
    }
    else if (data.item.type == 'weapon') {
        const weapon = data.item;
        let foundActor = null
        game.actors.forEach(actor => {
            actor.items.forEach(item => {
                if (weapon._id == item.id) {
                    foundActor = actor
                }
            });
        });
        if (!foundActor) {
            return ui.notifications.warn("You can only create macro buttons with the original character");
        }
        const command =
            `actor = game.actors.get('${foundActor.id}');
actor.rollItem("${weapon._id}")`;
        let macro = game.macros.find(m => (m.name === weapon.name) && (m.command === command));
        if (!macro) {
            macro = await Macro.create({
                name: weapon.name,
                type: "script",
                img: weapon.img,
                command: command,
                flags: { "boilerplate.itemMacro": true }
            });
        }
        game.user.assignHotbarMacro(macro, slot);
        return false;
    }
    else if (data.item.type == 'spell') {
        const spell = data.item;
        let foundActor = null
        game.actors.forEach(actor => {
            actor.items.forEach(item => {
                if (spell._id == item.id) {
                    foundActor = actor
                }
            });
        });
        if (!foundActor) {
            return ui.notifications.warn("You can only create macro buttons with the original character");
        }
        const command =
            `actor = game.actors.get('${foundActor.id}');
actor.rollSpell("${spell._id}")`;
        let macro = game.macros.find(m => (m.name === spell.name) && (m.command === command));
        if (!macro) {
            macro = await Macro.create({
                name: spell.name,
                type: "script",
                img: spell.img,
                command: command,
                flags: { "boilerplate.itemMacro": true }
            });
        }
        game.user.assignHotbarMacro(macro, slot);
        return false;
    }
}

Handlebars.registerHelper("getOwnedComponentCount", function (actor, componentName) {
    if (!actor) {
        console.warn("'actor' parameter passed into getOwnedComponentCount is undefined. That might be a problem with one of the selected actors diagrams.");
        return 0;
    }
    let ownedComponent = actor.findNeededComponent(componentName);
    return ownedComponent.sum("quantity");
});

Handlebars.registerHelper("getSetting", function (setting) {
  return game.settings.get("TheWitcherTRPG", setting);
});

Handlebars.registerHelper("window", function (...props) {
  props.pop();
  return props.reduce((result, prop) => result[prop], window);
});

Handlebars.registerHelper("includes", function (csv, substr) {
  return csv.split(",").map(v => v.trim()).includes(substr);
});