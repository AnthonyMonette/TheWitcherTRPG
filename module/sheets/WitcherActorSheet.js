import { buttonDialog, rollDamage, extendedRoll } from "../chat.js";
import { witcher } from "../config.js";
import { getRandomInt, updateDerived, rollSkillCheck, genId, calc_currency_weight, addModifiers } from "../witcher.js";
import { exportLoot, onChangeSkillList } from "./MonsterSheet.js";
import { RollConfig } from "../rollConfig.js";

import { ExecuteDefence } from "../../scripts/actions.js";

export default class WitcherActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["witcher", "sheet", "actor"],
      width: 1120,
      height: 600,
      template: "systems/TheWitcherTRPG/templates/sheets/actor/actor-sheet.html",
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
    });
  }

  /** @override */
  getData() {
    const data = super.getData();
    if (data.data.system) {
      data.system = data.data.system
    }

    data.useAdrenaline = game.settings.get("TheWitcherTRPG", "useOptionnalAdrenaline")
    data.displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
    data.useVerbalCombat = game.settings.get("TheWitcherTRPG", "useOptionnalVerbalCombat")
    data.displayRep = game.settings.get("TheWitcherTRPG", "displayRep")

    data.config = CONFIG.witcher;
    CONFIG.Combat.initiative.formula = !data.displayRollDetails ? "1d10 + @stats.ref.current" : "1d10 + @stats.ref.current[REF]";

    let actor = data.actor;
    let items = actor.items;
    data.weapons = actor.getList("weapon");
    data.weapons.forEach((weapon) => {
      if (weapon.system.enhancements > 0 && weapon.system.enhancements != weapon.system.enhancementItems.length) {
        let newEnhancementList = []
        for (let i = 0; i < weapon.system.enhancements; i++) {
          let element = weapon.system.enhancementItems[i]
          if (element && JSON.stringify(element) != '{}') {
            newEnhancementList.push(element)
          } else {
            newEnhancementList.push({})
          }
        }
        let item = actor.items.get(weapon._id);
        item.update({ 'system.enhancementItems': newEnhancementList })
      }
    });

    data.armors = items.filter(function (item) {
      return item.type == "armor" ||
        (item.type == "enhancement" && item.system.type == "armor" && item.system.applied == false)
    });
    data.armors.forEach((armor) => {
      if (armor.system.enhancements > 0 && armor.system.enhancements != armor.system.enhancementItems.length) {
        let newEnhancementList = []
        for (let i = 0; i < armor.system.enhancements; i++) {
          let element = armor.system.enhancementItems[i]
          if (element && JSON.stringify(element) != '{}') {
            newEnhancementList.push(element)
          } else {
            newEnhancementList.push({})
          }
        }
        let item = actor.items.get(armor._id);
        item.update({ 'system.enhancementItems': newEnhancementList })
      }
    });

    // Crafting section
    data.allComponents = actor.getList("component");
    data.craftingMaterials = data.allComponents.filter(i => i.system.type == "crafting-material" || i.system.type == "component");
    data.ingotsAndMinerals = data.allComponents.filter(i => i.system.type == "minerals");
    data.hidesAndAnimalParts = data.allComponents.filter(i => i.system.type == "animal-parts");
    data.enhancements = items.filter(i => i.type == "enhancement" && i.system.type != "armor" && !i.system.applied);

    // Valuables Section
    data.valuables = items.filter(i => i.type == "valuable");
    data.clothingAndContainers = data.valuables.filter(i => i.system.type == "clothing" || i.system.type == "containers");
    data.general = data.valuables.filter(i => i.system.type == "genera" || !i.system.type);
    data.foodAndDrinks = data.valuables.filter(i => i.system.type == "food-drink");
    data.toolkits = data.valuables.filter(i => i.system.type == "toolkit");
    data.questItems = data.valuables.filter(i => i.system.type == "quest-item");
    data.mounts = items.filter(i => i.type == "mount");
    data.mountAccessories = items.filter(i => i.type == "valuable" && i.system.type == "mount-accessories");

    data.runeItems = data.enhancements.filter(e => e.system.type == "rune");
    data.glyphItems = data.enhancements.filter(e => e.system.type == "glyph");

    // Alchemy section
    data.alchemicalItems = items.filter(i => (i.type == "valuable" && i.system.type == "alchemical-item") || (i.type == "alchemical" && i.system.type == "alchemical"));
    data.witcherPotions = items.filter(i => i.type == "alchemical" && (i.system.type == "decoction" || i.system.type == "potion"));
    data.oils = items.filter(i => i.type == "alchemical" && i.system.type == "oil");
    data.alchemicalTreatments = items.filter(i => i.type == "component" && i.system.type == "alchemical");
    data.mutagens = items.filter(i => i.type == "mutagen");
    
    // Formulae
    data.diagrams = actor.getList("diagrams");
    data.alchemicalItemDiagrams = data.diagrams.filter(d => d.system.type == "alchemical" || !d.system.type).map(sanitizeDescription);
    data.potionDiagrams = data.diagrams.filter(d => d.system.type == "potion").map(sanitizeDescription);
    data.decoctionDiagrams = data.diagrams.filter(d => d.system.type == "decoction").map(sanitizeDescription);
    data.oilDiagrams = data.diagrams.filter(d => d.system.type == "oil").map(sanitizeDescription);
    
    // Diagrams
    data.ingredientDiagrams = data.diagrams.filter(d => d.system.type == "ingredients").map(sanitizeDescription);
    data.weaponDiagrams = data.diagrams.filter(d => d.system.type == "weapon").map(sanitizeDescription);
    data.armorDiagrams = data.diagrams.filter(d => d.system.type == "armor").map(sanitizeDescription);
    data.elderfolkWeaponDiagrams = data.diagrams.filter(d => d.system.type == "armor-enhancement").map(sanitizeDescription);
    data.elderfolkArmorDiagrams = data.diagrams.filter(d => d.system.type == "elderfolk-weapon").map(sanitizeDescription);
    data.ammunitionDiagrams = data.diagrams.filter(d => d.system.type == "ammunition").map(sanitizeDescription);
    data.bombDiagrams = data.diagrams.filter(d => d.system.type == "bomb").map(sanitizeDescription);
    data.trapDiagrams = data.diagrams.filter(d => d.system.type == "traps").map(sanitizeDescription);

    // Others
    data.spells = actor.getList("spell");

    data.professions = actor.getList("profession");
    data.profession = data.professions[0];

    data.races = actor.getList("race");
    data.race = data.races[0];

    // Helping functions
    /** Sanitizes description if it contains forbidden html tags. */
    function sanitizeDescription(item) {
      if (!item.system.description) {
        return item;
      }

      const regex = /(<.+?>)/g;
      const whiteList = ["<p>", "</p>"];
      const tagsInText = item.system.description.match(regex);
      const itemCopy = JSON.parse(JSON.stringify(item));
      if (tagsInText.some(i => !whiteList.includes(i))) {
        const temp = document.createElement('div');
        temp.textContent = itemCopy.system.description;
        itemCopy.system.description = temp.innerHTML;
      }
      return itemCopy;
    }

    Array.prototype.sum = function (prop) {
      var total = 0
      for (var i = 0, _len = this.length; i < _len; i++) {
        if (this[i]["system"][prop]) {
          total += Number(this[i]["system"][prop])
        }
        else if (this[i]["system"]["system"][prop]) {
          total += Number(this[i]["system"]["system"][prop])
        }
      }
      return total
    }
    Array.prototype.weight = function () {
      var total = 0
      for (var i = 0, _len = this.length; i < _len; i++) {
        if (this[i]["system"]["weight"] && this[i]["system"]["quantity"]) {
          total += Number(this[i]["system"]["quantity"]) * Number(this[i]["system"]["weight"])
        }
      }
      return Math.ceil(total)
    }
    Array.prototype.cost = function () {
      var total = 0
      for (var i = 0, _len = this.length; i < _len; i++) {
        if (this[i]["system"]["cost"] && this[i]["system"]["quantity"]) {
          total += Number(this[i]["system"]["quantity"]) * Number(this[i]["system"]["cost"])
        }
      }
      return Math.ceil(total)
    }

    data.totalStats = this.calc_total_stats(data)
    data.totalSkills = this.calc_total_skills(data)
    data.totalProfSkills = this.calc_total_skills_profession(data)

    data.substancesVitriol = actor.getSubstance("vitriol");
    data.vitriolCount = data.substancesVitriol.sum("quantity");
    data.substancesRebis = actor.getSubstance("rebis");
    data.rebisCount = data.substancesRebis.sum("quantity");
    data.substancesAether = actor.getSubstance("aether");
    data.aetherCount = data.substancesAether.sum("quantity");
    data.substancesQuebrith = actor.getSubstance("quebrith");
    data.quebrithCount = data.substancesQuebrith.sum("quantity");
    data.substancesHydragenum = actor.getSubstance("hydragenum");
    data.hydragenumCount = data.substancesHydragenum.sum("quantity");
    data.substancesVermilion = actor.getSubstance("vermilion");
    data.vermilionCount = data.substancesVermilion.sum("quantity");
    data.substancesSol = actor.getSubstance("sol");
    data.solCount = data.substancesSol.sum("quantity");
    data.substancesCaelum = actor.getSubstance("caelum");
    data.caelumCount = data.substancesCaelum.sum("quantity");
    data.substancesFulgur = actor.getSubstance("fulgur");
    data.fulgurCount = data.substancesFulgur.sum("quantity");

    data.loots = items.filter(i => i.type == "component" ||
                                   i.type == "crafting-material" ||
                                   i.type == "enhancement" ||
                                   i.type == "valuable" ||
                                   i.type == "animal-parts" ||
                                   i.type == "diagrams" ||
                                   i.type == "armor" ||
                                   i.type == "alchemical" ||
                                   i.type == "enhancement" ||
                                   i.type == "mutagen");
    data.notes = actor.getList("note");

    data.activeEffects = actor.getList("effect");

    data.totalWeight = data.items.weight() + calc_currency_weight(data.system.currency);
    data.totalCost = data.items.cost();

    data.noviceSpells = data.spells.filter(s => s.system.level == "novice" &&
      (s.system.class == "Spells" || s.system.class == "Invocations" || s.system.class == "Witcher"));
    data.journeymanSpells = data.spells.filter(s => s.system.level == "journeyman" &&
      (s.system.class == "Spells" || s.system.class == "Invocations" || s.system.class == "Witcher"));
    data.masterSpells = data.spells.filter(s => s.system.level == "master" &&
      (s.system.class == "Spells" || s.system.class == "Invocations" || s.system.class == "Witcher"));
    data.hexes = data.spells.filter(s => s.system.class == "Hexes");
    data.rituals = data.spells.filter(s => s.system.class == "Rituals");
    data.magicalgift = data.spells.filter(s => s.system.class == "MagicalGift");

    if (actor.system.pannels == undefined) {
      actor.update({ 'system.pannels': {} });
    }
    data.isGM = game.user.isGM
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("input.stat-max").on("change", updateDerived(this.actor));

    let thisActor = this.actor;

    html.find(".hp-value").change(this._onHPChanged.bind(this));
    html.find(".inline-edit").change(this._onInlineEdit.bind(this));
    html.find(".item-edit").on("click", this._onItemEdit.bind(this));
    html.find(".item-show").on("click", this._onItemShow.bind(this));
    html.find(".item-weapon-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".item-armor-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".item-valuable-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".item-delete").on("click", this._onItemDelete.bind(this));
    html.find(".item-buy").on("click", this._onItemBuy.bind(this));
    html.find(".item-hide").on("click", this._onItemHide.bind(this));
    html.find(".add-item").on("click", this._onItemAdd.bind(this));
    html.find(".add-active-effect").on("click", this._onAddActiveEffect.bind(this));
    html.find(".skill-display").on("click", this._onSkillDisplay.bind(this));
    html.find(".item-substance-display").on("click", this._onSubstanceDisplay.bind(this));
    html.find(".item-spell-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".spell-display").on("click", this._onSpellDisplay.bind(this));
    html.find(".life-event-display").on("click", this._onLifeEventDisplay.bind(this));
    html.find(".stat-modifier-display").on("click", this._onStatModifierDisplay.bind(this));
    html.find(".skill-modifier-display").on("click", this._onSkillModifierDisplay.bind(this));
    html.find(".derived-modifier-display").on("click", this._onDerivedModifierDisplay.bind(this));

    html.find(".export-loot").on("click", function () { exportLoot(thisActor, false) });
    html.find(".export-loot-ext").on("click", function () { exportLoot(thisActor, true) });

    html.find(".init-roll").on("click", this._onInitRoll.bind(this));
    html.find(".crit-roll").on("click", this._onCritRoll.bind(this));
    html.find(".death-roll").on("click", this._onDeathSaveRoll.bind(this));
    html.find(".defence-roll").on("click", this._onDefenceRoll.bind(this));
    html.find(".heal-button").on("click", this._onHeal.bind(this));
    html.find(".verbal-button").on("click", this._onVerbalCombat.bind(this));
    html.find(".reputation-roll").on("click", this._onReputation.bind(this));

    html.find(".stat-roll").on("click", this._onStatSaveRoll.bind(this));
    html.find(".item-roll").on("click", this._onItemRoll.bind(this));
    html.find(".profession-roll").on("click", this._onProfessionRoll.bind(this));
    html.find(".spell-roll").on("click", this._onSpellRoll.bind(this));
    html.find(".alchemy-potion").on("click", this._alchemyCraft.bind(this));
    html.find(".crafting-craft").on("click", this._craftinCraft.bind(this));

    html.find(".add-crit").on("click", this._onCritAdd.bind(this));
    html.find(".delete-crit").on("click", this._onCritRemove.bind(this));

    html.find(".add-skill-modifier").on("click", this._onAddSkillModifier.bind(this));
    html.find(".add-modifier").on("click", this._onAddModifier.bind(this));
    html.find(".delete-stat").on("click", this._onModifierRemove.bind(this));
    html.find(".delete-skill-modifier").on("click", this._onSkillModifierRemove.bind(this));

    html.find(".list-mod-edit").on("blur", this._onModifierEdit.bind(this));
    html.find(".skill-mod-edit").on("blur", this._onSkillModifierEdit.bind(this));

    html.find(".change-skill-list").on("click", function () { onChangeSkillList(thisActor) });

    html.find(".enhancement-weapon-slot").on("click", this._chooseEnhancement.bind(this));
    html.find(".enhancement-armor-slot").on("click", this._chooseEnhancement.bind(this));

    html.find(".death-minus").on("click", this._removeDeathSaves.bind(this));
    html.find(".death-plus").on("click", this._addDeathSaves.bind(this));

    html.find("input").focusin(ev => this._onFocusIn(ev));

    html.find("#awareness-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 0) });
    html.find("#business-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 1) });
    html.find("#deduction-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 2) });
    html.find("#education-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 3) });
    html.find("#commonsp-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 4) });
    html.find("#eldersp-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 5) });
    html.find("#dwarven-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 6) });
    html.find("#monster-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 7) });
    html.find("#socialetq-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 8) });
    html.find("#streetwise-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 9) });
    html.find("#tactics-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 10) });
    html.find("#teaching-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 11) });
    html.find("#wilderness-rollable").on("click", function () { rollSkillCheck(thisActor, 0, 12) });
    //ref skills
    html.find("#brawling-rollable").on("click", function () { rollSkillCheck(thisActor, 1, 0) });
    html.find("#dodge-rollable").on("click", function () { rollSkillCheck(thisActor, 1, 1) });
    html.find("#melee-rollable").on("click", function () { rollSkillCheck(thisActor, 1, 2) });
    html.find("#riding-rollable").on("click", function () { rollSkillCheck(thisActor, 1, 3) });
    html.find("#sailing-rollable").on("click", function () { rollSkillCheck(thisActor, 1, 4) });
    html.find("#smallblades-rollable").on("click", function () { rollSkillCheck(thisActor, 1, 5) });
    html.find("#staffspear-rollable").on("click", function () { rollSkillCheck(thisActor, 1, 6) });
    html.find("#swordsmanship-rollable").on("click", function () { rollSkillCheck(thisActor, 1, 7) });
    //dex skills
    html.find("#archery-rollable").on("click", function () { rollSkillCheck(thisActor, 2, 0) });
    html.find("#athletics-rollable").on("click", function () { rollSkillCheck(thisActor, 2, 1) });
    html.find("#crossbow-rollable").on("click", function () { rollSkillCheck(thisActor, 2, 2) });
    html.find("#sleight-rollable").on("click", function () { rollSkillCheck(thisActor, 2, 3) });
    html.find("#stealth-rollable").on("click", function () { rollSkillCheck(thisActor, 2, 4) });
    //body skills
    html.find("#physique-rollable").on("click", function () { rollSkillCheck(thisActor, 3, 0) });
    html.find("#endurance-rollable").on("click", function () { rollSkillCheck(thisActor, 3, 1) });
    //emp skills
    html.find("#charisma-rollable").on("click", function () { rollSkillCheck(thisActor, 4, 0) });
    html.find("#deceit-rollable").on("click", function () { rollSkillCheck(thisActor, 4, 1) });
    html.find("#finearts-rollable").on("click", function () { rollSkillCheck(thisActor, 4, 2) });
    html.find("#gambling-rollable").on("click", function () { rollSkillCheck(thisActor, 4, 3) });
    html.find("#grooming-rollable").on("click", function () { rollSkillCheck(thisActor, 4, 4) });
    html.find("#perception-rollable").on("click", function () { rollSkillCheck(thisActor, 4, 5) });
    html.find("#leadership-rollable").on("click", function () { rollSkillCheck(thisActor, 4, 6) });
    html.find("#persuasion-rollable").on("click", function () { rollSkillCheck(thisActor, 4, 7) });
    html.find("#performance-rollable").on("click", function () { rollSkillCheck(thisActor, 4, 8) });
    html.find("#seduction-rollable").on("click", function () { rollSkillCheck(thisActor, 4, 9) });
    //cra skills
    html.find("#alchemy-rollable").on("click", function () { rollSkillCheck(thisActor, 5, 0) });
    html.find("#crafting-rollable").on("click", function () { rollSkillCheck(thisActor, 5, 1) });
    html.find("#disguise-rollable").on("click", function () { rollSkillCheck(thisActor, 5, 2) });
    html.find("#firstaid-rollable").on("click", function () { rollSkillCheck(thisActor, 5, 3) });
    html.find("#forgery-rollable").on("click", function () { rollSkillCheck(thisActor, 5, 4) });
    html.find("#picklock-rollable").on("click", function () { rollSkillCheck(thisActor, 5, 5) });
    html.find("#trapcraft-rollable").on("click", function () { rollSkillCheck(thisActor, 5, 6) });
    //will skills
    html.find("#courage-rollable").on("click", function () { rollSkillCheck(thisActor, 6, 0) });
    html.find("#hexweave-rollable").on("click", function () { rollSkillCheck(thisActor, 6, 1) });
    html.find("#intimidation-rollable").on("click", function () { rollSkillCheck(thisActor, 6, 2) });
    html.find("#spellcast-rollable").on("click", function () { rollSkillCheck(thisActor, 6, 3) });
    html.find("#resistmagic-rollable").on("click", function () { rollSkillCheck(thisActor, 6, 4) });
    html.find("#resistcoerc-rollable").on("click", function () { rollSkillCheck(thisActor, 6, 5) });
    html.find("#ritcraft-rollable").on("click", function () { rollSkillCheck(thisActor, 6, 6) });

    html.find(".dragable").on("dragstart", (ev) => {
      let itemId = ev.target.dataset.id
      let item = this.actor.items.get(itemId);
      ev.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          item: item,
          actor: this.actor,
          type: "itemDrop",
        }),
      )
    });

    const newDragDrop = new DragDrop({
      dragSelector: `.dragable`,
      dropSelector: `.window-content`,
      permissions: { dragstart: this._canDragStart.bind(this), drop: this._canDragDrop.bind(this) },
      callbacks: { dragstart: this._onDragStart.bind(this), drop: this._onDrop.bind(this) }
    })
    this._dragDrop.push(newDragDrop);
  }

  async _removeDeathSaves(event) {
    event.preventDefault();
    this.actor.update({ "system.deathSaves": 0 });
  }

  async _addDeathSaves(event) {
    event.preventDefault();
    this.actor.update({ "system.deathSaves": this.actor.system.deathSaves + 1 });
  }

  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    // dragData should exist for WitcherActorSheet, WitcherItemSheet.
    // It is populated during the activateListeners phase
    let witcherDragData = event.dataTransfer.getData("text/plain")
    let dragData = witcherDragData ? JSON.parse(witcherDragData) : data;

    // handle itemDrop prepared in WitcherActorSheet, WitcherItemSheet
    // need this to drop item from actor
    if (witcherDragData && dragData.type === "itemDrop") {
      let previousActor = game.actors.get(dragData.actor._id)
      let token = previousActor.token ?? previousActor.getActiveTokens()[0]
      if (token) {
        previousActor = token.actor
      }

      if (previousActor == this.actor) {
        return;
      }

      // Calculate the rollable amount of items to be dropped from actors' inventory
      if (typeof (dragData.item.system.quantity) === 'string' && dragData.item.system.quantity.includes("d")) {
        let messageData = {
          speaker: this.actor.getSpeaker(),
          flavor: `<h1>Quantity of ${dragData.item.name}</h1>`,
        }
        let roll = await new Roll(dragData.item.system.quantity).evaluate({ async: true })
        roll.toMessage(messageData)

        // Add items to the recipient actor
        this._addItem(this.actor, dragData.item, Math.floor(roll.total))

        // Remove items from donor actor
        if (previousActor) {
          await previousActor.items.get(dragData.item._id).delete()
        }
        return
      }

      if (dragData.item.system.quantity != 0) {
        if (dragData.item.system.quantity > 1) {
          let content = `${game.i18n.localize("WITCHER.Items.transferMany")}: <input type="number" class="small" name="numberOfItem" value=1>/${dragData.item.system.quantity} <br />`
          let cancel = true
          let numberOfItem = 0
          let dialogData = {
            buttons: [
              [`${game.i18n.localize("WITCHER.Button.Continue")}`, (html) => {
                numberOfItem = html.find("[name=numberOfItem]")[0].value;
                cancel = false
              }],
              [`${game.i18n.localize("WITCHER.Button.All")}`, () => {
                numberOfItem = dragData.item.system.quantity
                cancel = false
              }]
            ],
            title: game.i18n.localize("WITCHER.Items.transferTitle"),
            content: content
          }
          await buttonDialog(dialogData)

          if (cancel) {
            return
          } else {
            // Remove items from donor actor
            this._removeItem(previousActor, dragData.item._id, numberOfItem)
            if (numberOfItem > dragData.item.system.quantity) {
              numberOfItem = dragData.item.system.quantity
            }
            // Add items to the recipient actor
            this._addItem(this.actor, dragData.item, numberOfItem)
          }
        } else {
          // Add item to the recipient actor
          this._addItem(this.actor, dragData.item, 1)
          // Remove item from donor actor
          if (previousActor) {
            await previousActor.items.get(dragData.item._id).delete()
          }
        }
      }
    } else if (dragData && dragData.type === "Item") {
      // Adding items from compendia
      // We do not have the same dragData object in compendia as for Actor or Item
      let itemToAdd = item

      // Somehow previous item from passed data object is empty. Let's try to get item from passed event
      if (!itemToAdd) {
        let dragEventData = TextEditor.getDragEventData(event)
        itemToAdd = await fromUuid(dragEventData.uuid)
      }

      if (itemToAdd) {
        this._addItem(this.actor, itemToAdd, 1)
      }
    } else {
      super._onDrop(event, data);
    }
  }

  async _removeItem(actor, itemId, quantityToRemove) {
    actor.removeItem(itemId, quantityToRemove)
    //let foundItem = actor.items.get(itemId)
    //let newQuantity = foundItem.system.quantity - quantityToRemove
    //if (newQuantity <= 0) {
    //  await actor.items.get(itemId).delete()
    //} else {
    //  await foundItem.update({ 'system.quantity': newQuantity < 0 ? 0 : newQuantity })
    //}
  }

  async _addItem(actor, Additem, numberOfItem, forcecreate = false) {
    let foundItem = (actor.items).find(item => item.name == Additem.name);
    if (foundItem && !forcecreate) {
      await foundItem.update({ 'system.quantity': Number(foundItem.system.quantity) + Number(numberOfItem) })
    }
    else {
      let newItem = { ...Additem };

      if (numberOfItem) {
        newItem.system.quantity = Number(numberOfItem)
      }
      await actor.createEmbeddedDocuments("Item", [newItem]);
    }
  }

  async _chooseEnhancement(event) {
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId)
    let type = event.currentTarget.closest(".item").dataset.type;

    let content = ""
    let enhancements = this.actor.getList("enhancement")
    if (type == "weapon") {
      enhancements = enhancements.filter(e => e.system.applied == false && (e.system.type == "rune" || e.system.type == "weapon"));
    } else {
      enhancements = enhancements.filter(e => item.system.applied == false && (e.system.type == "armor" || e.system.type == "glyph"));
    }

    let quantity = enhancements.sum("quantity")
    if (quantity == 0) {
      content += `<div class="error-display">${game.i18n.localize("WITCHER.Enhancement.NoEnhancement")}</div>`
    } else {
      let enhancementsOption = ``
      enhancements.forEach(element => {
        enhancementsOption += `<option value="${element._id}"> ${element.name}(${element.system.quantity}) </option>`;
      });
      content += `<div><label>${game.i18n.localize("WITCHER.Dialog.Enhancement")}: <select name="enhancement">${enhancementsOption}</select></label></div>`
    }

    new Dialog({
      title: `${game.i18n.localize("WITCHER.Enhancement.ChooseTitle")}`,
      content,
      buttons: {
        Cancel: {
          label: `${game.i18n.localize("WITCHER.Button.Cancel")}`,
          callback: () => { }
        },
        Apply: {
          label: `${game.i18n.localize("WITCHER.Dialog.Apply")}`,
          callback: (html) => {
            let enhancementId = undefined
            if (html.find("[name=enhancement]")[0]) {
              enhancementId = html.find("[name=enhancement]")[0].value;
            }
            let choosedEnhancement = this.actor.items.get(enhancementId)
            if (item && choosedEnhancement) {
              let newEnhancementList = []
              let added = false
              item.system.enhancementItems.forEach(element => {
                if ((JSON.stringify(element) === '{}' || !element) && !added) {
                  element = choosedEnhancement
                  added = true
                }
                newEnhancementList.push(element)
              });
              if (type == "weapon") {
                item.update({ 'system.enhancementItems': newEnhancementList })
              }
              else {
                let allEffects = item.system.effects
                allEffects.push(...choosedEnhancement.system.effects)
                if (choosedEnhancement.system.type == "armor") {
                  item.update({
                    'system.enhancementItems': newEnhancementList,
                    "system.headStopping": item.system.headStopping + choosedEnhancement.system.stopping,
                    "system.headMaxStopping": item.system.headMaxStopping + choosedEnhancement.system.stopping,
                    "system.torsoStopping": item.system.torsoStopping + choosedEnhancement.system.stopping,
                    "system.torsoMaxStopping": item.system.torsoMaxStopping + choosedEnhancement.system.stopping,
                    "system.leftArmStopping": item.system.leftArmStopping + choosedEnhancement.system.stopping,
                    "system.leftArmMaxStopping": item.system.leftArmMaxStopping + choosedEnhancement.system.stopping,
                    "system.rightArmStopping": item.system.rightArmStopping + choosedEnhancement.system.stopping,
                    "system.rightArmMaxStopping": item.system.rightArmMaxStopping + choosedEnhancement.system.stopping,
                    "system.leftLegStopping": item.system.leftLegStopping + choosedEnhancement.system.stopping,
                    "system.leftLegMaxStopping": item.system.leftLegMaxStopping + choosedEnhancement.system.stopping,
                    "system.rightLegStopping": item.system.rightLegStopping + choosedEnhancement.system.stopping,
                    "system.rightLegMaxStopping": item.system.rightLegMaxStopping + choosedEnhancement.system.stopping,
                    'system.bludgeoning': choosedEnhancement.system.bludgeoning,
                    'system.slashing': choosedEnhancement.system.slashing,
                    'system.piercing': choosedEnhancement.system.piercing,
                    'system.effects': allEffects
                  })
                }
                else {
                  item.update({ 'system.effects': allEffects })
                }
              }
              let newName = choosedEnhancement.name + "(Applied)"
              let newQuantity = choosedEnhancement.system.quantity
              choosedEnhancement.update({
                'name': newName,
                'system.applied': true,
                'system.quantity': 1
              })
              if (newQuantity > 1) {
                newQuantity -= 1
                this._addItem(this.actor, choosedEnhancement, newQuantity, true)
              }
            }
          }
        }
      }
    }).render(true)
  }

  async _onAddSkillModifier(event) {
    let stat = event.currentTarget.closest(".skill").dataset.stat;
    let skill = event.currentTarget.closest(".skill").dataset.skill;
    let newModifierList = []
    if (this.actor.system.skills[stat][skill].modifiers) {
      newModifierList = this.actor.system.skills[stat][skill].modifiers
    }
    newModifierList.push({ id: genId(), name: "Modifier", value: 0 })

    switch (skill) {
      case "awareness": this.actor.update({ 'system.skills.int.awareness.modifiers': newModifierList }); break;
      case "business": this.actor.update({ 'system.skills.int.business.modifiers': newModifierList }); break;
      case "deduction": this.actor.update({ 'system.skills.int.deduction.modifiers': newModifierList }); break;
      case "education": this.actor.update({ 'system.skills.int.education.modifiers': newModifierList }); break;
      case "commonsp": this.actor.update({ 'system.skills.int.commonsp.modifiers': newModifierList }); break;
      case "eldersp": this.actor.update({ 'system.skills.int.eldersp.modifiers': newModifierList }); break;
      case "dwarven": this.actor.update({ 'system.skills.int.dwarven.modifiers': newModifierList }); break;
      case "monster": this.actor.update({ 'system.skills.int.monster.modifiers': newModifierList }); break;
      case "socialetq": this.actor.update({ 'system.skills.int.socialetq.modifiers': newModifierList }); break;
      case "streetwise": this.actor.update({ 'system.skills.int.streetwise.modifiers': newModifierList }); break;
      case "tactics": this.actor.update({ 'system.skills.int.tactics.modifiers': newModifierList }); break;
      case "teaching": this.actor.update({ 'system.skills.int.teaching.modifiers': newModifierList }); break;
      case "wilderness": this.actor.update({ 'system.skills.int.wilderness.modifiers': newModifierList }); break;

      case "brawling": this.actor.update({ 'system.skills.ref.brawling.modifiers': newModifierList }); break;
      case "dodge": this.actor.update({ 'system.skills.ref.dodge.modifiers': newModifierList }); break;
      case "melee": this.actor.update({ 'system.skills.ref.melee.modifiers': newModifierList }); break;
      case "riding": this.actor.update({ 'system.skills.ref.riding.modifiers': newModifierList }); break;
      case "sailing": this.actor.update({ 'system.skills.ref.sailing.modifiers': newModifierList }); break;
      case "smallblades": this.actor.update({ 'system.skills.ref.smallblades.modifiers': newModifierList }); break;
      case "staffspear": this.actor.update({ 'system.skills.ref.staffspear.modifiers': newModifierList }); break;
      case "swordsmanship": this.actor.update({ 'system.skills.ref.swordsmanship.modifiers': newModifierList }); break;

      case "courage": this.actor.update({ 'system.skills.will.courage.modifiers': newModifierList }); break;
      case "hexweave": this.actor.update({ 'system.skills.will.hexweave.modifiers': newModifierList }); break;
      case "intimidation": this.actor.update({ 'system.skills.will.intimidation.modifiers': newModifierList }); break;
      case "spellcast": this.actor.update({ 'system.skills.will.spellcast.modifiers': newModifierList }); break;
      case "resistmagic": this.actor.update({ 'system.skills.will.resistmagic.modifiers': newModifierList }); break;
      case "resistcoerc": this.actor.update({ 'system.skills.will.resistcoerc.modifiers': newModifierList }); break;
      case "ritcraft": this.actor.update({ 'system.skills.will.ritcraft.modifiers': newModifierList }); break;

      case "archery": this.actor.update({ 'system.skills.dex.archery.modifiers': newModifierList }); break;
      case "athletics": this.actor.update({ 'system.skills.dex.athletics.modifiers': newModifierList }); break;
      case "crossbow": this.actor.update({ 'system.skills.dex.crossbow.modifiers': newModifierList }); break;
      case "sleight": this.actor.update({ 'system.skills.dex.sleight.modifiers': newModifierList }); break;
      case "stealth": this.actor.update({ 'system.skills.dex.stealth.modifiers': newModifierList }); break;

      case "alchemy": this.actor.update({ 'system.skills.cra.alchemy.modifiers': newModifierList }); break;
      case "crafting": this.actor.update({ 'system.skills.cra.crafting.modifiers': newModifierList }); break;
      case "disguise": this.actor.update({ 'system.skills.cra.disguise.modifiers': newModifierList }); break;
      case "firstaid": this.actor.update({ 'system.skills.cra.firstaid.modifiers': newModifierList }); break;
      case "forgery": this.actor.update({ 'system.skills.cra.forgery.modifiers': newModifierList }); break;
      case "picklock": this.actor.update({ 'system.skills.cra.picklock.modifiers': newModifierList }); break;
      case "trapcraft": this.actor.update({ 'system.skills.cra.trapcraft.modifiers': newModifierList }); break;

      case "physique": this.actor.update({ 'system.skills.body.physique.modifiers': newModifierList }); break;
      case "endurance": this.actor.update({ 'system.skills.body.endurance.modifiers': newModifierList }); break;

      case "charisma": this.actor.update({ 'system.skills.emp.charisma.modifiers': newModifierList }); break;
      case "deceit": this.actor.update({ 'system.skills.emp.deceit.modifiers': newModifierList }); break;
      case "finearts": this.actor.update({ 'system.skills.emp.finearts.modifiers': newModifierList }); break;
      case "gambling": this.actor.update({ 'system.skills.emp.gambling.modifiers': newModifierList }); break;
      case "grooming": this.actor.update({ 'system.skills.emp.grooming.modifiers': newModifierList }); break;
      case "perception": this.actor.update({ 'system.skills.emp.perception.modifiers': newModifierList }); break;
      case "leadership": this.actor.update({ 'system.skills.emp.leadership.modifiers': newModifierList }); break;
      case "persuasion": this.actor.update({ 'system.skills.emp.persuasion.modifiers': newModifierList }); break;
      case "performance": this.actor.update({ 'system.skills.emp.performance.modifiers': newModifierList }); break;
      case "seduction": this.actor.update({ 'system.skills.emp.seduction.modifiers': newModifierList }); break;
    }
  }

  async _onAddModifier(event) {
    event.preventDefault();
    let stat = event.currentTarget.closest(".stat-display").dataset.stat;
    let type = event.currentTarget.closest(".stat-display").dataset.type;

    let newModifierList = []
    if (type == "coreStat") {
      if (this.actor.system.coreStats[stat].modifiers) {
        newModifierList = this.actor.system.coreStats[stat].modifiers
      }
    } else if (type == "derivedStat") {
      newModifierList = this.actor.system.derivedStats[stat].modifiers
    } else if (type == "reputation") {
      newModifierList = this.actor.system.reputation.modifiers
    } else {
      if (this.actor.system.stats[stat].modifiers) {
        newModifierList = this.actor.system.stats[stat].modifiers
      }
    }

    newModifierList.push({ id: genId(), name: "Modifier", value: 0 })

    switch (stat) {
      case "int": this.actor.update({ 'system.stats.int.modifiers': newModifierList }); break;
      case "ref": this.actor.update({ 'system.stats.ref.modifiers': newModifierList }); break;
      case "dex": this.actor.update({ 'system.stats.dex.modifiers': newModifierList }); break;
      case "body": this.actor.update({ 'system.stats.body.modifiers': newModifierList }); break;
      case "spd": this.actor.update({ 'system.stats.spd.modifiers': newModifierList }); break;
      case "emp": this.actor.update({ 'system.stats.emp.modifiers': newModifierList }); break;
      case "cra": this.actor.update({ 'system.stats.cra.modifiers': newModifierList }); break;
      case "will": this.actor.update({ 'system.stats.will.modifiers': newModifierList }); break;
      case "luck": this.actor.update({ 'system.stats.luck.modifiers': newModifierList }); break;
      case "stun": this.actor.update({ 'system.coreStats.stun.modifiers': newModifierList }); break;
      case "run": this.actor.update({ 'system.coreStats.run.modifiers': newModifierList }); break;
      case "leap": this.actor.update({ 'system.coreStats.leap.modifiers': newModifierList }); break;
      case "enc": this.actor.update({ 'system.coreStats.enc.modifiers': newModifierList }); break;
      case "rec": this.actor.update({ 'system.coreStats.rec.modifiers': newModifierList }); break;
      case "woundTreshold": this.actor.update({ 'system.coreStats.woundTreshold.modifiers': newModifierList }); break;
      case "hp": this.actor.update({ 'system.derivedStats.hp.modifiers': newModifierList }); break;
      case "sta": this.actor.update({ 'system.derivedStats.sta.modifiers': newModifierList }); break;
      case "resolve": this.actor.update({ 'system.derivedStats.resolve.modifiers': newModifierList }); break;
      case "focus": this.actor.update({ 'system.derivedStats.focus.modifiers': newModifierList }); break;
      case "reputation": this.actor.update({ 'system.reputation.modifiers': newModifierList }); break;
    }
  }

  async _onCritAdd(event) {
    event.preventDefault();
    const prevCritList = this.actor.system.critWounds;
    const newCritList = Object.values(prevCritList).map((details) => details);
    newCritList.push({
      id: genId(),
      effect: witcher.CritGravityDefaultEffect.Simple,
      mod: "None",
      description: witcher.CritDescription.SimpleCrackedJaw,
      notes: "",
    });
    this.actor.update({ "system.critWounds": newCritList });
  }

  async _onSkillModifierEdit(event) {
    let stat = event.currentTarget.closest(".skill").dataset.stat;
    let skill = event.currentTarget.closest(".skill").dataset.skill;

    let element = event.currentTarget;
    let itemId = element.closest(".list-modifiers").dataset.id;

    let field = element.dataset.field;
    let value = element.value
    let modifiers = this.actor.system.skills[stat][skill].modifiers;

    let objIndex = modifiers.findIndex((obj => obj.id == itemId));
    modifiers[objIndex][field] = value

    switch (skill) {
      case "awareness": this.actor.update({ 'system.skills.int.awareness.modifiers': modifiers }); break;
      case "business": this.actor.update({ 'system.skills.int.business.modifiers': modifiers }); break;
      case "deduction": this.actor.update({ 'system.skills.int.deduction.modifiers': modifiers }); break;
      case "education": this.actor.update({ 'system.skills.int.education.modifiers': modifiers }); break;
      case "commonsp": this.actor.update({ 'system.skills.int.commonsp.modifiers': modifiers }); break;
      case "eldersp": this.actor.update({ 'system.skills.int.eldersp.modifiers': modifiers }); break;
      case "dwarven": this.actor.update({ 'system.skills.int.dwarven.modifiers': modifiers }); break;
      case "monster": this.actor.update({ 'system.skills.int.monster.modifiers': modifiers }); break;
      case "socialetq": this.actor.update({ 'system.skills.int.socialetq.modifiers': modifiers }); break;
      case "streetwise": this.actor.update({ 'system.skills.int.streetwise.modifiers': modifiers }); break;
      case "tactics": this.actor.update({ 'system.skills.int.tactics.modifiers': modifiers }); break;
      case "teaching": this.actor.update({ 'system.skills.int.teaching.modifiers': modifiers }); break;
      case "wilderness": this.actor.update({ 'system.skills.int.wilderness.modifiers': modifiers }); break;

      case "brawling": this.actor.update({ 'system.skills.ref.brawling.modifiers': modifiers }); break;
      case "dodge": this.actor.update({ 'system.skills.ref.dodge.modifiers': modifiers }); break;
      case "melee": this.actor.update({ 'system.skills.ref.melee.modifiers': modifiers }); break;
      case "riding": this.actor.update({ 'system.skills.ref.riding.modifiers': modifiers }); break;
      case "sailing": this.actor.update({ 'system.skills.ref.sailing.modifiers': modifiers }); break;
      case "smallblades": this.actor.update({ 'system.skills.ref.smallblades.modifiers': modifiers }); break;
      case "staffspear": this.actor.update({ 'system.skills.ref.staffspear.modifiers': modifiers }); break;
      case "swordsmanship": this.actor.update({ 'system.skills.ref.swordsmanship.modifiers': modifiers }); break;

      case "courage": this.actor.update({ 'system.skills.will.courage.modifiers': modifiers }); break;
      case "hexweave": this.actor.update({ 'system.skills.will.hexweave.modifiers': modifiers }); break;
      case "intimidation": this.actor.update({ 'system.skills.will.intimidation.modifiers': modifiers }); break;
      case "spellcast": this.actor.update({ 'system.skills.will.spellcast.modifiers': modifiers }); break;
      case "resistmagic": this.actor.update({ 'system.skills.will.resistmagic.modifiers': modifiers }); break;
      case "resistcoerc": this.actor.update({ 'system.skills.will.resistcoerc.modifiers': modifiers }); break;
      case "ritcraft": this.actor.update({ 'system.skills.will.ritcraft.modifiers': modifiers }); break;

      case "archery": this.actor.update({ 'system.skills.dex.archery.modifiers': modifiers }); break;
      case "athletics": this.actor.update({ 'system.skills.dex.athletics.modifiers': modifiers }); break;
      case "crossbow": this.actor.update({ 'system.skills.dex.crossbow.modifiers': modifiers }); break;
      case "sleight": this.actor.update({ 'system.skills.dex.sleight.modifiers': modifiers }); break;
      case "stealth": this.actor.update({ 'system.skills.dex.stealth.modifiers': modifiers }); break;

      case "alchemy": this.actor.update({ 'system.skills.cra.alchemy.modifiers': modifiers }); break;
      case "crafting": this.actor.update({ 'system.skills.cra.crafting.modifiers': modifiers }); break;
      case "disguise": this.actor.update({ 'system.skills.cra.disguise.modifiers': modifiers }); break;
      case "firstaid": this.actor.update({ 'system.skills.cra.firstaid.modifiers': modifiers }); break;
      case "forgery": this.actor.update({ 'system.skills.cra.forgery.modifiers': modifiers }); break;
      case "picklock": this.actor.update({ 'system.skills.cra.picklock.modifiers': modifiers }); break;
      case "trapcraft": this.actor.update({ 'system.skills.cra.trapcraft.modifiers': modifiers }); break;

      case "physique": this.actor.update({ 'system.skills.body.physique.modifiers': modifiers }); break;
      case "endurance": this.actor.update({ 'system.skills.body.endurance.modifiers': modifiers }); break;

      case "charisma": this.actor.update({ 'system.skills.emp.charisma.modifiers': modifiers }); break;
      case "deceit": this.actor.update({ 'system.skills.emp.deceit.modifiers': modifiers }); break;
      case "finearts": this.actor.update({ 'system.skills.emp.finearts.modifiers': modifiers }); break;
      case "gambling": this.actor.update({ 'system.skills.emp.gambling.modifiers': modifiers }); break;
      case "grooming": this.actor.update({ 'system.skills.emp.grooming.modifiers': modifiers }); break;
      case "perception": this.actor.update({ 'system.skills.emp.perception.modifiers': modifiers }); break;
      case "leadership": this.actor.update({ 'system.skills.emp.leadership.modifiers': modifiers }); break;
      case "persuasion": this.actor.update({ 'system.skills.emp.persuasion.modifiers': modifiers }); break;
      case "performance": this.actor.update({ 'system.skills.emp.performance.modifiers': modifiers }); break;
      case "seduction": this.actor.update({ 'system.skills.emp.seduction.modifiers': modifiers }); break;
    }
  }

  async _onModifierEdit(event) {
    event.preventDefault();
    let stat = event.currentTarget.closest(".stat-display").dataset.stat;
    let type = event.currentTarget.closest(".stat-display").dataset.type;

    let element = event.currentTarget;
    let itemId = element.closest(".list-modifiers").dataset.id;

    let field = element.dataset.field;
    let value = element.value
    let modifiers = []

    if (type == "coreStat") {
      modifiers = this.actor.system.coreStats[stat].modifiers;
    } else if (type == "derivedStat") {
      modifiers = this.actor.system.derivedStats[stat].modifiers;
    } else if (type == "reputation") {
      modifiers = this.actor.system.reputation.modifiers;
    } else {
      modifiers = this.actor.system.stats[stat].modifiers;
    }

    let objIndex = modifiers.findIndex((obj => obj.id == itemId));
    modifiers[objIndex][field] = value
    switch (stat) {
      case "int": this.actor.update({ 'system.stats.int.modifiers': modifiers }); break;
      case "ref": this.actor.update({ 'system.stats.ref.modifiers': modifiers }); break;
      case "dex": this.actor.update({ 'system.stats.dex.modifiers': modifiers }); break;
      case "body": this.actor.update({ 'system.stats.body.modifiers': modifiers }); break;
      case "spd": this.actor.update({ 'system.stats.spd.modifiers': modifiers }); break;
      case "emp": this.actor.update({ 'system.stats.emp.modifiers': modifiers }); break;
      case "cra": this.actor.update({ 'system.stats.cra.modifiers': modifiers }); break;
      case "will": this.actor.update({ 'system.stats.will.modifiers': modifiers }); break;
      case "luck": this.actor.update({ 'system.stats.luck.modifiers': modifiers }); break;
      case "stun": this.actor.update({ 'system.coreStats.stun.modifiers': modifiers }); break;
      case "run": this.actor.update({ 'system.coreStats.run.modifiers': modifiers }); break;
      case "leap": this.actor.update({ 'system.coreStats.leap.modifiers': modifiers }); break;
      case "enc": this.actor.update({ 'system.coreStats.enc.modifiers': modifiers }); break;
      case "rec": this.actor.update({ 'system.coreStats.rec.modifiers': modifiers }); break;
      case "woundTreshold": this.actor.update({ 'system.coreStats.woundTreshold.modifiers': modifiers }); break;
      case "hp": this.actor.update({ 'system.derivedStats.hp.modifiers': modifiers }); break;
      case "sta": this.actor.update({ 'system.derivedStats.sta.modifiers': modifiers }); break;
      case "resolve": this.actor.update({ 'system.derivedStats.resolve.modifiers': modifiers }); break;
      case "focus": this.actor.update({ 'system.derivedStats.focus.modifiers': modifiers }); break;
      case "reputation": this.actor.update({ 'system.reputation.modifiers': modifiers }); break;
    }
    updateDerived(this.actor);
  }

  async _onSkillModifierRemove(event) {
    let stat = event.currentTarget.closest(".skill").dataset.stat;
    let skill = event.currentTarget.closest(".skill").dataset.skill;

    let prevModList = this.actor.system.skills[stat][skill].modifiers;
    const newModList = Object.values(prevModList).map((details) => details);
    const idxToRm = newModList.findIndex((v) => v.id === event.target.dataset.id);
    newModList.splice(idxToRm, 1);

    switch (skill) {
      case "awareness": this.actor.update({ 'system.skills.int.awareness.modifiers': newModList }); break;
      case "business": this.actor.update({ 'system.skills.int.business.modifiers': newModList }); break;
      case "deduction": this.actor.update({ 'system.skills.int.deduction.modifiers': newModList }); break;
      case "education": this.actor.update({ 'system.skills.int.education.modifiers': newModList }); break;
      case "commonsp": this.actor.update({ 'system.skills.int.commonsp.modifiers': newModList }); break;
      case "eldersp": this.actor.update({ 'system.skills.int.eldersp.modifiers': newModList }); break;
      case "dwarven": this.actor.update({ 'system.skills.int.dwarven.modifiers': newModList }); break;
      case "monster": this.actor.update({ 'system.skills.int.monster.modifiers': newModList }); break;
      case "socialetq": this.actor.update({ 'system.skills.int.socialetq.modifiers': newModList }); break;
      case "streetwise": this.actor.update({ 'system.skills.int.streetwise.modifiers': newModList }); break;
      case "tactics": this.actor.update({ 'system.skills.int.tactics.modifiers': newModList }); break;
      case "teaching": this.actor.update({ 'system.skills.int.teaching.modifiers': newModList }); break;
      case "wilderness": this.actor.update({ 'system.skills.int.wilderness.modifiers': newModList }); break;

      case "brawling": this.actor.update({ 'system.skills.ref.brawling.modifiers': newModList }); break;
      case "dodge": this.actor.update({ 'system.skills.ref.dodge.modifiers': newModList }); break;
      case "melee": this.actor.update({ 'system.skills.ref.melee.modifiers': newModList }); break;
      case "riding": this.actor.update({ 'system.skills.ref.riding.modifiers': newModList }); break;
      case "sailing": this.actor.update({ 'system.skills.ref.sailing.modifiers': newModList }); break;
      case "smallblades": this.actor.update({ 'system.skills.ref.smallblades.modifiers': newModList }); break;
      case "staffspear": this.actor.update({ 'system.skills.ref.staffspear.modifiers': newModList }); break;
      case "swordsmanship": this.actor.update({ 'system.skills.ref.swordsmanship.modifiers': newModList }); break;

      case "courage": this.actor.update({ 'system.skills.will.courage.modifiers': newModList }); break;
      case "hexweave": this.actor.update({ 'system.skills.will.hexweave.modifiers': newModList }); break;
      case "intimidation": this.actor.update({ 'system.skills.will.intimidation.modifiers': newModList }); break;
      case "spellcast": this.actor.update({ 'system.skills.will.spellcast.modifiers': newModList }); break;
      case "resistmagic": this.actor.update({ 'system.skills.will.resistmagic.modifiers': newModList }); break;
      case "resistcoerc": this.actor.update({ 'system.skills.will.resistcoerc.modifiers': newModList }); break;
      case "ritcraft": this.actor.update({ 'system.skills.will.ritcraft.modifiers': newModList }); break;

      case "archery": this.actor.update({ 'system.skills.dex.archery.modifiers': newModList }); break;
      case "athletics": this.actor.update({ 'system.skills.dex.athletics.modifiers': newModList }); break;
      case "crossbow": this.actor.update({ 'system.skills.dex.crossbow.modifiers': newModList }); break;
      case "sleight": this.actor.update({ 'system.skills.dex.sleight.modifiers': newModList }); break;
      case "stealth": this.actor.update({ 'system.skills.dex.stealth.modifiers': newModList }); break;

      case "alchemy": this.actor.update({ 'system.skills.cra.alchemy.modifiers': newModList }); break;
      case "crafting": this.actor.update({ 'system.skills.cra.crafting.modifiers': newModList }); break;
      case "disguise": this.actor.update({ 'system.skills.cra.disguise.modifiers': newModList }); break;
      case "firstaid": this.actor.update({ 'system.skills.cra.firstaid.modifiers': newModList }); break;
      case "forgery": this.actor.update({ 'system.skills.cra.forgery.modifiers': newModList }); break;
      case "picklock": this.actor.update({ 'system.skills.cra.picklock.modifiers': newModList }); break;
      case "trapcraft": this.actor.update({ 'system.skills.cra.trapcraft.modifiers': newModList }); break;

      case "physique": this.actor.update({ 'system.skills.body.physique.modifiers': newModList }); break;
      case "endurance": this.actor.update({ 'system.skills.body.endurance.modifiers': newModList }); break;

      case "charisma": this.actor.update({ 'system.skills.emp.charisma.modifiers': newModList }); break;
      case "deceit": this.actor.update({ 'system.skills.emp.deceit.modifiers': newModList }); break;
      case "finearts": this.actor.update({ 'system.skills.emp.finearts.modifiers': newModList }); break;
      case "gambling": this.actor.update({ 'system.skills.emp.gambling.modifiers': newModList }); break;
      case "grooming": this.actor.update({ 'system.skills.emp.grooming.modifiers': newModList }); break;
      case "perception": this.actor.update({ 'system.skills.emp.perception.modifiers': newModList }); break;
      case "leadership": this.actor.update({ 'system.skills.emp.leadership.modifiers': newModList }); break;
      case "persuasion": this.actor.update({ 'system.skills.emp.persuasion.modifiers': newModList }); break;
      case "performance": this.actor.update({ 'system.skills.emp.performance.modifiers': newModList }); break;
      case "seduction": this.actor.update({ 'system.skills.emp.seduction.modifiers': newModList }); break;
    }
  }

  async _onModifierRemove(event) {
    event.preventDefault();
    let stat = event.currentTarget.closest(".stat-display").dataset.stat;
    let type = event.currentTarget.closest(".stat-display").dataset.type;
    let prevModList = []
    if (type == "coreStat") {
      prevModList = this.actor.system.coreStats[stat].modifiers;
    } else if (type == "derivedStat") {
      prevModList = this.actor.system.derivedStats[stat].modifiers;
    } else if (type == "reputation") {
      prevModList = this.actor.system.reputation.modifiers;
    } else {
      prevModList = this.actor.system.stats[stat].modifiers;
    }
    const newModList = Object.values(prevModList).map((details) => details);
    const idxToRm = newModList.findIndex((v) => v.id === event.target.dataset.id);
    newModList.splice(idxToRm, 1);
    switch (stat) {
      case "int": this.actor.update({ 'system.stats.int.modifiers': newModList }); break;
      case "ref": this.actor.update({ 'system.stats.ref.modifiers': newModList }); break;
      case "dex": this.actor.update({ 'system.stats.dex.modifiers': newModList }); break;
      case "body": this.actor.update({ 'system.stats.body.modifiers': newModList }); break;
      case "spd": this.actor.update({ 'system.stats.spd.modifiers': newModList }); break;
      case "emp": this.actor.update({ 'system.stats.emp.modifiers': newModList }); break;
      case "cra": this.actor.update({ 'system.stats.cra.modifiers': newModList }); break;
      case "will": this.actor.update({ 'system.stats.will.modifiers': newModList }); break;
      case "luck": this.actor.update({ 'system.stats.luck.modifiers': newModList }); break;
      case "stun": this.actor.update({ 'system.coreStats.stun.modifiers': newModList }); break;
      case "run": this.actor.update({ 'system.coreStats.run.modifiers': newModList }); break;
      case "leap": this.actor.update({ 'system.coreStats.leap.modifiers': newModList }); break;
      case "enc": this.actor.update({ 'system.coreStats.enc.modifiers': newModList }); break;
      case "rec": this.actor.update({ 'system.coreStats.rec.modifiers': newModList }); break;
      case "woundTreshold": this.actor.update({ 'system.coreStats.woundTreshold.modifiers': newModList }); break;
      case "hp": this.actor.update({ 'system.derivedStats.hp.modifiers': newModList }); break;
      case "sta": this.actor.update({ 'system.derivedStats.sta.modifiers': newModList }); break;
      case "resolve": this.actor.update({ 'system.derivedStats.resolve.modifiers': newModList }); break;
      case "focus": this.actor.update({ 'system.derivedStats.focus.modifiers': newModList }); break;
      case "reputation": this.actor.update({ 'system.reputation.modifiers': newModList }); break;
    }
    updateDerived(this.actor);
  }

  async _onCritRemove(event) {
    event.preventDefault();
    const prevCritList = this.actor.system.critWounds;
    const newCritList = Object.values(prevCritList).map((details) => details);
    const idxToRm = newCritList.findIndex((v) => v.id === event.target.dataset.id);
    newCritList.splice(idxToRm, 1);
    this.actor.update({ "system.critWounds": newCritList });
  }

  async _onItemAdd(event) {
    let element = event.currentTarget
    let itemData = {
      name: `new ${element.dataset.itemtype}`,
      type: element.dataset.itemtype
    }

    switch (element.dataset.spelltype) {
      case "spellNovice":
        itemData.system = { class: "Spells", level: "novice" }
        break;
      case "spellJourneyman":
        itemData.system = { class: "Spells", level: "journeyman" }
        break;
      case "spellMaster":
        itemData.system = { class: "Spells", level: "master" }
        break;
      case "rituals":
        itemData.system = { class: "Rituals" }
        break;
      case "hexes":
        itemData.system = { class: "Hexes" }
        break;
      case "magicalgift":
        itemData.system = { class: "MagicalGift" }
        break;
    }

    if (element.dataset.itemtype == "component") {
      if (element.dataset.subtype == "alchemical") {
        itemData.system = { type: element.dataset.subtype }
      } else if (element.dataset.subtype) {
        itemData.system = { type: "substances", substanceType: element.dataset.subtype }
      } else {
        itemData.system = { type: "component", substanceType: element.dataset.subtype }
      }
    }

    if (element.dataset.itemtype == "valuable") {
      itemData.system = { type: "genera" };
    }

    if (element.dataset.itemtype == "diagram") {
      itemData.system = { type: "alchemical", level: "novice", isFormulae: true };
    }

    await Item.create(itemData, { parent: this.actor })
  }

  async _onAddActiveEffect() {
    let itemData = {
      name: `new effect`,
      type: "effect"
    }
    await Item.create(itemData, { parent: this.actor })
  }

  async _alchemyCraft(event) {
    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    let content = `<label>${game.i18n.localize("WITCHER.Dialog.Crafting")} ${item.name}</label> <br />`;

    let messageData = {
      speaker: this.actor.getSpeaker(),
      flavor: `<h1>Crafting</h1>`,
    }

    let areCraftComponentsEnough = true;

    content += `<div class="components-display">`
    let alchemyCraftComponents = item.populateAlchemyCraftComponentsList();
    alchemyCraftComponents
      .filter(a => a.quantity > 0)
      .forEach(a => {
        content += `<div class="flex">${a.content}</div>`

        let ownedSubstance = this.actor.getSubstance(a.name)
        let ownedSubstanceCount = ownedSubstance.sum("quantity")
        if (ownedSubstanceCount < Number(a.quantity)) {
          let missing = a.quantity - ownedSubstanceCount
          content += `<span class="error-display">${game.i18n.localize("WITCHER.Dialog.NoComponents")}: ${missing} ${a.alias}</span><br />`
          areCraftComponentsEnough = false
        }
      });
    content += `</div>`

    content += `<label>${game.i18n.localize("WITCHER.Dialog.CraftingDiagram")}: <input type="checkbox" name="hasDiagram"></label> <br />`
    content += `<label>${game.i18n.localize("WITCHER.Dialog.RealCrafting")}: <input type="checkbox" name="realCraft"></label> <br />`

    new Dialog({
      title: `${game.i18n.localize("WITCHER.Dialog.AlchemyTitle")}`,
      content,
      buttons: {
        Craft: {
          label: `${game.i18n.localize("WITCHER.Dialog.ButtonCraft")}`,
          callback: async html => {
            let stat = this.actor.system.stats.cra.current;
            let statName = game.i18n.localize(this.actor.system.stats.cra.label);
            let skill = this.actor.system.skills.cra.alchemy.value;
            let skillName = game.i18n.localize(this.actor.system.skills.cra.alchemy.label);
            let hasDiagram = html.find("[name=hasDiagram]").prop("checked");
            let realCraft = html.find("[name=realCraft]").prop("checked");
            skillName = skillName.replace(" (2)", "");
            messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.CraftingAlchemycal")}</h1>`,
              messageData.flavor += `<label>${game.i18n.localize("WITCHER.Dialog.Crafting")}:</label> <b>${item.name}</b> <br />`,
              messageData.flavor += `<label>${game.i18n.localize("WITCHER.Dialog.after")}:</label> <b>${item.system.craftingTime}</b> <br />`,
              messageData.flavor += `${game.i18n.localize("WITCHER.Diagram.alchemyDC")} ${item.system.alchemyDC}`;

            if (!item.isAlchemicalCraft()) {
              stat = this.actor.system.stats.cra.current;
              skill = this.actor.system.skills.cra.crafting.value;
              messageData.flavor = `${game.i18n.localize("WITCHER.Diagram.craftingDC")} ${item.system.craftingDC}`;
            }

            let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${statName}]+${skill}[${skillName}]`;

            if (hasDiagram) {
              rollFormula += !displayRollDetails ? `+2` : `+2[${game.i18n.localize("WITCHER.Dialog.Diagram")}]`
            }

            rollFormula = addModifiers(this.actor.system.skills.cra.alchemy.modifiers, rollFormula)

            let config = new RollConfig();
            config.showCrit = true
            config.showSuccess = true
            config.threshold = item.system.alchemyDC
            config.thresholdDesc = skillName
            config.messageOnSuccess = game.i18n.localize("WITCHER.craft.ItemsSuccessfullyCrafted")
            config.messageOnFailure = game.i18n.localize("WITCHER.craft.ItemsNotCrafted")

            if (realCraft) {
              if (areCraftComponentsEnough) {
                item.realCraft(rollFormula, messageData, config);
              } else {
                return ui.notifications.error(game.i18n.localize("WITCHER.Dialog.NoComponents") + " " + item.system.associatedItem.name)
              }
            } else {
              // Craft without automatic removal components and without real crafting of an item
              await extendedRoll(rollFormula, messageData, config)
            }
          }
        }
      }
    }).render(true)
  }

  async _craftinCraft(event) {
    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    let content = `<label>${game.i18n.localize("WITCHER.Dialog.Crafting")} ${item.name}</label> <br />`;

    let messageData = {
      speaker: this.actor.getSpeaker(),
      flavor: `<h1>Crafting</h1>`,
    }

    let areCraftComponentsEnough = true;
    content += `<div class="components-display">`
    item.system.craftingComponents.forEach(element => {
      content += `<div class="flex"><b>${element.name}</b>(${element.quantity}) </div>`
      let ownedComponent = this.actor.findNeededComponent(element.name);
      let componentQuantity = ownedComponent.sum("quantity");
      if (componentQuantity < Number(element.quantity)) {
        let missing = element.quantity - Number(componentQuantity)
        areCraftComponentsEnough = false;
        content += `<span class="error-display">${game.i18n.localize("WITCHER.Dialog.NoComponents")}: ${missing} ${element.name}</span><br />`
      }
    });
    content += `</div>`

    content += `<label>${game.i18n.localize("WITCHER.Dialog.CraftingDiagram")}: <input type="checkbox" name="hasDiagram"></label> <br />`
    content += `<label>${game.i18n.localize("WITCHER.Dialog.RealCrafting")}: <input type="checkbox" name="realCraft"></label> <br />`

    new Dialog({
      title: `${game.i18n.localize("WITCHER.Dialog.CraftingTitle")}`,
      content,
      buttons: {
        Craft: {
          label: `${game.i18n.localize("WITCHER.Dialog.ButtonCraft")}`,
          callback: async html => {
            let stat = this.actor.system.stats.cra.current;
            let statName = game.i18n.localize(this.actor.system.stats.cra.label);
            let skill = this.actor.system.skills.cra.crafting.value;
            let skillName = game.i18n.localize(this.actor.system.skills.cra.crafting.label);
            let hasDiagram = html.find("[name=hasDiagram]").prop("checked");
            let realCraft = html.find("[name=realCraft]").prop("checked");
            skillName = skillName.replace(" (2)", "");
            messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.CraftingItem")}</h1>`,
              messageData.flavor += `<label>${game.i18n.localize("WITCHER.Dialog.Crafting")}:</label> <b>${item.name}</b> <br />`,
              messageData.flavor += `<label>${game.i18n.localize("WITCHER.Dialog.after")}:</label> <b>${item.system.craftingTime}</b> <br />`,
              messageData.flavor += `${game.i18n.localize("WITCHER.Diagram.craftingDC")} ${item.system.craftingDC}`;

            let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${statName}]+${skill}[${skillName}]`;

            if (hasDiagram) {
              rollFormula += !displayRollDetails ? `+2` : `+2[${game.i18n.localize("WITCHER.Dialog.Diagram")}]`
            }

            rollFormula = addModifiers(this.actor.system.skills.cra.crafting.modifiers, rollFormula)

            let config = new RollConfig();
            config.showCrit = true
            config.showSuccess = true
            config.threshold = item.system.craftingDC
            config.thresholdDesc = skillName
            config.messageOnSuccess = game.i18n.localize("WITCHER.craft.ItemsSuccessfullyCrafted")
            config.messageOnFailure = game.i18n.localize("WITCHER.craft.ItemsNotCrafted")

            if (realCraft) {
              if (areCraftComponentsEnough) {
                item.realCraft(rollFormula, messageData, config);
              } else {
                return ui.notifications.error(game.i18n.localize("WITCHER.Dialog.NoComponents") + " " + item.system.associatedItem.name)
              }
            } else {
              // Craft without automatic removal components and without real crafting of an item
              await extendedRoll(rollFormula, messageData, config)
            }
          }
        }
      }
    }).render(true)
  }

  async _onSpellRoll(event, itemId = null) {

    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

    if (!itemId) {
      itemId = event.currentTarget.closest(".item").dataset.itemId;
    }
    let spellItem = this.actor.items.get(itemId);
    let rollFormula = `1d10`
    rollFormula += !displayRollDetails ? `+${this.actor.system.stats.will.current}` : `+${this.actor.system.stats.will.current}[${game.i18n.localize("WITCHER.StWill")}]`;
    switch (spellItem.system.class) {
      case "Witcher":
      case "Invocations":
      case "Spells":
        rollFormula += !displayRollDetails ? `+${this.actor.system.skills.will.spellcast.value}` : `+${this.actor.system.skills.will.spellcast.value}[${game.i18n.localize("WITCHER.SkWillSpellcastLable")}]`;
        break;
      case "Rituals":
        rollFormula += !displayRollDetails ? `+${this.actor.system.skills.will.ritcraft.value}` : `+${this.actor.system.skills.will.ritcraft.value}[${game.i18n.localize("WITCHER.SkWillRitCraftLable")}]`;
        break;
      case "Hexes":
        rollFormula += !displayRollDetails ? `+${this.actor.system.skills.will.hexweave.value}` : `+${this.actor.system.skills.will.hexweave.value}[${game.i18n.localize("WITCHER.SkWillHexLable")}]`;
        break;
    }
    let staCostTotal = spellItem.system.stamina;
    let customModifier = 0;
    let isExtraAttack = false
    let content = `<label>${game.i18n.localize("WITCHER.Dialog.attackExtra")}: <input type="checkbox" name="isExtraAttack"></label> <br />`
    if (spellItem.system.staminaIsVar) {
      content += `${game.i18n.localize("WITCHER.Spell.staminaDialog")}<input class="small" name="staCost" value=1> <br />`
    }

    let focusOptions = `<option value="0"> </option>`
    let secondFocusOptions = `<option value="0" selected> </option>`

    let useFocus = false
    if (this.actor.system.focus1.value > 0) {
      focusOptions += `<option value="${this.actor.system.focus1.value}" selected> ${this.actor.system.focus1.name} (${this.actor.system.focus1.value}) </option>`;
      secondFocusOptions += `<option value="${this.actor.system.focus1.value}"> ${this.actor.system.focus1.name} (${this.actor.system.focus1.value}) </option>`;
      useFocus = true
    }
    if (this.actor.system.focus2.value > 0) {
      focusOptions += `<option value="${this.actor.system.focus2.value}"> ${this.actor.system.focus2.name} (${this.actor.system.focus2.value}) </option>`;
      secondFocusOptions += `<option value="${this.actor.system.focus2.value}"> ${this.actor.system.focus2.name} (${this.actor.system.focus2.value}) </option>`;
      useFocus = true
    }
    if (this.actor.system.focus3.value > 0) {
      focusOptions += `<option value="${this.actor.system.focus3.value}"> ${this.actor.system.focus3.name} (${this.actor.system.focus3.value}) </option>`;
      secondFocusOptions += `<option value="${this.actor.system.focus3.value}"> ${this.actor.system.focus3.name} (${this.actor.system.focus3.value}) </option>`;
      useFocus = true
    }
    if (this.actor.system.focus4.value > 0) {
      focusOptions += `<option value="${this.actor.system.focus4.value}"> ${this.actor.system.focus4.name} (${this.actor.system.focus4.value}) </option>`;
      secondFocusOptions += `<option value="${this.actor.system.focus4.value}"> ${this.actor.system.focus4.name} (${this.actor.system.focus4.value}) </option>`;
      useFocus = true
    }

    if (useFocus) {
      content += ` <label>${game.i18n.localize("WITCHER.Spell.ChooseFocus")}: <select name="focus">${focusOptions}</select></label> <br />`
      content += ` <label>${game.i18n.localize("WITCHER.Spell.ChooseExpandedFocus")}: <select name="secondFocus">${secondFocusOptions}</select></label> <br />`
    }
    content += `<label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input class="small" name="customMod" value=0></label> <br /><br />`;
    let cancel = true
    let focusValue = 0
    let secondFocusValue = 0

    let dialogData = {
      buttons: [
        [`${game.i18n.localize("WITCHER.Button.Continue")}`, (html) => {
          if (spellItem.system.staminaIsVar) {
            staCostTotal = html.find("[name=staCost]")[0].value;
          }
          customModifier = html.find("[name=customMod]")[0].value;
          isExtraAttack = html.find("[name=isExtraAttack]").prop("checked");
          if (html.find("[name=focus]")[0]) {
            focusValue = html.find("[name=focus]")[0].value;
          }
          if (html.find("[name=secondFocus]")[0]) {
            secondFocusValue = html.find("[name=secondFocus]")[0].value;
          }
          cancel = false
        }]],
      title: game.i18n.localize("WITCHER.Spell.MagicCost"),
      content: content
    }
    await buttonDialog(dialogData)
    if (cancel) {
      return
    }
    let origStaCost = staCostTotal
    let newSta = this.actor.system.derivedStats.sta.value

    staCostTotal -= Number(focusValue) + Number(secondFocusValue)
    if (isExtraAttack) {
      staCostTotal += 3
    }

    let useMinimalStaCost = false
    if (staCostTotal < 1) {
      useMinimalStaCost = true
      staCostTotal = 1
    }

    newSta -= staCostTotal

    if (newSta < 0) {
      return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
    }

    this.actor.update({
      'system.derivedStats.sta.value': newSta
    });

    //todo check whether we need to spent 1 STA even if focus value > STA cost
    let staCostdisplay = `${origStaCost}[${game.i18n.localize("WITCHER.Spell.Short.StaCost")}]`

    if (isExtraAttack) {
      staCostdisplay += ` + 3[${game.i18n.localize("WITCHER.Dialog.attackExtra")}]`
    }

    staCostdisplay += ` - ${Number(focusValue) + Number(secondFocusValue)}[${game.i18n.localize("WITCHER.Actor.DerStat.Focus")}]`
    staCostdisplay += ` =  ${staCostTotal}`
    if (useMinimalStaCost) {
      staCostdisplay += `[${game.i18n.localize("WITCHER.MinValue")}]`
    }

    if (customModifier < 0) { rollFormula += !displayRollDetails ? `${customModifier}` : `${customModifier}[${game.i18n.localize("WITCHER.Settings.Custom")}]` }
    if (customModifier > 0) { rollFormula += !displayRollDetails ? `+${customModifier}` : `+${customModifier}[${game.i18n.localize("WITCHER.Settings.Custom")}]` }
    if (isExtraAttack) { rollFormula += !displayRollDetails ? `-3` : `-3[${game.i18n.localize("WITCHER.Dialog.attackExtra")}]` }

    let spellSource = ''
    switch (spellItem.system.source) {
      case "mixedElements": spellSource = "WITCHER.Spell.Mixed"; break;
      case "earth": spellSource = "WITCHER.Spell.Earth"; break;
      case "air": spellSource = "WITCHER.Spell.Air"; break;
      case "fire": spellSource = "WITCHER.Spell.Fire"; break;
      case "Water": spellSource = "WITCHER.Spell.Water"; break;
    }

    let messageData = {
      speaker: this.actor.getSpeaker(),
      flags: spellItem.getSpellFlags(),
      flavor: `<h2><img src="${spellItem.img}" class="item-img" />${spellItem.name}</h2>
          <div><b>${game.i18n.localize("WITCHER.Spell.StaCost")}: </b>${staCostdisplay}</div>
          <div><b>${game.i18n.localize("WITCHER.Mutagen.Source")}: </b>${game.i18n.localize(spellSource)}</div>
          <div><b>${game.i18n.localize("WITCHER.Spell.Effect")}: </b>${spellItem.system.effect}</div>`
    }
    if (spellItem.system.range) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Range")}: </b>${spellItem.system.range}</div>`
    }
    if (spellItem.system.duration) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Duration")}: </b>${spellItem.system.duration}</div>`
    }
    if (spellItem.system.defence) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Defence")}: </b>${spellItem.system.defence}</div>`
    }
    if (spellItem.system.preparationTime) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.PrepTime")}: </b>${spellItem.system.preparationTime}</div>`
    }
    if (spellItem.system.dificultyCheck) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.DC")}: </b>${spellItem.system.dificultyCheck}</div>`
    }
    if (spellItem.system.components) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Components")}: </b>${spellItem.system.components}</div>`
    }
    if (spellItem.system.alternateComponents) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.AlternateComponents")}: </b>${spellItem.system.alternateComponents}</div>`
    }
    if (spellItem.system.liftRequirement) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Requirements")}: </b>${spellItem.system.liftRequirement}</div>`
    }

    if (spellItem.system.causeDamages) {
      let effects = JSON.stringify(spellItem.system.effects)
      let locationJSON = JSON.stringify(this.actor.getLocationObject("randomSpell"))

      let dmg = spellItem.system.damage || "0"
      messageData.flavor += `<button class="damage" data-img="${spellItem.img}" data-name="${spellItem.name}" data-dmg="${dmg}" data-location='${locationJSON}' data-effects='${effects}'>${game.i18n.localize("WITCHER.table.Damage")}</button>`;
    }

    let config = new RollConfig()
    config.showCrit = true
    await extendedRoll(rollFormula, messageData, config)

    let token = this.actor.getControlledToken();

    await spellItem.createSpellVisualEffectIfApplicable(token);
    await spellItem.deleteSpellVisualEffect();
  }

  async _onProfessionRoll(event) {
    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
    let stat = event.currentTarget.closest(".profession-display").dataset.stat;
    let level = event.currentTarget.closest(".profession-display").dataset.level;
    let name = event.currentTarget.closest(".profession-display").dataset.name;
    let effet = event.currentTarget.closest(".profession-display").dataset.effet;
    let statValue = 0
    let statName = 0
    switch (stat) {
      case "int":
        statValue = this.actor.system.stats.int.current;
        statName = "WITCHER.StInt";
        break;
      case "ref":
        statValue = this.actor.system.stats.ref.current;
        statName = "WITCHER.StRef";
        break;
      case "dex":
        statValue = this.actor.system.stats.dex.current;
        statName = "WITCHER.StDex";
        break;
      case "body":
        statValue = this.actor.system.stats.body.current;
        statName = "WITCHER.StBody";
        break;
      case "spd":
        statValue = this.actor.system.stats.spd.current;
        statName = "WITCHER.StSpd";
        break;
      case "emp":
        statValue = this.actor.system.stats.emp.current;
        statName = "WITCHER.StEmp";
        break;
      case "cra":
        statValue = this.actor.system.stats.cra.current;
        statName = "WITCHER.StCra";
        break;
      case "will":
        statValue = this.actor.system.stats.will.current;
        statName = "WITCHER.StWill";
        break;
      case "luck":
        statValue = this.actor.system.stats.int.current;
        statName = "WITCHER.StLuck";
        break;
    }
    let rollFormula = !displayRollDetails ? `1d10+${statValue}+${level}` : `1d10+${statValue}[${game.i18n.localize(statName)}]+${level}[${name}]`;
    new Dialog({
      title: `${game.i18n.localize("WITCHER.Dialog.profession.skill")}: ${name}`,
      content: `<label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input name="customModifiers" value=0></label>`,
      buttons: {
        continue: {
          label: game.i18n.localize("WITCHER.Button.Continue"),
          callback: async html => {
            let customAtt = html.find("[name=customModifiers]")[0].value;
            if (customAtt < 0) {
              rollFormula += !displayRollDetails ? `${customAtt}` : `${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
            }
            if (customAtt > 0) {
              rollFormula += !displayRollDetails ? `+${customAtt}` : `+${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
            }

            let messageData = {
              speaker: this.actor.getSpeaker(),
              flavor: `<h2>${name}</h2>${effet}`
            }

            let config = new RollConfig()
            config.showCrit = true
            await extendedRoll(rollFormula, messageData, config)
          }
        }
      }
    }).render(true)
  }

  async _onInitRoll(event) {
    this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true })
  }

  async _onCritRoll(event) {
    let rollResult = await new Roll("1d10x10").evaluate({ async: true })
    let messageData = {
      speaker: this.actor.getSpeaker()
    }
    rollResult.toMessage(messageData)
  }

  async _onDeathSaveRoll(event) {
    let stunBase = Math.floor((this.actor.system.stats.body.max + this.actor.system.stats.will.max) / 2);
    if (this.actor.system.derivedStats.hp.value > 0) {
      stunBase = this.actor.system.coreStats.stun.current
    }
    if (stunBase > 10) {
      stunBase = 10;
    }
    stunBase -= this.actor.system.deathSaves

    let messageData = {
      speaker: this.actor.getSpeaker(),
      flavor: `
        <h2>${game.i18n.localize("WITCHER.DeathSave")}</h2>
        <div class="roll-summary">
            <div class="dice-formula">${game.i18n.localize("WITCHER.Chat.SaveText")} <b>${stunBase}</b></div>
        </div>
        <hr />`
    }

    let config = new RollConfig()
    config.reversal = true
    config.showSuccess = true
    config.threshold = stunBase

    await extendedRoll(`1d10`, messageData, config)
  }

  async _onDefenceRoll(event) {
    ExecuteDefence(this.actor)
  }

  async _onReputation(event) {
    let dialogTemplate = `
      <h1>${game.i18n.localize("WITCHER.Reputation")}</h1>`;
    if (this.actor.system.reputation.modifiers.length > 0) {
      dialogTemplate += `<label>${game.i18n.localize("WITCHER.Apply.Mod")}</label>`;
      this.actor.system.reputation.modifiers.forEach(mod => dialogTemplate += `<div><input id="${mod.name.replace(/\s/g, '')}" type="checkbox" unchecked/> ${mod.name}(${mod.value})</div>`)
    }
    new Dialog({
      title: game.i18n.localize("WITCHER.ReputationTitle"),
      content: dialogTemplate,
      buttons: {
        t1: {
          label: `${game.i18n.localize("WITCHER.ReputationButton.Save")}`,
          callback: (async html => {
            let statValue = this.actor.system.reputation.max

            this.actor.system.reputation.modifiers.forEach(mod => {
              const noSpacesName = mod.name.replace(/\s/g, '')
              if (html.find(`#${noSpacesName}`)[0].checked) {
                statValue += Number(mod.value)
              }
            });

            let messageData = { speaker: this.actor.getSpeaker() }
            messageData.flavor = `
              <h2>${game.i18n.localize("WITCHER.ReputationTitle")}: ${game.i18n.localize("WITCHER.ReputationSave.Title")}</h2>
              <div class="roll-summary">
                <div class="dice-formula">${game.i18n.localize("WITCHER.Chat.SaveText")}: <b>${statValue}</b></div>
              </div>
              <hr />`

            let config = new RollConfig()
            config.showSuccess = true
            config.reversal = true
            config.threshold = statValue

            await extendedRoll(`1d10`, messageData, config)
          })
        },
        t2: {
          label: `${game.i18n.localize("WITCHER.ReputationButton.FaceDown")}`,
          callback: (async html => {
            let repValue = this.actor.system.reputation.max

            this.actor.system.reputation.modifiers.forEach(mod => {
              const noSpacesName = mod.name.replace(/\s/g, '')
              if (html.find(`#${noSpacesName}`)[0].checked) {
                repValue += Number(mod.value)
              }
            });

            let messageData = { speaker: this.actor.getSpeaker() }
            let rollFormula = `1d10 + ${Number(repValue)}[${game.i18n.localize("WITCHER.Reputation")}] + ${Number(this.actor.system.stats.will.current)}[${game.i18n.localize("WITCHER.StWill")}]`
            messageData.flavor = `
              <h2>${game.i18n.localize("WITCHER.ReputationTitle")}: ${game.i18n.localize("WITCHER.ReputationFaceDown.Title")}</h2>
              <div class="roll-summary">
                <div class="dice-formula">${game.i18n.localize("WITCHER.context.Result")}: <b>${rollFormula}</b></div>
              </div>
              <hr />`

            await extendedRoll(rollFormula, messageData, new RollConfig())
          })
        }
      }
    }).render(true);
  }

  async _onHeal() {
    let dialogTemplate = `
      <h1>${game.i18n.localize("WITCHER.Heal.title")}</h1>
      <div class="flex">
        <div>
          <div><input id="R" type="checkbox" unchecked/> ${game.i18n.localize("WITCHER.Heal.resting")}</div>
          <div><input id="SF" type="checkbox" unchecked/> ${game.i18n.localize("WITCHER.Heal.sterilized")}</div>
        </div>
        <div>
          <div><input id="HH" type="checkbox" unchecked/> ${game.i18n.localize("WITCHER.Heal.healinghand")}</div>
            <div><input id="HT" type="checkbox" unchecked/> ${game.i18n.localize("WITCHER.Heal.healingTent")}</div>
        </div>
      </div>`;
    new Dialog({
      title: game.i18n.localize("WITCHER.Heal.dialogTitle"),
      content: dialogTemplate,
      buttons: {
        t1: {
          label: game.i18n.localize("WITCHER.Heal.button"),
          callback: async (html) => {
            let rested = html.find("#R")[0].checked;
            let sterFluid = html.find("#SF")[0].checked;
            let healHand = html.find("#HH")[0].checked;
            let healTent = html.find("#HT")[0].checked;

            let actor = this.actor;
            let rec = actor.system.coreStats.rec.current;
            let curHealth = actor.system.derivedStats.hp.value;
            let total_rec = 0;
            let maxHealth = actor.system.derivedStats.hp.max;
            //Calculate healed amount
            if (rested) {
              console.log("Spent Day Resting");
              total_rec += rec;
            }
            else {
              console.log("Spent Day Active");
              total_rec += Math.floor(rec / 2);
            }
            if (sterFluid) {
              console.log("Add Sterilising Fluid Bonus");
              total_rec += 2;
            }
            if (healHand) {
              console.log("Add Healing Hands Bonus");
              total_rec += 3;
            }
            if (healTent) {
              console.log("Add Healing Tent Bonus");
              total_rec += 2;
            }
            //Update actor health
            await actor.update({ "system.derivedStats.hp.value": Math.min(curHealth + total_rec, maxHealth) })
            setTimeout(() => {
              let newSTA = actor.system.derivedStats.sta.max;
              //Delay stamina refill to allow actor sheet to update max STA value if previously Seriously Wounded or in Death State, otherwise it would refill to the weakened max STA value
              actor.update({ "system.derivedStats.sta.value": newSTA });
            }, 400);

            ui.notifications.info(`${actor.name} ${game.i18n.localize("WITCHER.Heal.recovered")} ${rested ? game.i18n.localize("WITCHER.Heal.restful") : game.i18n.localize("WITCHER.Heal.active")} ${game.i18n.localize("WITCHER.Heal.day")}`)

            //Remove add one day for each Crit wound and removes it if equals to max days.
            const critList = Object.values(this.actor.system.critWounds).map((details) => details);
            let newCritList = []
            critList.forEach(crit => {
              crit.daysHealed += 1
              if (crit.healingTime <= 0 || crit.daysHealed < crit.healingTime) {
                newCritList.push(crit)
              }
            });
            this.actor.update({ "system.critWounds": newCritList });
          }
        },
        t2: {
          label: `${game.i18n.localize("WITCHER.Button.Cancel")}`,
        }
      },
    }).render(true);
  }

  async _onVerbalCombat() {
    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
    const dialogTemplate = await renderTemplate("systems/TheWitcherTRPG/templates/sheets/verbal-combat.html");
    new Dialog({
      title: game.i18n.localize("WITCHER.verbalCombat.DialogTitle"),
      content: dialogTemplate,
      buttons: {
        t1: {
          label: "Roll",
          callback: async (html) => {
            let verbal = document.querySelector('input[name="verbalCombat"]:checked').value;
            console.log(verbal)
            let vcName;
            let vcStatName;
            let vcStat;
            let vcSkillName;
            let vcSkill;
            let vcDmg;
            let effect;
            let modifiers;
            switch (verbal) {
              case "Seduce":
                vcName = "WITCHER.verbalCombat.Seduce";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpSeduction";
                vcSkill = this.actor.system.skills.emp.seduction.value;
                modifiers = this.actor.system.skills.emp.seduction.modifiers
                vcDmg = `1d6+${this.actor.system.stats.emp.current}[${game.i18n.localize(vcStatName)}]`
                effect = "WITCHER.verbalCombat.SeduceEffect"
                break;
              case "Persuade":
                vcName = "WITCHER.verbalCombat.Persuade";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpPersuasion";
                vcSkill = this.actor.system.skills.emp.persuasion.value;
                modifiers = this.actor.system.skills.emp.persuasion.modifiers;
                vcDmg = `1d6/2+${this.actor.system.stats.emp.current}[${game.i18n.localize(vcStatName)}]`
                effect = "WITCHER.verbalCombat.PersuadeEffect"
                break;
              case "Appeal":
                vcName = "WITCHER.verbalCombat.Appeal";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpLeadership";
                vcSkill = this.actor.system.skills.emp.leadership.value;
                modifiers = this.actor.system.skills.emp.leadership.modifiers;
                vcDmg = `1d10+${this.actor.system.stats.emp.current}[${game.i18n.localize(vcStatName)}]`
                effect = "WITCHER.verbalCombat.AppealEffect"
                break;
              case "Befriend":
                vcName = "WITCHER.verbalCombat.Befriend";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpCharisma";
                vcSkill = this.actor.system.skills.emp.charisma.value;
                modifiers = this.actor.system.skills.emp.charisma.modifiers;
                vcDmg = `1d6+${this.actor.system.stats.emp.current}[${game.i18n.localize(vcStatName)}]`
                effect = "WITCHER.verbalCombat.BefriendEffect"
                break;
              case "Deceive":
                vcName = "WITCHER.verbalCombat.Deceive";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpDeceit";
                vcSkill = this.actor.system.skills.emp.deceit.value;
                modifiers = this.actor.system.skills.emp.deceit.modifiers;
                vcDmg = `1d6+${this.actor.system.stats.int.current}[${game.i18n.localize("WITCHER.Actor.Stat.Int")}]`
                effect = "WITCHER.verbalCombat.DeceiveEffect"
                break;
              case "Ridicule":
                vcName = "WITCHER.verbalCombat.Ridicule";
                vcStatName = "WITCHER.Actor.Stat.Int";
                vcStat = this.actor.system.stats.int.current;
                vcSkillName = "WITCHER.SkIntSocialEt";
                vcSkill = this.actor.system.skills.int.socialetq.value;
                modifiers = this.actor.system.skills.int.socialetq.modifiers;
                vcDmg = `1d6+${this.actor.system.stats.will.current}[${game.i18n.localize("WITCHER.Actor.Stat.Will")}]`
                effect = "WITCHER.verbalCombat.RidiculeEffect"
                break;
              case "Intimidate":
                vcName = "WITCHER.verbalCombat.Intimidate";
                vcStatName = "WITCHER.Actor.Stat.Will";
                vcStat = this.actor.system.stats.will.current;
                vcSkillName = "WITCHER.SkWillIntim";
                vcSkill = this.actor.system.skills.will.intimidation.value;
                modifiers = this.actor.system.skills.will.intimidation.modifiers;
                vcDmg = `1d10+${this.actor.system.stats.will.current}[${game.i18n.localize("WITCHER.Actor.Stat.Will")}]`
                effect = "WITCHER.verbalCombat.IntimidateEffect"
                break;
              case "Ignore":
                vcName = "WITCHER.verbalCombat.Ignore";
                vcStatName = "WITCHER.Actor.Stat.Will";
                vcStat = this.actor.system.stats.will.current;
                vcSkillName = "WITCHER.SkWillResistCoer";
                vcSkill = this.actor.system.skills.will.resistcoerc.value;
                modifiers = [];
                vcDmg = `1d10+${this.actor.system.stats.emp.current}[${game.i18n.localize("WITCHER.Actor.Stat.Emp")}]`
                effect = "WITCHER.verbalCombat.None"
                break;
              case "Counterargue":
                vcName = "WITCHER.verbalCombat.Counterargue";
                vcStatName = "WITCHER.context.unavailable";
                vcStat = 0;
                vcSkillName = "WITCHER.context.unavailable";
                vcSkill = 0;
                modifiers = this.actor.system.skills.emp.persuasion.modifiers;
                vcDmg = `${game.i18n.localize("WITCHER.verbalCombat.CounterargueDmg")}`
                effect = "WITCHER.verbalCombat.CounterargueEffect"
                break;
              case "ChangeSubject":
                vcName = "WITCHER.verbalCombat.ChangeSubject";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpPersuasion";
                vcSkill = this.actor.system.skills.emp.persuasion.value;
                modifiers = this.actor.system.skills.emp.persuasion.modifiers;
                vcDmg = `1d6+${this.actor.system.stats.int.current}[${game.i18n.localize("WITCHER.Actor.Stat.Int")}]`
                effect = "WITCHER.verbalCombat.None"
                break;
              case "Disengage":
                vcName = "WITCHER.verbalCombat.Disengage";
                vcStatName = "WITCHER.Actor.Stat.Will";
                vcStat = this.actor.system.stats.will.current;
                vcSkillName = "WITCHER.SkWillResistCoer";
                vcSkill = this.actor.system.skills.will.resistcoerc.value;
                modifiers = this.actor.system.skills.will.resistcoerc.modifiers;
                vcDmg = game.i18n.localize("WITCHER.verbalCombat.None")
                effect = "WITCHER.verbalCombat.DisengageEffect"
                break;
              case "Romance":
                vcName = "WITCHER.verbalCombat.Romance";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpCharisma";
                vcSkill = this.actor.system.skills.emp.charisma.value;
                modifiers = this.actor.system.skills.emp.charisma.modifiers;
                vcDmg = game.i18n.localize("WITCHER.verbalCombat.None")
                effect = "WITCHER.verbalCombat.RomanceEffect"
                break;
              case "Study":
                vcName = "WITCHER.verbalCombat.Study";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpHumanPerc";
                vcSkill = this.actor.system.skills.emp.perception.value;
                modifiers = this.actor.system.skills.emp.perception.modifiers;
                vcDmg = game.i18n.localize("WITCHER.verbalCombat.None")
                effect = "WITCHER.verbalCombat.StudyEffect"
                break;
              case "ImplyPersuade":
                vcName = "WITCHER.verbalCombat.ImplyPersuade";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpPersuasion";
                vcSkill = this.actor.system.skills.emp.persuasion.value;
                modifiers = this.actor.system.skills.emp.persuasion.modifiers;
                vcDmg = game.i18n.localize("WITCHER.verbalCombat.None")
                effect = "WITCHER.verbalCombat.ImplyEffect"
                break;
              case "ImplyDeceit":
                vcName = "WITCHER.verbalCombat.ImplyDeceit";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpDeceit";
                vcSkill = this.actor.system.skills.emp.deceit.value;
                modifiers = this.actor.system.skills.emp.deceit.modifiers;
                vcDmg = game.i18n.localize("WITCHER.verbalCombat.None")
                effect = "WITCHER.verbalCombat.ImplyEffect"
                break;
              case "Bribe":
                vcName = "WITCHER.verbalCombat.Bribe";
                vcStatName = "WITCHER.Actor.Stat.Emp";
                vcStat = this.actor.system.stats.emp.current;
                vcSkillName = "WITCHER.SkEmpGambling";
                vcSkill = this.actor.system.skills.emp.gambling.value;
                modifiers = this.actor.system.skills.emp.gambling.modifiers;
                vcDmg = game.i18n.localize("WITCHER.verbalCombat.None")
                effect = "WITCHER.verbalCombat.BribeEffect"
                break;
            }
            let rollFormula = !displayRollDetails ? `1d10+${vcStat}+${vcSkill}` : `1d10+${vcStat}[${game.i18n.localize(vcStatName)}]+${vcSkill}[${game.i18n.localize(vcSkillName)}]`

            rollFormula = addModifiers(modifiers, rollFormula)

            let customAtt = html.find("[name=customModifiers]")[0].value;
            if (customAtt < 0) {
              rollFormula += !displayRollDetails ? `${customAtt}` : `${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
            }
            if (customAtt > 0) {
              rollFormula += !displayRollDetails ? `+${customAtt}` : `+${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
            }

            let messageData = { speaker: this.actor.getSpeaker() }
            messageData.flavor = `
              <h2>${game.i18n.localize("WITCHER.verbalCombat.Title")}: ${game.i18n.localize(vcName)}</h2>
              <b>${game.i18n.localize("WITCHER.Weapon.Damage")}</b>: ${vcDmg} <br />
              ${game.i18n.localize(effect)}
              <hr />`

            let config = new RollConfig()
            config.showCrit = true
            await extendedRoll(rollFormula, messageData, config)
          }
        },
        t2: {
          label: `${game.i18n.localize("WITCHER.Button.Cancel")}`,
        }
      },
    }).render(true);
  }

  async _onStatSaveRoll(event) {
    let stat = event.currentTarget.closest(".stat-display").dataset.stat;
    let statValue = 0
    let statName = 0
    switch (stat) {
      case "int":
        statValue = this.actor.system.stats.int.current;
        statName = "WITCHER.StInt";
        break;
      case "ref":
        statValue = this.actor.system.stats.ref.current;
        statName = "WITCHER.StRef";
        break;
      case "dex":
        statValue = this.actor.system.stats.dex.current;
        statName = "WITCHER.StDex";
        break;
      case "body":
        statValue = this.actor.system.stats.body.current;
        statName = "WITCHER.StBody";
        break;
      case "spd":
        statValue = this.actor.system.stats.spd.current;
        statName = "WITCHER.StSpd";
        break;
      case "emp":
        statValue = this.actor.system.stats.emp.current;
        statName = "WITCHER.StEmp";
        break;
      case "cra":
        statValue = this.actor.system.stats.cra.current;
        statName = "WITCHER.StCra";
        break;
      case "will":
        statValue = this.actor.system.stats.will.current;
        statName = "WITCHER.StWill";
        break;
      case "luck":
        statValue = this.actor.system.stats.luck.current;
        statName = "WITCHER.StLuck";
        break;
      case "reputation":
        statValue = this.actor.system.reputation.max;
        statName = "WITCHER.StReputation";
        break;
    }

    let messageData = { speaker: this.actor.getSpeaker() }
    messageData.flavor = `
      <h2>${game.i18n.localize(statName)}</h2>
      <div class="roll-summary">
          <div class="dice-formula">${game.i18n.localize("WITCHER.Chat.SaveText")} <b>${statValue}</b></div>
      </div>
      <hr />`

    let config = new RollConfig()
    config.showCrit = true
    config.showSuccess = true
    config.reversal = true
    config.threshold = statValue
    config.thresholdDesc = statName
    await extendedRoll(`1d10`, messageData, config)
  }

  _onHPChanged(event) {
    updateDerived(this.actor)
  }

  _onInlineEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    let field = element.dataset.field;
    // Edit checkbox values
    let value = element.value
    if (value == "false") {
      value = true
    }
    if (value == "true" || value == "checked") {
      value = false
    }

    return item.update({ [field]: value });
  }

  _onItemEdit(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    item.sheet.render(true)
  }

  async _onItemShow(event) {
    event.preventDefault;
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    new Dialog({
      title: item.name,
      content: `<img src="${item.img}" alt="${item.img}" width="100%" />`,
      buttons: {}
    }, {
      width: 520,
      resizable: true
    }).render(true);
  }

  async _onItemDelete(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    return await this.actor.items.get(itemId).delete();
  }

  async _onItemBuy(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    let coinOptions = `
      <option value="crown" selected> ${game.i18n.localize("WITCHER.Currency.crown")} </option>
      <option value="bizant"> ${game.i18n.localize("WITCHER.Currency.bizant")} </option>
      <option value="ducat"> ${game.i18n.localize("WITCHER.Currency.ducat")} </option>
      <option value="lintar"> ${game.i18n.localize("WITCHER.Currency.lintar")} </option>
      <option value="floren"> ${game.i18n.localize("WITCHER.Currency.floren")} </option>
      <option value="oren"> ${game.i18n.localize("WITCHER.Currency.oren")} </option>
      `;
    let percentOptions = `
      <option value="50">50%</option>
      <option value="100"selected>100%</option>
      <option value="125">125%</option>
      <option value="150">150%</option>
      <option value="175">175%</option>
      <option value="200">200%</option>
      `;

    let content = `
      <script>
        function calcTotalCost() {
          var qtyInput = document.getElementById("itemQty");
          var ItemCostInput = document.getElementById("custumCost");
          var costTotalInput = document.getElementById("costTotal");
          costTotalInput.value = ItemCostInput.value * qtyInput.value
        }
        function applyPercentage() {
          var qtyInput = document.getElementById("itemQty");
          var percentage = document.getElementById("percent");
          var ItemCostInput = document.getElementById("custumCost");
          ItemCostInput.value = Math.ceil(${item.system.cost} * (percentage.value / 100))

          var costTotalInput = document.getElementById("costTotal");
          costTotalInput.value = ItemCostInput.value * qtyInput.value
        }
      </script>

      <label>${game.i18n.localize("WITCHER.Loot.InitialCost")}: ${item.system.cost}</label><br />
      <label>${game.i18n.localize("WITCHER.Loot.HowMany")}: <input id="itemQty" onChange="calcTotalCost()" type="number" class="small" name="itemQty" value=1> /${item.system.quantity}</label> <br />
      <label>${game.i18n.localize("WITCHER.Loot.ItemCost")}</label> <input id="custumCost" onChange="calcTotalCost()" type="number" name="costPerItemValue" value=${item.system.cost}>${game.i18n.localize("WITCHER.Loot.Percent")}<select id="percent" onChange="applyPercentage()" name="percentage">${percentOptions}</select><br /><br />
      <label>${game.i18n.localize("WITCHER.Loot.TotalCost")}</label> <input id="costTotal" type="number" class="small" name="costTotalValue" value=${item.system.cost}> <select name="coinType">${coinOptions}</select><br />
      `
    let Characteroptions = `<option value="">other</option>`
    for (let actor of game.actors) {
      if (actor.testUserPermission(game.user, "OWNER")) {
        if (actor == game.user.character) {
          Characteroptions += `<option value="${actor._id}" selected>${actor.name}</option>`
        } else {
          Characteroptions += `<option value="${actor._id}">${actor.name}</option>`
        }
      };
    }
    content += `To Character : <select name="character">${Characteroptions}</select>`
    let cancel = true
    let numberOfItem = 0;
    let totalCost = 0;
    let characterId = "";
    let coinType = "";

    let dialogData = {
      buttons: [
        [`${game.i18n.localize("WITCHER.Button.Continue")}`, (html) => {
          numberOfItem = html.find("[name=itemQty]")[0].value;
          totalCost = html.find("[name=costTotalValue]")[0].value;
          coinType = html.find("[name=coinType]")[0].value;
          characterId = html.find("[name=character]")[0].value;
          cancel = false
        }]],
      title: game.i18n.localize("WITCHER.Loot.BuyTitle"),
      content: content
    }
    await buttonDialog(dialogData)
    if (cancel) {
      return
    }

    let buyerActor = game.actors.get(characterId)
    let token = buyerActor.token ?? buyerActor.getActiveTokens()[0]
    if (token) {
      buyerActor = token.actor
    }
    let hasEnoughMoney = true
    if (buyerActor) {
      hasEnoughMoney = buyerActor.system.currency[coinType] >= totalCost
    }

    if (!hasEnoughMoney) {
      ui.notifications.error("Not Enough Coins");
    } else {
      this._removeItem(this.actor, itemId, numberOfItem)
      if (buyerActor) {
        this._addItem(buyerActor, item, numberOfItem)
      }

      switch (coinType) {
        case "crown":
          if (buyerActor) { buyerActor.update({ 'system.currency.crown': buyerActor.system.currency[coinType] - totalCost }) }
          this.actor.update({ 'system.currency.crown': Number(this.actor.system.currency[coinType]) + Number(totalCost) })
          break;
        case "bizant":
          if (buyerActor) { buyerActor.update({ 'system.currency.bizant': buyerActor.system.currency[coinType] - totalCost }) }
          this.actor.update({ 'system.currency.crown': Number(this.actor.system.currency[coinType]) + Number(totalCost) })
          break;
        case "ducat":
          if (buyerActor) { buyerActor.update({ 'system.currency.ducat': buyerActor.system.currency[coinType] - totalCost }) }
          this.actor.update({ 'system.currency.crown': Number(this.actor.system.currency[coinType]) + Number(totalCost) })
          break;
        case "lintar":
          if (buyerActor) { buyerActor.update({ 'system.currency.lintar': buyerActor.system.currency[coinType] - totalCost }) }
          this.actor.update({ 'system.currency.crown': Number(this.actor.system.currency[coinType]) + Number(totalCost) })
          break;
        case "floren":
          if (buyerActor) { buyerActor.update({ 'system.currency.floren': buyerActor.system.currency[coinType] - totalCost }) }
          this.actor.update({ 'system.currency.crown': Number(this.actor.system.currency[coinType]) + Number(totalCost) })
          break;
        case "oren":
          if (buyerActor) { buyerActor.update({ 'system.currency.oren': buyerActor.system.currency[coinType] - totalCost }) }
          this.actor.update({ 'system.currency.crown': Number(this.actor.system.currency[coinType]) + Number(totalCost) })
          break;
      }
    }
  }

  _onItemHide(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    item.update({ "system.isHidden": !item.system.isHidden })
  }

  _onItemDisplayInfo(event) {
    event.preventDefault();
    let section = event.currentTarget.closest(".item");
    let editor = $(section).find(".item-info")
    editor.toggleClass("invisible");
  }

  _onFocusIn(event) {
    event.currentTarget.select();
  }

  async _onItemRoll(event, itemId = null) {
    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

    if (!itemId) {
      itemId = event.currentTarget.closest(".item").dataset.itemId;
    }
    let item = this.actor.items.get(itemId);
    let displayDmgFormula = `${item.system.damage}`
    let formula = !displayRollDetails ? `${item.system.damage}` : `${item.system.damage}[${game.i18n.localize("WITCHER.Diagram.Weapon")}]`

    let isMeleeAttack = item.doesWeaponNeedMeleeSkillToAttack();
    if (this.actor.type == "character" && isMeleeAttack) {
      if (this.actor.system.attackStats.meleeBonus < 0) {
        displayDmgFormula += `${this.actor.system.attackStats.meleeBonus}`
        formula += !displayRollDetails ? `${this.actor.system.attackStats.meleeBonus}` : `${this.actor.system.attackStats.meleeBonus}[${game.i18n.localize("WITCHER.Dialog.attackMeleeBonus")}]`
      }
      if (this.actor.system.attackStats.meleeBonus > 0) {
        displayDmgFormula += `+${this.actor.system.attackStats.meleeBonus}`
        formula += !displayRollDetails ? `+${this.actor.system.attackStats.meleeBonus}` : `+${this.actor.system.attackStats.meleeBonus}[${game.i18n.localize("WITCHER.Dialog.attackMeleeBonus")}]`
      }
    }

    let attackSkill = item.getItemAttackSkill();
    let messageData = {
      speaker: this.actor.getSpeaker(),
      flavor: `<h1> ${game.i18n.localize("WITCHER.Dialog.attack")}: ${item.name}</h1>`,
      flags: item.getAttackSkillFlags(),
    }

    let ammunitions = ``
    let noAmmo = 0
    let ammunitionOption = ``
    if (item.system.usingAmmo) {
      ammunitions = this.actor.items.filter(function (item) { return item.type == "weapon" && item.system.isAmmo });
      let quantity = ammunitions.sum("quantity")
      if (quantity <= 0) {
        noAmmo = 1;
      } else {
        ammunitions.forEach(element => {
          ammunitionOption += `<option value="${element._id}"> ${element.name}(${element.system.quantity}) </option>`;
        });
      }
    }

    let noThrowable = !this.actor.isEnoughThrowableWeapon(item)
    let Mymelebonus = this.actor.system.attackStats.meleeBonus
    let data = { item, attackSkill, displayDmgFormula, isMeleeAttack, noAmmo, noThrowable, ammunitionOption, ammunitions, Mymelebonus }
    const myDialogOptions = { width: 500 }
    const dialogTemplate = await renderTemplate("systems/TheWitcherTRPG/templates/sheets/weapon-attack.html", data)

    new Dialog({
      title: `${game.i18n.localize("WITCHER.Dialog.attackWith")}: ${item.name}`,
      content: dialogTemplate,
      buttons: {
        Roll: {
          label: `${game.i18n.localize("WITCHER.Dialog.ButtonRoll")}`,
          callback: async html => {
            let isExtraAttack = html.find("[name=isExtraAttack]").prop("checked");

            let location = html.find("[name=location]")[0].value;
            let ammunition = undefined
            if (html.find("[name=ammunition]")[0]) {
              ammunition = html.find("[name=ammunition]")[0].value;
            }

            let targetOutsideLOS = html.find("[name=targetOutsideLOS]").prop("checked");
            let outsideLOS = html.find("[name=outsideLOS]").prop("checked");
            let isFastDraw = html.find("[name=isFastDraw]").prop("checked");
            let isProne = html.find("[name=isProne]").prop("checked");
            let isPinned = html.find("[name=isPinned]").prop("checked");
            let isActivelyDodging = html.find("[name=isActivelyDodging]").prop("checked");
            let isMoving = html.find("[name=isMoving]").prop("checked");
            let isAmbush = html.find("[name=isAmbush]").prop("checked");
            let isRicochet = html.find("[name=isRicochet]").prop("checked");
            let isBlinded = html.find("[name=isBlinded]").prop("checked");
            let isSilhouetted = html.find("[name=isSilhouetted]").prop("checked");
            let customAim = html.find("[name=customAim]")[0].value;

            let range = item.system.range ? html.find("[name=range]")[0].value : null;
            let customAtt = html.find("[name=customAtt]")[0].value;
            let strike = html.find("[name=strike]")[0].value;
            let damageType = html.find("[name=damageType]")[0].value;
            let customDmg = html.find("[name=customDmg]")[0].value;
            let attacknumber = 1;

            if (isExtraAttack) {
              let newSta = this.actor.system.derivedStats.sta.value - 3

              if (newSta < 0) {
                return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
              }
              this.actor.update({
                'system.derivedStats.sta.value': newSta
              });
            }

            if (strike == "fast") {
              attacknumber = 2;
            }
            for (let i = 0; i < attacknumber; i++) {
              let attFormula = "1d10"
              let damageFormula = formula;

              if (item.system.accuracy < 0) {
                attFormula += !displayRollDetails ? `${item.system.accuracy}` :
                  `${item.system.accuracy}[${game.i18n.localize("WITCHER.Weapon.Short.WeaponAccuracy")}]`
              }
              if (item.system.accuracy > 0) {
                attFormula += !displayRollDetails ? `+${item.system.accuracy}` :
                  `+${item.system.accuracy}[${game.i18n.localize("WITCHER.Weapon.Short.WeaponAccuracy")}]`
              }
              if (targetOutsideLOS) {
                attFormula += !displayRollDetails ? `-3` :
                  `-3[${game.i18n.localize("WITCHER.Dialog.attackTargetOutsideLOS")}]`;
              }
              if (outsideLOS) {
                attFormula += !displayRollDetails ? `+3` :
                  `+3[${game.i18n.localize("WITCHER.Dialog.attackOutsideLOS")}]`;
              }
              if (isExtraAttack) {
                attFormula += !displayRollDetails ? `-3` :
                  `-3[${game.i18n.localize("WITCHER.Dialog.attackExtra")}]`;
              }
              if (isFastDraw) {
                attFormula += !displayRollDetails ? `-3` :
                  `-3[${game.i18n.localize("WITCHER.Dialog.attackIsFastDraw")}]`;
              }
              if (isProne) {
                attFormula += !displayRollDetails ? `-2` :
                  `-2[${game.i18n.localize("WITCHER.Dialog.attackIsProne")}]`;
              }
              if (isPinned) {
                attFormula += !displayRollDetails ? `+4` :
                  `+4[${game.i18n.localize("WITCHER.Dialog.attackIsPinned")}]`;
              }
              if (isActivelyDodging) {
                attFormula += !displayRollDetails ? `-2` :
                  `-2[${game.i18n.localize("WITCHER.Dialog.attackIsActivelyDodging")}]`;
              }
              if (isMoving) {
                attFormula += !displayRollDetails ? `-3` :
                  `-3[${game.i18n.localize("WITCHER.Dialog.attackIsMoving")}]`;
              }
              if (isAmbush) {
                attFormula += !displayRollDetails ? `+5` :
                  `+5[${game.i18n.localize("WITCHER.Dialog.attackIsAmbush")}]`;
              }
              if (isRicochet) {
                attFormula += !displayRollDetails ? `-5` :
                  `-5[${game.i18n.localize("WITCHER.Dialog.attackIsRicochet")}]`;
              }
              if (isBlinded) {
                attFormula += !displayRollDetails ? `-3` :
                  `-3[${game.i18n.localize("WITCHER.Dialog.attackIsBlinded")}]`;
              }
              if (isSilhouetted) {
                attFormula += !displayRollDetails ? `+2` :
                  `+2[${game.i18n.localize("WITCHER.Dialog.attackIsSilhouetted")}]`;
              }
              if (customAim > 0) {
                attFormula += !displayRollDetails ? `+${customAim}` :
                  `+${customAim}[${game.i18n.localize("WITCHER.Dialog.attackCustom")}]`;
              }

              let modifiers;

              switch (attackSkill.name) {
                case "Brawling":
                  attFormula += !displayRollDetails ? `+${this.actor.system.stats.ref.current}+${this.actor.system.skills.ref.brawling.value}` :
                    `+${this.actor.system.stats.ref.current}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${this.actor.system.skills.ref.brawling.value}[${game.i18n.localize("WITCHER.SkRefBrawling")}]`;
                  modifiers = this.actor.system.skills.ref.brawling.modifiers;
                  break;
                case "Melee":
                  attFormula += !displayRollDetails ? `+${this.actor.system.stats.ref.current}+${this.actor.system.skills.ref.melee.value}` :
                    `+${this.actor.system.stats.ref.current}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${this.actor.system.skills.ref.melee.value}[${game.i18n.localize("WITCHER.SkRefMelee")}]`;
                  modifiers = this.actor.system.skills.ref.melee.modifiers;
                  break;
                case "Small Blades":
                  attFormula += !displayRollDetails ? `+${this.actor.system.stats.ref.current}+${this.actor.system.skills.ref.smallblades.value}` :
                    `+${this.actor.system.stats.ref.current}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${this.actor.system.skills.ref.smallblades.value}[${game.i18n.localize("WITCHER.SkRefSmall")}]`;
                  modifiers = this.actor.system.skills.ref.smallblades.modifiers;
                  break;
                case "Staff/Spear":
                  attFormula += !displayRollDetails ? `+${this.actor.system.stats.ref.current}+${this.actor.system.skills.ref.staffspear.value}` :
                    `+${this.actor.system.stats.ref.current}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${this.actor.system.skills.ref.staffspear.value}[${game.i18n.localize("WITCHER.SkRefStaff")}]`;
                  modifiers = this.actor.system.skills.ref.staffspear.modifiers;
                  break;
                case "Swordsmanship":
                  attFormula += !displayRollDetails ? `+${this.actor.system.stats.ref.current}+${this.actor.system.skills.ref.swordsmanship.value}` :
                    `+${this.actor.system.stats.ref.current}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${this.actor.system.skills.ref.swordsmanship.value}[${game.i18n.localize("WITCHER.SkRefSwordsmanship")}]`;
                  modifiers = this.actor.system.skills.ref.swordsmanship.modifiers;
                  break;
                case "Archery":
                  attFormula += !displayRollDetails ? `+${this.actor.system.stats.dex.current}+${this.actor.system.skills.dex.archery.value}` :
                    `+${this.actor.system.stats.dex.current}[${game.i18n.localize("WITCHER.Actor.Stat.Dex")}]+${this.actor.system.skills.dex.archery.value}[${game.i18n.localize("WITCHER.SkDexArchery")}]`;
                  modifiers = this.actor.system.skills.dex.archery.modifiers;
                  break;
                case "Athletics":
                  attFormula += !displayRollDetails ? `+${this.actor.system.stats.dex.current}+${this.actor.system.skills.dex.athletics.value}` :
                    `+${this.actor.system.stats.dex.current}[${game.i18n.localize("WITCHER.Actor.Stat.Dex")}]+${this.actor.system.skills.dex.athletics.value}[${game.i18n.localize("WITCHER.SkDexAthletics")}]`;
                  modifiers = this.actor.system.skills.dex.athletics.modifiers;
                  break;
                case "Crossbow":
                  attFormula += !displayRollDetails ? `+${this.actor.system.stats.dex.current}+${this.actor.system.skills.dex.crossbow.value}` :
                    `+${this.actor.system.stats.dex.current}[${game.i18n.localize("WITCHER.Actor.Stat.Dex")}]+${this.actor.system.skills.dex.crossbow.value}[${game.i18n.localize("WITCHER.SkDexCrossbow")}]`;
                  modifiers = this.actor.system.skills.dex.crossbow.modifiers;
                  break;
              }

              if (customAtt != "0") {
                attFormula += !displayRollDetails ? `+${customAtt}` : `+${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`;
              }

              switch (range) {
                case "pointBlank":
                  attFormula = !displayRollDetails ? `${attFormula}+5` : `${attFormula}+5[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                  break;
                case "medium":
                  attFormula = !displayRollDetails ? `${attFormula}-2` : `${attFormula}-2[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                  break;
                case "long":
                  attFormula = !displayRollDetails ? `${attFormula}-4` : `${attFormula}-4[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                  break;
                case "extreme":
                  attFormula = !displayRollDetails ? `${attFormula}-6` : `${attFormula}-6[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                  break;
              }

              if (customDmg != "0") {
                damageFormula += !displayRollDetails ? `+${customDmg}` : `+${customDmg}[${game.i18n.localize("WITCHER.Settings.Custom")}]`;
              }
              let touchedLocation = this.actor.getLocationObject(location);
              let LocationFormula = touchedLocation.locationFormula;
              attFormula += !displayRollDetails
                ? `${touchedLocation.modifier}`
                : `${touchedLocation.modifier}[${touchedLocation.alias}]`;

              if (strike == "joint" || strike == "strong") {
                attFormula = !displayRollDetails ? `${attFormula}-3` : `${attFormula}-3[${game.i18n.localize("WITCHER.Dialog.attackStrike")}]`;
              }

              attFormula = addModifiers(modifiers, attFormula)

              let allEffects = item.system.effects
              if (ammunition) {
                let item = this.actor.items.get(ammunition);
                let newQuantity = item.system.quantity - 1;
                item.update({ "system.quantity": newQuantity })
                allEffects.push(...item.system.effects)
              }

              if (item.isWeaponThrowable()) {
                let newQuantity = item.system.quantity - 1;
                if (newQuantity < 0) {
                  return
                }
                item.update({ "system.quantity": newQuantity })
                allEffects.push(...item.system.effects)
              }

              if (item.system.enhancementItems) {
                item.system.enhancementItems.forEach(element => {
                  if (element && JSON.stringify(element) != '{}') {
                    let enhancement = this.actor.items.get(element._id);
                    allEffects.push(...enhancement.system.effects)
                  }
                });
              }

              let effects = JSON.stringify(item.system.effects)
              messageData.flavor = `<div class="attack-message"><h1><img src="${item.img}" class="item-img" />${game.i18n.localize("WITCHER.Attack")}: ${item.name}</h1>`;
              messageData.flavor += `<span>  ${game.i18n.localize("WITCHER.Armor.Location")}: ${touchedLocation.alias} = ${LocationFormula} </span>`;

              let touchedLocationJSON = JSON.stringify(touchedLocation);
              messageData.flavor += `<button class="damage" data-img="${item.img}" data-dmg-type="${damageType}" data-name="${item.name}" data-dmg="${damageFormula}" data-location='${touchedLocationJSON}'  data-location-formula="${LocationFormula}" data-strike="${strike}" data-effects='${effects}'>${game.i18n.localize("WITCHER.table.Damage")}</button>`;

              let config = new RollConfig()
              config.showResult = false
              let roll = await extendedRoll(attFormula, messageData, config)

              if (item.system.rollOnlyDmg) {
                rollDamage(item.img, item.name, damageFormula, touchedLocation, LocationFormula, strike, item.system.effects, damageType)
              } else {
                roll.toMessage(messageData);
              }
            }
          }
        }
      }
    }, myDialogOptions).render(true)
  }

  _onSpellDisplay(event) {
    event.preventDefault();
    let section = event.currentTarget.closest(".spell");
    switch (section.dataset.spelltype) {
      case "noviceSpell":
        this.actor.update({ 'system.pannels.noviceSpellIsOpen': this.actor.system.pannels.noviceSpellIsOpen ? false : true });
        break;
      case "journeymanSpell":
        this.actor.update({ 'system.pannels.journeymanSpellIsOpen': this.actor.system.pannels.journeymanSpellIsOpen ? false : true });
        break;
      case "masterSpell":
        this.actor.update({ 'system.pannels.masterSpellIsOpen': this.actor.system.pannels.masterSpellIsOpen ? false : true });
        break;
      case "ritual":
        this.actor.update({ 'system.pannels.ritualIsOpen': this.actor.system.pannels.ritualIsOpen ? false : true });
        break;
      case "hex":
        this.actor.update({ 'system.pannels.hexIsOpen': this.actor.system.pannels.hexIsOpen ? false : true });
        break;
      case "magicalgift":
        this.actor.update({ 'system.pannels.magicalgiftIsOpen': this.actor.system.pannels.magicalgiftIsOpen ? false : true });
        break;
    }
  }

  _onLifeEventDisplay(event) {
    event.preventDefault();
    let section = event.currentTarget.closest(".lifeEvents");
    switch (section.dataset.event) {
      case "10": this.actor.update({ 'system.general.lifeEvents.10.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "20": this.actor.update({ 'system.general.lifeEvents.20.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "30": this.actor.update({ 'system.general.lifeEvents.30.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "40": this.actor.update({ 'system.general.lifeEvents.40.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "50": this.actor.update({ 'system.general.lifeEvents.50.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "60": this.actor.update({ 'system.general.lifeEvents.60.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "70": this.actor.update({ 'system.general.lifeEvents.70.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "80": this.actor.update({ 'system.general.lifeEvents.80.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "90": this.actor.update({ 'system.general.lifeEvents.90.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "100": this.actor.update({ 'system.general.lifeEvents.100.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "110": this.actor.update({ 'system.general.lifeEvents.110.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "120": this.actor.update({ 'system.general.lifeEvents.120.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "130": this.actor.update({ 'system.general.lifeEvents.130.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "140": this.actor.update({ 'system.general.lifeEvents.140.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "150": this.actor.update({ 'system.general.lifeEvents.150.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "160": this.actor.update({ 'system.general.lifeEvents.160.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "170": this.actor.update({ 'system.general.lifeEvents.170.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "180": this.actor.update({ 'system.general.lifeEvents.180.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "190": this.actor.update({ 'system.general.lifeEvents.190.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
      case "200": this.actor.update({ 'system.general.lifeEvents.200.isOpened': this.actor.system.general.lifeEvents[section.dataset.event].isOpened ? false : true }); break;
    }
  }

  _onStatModifierDisplay(event) {
    event.preventDefault();
    let stat = event.currentTarget.closest(".stat-display").dataset.stat;
    switch (stat) {
      case "int": this.actor.update({ 'system.stats.int.isOpened': this.actor.system.stats.int.isOpened ? false : true }); break;
      case "ref": this.actor.update({ 'system.stats.ref.isOpened': this.actor.system.stats.ref.isOpened ? false : true }); break;
      case "dex": this.actor.update({ 'system.stats.dex.isOpened': this.actor.system.stats.dex.isOpened ? false : true }); break;
      case "body": this.actor.update({ 'system.stats.body.isOpened': this.actor.system.stats.body.isOpened ? false : true }); break;
      case "spd": this.actor.update({ 'system.stats.spd.isOpened': this.actor.system.stats.spd.isOpened ? false : true }); break;
      case "emp": this.actor.update({ 'system.stats.emp.isOpened': this.actor.system.stats.emp.isOpened ? false : true }); break;
      case "cra": this.actor.update({ 'system.stats.cra.isOpened': this.actor.system.stats.cra.isOpened ? false : true }); break;
      case "will": this.actor.update({ 'system.stats.will.isOpened': this.actor.system.stats.will.isOpened ? false : true }); break;
      case "luck": this.actor.update({ 'system.stats.luck.isOpened': this.actor.system.stats.luck.isOpened ? false : true }); break;
      case "stun": this.actor.update({ 'system.coreStats.stun.isOpened': this.actor.system.coreStats.stun.isOpened ? false : true }); break;
      case "run": this.actor.update({ 'system.coreStats.run.isOpened': this.actor.system.coreStats.run.isOpened ? false : true }); break;
      case "leap": this.actor.update({ 'system.coreStats.leap.isOpened': this.actor.system.coreStats.leap.isOpened ? false : true }); break;
      case "enc": this.actor.update({ 'system.coreStats.enc.isOpened': this.actor.system.coreStats.enc.isOpened ? false : true }); break;
      case "rec": this.actor.update({ 'system.coreStats.rec.isOpened': this.actor.system.coreStats.rec.isOpened ? false : true }); break;
      case "woundTreshold": this.actor.update({ 'system.coreStats.woundTreshold.isOpened': this.actor.system.coreStats.woundTreshold.isOpened ? false : true }); break;
      case "reputation": this.actor.update({ 'system.reputation.isOpened': this.actor.system.reputation.isOpened ? false : true }); break;
    }
  }

  _onDerivedModifierDisplay(event) {
    this.actor.update({ 'system.derivedStats.modifiersIsOpened': this.actor.system.derivedStats.modifiersIsOpened ? false : true });
  }

  _onSkillModifierDisplay(event) {
    event.preventDefault();
    let skill = event.currentTarget.closest(".skill").dataset.skill;
    switch (skill) {
      case "awareness": this.actor.update({ 'system.skills.int.awareness.isOpened': this.actor.system.skills.int.awareness.isOpened ? false : true }); break;
      case "business": this.actor.update({ 'system.skills.int.business.isOpened': this.actor.system.skills.int.business.isOpened ? false : true }); break;
      case "deduction": this.actor.update({ 'system.skills.int.deduction.isOpened': this.actor.system.skills.int.deduction.isOpened ? false : true }); break;
      case "education": this.actor.update({ 'system.skills.int.education.isOpened': this.actor.system.skills.int.education.isOpened ? false : true }); break;
      case "commonsp": this.actor.update({ 'system.skills.int.commonsp.isOpened': this.actor.system.skills.int.commonsp.isOpened ? false : true }); break;
      case "eldersp": this.actor.update({ 'system.skills.int.eldersp.isOpened': this.actor.system.skills.int.eldersp.isOpened ? false : true }); break;
      case "dwarven": this.actor.update({ 'system.skills.int.dwarven.isOpened': this.actor.system.skills.int.dwarven.isOpened ? false : true }); break;
      case "monster": this.actor.update({ 'system.skills.int.monster.isOpened': this.actor.system.skills.int.monster.isOpened ? false : true }); break;
      case "socialetq": this.actor.update({ 'system.skills.int.socialetq.isOpened': this.actor.system.skills.int.socialetq.isOpened ? false : true }); break;
      case "streetwise": this.actor.update({ 'system.skills.int.streetwise.isOpened': this.actor.system.skills.int.streetwise.isOpened ? false : true }); break;
      case "tactics": this.actor.update({ 'system.skills.int.tactics.isOpened': this.actor.system.skills.int.tactics.isOpened ? false : true }); break;
      case "teaching": this.actor.update({ 'system.skills.int.teaching.isOpened': this.actor.system.skills.int.teaching.isOpened ? false : true }); break;
      case "wilderness": this.actor.update({ 'system.skills.int.wilderness.isOpened': this.actor.system.skills.int.wilderness.isOpened ? false : true }); break;

      case "brawling": this.actor.update({ 'system.skills.ref.brawling.isOpened': this.actor.system.skills.ref.brawling.isOpened ? false : true }); break;
      case "dodge": this.actor.update({ 'system.skills.ref.dodge.isOpened': this.actor.system.skills.ref.dodge.isOpened ? false : true }); break;
      case "melee": this.actor.update({ 'system.skills.ref.melee.isOpened': this.actor.system.skills.ref.melee.isOpened ? false : true }); break;
      case "riding": this.actor.update({ 'system.skills.ref.riding.isOpened': this.actor.system.skills.ref.riding.isOpened ? false : true }); break;
      case "sailing": this.actor.update({ 'system.skills.ref.sailing.isOpened': this.actor.system.skills.ref.sailing.isOpened ? false : true }); break;
      case "smallblades": this.actor.update({ 'system.skills.ref.smallblades.isOpened': this.actor.system.skills.ref.smallblades.isOpened ? false : true }); break;
      case "staffspear": this.actor.update({ 'system.skills.ref.staffspear.isOpened': this.actor.system.skills.ref.staffspear.isOpened ? false : true }); break;
      case "swordsmanship": this.actor.update({ 'system.skills.ref.swordsmanship.isOpened': this.actor.system.skills.ref.swordsmanship.isOpened ? false : true }); break;

      case "courage": this.actor.update({ 'system.skills.will.courage.isOpened': this.actor.system.skills.will.courage.isOpened ? false : true }); break;
      case "hexweave": this.actor.update({ 'system.skills.will.hexweave.isOpened': this.actor.system.skills.will.hexweave.isOpened ? false : true }); break;
      case "intimidation": this.actor.update({ 'system.skills.will.intimidation.isOpened': this.actor.system.skills.will.intimidation.isOpened ? false : true }); break;
      case "spellcast": this.actor.update({ 'system.skills.will.spellcast.isOpened': this.actor.system.skills.will.spellcast.isOpened ? false : true }); break;
      case "resistmagic": this.actor.update({ 'system.skills.will.resistmagic.isOpened': this.actor.system.skills.will.resistmagic.isOpened ? false : true }); break;
      case "resistcoerc": this.actor.update({ 'system.skills.will.resistcoerc.isOpened': this.actor.system.skills.will.resistcoerc.isOpened ? false : true }); break;
      case "ritcraft": this.actor.update({ 'system.skills.will.ritcraft.isOpened': this.actor.system.skills.will.ritcraft.isOpened ? false : true }); break;

      case "archery": this.actor.update({ 'system.skills.dex.archery.isOpened': this.actor.system.skills.dex.archery.isOpened ? false : true }); break;
      case "athletics": this.actor.update({ 'system.skills.dex.athletics.isOpened': this.actor.system.skills.dex.athletics.isOpened ? false : true }); break;
      case "crossbow": this.actor.update({ 'system.skills.dex.crossbow.isOpened': this.actor.system.skills.dex.crossbow.isOpened ? false : true }); break;
      case "sleight": this.actor.update({ 'system.skills.dex.sleight.isOpened': this.actor.system.skills.dex.sleight.isOpened ? false : true }); break;
      case "stealth": this.actor.update({ 'system.skills.dex.stealth.isOpened': this.actor.system.skills.dex.stealth.isOpened ? false : true }); break;

      case "alchemy": this.actor.update({ 'system.skills.cra.alchemy.isOpened': this.actor.system.skills.cra.alchemy.isOpened ? false : true }); break;
      case "crafting": this.actor.update({ 'system.skills.cra.crafting.isOpened': this.actor.system.skills.cra.crafting.isOpened ? false : true }); break;
      case "disguise": this.actor.update({ 'system.skills.cra.disguise.isOpened': this.actor.system.skills.cra.disguise.isOpened ? false : true }); break;
      case "firstaid": this.actor.update({ 'system.skills.cra.firstaid.isOpened': this.actor.system.skills.cra.firstaid.isOpened ? false : true }); break;
      case "forgery": this.actor.update({ 'system.skills.cra.forgery.isOpened': this.actor.system.skills.cra.forgery.isOpened ? false : true }); break;
      case "picklock": this.actor.update({ 'system.skills.cra.picklock.isOpened': this.actor.system.skills.cra.picklock.isOpened ? false : true }); break;
      case "trapcraft": this.actor.update({ 'system.skills.cra.trapcraft.isOpened': this.actor.system.skills.cra.trapcraft.isOpened ? false : true }); break;

      case "physique": this.actor.update({ 'system.skills.body.physique.isOpened': this.actor.system.skills.body.physique.isOpened ? false : true }); break;
      case "endurance": this.actor.update({ 'system.skills.body.endurance.isOpened': this.actor.system.skills.body.endurance.isOpened ? false : true }); break;

      case "charisma": this.actor.update({ 'system.skills.emp.charisma.isOpened': this.actor.system.skills.emp.charisma.isOpened ? false : true }); break;
      case "deceit": this.actor.update({ 'system.skills.emp.deceit.isOpened': this.actor.system.skills.emp.deceit.isOpened ? false : true }); break;
      case "finearts": this.actor.update({ 'system.skills.emp.finearts.isOpened': this.actor.system.skills.emp.finearts.isOpened ? false : true }); break;
      case "gambling": this.actor.update({ 'system.skills.emp.gambling.isOpened': this.actor.system.skills.emp.gambling.isOpened ? false : true }); break;
      case "grooming": this.actor.update({ 'system.skills.emp.grooming.isOpened': this.actor.system.skills.emp.grooming.isOpened ? false : true }); break;
      case "perception": this.actor.update({ 'system.skills.emp.perception.isOpened': this.actor.system.skills.emp.perception.isOpened ? false : true }); break;
      case "leadership": this.actor.update({ 'system.skills.emp.leadership.isOpened': this.actor.system.skills.emp.leadership.isOpened ? false : true }); break;
      case "persuasion": this.actor.update({ 'system.skills.emp.persuasion.isOpened': this.actor.system.skills.emp.persuasion.isOpened ? false : true }); break;
      case "performance": this.actor.update({ 'system.skills.emp.performance.isOpened': this.actor.system.skills.emp.performance.isOpened ? false : true }); break;
      case "seduction": this.actor.update({ 'system.skills.emp.seduction.isOpened': this.actor.system.skills.emp.seduction.isOpened ? false : true }); break;
    }
  }

  _onSkillDisplay(event) {
    event.preventDefault();
    let section = event.currentTarget.closest(".skill");
    switch (section.dataset.skilltype) {
      case "int":
        this.actor.update({ 'system.pannels.intIsOpen': this.actor.system.pannels.intIsOpen ? false : true });
        break;
      case "ref":
        this.actor.update({ 'system.pannels.refIsOpen': this.actor.system.pannels.refIsOpen ? false : true });
        break;
      case "dex":
        this.actor.update({ 'system.pannels.dexIsOpen': this.actor.system.pannels.dexIsOpen ? false : true });
        break;
      case "body":
        this.actor.update({ 'system.pannels.bodyIsOpen': this.actor.system.pannels.bodyIsOpen ? false : true });
        break;
      case "emp":
        this.actor.update({ 'system.pannels.empIsOpen': this.actor.system.pannels.empIsOpen ? false : true });
        break;
      case "cra":
        this.actor.update({ 'system.pannels.craIsOpen': this.actor.system.pannels.craIsOpen ? false : true });
        break;
      case "will":
        this.actor.update({ 'system.pannels.willIsOpen': this.actor.system.pannels.willIsOpen ? false : true });
        break;
    }
  }

  _onSubstanceDisplay(event) {
    event.preventDefault();
    let section = event.currentTarget.closest(".substance");

    switch (section.dataset.subtype) {
      case "vitriol":
        this.actor.update({ 'system.pannels.vitriolIsOpen': this.actor.system.pannels.vitriolIsOpen ? false : true });
        break;
      case "rebis":
        this.actor.update({ 'system.pannels.rebisIsOpen': this.actor.system.pannels.rebisIsOpen ? false : true });
        break;
      case "aether":
        this.actor.update({ 'system.pannels.aetherIsOpen': this.actor.system.pannels.aetherIsOpen ? false : true });
        break;
      case "quebrith":
        this.actor.update({ 'system.pannels.quebrithIsOpen': this.actor.system.pannels.quebrithIsOpen ? false : true });
        break;
      case "hydragenum":
        this.actor.update({ 'system.pannels.hydragenumIsOpen': this.actor.system.pannels.hydragenumIsOpen ? false : true });
        break;
      case "vermilion":
        this.actor.update({ 'system.pannels.vermilionIsOpen': this.actor.system.pannels.vermilionIsOpen ? false : true });
        break;
      case "sol":
        this.actor.update({ 'system.pannels.solIsOpen': this.actor.system.pannels.solIsOpen ? false : true });
        break;
      case "caelum":
        this.actor.update({ 'system.pannels.caelumIsOpen': this.actor.system.pannels.caelumIsOpen ? false : true });
        break;
      case "fulgur":
        this.actor.update({ 'system.pannels.fulgurIsOpen': this.actor.system.pannels.fulgurIsOpen ? false : true });
        break;
    }
  }

  calc_total_skills_profession(data) {
    let totalSkills = 0;
    if (data.profession) {
      totalSkills += Number(data.profession.system.definingSkill.level);
      totalSkills += Number(data.profession.system.skillPath1.skill1.level) + Number(data.profession.system.skillPath1.skill2.level) + Number(data.profession.system.skillPath1.skill3.level)
      totalSkills += Number(data.profession.system.skillPath2.skill1.level) + Number(data.profession.system.skillPath2.skill2.level) + Number(data.profession.system.skillPath2.skill3.level)
      totalSkills += Number(data.profession.system.skillPath3.skill1.level) + Number(data.profession.system.skillPath3.skill2.level) + Number(data.profession.system.skillPath3.skill3.level)
    }
    return totalSkills;
  }

  calc_total_skills(data) {
    let totalSkills = 0;
    for (let element in data.system.skills) {
      for (let skill in data.system.skills[element]) {
        let skillLabel = game.i18n.localize(data.system.skills[element][skill].label)
        if (skillLabel?.includes("(2)")) {
          totalSkills += data.system.skills[element][skill].value * 2;
        }
        else {
          totalSkills += data.system.skills[element][skill].value;
        }
      }
    }
    return totalSkills;
  }

  calc_total_stats(data) {
    let totalStats = 0;
    for (let element in data.system.stats) {
      totalStats += data.system.stats[element].max;
    }
    return totalStats;
  }

  /** Do not delete. This method is here to give external modules the possibility to make skill rolls. */
  async _onSkillRoll(statNum, skillNum) {
    rollSkillCheck(this.actor, statNum, skillNum);
  }
}
