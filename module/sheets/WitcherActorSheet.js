import { buttonDialog, rollDamage } from "../chat.js";
import { witcher } from "../config.js";
import { getRandomInt, updateDerived, rollSkillCheck, genId, calc_currency_weight } from "../witcher.js";

import { ExecuteDefense } from "../../scripts/actions.js";

export default class WitcherActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["witcher", "sheet", "actor"],
        width: 805,
        height: 600,
        template: "systems/TheWitcherTRPG/templates/sheets/actor/actor-sheet.html",
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      });
    }

    /** @override */
    getData() {
      const data = super.getData();
      if (data.data.data) {
        data.data = data.data.data
      }
      
      data.useAdrenaline = game.settings.get("TheWitcherTRPG", "useOptionnalAdrenaline")
      data.displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

      data.config = CONFIG.witcher;
      CONFIG.Combat.initiative.formula = "1d10 + @stats.ref.current"
      if (data.displayRollDetails) {
        CONFIG.Combat.initiative.formula = "1d10 + @stats.ref.current[REF]"
      }

      data.weapons = data.items.filter(function(item) {return item.type=="weapon"});
      data.weapons.forEach((weapon)=>{
        if (weapon.data.enhancements > 0 && weapon.data.enhancements != weapon.data.enhancementItems.length) {
          let newEnhancementList = []
          for (let i = 0; i < weapon.data.enhancements; i++) {
            let element = weapon.data.enhancementItems[i]
            if (element && JSON.stringify(element) != '{}'){
              newEnhancementList.push(element)
            }else {
              newEnhancementList.push({})
            }
          } 
          let item = this.actor.items.get(weapon._id);
          item.update({ 'data.enhancementItems': newEnhancementList})
        }
      });

      data.armors = data.items.filter(function(item) {return item.type=="armor" || (item.type == "enhancement" && item.data.type == "armor" && item.data.applied == false)});
      data.armors.forEach((armor)=>{
        if (armor.data.enhancements > 0 && armor.data.enhancements != armor.data.enhancementItems.length) {
          let newEnhancementList = []
          for (let i = 0; i < armor.data.enhancements; i++) {
            let element = armor.data.enhancementItems[i]
            if (element && JSON.stringify(element) != '{}'){
              newEnhancementList.push(element)
            }else {
              newEnhancementList.push({})
            }
          } 
          let item = this.actor.items.get(armor._id);
          item.update({ 'data.enhancementItems': newEnhancementList})
        }
      });

      data.components = data.items.filter(function(item) {return item.type=="component" &&  item.data.type!="substances"});
      data.allComponents = data.items.filter(function(item) {return item.type=="component"});
      data.valuables = data.items.filter(function(item) {return item.type=="valuable" || item.type == "mount" || item.type =="alchemical" || item.type =="mutagen" || (item.type == "enhancement" && item.data.type != "armor" && item.data.applied == false)});
      data.diagrams = data.items.filter(function(item) {return item.type=="diagrams"});
      data.spells = data.items.filter(function(item) {return item.type=="spell"});
      
      data.professions = data.items.filter(function(item) {return item.type=="profession"});
      data.profession = data.professions[0];
      
      data.races = data.items.filter(function(item) {return item.type=="race"});
      data.race = data.races[0];

      Array.prototype.sum = function (prop) {
        var total = 0
        for ( var i = 0, _len = this.length; i < _len; i++ ) {
            if (this[i]["data"][prop]){
              total += Number(this[i]["data"][prop])
            }
            else if (this[i]["data"]["data"][prop]){
              total += Number(this[i]["data"]["data"][prop])
            }
        }
        return total
      }
      Array.prototype.weight = function () {
        var total = 0
        for ( var i = 0, _len = this.length; i < _len; i++ ) {
            if (this[i]["data"]["weight"] && this[i]["data"]["quantity"]){
              total += Number(this[i]["data"]["quantity"]) * Number(this[i]["data"]["weight"])
            }
        }
        return Math.ceil(total)
      }
      Array.prototype.cost = function () {
        var total = 0
        for ( var i = 0, _len = this.length; i < _len; i++ ) {
            if (this[i]["data"]["cost"] && this[i]["data"]["quantity"]){
              total += Number(this[i]["data"]["quantity"]) * Number(this[i]["data"]["cost"])
            }
        }
        return Math.ceil(total)
      }

      data.totalStats = this.calc_total_stats(data)
      data.totalSkills = this.calc_total_skills(data)
      data.totalProfSkills = this.calc_total_skills_profession(data)

      data.substancesVitriol = data.items.filter(function(item) {return item.type=="component" &&  item.data.type=="substances" && item.data.substanceType=="vitriol" });
      data.vitriolCount =  data.substancesVitriol.sum("quantity");
      data.substancesRebis = data.items.filter(function(item) {return item.type=="component" &&  item.data.type=="substances" && item.data.substanceType=="rebis" });
      data.rebisCount =  data.substancesRebis.sum("quantity");
      data.substancesAether = data.items.filter(function(item) {return item.type=="component" &&  item.data.type=="substances" && item.data.substanceType=="aether" });
      data.aetherCount =  data.substancesAether.sum("quantity");
      data.substancesQuebrith = data.items.filter(function(item) {return item.type=="component" &&  item.data.type=="substances" && item.data.substanceType=="quebrith" });
      data.quebrithCount =  data.substancesQuebrith.sum("quantity");
      data.substancesHydragenum = data.items.filter(function(item) {return item.type=="component" &&  item.data.type=="substances" && item.data.substanceType=="hydragenum" });
      data.hydragenumCount =  data.substancesHydragenum.sum("quantity");
      data.substancesVermilion = data.items.filter(function(item) {return item.type=="component" &&  item.data.type=="substances" && item.data.substanceType=="vermilion" });
      data.vermilionCount =  data.substancesVermilion.sum("quantity");
      data.substancesSol = data.items.filter(function(item) {return item.type=="component" &&  item.data.type=="substances" && item.data.substanceType=="sol" });
      data.solCount =  data.substancesSol.sum("quantity");
      data.substancesCaelum = data.items.filter(function(item) {return item.type=="component" &&  item.data.type=="substances" && item.data.substanceType=="caelum" });
      data.caelumCount =  data.substancesCaelum.sum("quantity");
      data.substancesFulgur = data.items.filter(function(item) {return item.type=="component" &&  item.data.type=="substances" && item.data.substanceType=="fulgur" });
      data.fulgurCount =  data.substancesFulgur.sum("quantity");


      data.loots =  data.items.filter(function(item) {return item.type=="component" || item.type == "valuable" || item.type=="diagrams" || item.type=="armor" || item.type=="alchemical" || item.type == "enhancement" || item.type == "mutagen"});
      data.notes =  data.items.filter(function(item) {return item.type=="note"});
      
      data.activeEffects =  data.items.filter(function(item) {return item.type=="effect"});

      data.totalWeight =   data.items.weight() + calc_currency_weight(data.data.currency);
      data.totalCost =  data.items.cost();

      data.noviceSpells = data.items.filter(function(item) {return item.type=="spell" &&  item.data.level=="novice" && (item.data.class=="Spells" || item.data.class=="Invocations" || item.data.class=="Witcher")});
      data.journeymanSpells = data.items.filter(function(item) {return item.type=="spell" &&  item.data.level=="journeyman" && (item.data.class=="Spells" || item.data.class=="Invocations" || item.data.class=="Witcher")});
      data.masterSpells = data.items.filter(function(item) {return item.type=="spell" &&  item.data.level=="master" && (item.data.class=="Spells" || item.data.class=="Invocations" || item.data.class=="Witcher")});
      data.hexes = data.items.filter(function(item) {return item.type=="spell" &&  item.data.class=="Hexes"});
      data.rituals = data.items.filter(function(item) {return item.type=="spell" &&  item.data.class=="Rituals"});

      if (this.actor.data.data.pannels == undefined){
        this.actor.update({ 'data.pannels':{}});
      }

      return data;
    }

    activateListeners(html) {
      super.activateListeners(html);
      
      html.find("input.stat-max").on("change", updateDerived(this.actor));

      let thisActor = this.actor;
      
      html.find(".hp-value").change(this._onHPChanged.bind(this));
      html.find(".inline-edit").change(this._onInlineEdit.bind(this));
      html.find(".item-edit").on("click", this._onItemEdit.bind(this));
      html.find(".item-weapon-display").on("click", this._onItemDisplayInfo.bind(this));
      html.find(".item-armor-display").on("click", this._onItemDisplayInfo.bind(this));
      html.find(".item-valuable-display").on("click", this._onItemDisplayInfo.bind(this));
      html.find(".item-delete").on("click", this._onItemDelete.bind(this));
      html.find(".add-item").on("click", this._onItemAdd.bind(this));
      html.find(".add-active-effect").on("click", this._onAddActiveEffect.bind(this));
      html.find(".skill-display").on("click", this._onSkillDisplay.bind(this));
      html.find(".item-substance-display").on("click", this._onSubstanceDisplay.bind(this));
      html.find(".spell-display").on("click", this._onSpellDisplay.bind(this));
      html.find(".life-event-display").on("click", this._onLifeEventDisplay.bind(this));
      html.find(".stat-modifier-display").on("click", this._onStatModifierDisplay.bind(this));
      html.find(".skill-modifier-display").on("click", this._onSkillModifierDisplay.bind(this));
      html.find(".derived-modifier-display").on("click", this._onDerivedModifierDisplay.bind(this));
      
      html.find(".init-roll").on("click", this._onInitRoll.bind(this));
      html.find(".crit-roll").on("click", this._onCritRoll.bind(this));
      html.find(".death-roll").on("click", this._onDeathSaveRoll.bind(this));
      html.find(".defence-roll").on("click", this._onDefenceRoll.bind(this));
      
      html.find(".stat-roll").on("click", this._onStatSaveRoll.bind(this));
      html.find(".item-roll").on("click", this._onItemRoll.bind(this));
      html.find(".profession-roll").on("click", this._onProfessionRoll.bind(this));
      html.find(".spell-roll").on("click", this._onSpellRoll.bind(this));
      html.find(".alchemy-potion").on("click", this._alchemyCraft.bind(this));

      html.find(".add-crit").on("click", this._onCritAdd.bind(this));
      html.find(".delete-crit").on("click", this._onCritRemove.bind(this));
      
      html.find(".add-skill-modifier").on("click", this._onAddSkillModifier.bind(this));
      html.find(".add-modifier").on("click", this._onAddModifier.bind(this));
      html.find(".delete-stat").on("click", this._onModifierRemove.bind(this));
      html.find(".delete-skill-modifier").on("click", this._onSkillModifierRemove.bind(this));

      html.find(".list-mod-edit").on("blur", this._onModifierEdit.bind(this));
      html.find(".skill-mod-edit").on("blur", this._onSkillModifierEdit.bind(this));

      html.find(".enhancement-weapon-slot").on("click", this._chooseEnhancement.bind(this));
      html.find(".enhancement-armor-slot").on("click", this._chooseEnhancement.bind(this));

      html.find(".death-minus").on("click", this._removeDeathSaves.bind(this));
      html.find(".death-plus").on("click", this._addDeathSaves.bind(this));

      html.find("input").focusin(ev => this._onFocusIn(ev));      
      
      html.find("#awareness-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 0)});
      html.find("#business-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 1)});
      html.find("#deduction-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 2)});
      html.find("#education-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 3)});
      html.find("#commonsp-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 4)});
      html.find("#eldersp-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 5)});
      html.find("#dwarven-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 6)});
      html.find("#monster-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 7)});
      html.find("#socialetq-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 8)});
      html.find("#streetwise-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 9)});
      html.find("#tactics-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 10)});
      html.find("#teaching-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 11)});
      html.find("#wilderness-rollable").on("click", function () {rollSkillCheck(thisActor, 0, 12)});
      //ref skills
      html.find("#brawling-rollable").on("click", function () {rollSkillCheck(thisActor, 1, 0)});
      html.find("#dodge-rollable").on("click", function () {rollSkillCheck(thisActor, 1, 1)});
      html.find("#melee-rollable").on("click", function () {rollSkillCheck(thisActor, 1, 2)});
      html.find("#riding-rollable").on("click", function () {rollSkillCheck(thisActor, 1, 3)});
      html.find("#sailing-rollable").on("click", function () {rollSkillCheck(thisActor, 1, 4)});
      html.find("#smallblades-rollable").on("click", function () {rollSkillCheck(thisActor, 1, 5)});
      html.find("#staffspear-rollable").on("click", function () {rollSkillCheck(thisActor, 1, 6)});
      html.find("#swordsmanship-rollable").on("click", function () {rollSkillCheck(thisActor, 1, 7)});
      //dex skills
      html.find("#archery-rollable").on("click", function () {rollSkillCheck(thisActor, 2, 0)});
      html.find("#athletics-rollable").on("click", function () {rollSkillCheck(thisActor, 2, 1)});
      html.find("#crossbow-rollable").on("click", function () {rollSkillCheck(thisActor, 2, 2)});
      html.find("#sleight-rollable").on("click", function () {rollSkillCheck(thisActor, 2, 3)});
      html.find("#stealth-rollable").on("click", function () {rollSkillCheck(thisActor, 2, 4)});
      //body skills
      html.find("#physique-rollable").on("click", function () {rollSkillCheck(thisActor, 3, 0)});
      html.find("#endurance-rollable").on("click", function () {rollSkillCheck(thisActor, 3, 1)});
      //emp skills
      html.find("#charisma-rollable").on("click", function () {rollSkillCheck(thisActor, 4, 0)});
      html.find("#deceit-rollable").on("click", function () {rollSkillCheck(thisActor, 4, 1)});
      html.find("#finearts-rollable").on("click", function () {rollSkillCheck(thisActor, 4, 2)});
      html.find("#gambling-rollable").on("click", function () {rollSkillCheck(thisActor, 4, 3)});
      html.find("#grooming-rollable").on("click", function () {rollSkillCheck(thisActor, 4, 4)});
      html.find("#perception-rollable").on("click", function () {rollSkillCheck(thisActor, 4, 5)});
      html.find("#leadership-rollable").on("click", function () {rollSkillCheck(thisActor, 4, 6)});
      html.find("#persuasion-rollable").on("click", function () {rollSkillCheck(thisActor, 4, 7)});
      html.find("#performance-rollable").on("click", function () {rollSkillCheck(thisActor, 4, 8)});
      html.find("#seduction-rollable").on("click", function () {rollSkillCheck(thisActor, 4, 9)});
      //cra skills
      html.find("#alchemy-rollable").on("click", function () {rollSkillCheck(thisActor, 5, 0)});
      html.find("#crafting-rollable").on("click", function () {rollSkillCheck(thisActor, 5, 1)});
      html.find("#disguise-rollable").on("click", function () {rollSkillCheck(thisActor, 5, 2)});
      html.find("#firstaid-rollable").on("click", function () {rollSkillCheck(thisActor, 5, 3)});
      html.find("#forgery-rollable").on("click", function () {rollSkillCheck(thisActor, 5, 4)});
      html.find("#picklock-rollable").on("click", function () {rollSkillCheck(thisActor, 5, 5)});
      html.find("#trapcraft-rollable").on("click", function () {rollSkillCheck(thisActor, 5, 6)});
      //will skills
      html.find("#courage-rollable").on("click", function () {rollSkillCheck(thisActor, 6, 0)});
      html.find("#hexweave-rollable").on("click", function () {rollSkillCheck(thisActor, 6, 1)});
      html.find("#intimidation-rollable").on("click", function () {rollSkillCheck(thisActor, 6, 2)});
      html.find("#spellcast-rollable").on("click", function () {rollSkillCheck(thisActor, 6, 3)});
      html.find("#resistmagic-rollable").on("click", function () {rollSkillCheck(thisActor, 6, 4)});
      html.find("#resistcoerc-rollable").on("click", function () {rollSkillCheck(thisActor, 6, 5)});
      html.find("#ritcraft-rollable").on("click", function () {rollSkillCheck(thisActor, 6, 6)});

      html.find(".dragable").on("dragstart", (ev) => {
        let itemId = ev.target.dataset.id
        let item = this.actor.items.get(itemId);
        ev.originalEvent.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            item: item,
            type: "itemDrop",
            }),
          )});

      const newDragDrop = new DragDrop({
        dragSelector:`.dragable`,
        dropSelector:`.items`,
        permissions: { dragstart: this._canDragStart.bind(this), drop: this._canDragDrop.bind(this) },
        callbacks: { dragstart: this._onDragStart.bind(this), drop: this._onDrop.bind(this) }
      })
      this._dragDrop.push(newDragDrop);
    }

    async _removeDeathSaves(event) {
      event.preventDefault();
      this.actor.update({ "data.deathSaves": 0 });
    }
    async _addDeathSaves(event) {
      event.preventDefault();
      this.actor.update({ "data.deathSaves": this.actor.data.data.deathSaves + 1 });
    }
    
    async _onDrop(event, data) {
      let dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (dragData.type === "itemDrop") {
        let previousActor = null
        game.actors.forEach(actor => {
          actor.items.forEach(item => {
              if(dragData.item._id == item.id) {
                previousActor = actor
              }
          });
        });
        if (typeof(dragData.item.data.quantity) === 'string' && dragData.item.data.quantity.includes("d")){
          let messageData = {
            speaker: {alias: this.actor.name},
            flavor: `<h1>Quantity of ${dragData.item.name}</h1>`,
          }
    
          let roll = await new Roll(dragData.item.data.quantity).roll().toMessage(messageData)
          dragData.item.data.quantity = Math.floor(roll.roll.total)
          this._addItem(this.actor, dragData.item)
          if (previousActor) {
            previousActor.deleteOwnedItem(dragData.item._id)
          }
          return
        }
        if (dragData.item.data.quantity != 0) {
          if (dragData.item.data.quantity > 1) {
            let content =  `${ game.i18n.localize("WITCHER.Items.transferMany")}: <input class="small" name="numberOfItem" value=1>/${dragData.item.data.quantity} <br />`
            let cancel = true
            let numberOfItem = 0
            let dialogData = {
              buttons : [
              [`${game.i18n.localize("WITCHER.Button.Continue")}`, (html)=>{  
                numberOfItem = html.find("[name=numberOfItem]")[0].value;
                cancel = false
              } ]],
              title : game.i18n.localize("WITCHER.Items.transferTitle"),
              content : content
            }
            await buttonDialog(dialogData)
            if (cancel) {
              return
            }else {
              let item = previousActor.items.get(dragData.item._id)
              let newQuantity = dragData.item.data.quantity - numberOfItem
              if (newQuantity <= 0 ){
                previousActor.deleteOwnedItem(dragData.item._id)
              }else {
                item.update({'data.quantity': newQuantity <0 ? 0 : newQuantity})
              }
              if (numberOfItem > dragData.item.data.quantity) {
                numberOfItem = dragData.item.data.quantity
              }
              dragData.item.data.quantity = numberOfItem
              this._addItem(this.actor, dragData.item)
            }
          }else {
            this._addItem(this.actor, dragData.item)
            if (previousActor) {
              previousActor.deleteOwnedItem(dragData.item._id)
            }
          }
        }
      } else {
        super._onDrop(event, data);
      }
    }

    async _addItem(actor, Additem) {
      let foundItem = (actor.items).find(item => item.name == Additem.name);
      console.log(foundItem)
      if (foundItem){
        foundItem.update({'data.quantity': Number(foundItem.data.data.quantity) + Number(Additem.data.quantity)})
      }
      else {
        actor.createEmbeddedDocuments("Item", [Additem]);
      }
    }

    async _chooseEnhancement(event) {
      let itemId = event.currentTarget.closest(".item").dataset.itemId;
      let item = this.actor.items.get(itemId)
      let type = event.currentTarget.closest(".item").dataset.type;
      
      let content = ""
      let enhancements = []
      if (type == "weapon"){
        enhancements = this.actor.items.filter(function(item) {return item.type == "enhancement" && item.data.data.type == "rune" && item.data.data.applied == false});
      }
      else {
        enhancements = this.actor.items.filter(function(item) {return item.type == "enhancement" && item.data.data.applied == false && (item.data.data.type == "armor" || item.data.data.type == "glyph")});
      }
       
      let quantity = enhancements.sum("quantity")
      if (quantity == 0 ) {
        content += `<div class="error-display">${game.i18n.localize("WITCHER.Enhancement.NoEnhancement")}</div>`
      }else {
        let enhancementsOption = ``
        enhancements.forEach(element => {
          enhancementsOption += `<option value="${element.data._id}"> ${element.data.name}(${element.data.data.quantity}) </option>`;
        });
        content += `<div><label>${game.i18n.localize("WITCHER.Dialog.Enhancement")}: <select name="enhancement">${enhancementsOption}</select></label></div>`
      }

      new Dialog({
        title: `${game.i18n.localize("WITCHER.Enhancement.ChooseTitle")}`, 
        content,
        buttons: {
          Cancel: {
            label:`${game.i18n.localize("WITCHER.Button.Cancel")}`, 
            callback: ()=>{}}, 
          Apply: {
            label: `${game.i18n.localize("WITCHER.Dialog.Apply")}`, 
            callback: (html) => {
            let enhancementId = undefined
            if (html.find("[name=enhancement]")[0]) {
              enhancementId = html.find("[name=enhancement]")[0].value;
            }
            let choosedEnhancement = this.actor.items.get(enhancementId)
            if (item && choosedEnhancement){
              let newEnhancementList = []
              let added = false
              item.data.data.enhancementItems.forEach(element => {
                if ((JSON.stringify(element) === '{}'|| !element) && !added) {
                  element = choosedEnhancement
                  added = true
                }
                newEnhancementList.push(element)
              });
              if (type == "weapon") {
                item.update({ 'data.enhancementItems': newEnhancementList})
              }
              else {
                let allEffects = item.data.data.effects
                allEffects.push(...choosedEnhancement.data.data.effects)
                if (choosedEnhancement.data.data.type == "armor") {
                  item.update({ 'data.enhancementItems': newEnhancementList,
                                "data.headStopping": item.data.data.headStopping + choosedEnhancement.data.data.stopping,
                                "data.headMaxStopping": item.data.data.headMaxStopping + choosedEnhancement.data.data.stopping,
                                "data.torsoStopping": item.data.data.torsoStopping + choosedEnhancement.data.data.stopping,
                                "data.torsoMaxStopping": item.data.data.torsoMaxStopping + choosedEnhancement.data.data.stopping,
                                "data.leftArmStopping": item.data.data.leftArmStopping + choosedEnhancement.data.data.stopping,
                                "data.leftArmMaxStopping": item.data.data.leftArmMaxStopping + choosedEnhancement.data.data.stopping,
                                "data.rightArmStopping": item.data.data.rightArmStopping + choosedEnhancement.data.data.stopping,
                                "data.rightArmMaxStopping": item.data.data.rightArmMaxStopping + choosedEnhancement.data.data.stopping,
                                "data.leftLegStopping": item.data.data.leftLegStopping + choosedEnhancement.data.data.stopping,
                                "data.leftLegMaxStopping": item.data.data.leftLegMaxStopping + choosedEnhancement.data.data.stopping,
                                "data.rightLegStopping": item.data.data.rightLegStopping + choosedEnhancement.data.data.stopping,
                                "data.rightLegMaxStopping": item.data.data.rightLegMaxStopping + choosedEnhancement.data.data.stopping,
                                'data.bludgeoning': choosedEnhancement.data.data.bludgeoning,
                                'data.slashing': choosedEnhancement.data.data.slashing,
                                'data.percing': choosedEnhancement.data.data.percing,
                                'data.effects': allEffects})
                }
                else {
                  item.update({'data.effects': allEffects})
                }
                choosedEnhancement.update({ 'data.applied': true,
                                            'data.weight': 0})
              }
            }
          }
        }
        }}).render(true) 
      }
    
    async _onAddSkillModifier(event){
      let stat = event.currentTarget.closest(".skill").dataset.stat;
      let skill = event.currentTarget.closest(".skill").dataset.skill;
      let newModifierList  = []
      if (this.actor.data.data.skills[stat][skill].modifiers){
        newModifierList = this.actor.data.data.skills[stat][skill].modifiers
      }
      newModifierList.push({id: genId(), name: "Modifier", value: 0})
      
      switch(skill) {
        case "awareness": this.actor.update({ 'data.skills.int.awareness.modifiers': newModifierList}); break;
        case "business": this.actor.update({ 'data.skills.int.business.modifiers': newModifierList}); break;
        case "deduction": this.actor.update({ 'data.skills.int.deduction.modifiers': newModifierList}); break;
        case "education": this.actor.update({ 'data.skills.int.education.modifiers': newModifierList}); break;
        case "commonsp": this.actor.update({ 'data.skills.int.commonsp.modifiers': newModifierList}); break;
        case "eldersp": this.actor.update({ 'data.skills.int.eldersp.modifiers': newModifierList}); break;
        case "dwarven": this.actor.update({ 'data.skills.int.dwarven.modifiers': newModifierList}); break;
        case "monster": this.actor.update({ 'data.skills.int.monster.modifiers': newModifierList}); break;
        case "socialetq": this.actor.update({ 'data.skills.int.socialetq.modifiers': newModifierList}); break;
        case "streetwise": this.actor.update({ 'data.skills.int.streetwise.modifiers': newModifierList}); break;
        case "tactics": this.actor.update({ 'data.skills.int.tactics.modifiers': newModifierList}); break;
        case "teaching": this.actor.update({ 'data.skills.int.teaching.modifiers': newModifierList}); break;
        case "wilderness": this.actor.update({ 'data.skills.int.wilderness.modifiers': newModifierList}); break;
        
        case "brawling": this.actor.update({ 'data.skills.ref.brawling.modifiers': newModifierList}); break;
        case "dodge": this.actor.update({ 'data.skills.ref.dodge.modifiers': newModifierList}); break;
        case "melee": this.actor.update({ 'data.skills.ref.melee.modifiers': newModifierList}); break;
        case "riding": this.actor.update({ 'data.skills.ref.riding.modifiers': newModifierList}); break;
        case "sailing": this.actor.update({ 'data.skills.ref.sailing.modifiers': newModifierList}); break;
        case "smallblades": this.actor.update({ 'data.skills.ref.smallblades.modifiers': newModifierList}); break;
        case "staffspear": this.actor.update({ 'data.skills.ref.staffspear.modifiers': newModifierList}); break;
        case "swordsmanship": this.actor.update({ 'data.skills.ref.swordsmanship.modifiers': newModifierList}); break;
        
        case "courage": this.actor.update({ 'data.skills.will.courage.modifiers': newModifierList}); break;
        case "hexweave": this.actor.update({ 'data.skills.will.hexweave.modifiers': newModifierList}); break;
        case "intimidation": this.actor.update({ 'data.skills.will.intimidation.modifiers': newModifierList}); break;
        case "spellcast": this.actor.update({ 'data.skills.will.spellcast.modifiers': newModifierList}); break;
        case "resistmagic": this.actor.update({ 'data.skills.will.resistmagic.modifiers': newModifierList}); break;
        case "resistcoerc": this.actor.update({ 'data.skills.will.resistcoerc.modifiers': newModifierList}); break;
        case "ritcraft": this.actor.update({ 'data.skills.will.ritcraft.modifiers': newModifierList}); break;
 
        case "archery": this.actor.update({ 'data.skills.dex.archery.modifiers': newModifierList}); break;
        case "athletics": this.actor.update({ 'data.skills.dex.athletics.modifiers': newModifierList}); break;
        case "crossbow": this.actor.update({ 'data.skills.dex.crossbow.modifiers': newModifierList}); break;
        case "sleight": this.actor.update({ 'data.skills.dex.sleight.modifiers': newModifierList}); break;
        case "stealth": this.actor.update({ 'data.skills.dex.stealth.modifiers': newModifierList}); break;
        
        case "alchemy": this.actor.update({ 'data.skills.cra.alchemy.modifiers': newModifierList}); break;
        case "crafting": this.actor.update({ 'data.skills.cra.crafting.modifiers': newModifierList}); break;
        case "disguise": this.actor.update({ 'data.skills.cra.disguise.modifiers': newModifierList}); break;
        case "firstaid": this.actor.update({ 'data.skills.cra.firstaid.modifiers': newModifierList}); break;
        case "forgery": this.actor.update({ 'data.skills.cra.forgery.modifiers': newModifierList}); break;
        case "picklock": this.actor.update({ 'data.skills.cra.picklock.modifiers': newModifierList}); break;
        case "trapcraft": this.actor.update({ 'data.skills.cra.trapcraft.modifiers': newModifierList}); break;

        case "physique": this.actor.update({ 'data.skills.body.physique.modifiers': newModifierList}); break;
        case "endurance": this.actor.update({ 'data.skills.body.endurance.modifiers': newModifierList}); break;
        
        case "charisma": this.actor.update({ 'data.skills.emp.charisma.modifiers': newModifierList}); break;
        case "deceit": this.actor.update({ 'data.skills.emp.deceit.modifiers': newModifierList}); break;
        case "finearts": this.actor.update({ 'data.skills.emp.finearts.modifiers': newModifierList}); break;
        case "gambling": this.actor.update({ 'data.skills.emp.gambling.modifiers': newModifierList}); break;
        case "grooming": this.actor.update({ 'data.skills.emp.grooming.modifiers': newModifierList}); break;
        case "perception": this.actor.update({ 'data.skills.emp.perception.modifiers': newModifierList}); break;
        case "leadership": this.actor.update({ 'data.skills.emp.leadership.modifiers': newModifierList}); break;
        case "persuasion": this.actor.update({ 'data.skills.emp.persuasion.modifiers': newModifierList}); break;
        case "performance": this.actor.update({ 'data.skills.emp.performance.modifiers': newModifierList}); break;
        case "seduction": this.actor.update({ 'data.skills.emp.seduction.modifiers': newModifierList}); break;
      }
    }

    async _onAddModifier(event){
      event.preventDefault();
      let stat = event.currentTarget.closest(".stat-display").dataset.stat;
      let type = event.currentTarget.closest(".stat-display").dataset.type;
      
      let newModifierList  = []
      if (type == "coreStat") {
        if (this.actor.data.data.coreStats[stat].modifiers){
          newModifierList = this.actor.data.data.coreStats[stat].modifiers
        }
      }else  if (type == "derivedStat") {
        newModifierList = this.actor.data.data.derivedStats[stat].modifiers
      }else {
        if (this.actor.data.data.stats[stat].modifiers){
          newModifierList = this.actor.data.data.stats[stat].modifiers
        }
      }

      newModifierList.push({id: genId(), name: "Modifier", value: 0})

      switch(stat) {
        case "int": this.actor.update({ 'data.stats.int.modifiers': newModifierList}); break;
        case "ref": this.actor.update({ 'data.stats.ref.modifiers': newModifierList}); break;
        case "dex": this.actor.update({ 'data.stats.dex.modifiers': newModifierList}); break;
        case "body": this.actor.update({ 'data.stats.body.modifiers': newModifierList}); break;
        case "spd": this.actor.update({ 'data.stats.spd.modifiers': newModifierList}); break;
        case "emp": this.actor.update({ 'data.stats.emp.modifiers': newModifierList}); break;
        case "cra": this.actor.update({ 'data.stats.cra.modifiers': newModifierList}); break;
        case "will": this.actor.update({ 'data.stats.will.modifiers': newModifierList}); break;
        case "luck": this.actor.update({ 'data.stats.luck.modifiers': newModifierList}); break;
        case "stun": this.actor.update({ 'data.coreStats.stun.modifiers': newModifierList}); break;
        case "run": this.actor.update({ 'data.coreStats.run.modifiers': newModifierList}); break;
        case "leap": this.actor.update({ 'data.coreStats.leap.modifiers': newModifierList}); break;
        case "enc": this.actor.update({ 'data.coreStats.enc.modifiers': newModifierList}); break;
        case "rec": this.actor.update({ 'data.coreStats.rec.modifiers': newModifierList}); break;
        case "woundTreshold": this.actor.update({ 'data.coreStats.woundTreshold.modifiers': newModifierList}); break;
        case "hp": this.actor.update({ 'data.derivedStats.hp.modifiers': newModifierList}); break;
        case "sta": this.actor.update({ 'data.derivedStats.sta.modifiers': newModifierList}); break;
        case "resolve": this.actor.update({ 'data.derivedStats.resolve.modifiers': newModifierList}); break;
        case "focus": this.actor.update({ 'data.derivedStats.focus.modifiers': newModifierList}); break;
      }
    }

    async _onCritAdd(event) {
        event.preventDefault();
        const prevCritList = this.actor.data.data.critWounds;
        const newCritList = Object.values(prevCritList).map((details) => details);
        newCritList.push({
            id: genId(),
            effect: witcher.CritGravityDefaultEffect.Simple,
            mod: "None",
            description: witcher.CritDescription.SimpleCrackedJaw,
            notes: "",
        });
        this.actor.update({ "data.critWounds": newCritList });
    }
    
    async _onSkillModifierEdit(event){
      let stat = event.currentTarget.closest(".skill").dataset.stat;
      let skill = event.currentTarget.closest(".skill").dataset.skill;

      let element = event.currentTarget;
      let itemId = element.closest(".list-modifiers").dataset.id;
      
      let field = element.dataset.field;
      let value = element.value
      let modifiers = this.actor.data.data.skills[stat][skill].modifiers;

      let objIndex = modifiers.findIndex((obj => obj.id == itemId));
      modifiers[objIndex][field] = value
      
      switch(skill) {
        case "awareness": this.actor.update({ 'data.skills.int.awareness.modifiers': modifiers}); break;
        case "business": this.actor.update({ 'data.skills.int.business.modifiers': modifiers}); break;
        case "deduction": this.actor.update({ 'data.skills.int.deduction.modifiers': modifiers}); break;
        case "education": this.actor.update({ 'data.skills.int.education.modifiers': modifiers}); break;
        case "commonsp": this.actor.update({ 'data.skills.int.commonsp.modifiers': modifiers}); break;
        case "eldersp": this.actor.update({ 'data.skills.int.eldersp.modifiers': modifiers}); break;
        case "dwarven": this.actor.update({ 'data.skills.int.dwarven.modifiers': modifiers}); break;
        case "monster": this.actor.update({ 'data.skills.int.monster.modifiers': modifiers}); break;
        case "socialetq": this.actor.update({ 'data.skills.int.socialetq.modifiers': modifiers}); break;
        case "streetwise": this.actor.update({ 'data.skills.int.streetwise.modifiers': modifiers}); break;
        case "tactics": this.actor.update({ 'data.skills.int.tactics.modifiers': modifiers}); break;
        case "teaching": this.actor.update({ 'data.skills.int.teaching.modifiers': modifiers}); break;
        case "wilderness": this.actor.update({ 'data.skills.int.wilderness.modifiers': modifiers}); break;
        
        case "brawling": this.actor.update({ 'data.skills.ref.brawling.modifiers': modifiers}); break;
        case "dodge": this.actor.update({ 'data.skills.ref.dodge.modifiers': modifiers}); break;
        case "melee": this.actor.update({ 'data.skills.ref.melee.modifiers': modifiers}); break;
        case "riding": this.actor.update({ 'data.skills.ref.riding.modifiers': modifiers}); break;
        case "sailing": this.actor.update({ 'data.skills.ref.sailing.modifiers': modifiers}); break;
        case "smallblades": this.actor.update({ 'data.skills.ref.smallblades.modifiers': modifiers}); break;
        case "staffspear": this.actor.update({ 'data.skills.ref.staffspear.modifiers': modifiers}); break;
        case "swordsmanship": this.actor.update({ 'data.skills.ref.swordsmanship.modifiers': modifiers}); break;
        
        case "courage": this.actor.update({ 'data.skills.will.courage.modifiers': modifiers}); break;
        case "hexweave": this.actor.update({ 'data.skills.will.hexweave.modifiers': modifiers}); break;
        case "intimidation": this.actor.update({ 'data.skills.will.intimidation.modifiers': modifiers}); break;
        case "spellcast": this.actor.update({ 'data.skills.will.spellcast.modifiers': modifiers}); break;
        case "resistmagic": this.actor.update({ 'data.skills.will.resistmagic.modifiers': modifiers}); break;
        case "resistcoerc": this.actor.update({ 'data.skills.will.resistcoerc.modifiers': modifiers}); break;
        case "ritcraft": this.actor.update({ 'data.skills.will.ritcraft.modifiers': modifiers}); break;
 
        case "archery": this.actor.update({ 'data.skills.dex.archery.modifiers': modifiers}); break;
        case "athletics": this.actor.update({ 'data.skills.dex.athletics.modifiers': modifiers}); break;
        case "crossbow": this.actor.update({ 'data.skills.dex.crossbow.modifiers': modifiers}); break;
        case "sleight": this.actor.update({ 'data.skills.dex.sleight.modifiers': modifiers}); break;
        case "stealth": this.actor.update({ 'data.skills.dex.stealth.modifiers': modifiers}); break;
        
        case "alchemy": this.actor.update({ 'data.skills.cra.alchemy.modifiers': modifiers}); break;
        case "crafting": this.actor.update({ 'data.skills.cra.crafting.modifiers': modifiers}); break;
        case "disguise": this.actor.update({ 'data.skills.cra.disguise.modifiers': modifiers}); break;
        case "firstaid": this.actor.update({ 'data.skills.cra.firstaid.modifiers': modifiers}); break;
        case "forgery": this.actor.update({ 'data.skills.cra.forgery.modifiers': modifiers}); break;
        case "picklock": this.actor.update({ 'data.skills.cra.picklock.modifiers': modifiers}); break;
        case "trapcraft": this.actor.update({ 'data.skills.cra.trapcraft.modifiers': modifiers}); break;

        case "physique": this.actor.update({ 'data.skills.body.physique.modifiers': modifiers}); break;
        case "endurance": this.actor.update({ 'data.skills.body.endurance.modifiers': modifiers}); break;
        
        case "charisma": this.actor.update({ 'data.skills.emp.charisma.modifiers': modifiers}); break;
        case "deceit": this.actor.update({ 'data.skills.emp.deceit.modifiers': modifiers}); break;
        case "finearts": this.actor.update({ 'data.skills.emp.finearts.modifiers': modifiers}); break;
        case "gambling": this.actor.update({ 'data.skills.emp.gambling.modifiers': modifiers}); break;
        case "grooming": this.actor.update({ 'data.skills.emp.grooming.modifiers': modifiers}); break;
        case "perception": this.actor.update({ 'data.skills.emp.perception.modifiers': modifiers}); break;
        case "leadership": this.actor.update({ 'data.skills.emp.leadership.modifiers': modifiers}); break;
        case "persuasion": this.actor.update({ 'data.skills.emp.persuasion.modifiers': modifiers}); break;
        case "performance": this.actor.update({ 'data.skills.emp.performance.modifiers': modifiers}); break;
        case "seduction": this.actor.update({ 'data.skills.emp.seduction.modifiers': modifiers}); break;
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
        modifiers = this.actor.data.data.coreStats[stat].modifiers;
      }else if (type == "derivedStat") {
        modifiers = this.actor.data.data.derivedStats[stat].modifiers;
      }else {
        modifiers = this.actor.data.data.stats[stat].modifiers;
      }

      let objIndex = modifiers.findIndex((obj => obj.id == itemId));
      modifiers[objIndex][field] = value
      switch(stat) {
        case "int": this.actor.update({ 'data.stats.int.modifiers': modifiers}); break;
        case "ref": this.actor.update({ 'data.stats.ref.modifiers': modifiers}); break;
        case "dex": this.actor.update({ 'data.stats.dex.modifiers': modifiers}); break;
        case "body": this.actor.update({ 'data.stats.body.modifiers': modifiers}); break;
        case "spd": this.actor.update({ 'data.stats.spd.modifiers': modifiers}); break;
        case "emp": this.actor.update({ 'data.stats.emp.modifiers': modifiers}); break;
        case "cra": this.actor.update({ 'data.stats.cra.modifiers': modifiers}); break;
        case "will": this.actor.update({ 'data.stats.will.modifiers': modifiers}); break;
        case "luck": this.actor.update({ 'data.stats.luck.modifiers': modifiers}); break;
        case "stun": this.actor.update({ 'data.coreStats.stun.modifiers': modifiers}); break;
        case "run": this.actor.update({ 'data.coreStats.run.modifiers': modifiers}); break;
        case "leap": this.actor.update({ 'data.coreStats.leap.modifiers': modifiers}); break;
        case "enc": this.actor.update({ 'data.coreStats.enc.modifiers': modifiers}); break;
        case "rec": this.actor.update({ 'data.coreStats.rec.modifiers': modifiers}); break;
        case "woundTreshold": this.actor.update({ 'data.coreStats.woundTreshold.modifiers': modifiers}); break;
        case "hp": this.actor.update({ 'data.derivedStats.hp.modifiers': modifiers}); break;
        case "sta": this.actor.update({ 'data.derivedStats.sta.modifiers': modifiers}); break;
        case "resolve": this.actor.update({ 'data.derivedStats.resolve.modifiers': modifiers}); break;
        case "focus": this.actor.update({ 'data.derivedStats.focus.modifiers': modifiers}); break;
      }
      updateDerived(this.actor);
    }

    async _onSkillModifierRemove(event){
      let stat = event.currentTarget.closest(".skill").dataset.stat;
      let skill = event.currentTarget.closest(".skill").dataset.skill;

      let prevModList = this.actor.data.data.skills[stat][skill].modifiers;
      const newModList = Object.values(prevModList).map((details) => details);
      const idxToRm = newModList.findIndex((v) => v.id === event.target.dataset.id);
      newModList.splice(idxToRm, 1);
      
      switch(skill) {
        case "awareness": this.actor.update({ 'data.skills.int.awareness.modifiers': newModList}); break;
        case "business": this.actor.update({ 'data.skills.int.business.modifiers': newModList}); break;
        case "deduction": this.actor.update({ 'data.skills.int.deduction.modifiers': newModList}); break;
        case "education": this.actor.update({ 'data.skills.int.education.modifiers': newModList}); break;
        case "commonsp": this.actor.update({ 'data.skills.int.commonsp.modifiers': newModList}); break;
        case "eldersp": this.actor.update({ 'data.skills.int.eldersp.modifiers': newModList}); break;
        case "dwarven": this.actor.update({ 'data.skills.int.dwarven.modifiers': newModList}); break;
        case "monster": this.actor.update({ 'data.skills.int.monster.modifiers': newModList}); break;
        case "socialetq": this.actor.update({ 'data.skills.int.socialetq.modifiers': newModList}); break;
        case "streetwise": this.actor.update({ 'data.skills.int.streetwise.modifiers': newModList}); break;
        case "tactics": this.actor.update({ 'data.skills.int.tactics.modifiers': newModList}); break;
        case "teaching": this.actor.update({ 'data.skills.int.teaching.modifiers': newModList}); break;
        case "wilderness": this.actor.update({ 'data.skills.int.wilderness.modifiers': newModList}); break;
        
        case "brawling": this.actor.update({ 'data.skills.ref.brawling.modifiers': newModList}); break;
        case "dodge": this.actor.update({ 'data.skills.ref.dodge.modifiers': newModList}); break;
        case "melee": this.actor.update({ 'data.skills.ref.melee.modifiers': newModList}); break;
        case "riding": this.actor.update({ 'data.skills.ref.riding.modifiers': newModList}); break;
        case "sailing": this.actor.update({ 'data.skills.ref.sailing.modifiers': newModList}); break;
        case "smallblades": this.actor.update({ 'data.skills.ref.smallblades.modifiers': newModList}); break;
        case "staffspear": this.actor.update({ 'data.skills.ref.staffspear.modifiers': newModList}); break;
        case "swordsmanship": this.actor.update({ 'data.skills.ref.swordsmanship.modifiers': newModList}); break;
        
        case "courage": this.actor.update({ 'data.skills.will.courage.modifiers': newModList}); break;
        case "hexweave": this.actor.update({ 'data.skills.will.hexweave.modifiers': newModList}); break;
        case "intimidation": this.actor.update({ 'data.skills.will.intimidation.modifiers': newModList}); break;
        case "spellcast": this.actor.update({ 'data.skills.will.spellcast.modifiers': newModList}); break;
        case "resistmagic": this.actor.update({ 'data.skills.will.resistmagic.modifiers': newModList}); break;
        case "resistcoerc": this.actor.update({ 'data.skills.will.resistcoerc.modifiers': newModList}); break;
        case "ritcraft": this.actor.update({ 'data.skills.will.ritcraft.modifiers': newModList}); break;
 
        case "archery": this.actor.update({ 'data.skills.dex.archery.modifiers': newModList}); break;
        case "athletics": this.actor.update({ 'data.skills.dex.athletics.modifiers': newModList}); break;
        case "crossbow": this.actor.update({ 'data.skills.dex.crossbow.modifiers': newModList}); break;
        case "sleight": this.actor.update({ 'data.skills.dex.sleight.modifiers': newModList}); break;
        case "stealth": this.actor.update({ 'data.skills.dex.stealth.modifiers': newModList}); break;
        
        case "alchemy": this.actor.update({ 'data.skills.cra.alchemy.modifiers': newModList}); break;
        case "crafting": this.actor.update({ 'data.skills.cra.crafting.modifiers': newModList}); break;
        case "disguise": this.actor.update({ 'data.skills.cra.disguise.modifiers': newModList}); break;
        case "firstaid": this.actor.update({ 'data.skills.cra.firstaid.modifiers': newModList}); break;
        case "forgery": this.actor.update({ 'data.skills.cra.forgery.modifiers': newModList}); break;
        case "picklock": this.actor.update({ 'data.skills.cra.picklock.modifiers': newModList}); break;
        case "trapcraft": this.actor.update({ 'data.skills.cra.trapcraft.modifiers': newModList}); break;

        case "physique": this.actor.update({ 'data.skills.body.physique.modifiers': newModList}); break;
        case "endurance": this.actor.update({ 'data.skills.body.endurance.modifiers': newModList}); break;
        
        case "charisma": this.actor.update({ 'data.skills.emp.charisma.modifiers': newModList}); break;
        case "deceit": this.actor.update({ 'data.skills.emp.deceit.modifiers': newModList}); break;
        case "finearts": this.actor.update({ 'data.skills.emp.finearts.modifiers': newModList}); break;
        case "gambling": this.actor.update({ 'data.skills.emp.gambling.modifiers': newModList}); break;
        case "grooming": this.actor.update({ 'data.skills.emp.grooming.modifiers': newModList}); break;
        case "perception": this.actor.update({ 'data.skills.emp.perception.modifiers': newModList}); break;
        case "leadership": this.actor.update({ 'data.skills.emp.leadership.modifiers': newModList}); break;
        case "persuasion": this.actor.update({ 'data.skills.emp.persuasion.modifiers': newModList}); break;
        case "performance": this.actor.update({ 'data.skills.emp.performance.modifiers': newModList}); break;
        case "seduction": this.actor.update({ 'data.skills.emp.seduction.modifiers': newModList}); break;
      }
    }

    async _onModifierRemove(event) {
      event.preventDefault();
      let stat = event.currentTarget.closest(".stat-display").dataset.stat;
      let type = event.currentTarget.closest(".stat-display").dataset.type;
      let prevModList = []
      if (type == "coreStat") {
        prevModList = this.actor.data.data.coreStats[stat].modifiers;
      }else if(type == "derivedStat"){
        prevModList = this.actor.data.data.derivedStats[stat].modifiers;
      }else {
        prevModList = this.actor.data.data.stats[stat].modifiers;
      }
      const newModList = Object.values(prevModList).map((details) => details);
      const idxToRm = newModList.findIndex((v) => v.id === event.target.dataset.id);
      newModList.splice(idxToRm, 1);
      switch(stat) {
        case "int": this.actor.update({ 'data.stats.int.modifiers': newModList}); break;
        case "ref": this.actor.update({ 'data.stats.ref.modifiers': newModList}); break;
        case "dex": this.actor.update({ 'data.stats.dex.modifiers': newModList}); break;
        case "body": this.actor.update({ 'data.stats.body.modifiers': newModList}); break;
        case "spd": this.actor.update({ 'data.stats.spd.modifiers': newModList}); break;
        case "emp": this.actor.update({ 'data.stats.emp.modifiers': newModList}); break;
        case "cra": this.actor.update({ 'data.stats.cra.modifiers': newModList}); break;
        case "will": this.actor.update({ 'data.stats.will.modifiers': newModList}); break;
        case "luck": this.actor.update({ 'data.stats.luck.modifiers': newModList}); break;
        case "stun": this.actor.update({ 'data.coreStats.stun.modifiers': newModList}); break;
        case "run": this.actor.update({ 'data.coreStats.run.modifiers': newModList}); break;
        case "leap": this.actor.update({ 'data.coreStats.leap.modifiers': newModList}); break;
        case "enc": this.actor.update({ 'data.coreStats.enc.modifiers': newModList}); break;
        case "rec": this.actor.update({ 'data.coreStats.rec.modifiers': newModList}); break;
        case "woundTreshold": this.actor.update({ 'data.coreStats.woundTreshold.modifiers': newModList}); break;
        case "hp": this.actor.update({ 'data.derivedStats.hp.modifiers': newModList}); break;
        case "sta": this.actor.update({ 'data.derivedStats.sta.modifiers': newModList}); break;
        case "resolve": this.actor.update({ 'data.derivedStats.resolve.modifiers': newModList}); break;
        case "focus": this.actor.update({ 'data.derivedStats.focus.modifiers': newModList}); break;
      }
      updateDerived(this.actor);
  }

  async _onCritRemove(event) {
      event.preventDefault();
      const prevCritList = this.actor.data.data.critWounds;
      const newCritList = Object.values(prevCritList).map((details) => details);
      const idxToRm = newCritList.findIndex((v) => v.id === event.target.dataset.id);
      newCritList.splice(idxToRm, 1);
      this.actor.update({ "data.critWounds": newCritList });
  }

    
    async _onItemAdd(event) {
      let element = event.currentTarget
      let itemData = {
        name: `new ${element.dataset.itemtype}`, 
        type: element.dataset.itemtype
      }

      switch(element.dataset.spelltype){
        case  "spellNovice":
          itemData.data={ class: "Spells", level:"novice"}
          break;
        case  "spellJourneyman":
          itemData.data={ class: "Spells", level:"journeyman"}
          break;
        case  "spellMaster":
          itemData.data={ class: "Spells", level:"master"}
          break;
        case  "rituals":
          itemData.data={ class: "Rituals"}
          break;
        case  "hexes":
          itemData.data={ class: "Hexes"}
          break;
      }

      if (element.dataset.itemtype == "component") {
        if (element.dataset.subtype) {
          itemData.data = { type: "substances", substanceType: element.dataset.subtype}
        }else{
          itemData.data = { type: "component", substanceType: element.dataset.subtype}
        }
      }

      this.actor.createOwnedItem(itemData)
    }

    async _onAddActiveEffect(){
      let itemData = {
        name: `new effect`, 
        type: "effect"
      }
      this.actor.createOwnedItem(itemData)
    }

    async _alchemyCraft(event) {
      let itemId = event.currentTarget.closest(".item").dataset.itemId;
      let item = this.actor.items.get(itemId);

      const content = `<label>${game.i18n.localize("WITCHER.Dialog.Crafting")} ${item.data.name}</label> <br /> Work in progress`;

      let messageData = {
        speaker: {alias: this.actor.name},
        flavor: `<h1>Crafting</h1>`,
      }

      new Dialog({
        title: `${game.i18n.localize("WITCHER.Dialog.AlchemyTitle")}`, 
        content,
        buttons: {
          Craft: {
            label: `${game.i18n.localize("WITCHER.Dialog.ButtonCraft")}`, 
            callback: (html) => {
              let stat = this.actor.data.data.stats.cra.current;
              let skill = this.actor.data.data.skills.cra.alchemy.value;
              messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.CraftingAlchemycal")}</h1>`,
              messageData.flavor += `${game.i18n.localize("WITCHER.Diagram.alchemyDC")} ${item.data.data.alchemyDC}`;
              
              if (!item.data.data.alchemyDC || item.data.data.alchemyDC == 0){
                stat = this.actor.data.data.stats.cra.current;
                skill = this.actor.data.data.skills.cra.crafting.value;
                messageData.flavor = `${game.i18n.localize("WITCHER.DiagramcraftingDC")} ${item.data.data.craftingDC}`;
              }
              let rollFormula = `1d10+${stat}+${skill}`;
              new Roll(rollFormula).roll().toMessage(messageData);
            }
          }
        }}).render(true) 
    }


    async _onSpellRoll(event, itemId = null) {
      
      let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

      if (!itemId){
        itemId = event.currentTarget.closest(".item").dataset.itemId;
      }
      let spellItem = this.actor.items.get(itemId);
      let formula = `1d10`
      formula += !displayRollDetails ? `+${this.actor.data.data.stats.will.current}`: `+${this.actor.data.data.stats.will.current}[${game.i18n.localize("WITCHER.StWill")}]`;
      switch(spellItem.data.data.class) {
        case "Witcher":
        case "Invocations":
        case "Spells":
          formula +=  !displayRollDetails ? `+${this.actor.data.data.skills.will.spellcast.value}`: `+${this.actor.data.data.skills.will.spellcast.value}[${game.i18n.localize("WITCHER.SkWillSpellcastLable")}]`;
          break;
        case "Rituals":
          formula +=  !displayRollDetails ? `+${this.actor.data.data.skills.will.ritcraft.value}`:`+${this.actor.data.data.skills.will.ritcraft.value}[${game.i18n.localize("WITCHER.SkWillRitCraftLable")}]`;
          break;
        case "Hexes":
          formula +=  !displayRollDetails ? `+${this.actor.data.data.skills.will.hexweave.value}`:`+${this.actor.data.data.skills.will.hexweave.value}[${game.i18n.localize("WITCHER.SkWillHexLable")}]`;
          break;
      }
      let staCostTotal = spellItem.data.data.stamina;
      let customModifier = 0;
      let isExtraAttack = false
      let content = `<label>${game.i18n.localize("WITCHER.Dialog.attackExtra")}: <input type="checkbox" name="isExtraAttack"></label> <br />`
      if (spellItem.data.data.staminaIsVar){
        content += `${game.i18n.localize("WITCHER.Spell.staminaDialog")}<input class="small" name="staCost" value=1> <br />`
      }
      content += `<label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input class="small" name="customMod" value=0></label> <br />`;
      let cancel = true
      let dialogData = {
        buttons : [
        [`${game.i18n.localize("WITCHER.Button.Continue")}`, (html)=>{  
          if (spellItem.data.data.staminaIsVar){
            staCostTotal = html.find("[name=staCost]")[0].value;
          }
          customModifier = html.find("[name=customMod]")[0].value;
          isExtraAttack = html.find("[name=isExtraAttack]").prop("checked");
          cancel = false
        } ]],
        title : game.i18n.localize("WITCHER.Spell.MagicCost"),
        content : content
      }
      await buttonDialog(dialogData)
      if (cancel) {
        return
      }
      let newSta  = this.actor.data.data.derivedStats.sta.value
      if (isExtraAttack) {
        newSta -= 3
        if (newSta < 0) {
          return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
        }
        this.actor.update({ 
          'data.derivedStats.sta.value': newSta
        });
      }
      let staCostdisplay = staCostTotal;
      let staFocus = 0 
      if (this.actor.data.data.focus1) {
        staFocus = Number(this.actor.data.data.focus1.value) + Number(this.actor.data.data.focus2.value) + Number(this.actor.data.data.focus3.value) + Number(this.actor.data.data.focus4.value) 
      }
      
      staCostTotal -= staFocus
      if (staCostTotal < 0) {
        staCostTotal = 0
      }

      newSta -= staCostTotal
      if (newSta < 0) {
        return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
      }
      
      this.actor.update({ 
        'data.derivedStats.sta.value': newSta
      });
      staCostdisplay += `-${staFocus}[Focus]`
	
      if (customModifier < 0){formula += !displayRollDetails ? `${customModifier}`: `${customModifier}[${game.i18n.localize("WITCHER.Settings.Custom")}]`}
      if (customModifier > 0){formula += !displayRollDetails ? `+${customModifier}` : `+${customModifier}[${game.i18n.localize("WITCHER.Settings.Custom")}]`}
      let rollResult = new Roll(formula).roll()
      let messageData = {flavor:`<h2><img src="${spellItem.img}" class="item-img" />${spellItem.name}</h2>
          <div><b>${game.i18n.localize("WITCHER.Spell.StaCost")}: </b>${staCostdisplay}</div>
          <div><b>${game.i18n.localize("WITCHER.Spell.Effect")}: </b>${spellItem.data.data.effect}</div>`}
      if (spellItem.data.data.range) {
        messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Range")}: </b>${spellItem.data.data.range}</div>`
      }
      if (spellItem.data.data.duration) {
        messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Duration")}: </b>${spellItem.data.data.duration}</div>`
      }
      if (spellItem.data.data.defence) {
        messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Defence")}: </b>${spellItem.data.data.defence}</div>`
      }
      if (spellItem.data.data.preparationTime) {
        messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.PrepTime")}: </b>${spellItem.data.data.preparationTime}</div>`
      }
      if (spellItem.data.data.dificultyCheck) {
        messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.DC")}: </b>${spellItem.data.data.dificultyCheck}</div>`
      }
      if (spellItem.data.data.components) {
        messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Components")}: </b>${spellItem.data.data.components}</div>`
      }
      if (spellItem.data.data.alternateComponents) {
        messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.AlternateComponents")}: </b>${spellItem.data.data.alternateComponents}</div>`
      }
      if (spellItem.data.data.liftRequirement) {
        messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Requirements")}: </b>${spellItem.data.data.liftRequirement}</div>`
      }

      if (spellItem.data.data.causeDamages) {
        let effects = JSON.stringify(spellItem.data.data.effects)
        messageData.flavor += `<button class="damage" data-img="${spellItem.img}" data-name="${spellItem.name}" data-dmg="${spellItem.data.data.damage}" data-location="random" data-effects='${effects}'>${game.i18n.localize("WITCHER.table.Damage")}</button>`;
      }
      
      if (rollResult.dice[0].results[0].result == 10){  
        messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
      }
      else if(rollResult.dice[0].results[0].result == 1) {  
        messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
      }

      rollResult.toMessage(messageData)

      let token = this.actor.token;
      if (token && spellItem.data.data.createTemplate) {
        let distance = Number(spellItem.data.data.templateSize)
        let direction = 0
        if (spellItem.data.data.templateType == "rect") {
          distance = Math.hypot(Number(spellItem.data.data.templateSize))
          direction = 45
        }
        let templateData = {
          t: spellItem.data.data.templateType,
          user: game.user._id,
          distance: distance,
          direction: direction,
          x: token.data.x + (token.data.width * 100) / 2,
          y: token.data.y  + (token.data.height * 100) / 2,
          fillColor: game.user.color
        }


        await MeasuredTemplate.create(templateData);
      }
    }

    async _onProfessionRoll(event) {
      let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
      let stat = event.currentTarget.closest(".profession-display").dataset.stat;
      let level = event.currentTarget.closest(".profession-display").dataset.level;
      let name = event.currentTarget.closest(".profession-display").dataset.name;
      let effet = event.currentTarget.closest(".profession-display").dataset.effet;
      let statValue = 0
      let statName = 0
      switch(stat){
        case "int":
            statValue = this.actor.data.data.stats.int.current;
            statName = "WITCHER.StInt";
            break;
        case "ref":
            statValue = this.actor.data.data.stats.ref.current;
            statName = "WITCHER.StRef";
            break;
        case "dex":
            statValue = this.actor.data.data.stats.dex.current;
            statName = "WITCHER.StDex";
            break;
        case "body":
            statValue = this.actor.data.data.stats.body.current;
            statName = "WITCHER.StBody";
            break;
        case "spd":
            statValue = this.actor.data.data.stats.spd.current;
            statName = "WITCHER.StSpd";
            break;
        case "emp":
            statValue = this.actor.data.data.stats.emp.current;
            statName = "WITCHER.StEmp";
            break;
        case "cra":
            statValue = this.actor.data.data.stats.cra.current;
            statName = "WITCHER.StCra";
            break;
        case "will":
            statValue = this.actor.data.data.stats.will.current;
            statName = "WITCHER.StWill";
            break;
        case "luck":
            statValue = this.actor.data.data.stats.int.current;
            statName = "WITCHER.StLuck";
            break;
      }
      let rollFormula = !displayRollDetails ? `1d10+${statValue}+${level}`: `1d10+${statValue}[${game.i18n.localize(statName)}]+${level}[${name}]`;
      let rollResult = new Roll(rollFormula).roll()
      let messageData = {flavor: `<h2>${name}</h2>${effet}`}
      if (rollResult.dice[0].results[0].result == 10){  
        messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
      }
      else if(rollResult.dice[0].results[0].result == 1) {  
        messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
      }
      rollResult.toMessage(messageData)
    }

    async _onInitRoll(event) {
      this.actor.rollInitiative({createCombatants: true, rerollInitiative: true})
    }

    async _onCritRoll(event) {
      let rollResult = new Roll("1d10x10").roll()
      rollResult.toMessage()
    }

    async _onDeathSaveRoll(event) {
      let rollResult = new Roll("1d10").roll()
      let stunBase = Math.floor((this.actor.data.data.stats.body.max + this.actor.data.data.stats.will.max)/2);
      if(stunBase > 10){
        stunBase = 10;
      }
      stunBase -= this.actor.data.data.deathSaves
      
      let messageData = {flavor: `
      <h2>${game.i18n.localize("WITCHER.DeathSave")}</h2>
      <div class="roll-summary">
          <div class="dice-formula">${game.i18n.localize("WITCHER.Chat.SaveText")} <b>${stunBase}</b></div>
      </div>
      <hr />`}
      if (rollResult.total < stunBase) {
        messageData.flavor += `<div  class="dice-sucess"> <b>${game.i18n.localize("WITCHER.Chat.Success")}</b></div>`
      }
      else {
        messageData.flavor += `<div  class="dice-fail"><b>${game.i18n.localize("WITCHER.Chat.Fail")}</b></div>`
      }
      rollResult.toMessage(messageData);
    }

    async _onDefenceRoll(event) {
      ExecuteDefense(this.actor)
      
     
    }
    
    async _onStatSaveRoll(event) {
      let stat = event.currentTarget.closest(".stat-display").dataset.stat;
      let statValue = 0
      let statName = 0
      switch(stat){
        case "int":
            statValue = this.actor.data.data.stats.int.current;
            statName = "WITCHER.StInt";
            break;
        case "ref":
            statValue = this.actor.data.data.stats.ref.current;
            statName = "WITCHER.StRef";
            break;
        case "dex":
            statValue = this.actor.data.data.stats.dex.current;
            statName = "WITCHER.StDex";
            break;
        case "body":
            statValue = this.actor.data.data.stats.body.current;
            statName = "WITCHER.StBody";
            break;
        case "spd":
            statValue = this.actor.data.data.stats.spd.current;
            statName = "WITCHER.StSpd";
            break;
        case "emp":
            statValue = this.actor.data.data.stats.emp.current;
            statName = "WITCHER.StEmp";
            break;
        case "cra":
            statValue = this.actor.data.data.stats.cra.current;
            statName = "WITCHER.StCra";
            break;
        case "will":
            statValue = this.actor.data.data.stats.will.current;
            statName = "WITCHER.StWill";
            break;
        case "luck":
            statValue = this.actor.data.data.stats.luck.current;
            statName = "WITCHER.StLuck";
            break;
      }

      let rollResult = new Roll("1d10").roll()
      let messageData = {}
      messageData.flavor = `
      <h2>${game.i18n.localize(statName)}</h2>
      <div class="roll-summary">
          <div class="dice-formula">${game.i18n.localize("WITCHER.Chat.SaveText")} <b>${statValue}</b></div>
      </div>
      <hr />`
      if (rollResult.total < statValue) {
        messageData.flavor += `<div  class="dice-sucess"> <b>${game.i18n.localize("WITCHER.Chat.Success")}</b></div>`
      }
      else {
        messageData.flavor += `<div  class="dice-fail"><b>${game.i18n.localize("WITCHER.Chat.Fail")}</b></div>`
      }
      rollResult.toMessage(messageData);
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
      if(value == "false") { 
        value = true
      }
      if(value == "true" || value== "checked") { 
        value = false
      }
      
      return item.update({[field]: value});
    }
    
    _onItemEdit(event) {
      event.preventDefault(); 
      let itemId = event.currentTarget.closest(".item").dataset.itemId;
      let item = this.actor.items.get(itemId);

      item.sheet.render(true)
    }
    
    _onItemDelete(event) {
      event.preventDefault(); 
      let itemId = event.currentTarget.closest(".item").dataset.itemId;
      return this.actor.deleteOwnedItem(itemId);
    }

    _onItemDisplayInfo(event) {
      event.preventDefault(); 
      let section = event.currentTarget.closest(".item");
      let editor = $(section).find(".item-info")
      editor.toggleClass("hidden");
    }

    _onFocusIn(event) {
      event.currentTarget.select();
    }

    _onItemRoll(event, itemId = null) {
      
      let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

      if (!itemId){
        itemId = event.currentTarget.closest(".item").dataset.itemId;
      }
      let item = this.actor.items.get(itemId);
      let formula = item.data.data.damage
     
      let isMeleeAttack = witcher.meleeSkills.includes(item.data.data.attackSkill)
      if (this.actor.type == "character" && isMeleeAttack){
        if (this.actor.data.data.attackStats.meleeBonus < 0){
          formula += `${this.actor.data.data.attackStats.meleeBonus}`
        }
        if (this.actor.data.data.attackStats.meleeBonus > 0){
          formula += `+${this.actor.data.data.attackStats.meleeBonus}`
        }
      }

      let messageData = {
        speaker: {alias: this.actor.name},
        flavor: `<h1> ${game.i18n.localize("WITCHER.Dialog.attack")}: ${item.name}</h1>`,
      }
  
      const locationOptions = `
      <option value="randomHuman"> ${game.i18n.localize("WITCHER.Dialog.attackRandomHuman")} </option>
      <option value="randomMonster"> ${game.i18n.localize("WITCHER.Dialog.attackRandomMonster")} </option>
      <option value="head"> ${game.i18n.localize("WITCHER.Dialog.attackHead")} </option>
      <option value="torso"> ${game.i18n.localize("WITCHER.Dialog.attackTorso")} </option>
      <option value="arm"> ${game.i18n.localize("WITCHER.Dialog.attackArm")} </option>
      <option value="leg"> ${game.i18n.localize("WITCHER.Dialog.attackLeg")} </option>
      <option value="tail"> ${game.i18n.localize("WITCHER.Dialog.attackTail")} </option>
      `;

      const AttackModifierOptions = `
      <div id="attackModifiers" class="flex">
        <label><input type="checkbox" name="outsideLOS"> ${game.i18n.localize("WITCHER.Dialog.attackOutsideLOS")}</label> <br />
        <label><input type="checkbox" name="isFastDraw">${game.i18n.localize("WITCHER.Dialog.attackisFastDraw")}</label> <br />
        <label><input type="checkbox" name="isProne">${game.i18n.localize("WITCHER.Dialog.attackisProne")}</label> <br />
        <label><input type="checkbox" name="isPinned"> ${game.i18n.localize("WITCHER.Dialog.attackisPinned")}</label> <br />
        <label><input type="checkbox" name="isActivelyDodging"> ${game.i18n.localize("WITCHER.Dialog.attackisActivelyDodging")}</label> <br />
        <label><input type="checkbox" name="isMoving"> ${game.i18n.localize("WITCHER.Dialog.attackisMoving")}</label> <br />
        <label><input type="checkbox" name="targetOutsideLOS"> ${game.i18n.localize("WITCHER.Dialog.attacktargetOutsideLOS")}</label> <br />
        <label><input type="checkbox" name="isAmbush"> ${game.i18n.localize("WITCHER.Dialog.attackisAmbush")}</label> <br />
        <label><input type="checkbox" name="isRicochet"> ${game.i18n.localize("WITCHER.Dialog.attackisRicochet")}</label> <br />
        <label><input type="checkbox" name="isBlinded"> ${game.i18n.localize("WITCHER.Dialog.attackisBlinded")}</label> <br />
        <label><input type="checkbox" name="isSilhouetted"> ${game.i18n.localize("WITCHER.Dialog.attackisSilhouetted")}</label> <br />
        <label><input type="checkbox" name="isAiming"> ${game.i18n.localize("WITCHER.Dialog.attackisAiming")}: </label> <input class="small" name="customAim" value=0> <br />
    </div>
      `;
      const rangeOptions = `
      <option value="none"> ${game.i18n.localize("WITCHER.Dialog.rangeNone")} </option>
      <option value="pointBlank"> ${game.i18n.localize("WITCHER.Dialog.rangePointBlank")} </option>
      <option value="close"> ${game.i18n.localize("WITCHER.Dialog.rangeClose")}</option>
      <option value="medium"> ${game.i18n.localize("WITCHER.Dialog.rangeMedium")} </option>
      <option value="long"> ${game.i18n.localize("WITCHER.Dialog.rangeLong")} </option>
      <option value="extreme"> ${game.i18n.localize("WITCHER.Dialog.rangeExtreme")} </option>
      `;
      const StrikeOptions = `
      <option value="normal"> ${game.i18n.localize("WITCHER.Dialog.strikeNormal")} </option>
      <option value="fast"> ${game.i18n.localize("WITCHER.Dialog.strikeFast")} </option>
      <option value="strong"> ${game.i18n.localize("WITCHER.Dialog.strikeStrong")} </option>
      <option value="joint"> ${game.i18n.localize("WITCHER.Dialog.strikeJoint")} </option>
      `;
      let content = `<h2>${item.name} ${game.i18n.localize("WITCHER.Dialog.attackUse")}: ${item.data.data.attackSkill}</h2> 
                     <div class="flex">
                      <label>${game.i18n.localize("WITCHER.Dialog.attackExtra")}: <input type="checkbox" name="isExtraAttack"></label> <br />
                     </div>
                     <script>
                     function myFunction() {
                       var x = document.getElementById("attackModifiers");
                       x.style.display = x.style.display === "none" ? "block" : "none";
                     }
                     </script
                     <label>${game.i18n.localize("WITCHER.Dialog.attackLocation")}: <select name="location">${locationOptions}</select></label> <br />`
      if (item.data.data.range) {
        content += `<label>${game.i18n.localize("WITCHER.Dialog.attackRange")}: <select name="range">${rangeOptions}</select></label> ${item.data.data.range}<br />`
      }

      content += `<label>${game.i18n.localize("WITCHER.Dialog.attackStrike")}: <select name="strike">${StrikeOptions}</select></label> <br />
                  <label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input name="customAtt" value=0></label> <br />
                  <label>${game.i18n.localize("WITCHER.Dialog.attackModifierse")}: <a onclick="myFunction()"><i class="fas fa-chevron-right"></i></a></label> <br />${AttackModifierOptions}<br />
                  <h2>${item.name} ${game.i18n.localize("WITCHER.Dialog.attackDamage")}: ${formula}</h2> 
                  <label>${game.i18n.localize("WITCHER.Dialog.attackCustomDmg")}: <input name="customDmg" value=0></label> <br />`;
                  
      if (this.actor.type =="character" && isMeleeAttack){ 
        content += `<label>${game.i18n.localize("WITCHER.Dialog.attackMeleeBonus")}: ${this.actor.data.data.attackStats.meleeBonus} </label><br />`
      }

      if (item.data.data.usingAmmo){
        let ammunitions = this.actor.items.filter(function(item) {return item.data.type=="weapon" &&  item.data.data.isAmmo});
        let quantity = ammunitions.sum("quantity")
        content += `<h2>${game.i18n.localize("WITCHER.Dialog.chooseAmmunition")}</h2> `
        if (quantity <= 0) {
          content += `<div class="error-display">${game.i18n.localize("WITCHER.Dialog.NoAmmunation")}</h2>`
        }
        else {
          let ammunationOption = ``
          ammunitions.forEach(element => {
            ammunationOption += `<option value="${element.data._id}"> ${element.data.name}(${element.data.data.quantity}) </option>`;
          });
          content += ` <label>${game.i18n.localize("WITCHER.Dialog.Ammunation")}: <select name="ammunation">${ammunationOption}</select></label> <br /><br />`
        }
      }
              
      
      new Dialog({
        title: `${game.i18n.localize("WITCHER.Dialog.attackWith")}: ${item.name}`, 
        content,
        buttons: {
          Roll: {
            label: `${game.i18n.localize("WITCHER.Dialog.ButtonRoll")}`,
            callback: (html) => {
              let isExtraAttack = html.find("[name=isExtraAttack]").prop("checked");

              let location = html.find("[name=location]")[0].value;
              let ammunition = undefined
              if (html.find("[name=ammunation]")[0]) {
                ammunition = html.find("[name=ammunation]")[0].value;
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
              let isAiming = html.find("[name=isAiming]").prop("checked");
              let customAim = html.find("[name=customAim]")[0].value;

              let range = item.data.data.range ? html.find("[name=range]")[0].value: null;
              let customAtt = html.find("[name=customAtt]")[0].value;
              let strike = html.find("[name=strike]")[0].value;

              let customDmg = html.find("[name=customDmg]")[0].value;
              let attacknumber = 1;
              
              if (isExtraAttack) {
                let newSta = this.actor.data.data.derivedStats.sta.value - 3
                
                if (newSta < 0) {
                  return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
                }
                this.actor.update({ 
                  'data.derivedStats.sta.value': newSta
                });
              }

              if (strike == "fast") {
                attacknumber = 2;
              }
              for (let i=0; i < attacknumber; i++){
                let attFormula = "1d10"
                let damageFormula = formula;

                if (item.data.data.accuracy < 0){
                  attFormula += !displayRollDetails ? `${item.data.data.accuracy}` : `${item.data.data.accuracy}[${game.i18n.localize("WITCHER.Weapon.WeaponAccuracy")}]`
                }
                if (item.data.data.accuracy > 0){
                  attFormula += !displayRollDetails ? `+${item.data.data.accuracy}`: `+${item.data.data.accuracy}[${game.i18n.localize("WITCHER.Weapon.WeaponAccuracy")}]`
                }
                if (targetOutsideLOS) {attFormula += "-3";}
                if (outsideLOS) {attFormula += "+3";}
                if (isExtraAttack) { attFormula += "-3"; }
                if (isFastDraw) { attFormula += "-3"; }
                if (isProne) { attFormula += "-2"; }
                if (isPinned) { attFormula += "+4"; }
                if (isActivelyDodging) { attFormula += "-2"; }
                if (isMoving) { attFormula += "-3"; }
                if (isAmbush) { attFormula += "+5"; }
                if (isRicochet) { attFormula += "-5"; }
                if (isBlinded) { attFormula += "-3"; }
                if (isSilhouetted) { attFormula += "+2"; }
                if (isAiming) { attFormula += `+${customAim}`}

                let totalModifiers = 0;

                switch(item.data.data.attackSkill){
                  case "Brawling":
                    attFormula += !displayRollDetails ? `+${this.actor.data.data.stats.ref.current}+${this.actor.data.data.skills.ref.brawling.value}`:
                      `+${this.actor.data.data.stats.ref.current}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${this.actor.data.data.skills.ref.brawling.value}[${game.i18n.localize("WITCHER.SkRefBrawling")}]`;
                    this.actor.data.data.skills.ref.brawling.modifiers.forEach(item => totalModifiers += Number(item.value));
                    break;
                  case "Melee":
                    attFormula += !displayRollDetails ? `+${this.actor.data.data.stats.ref.current}+${this.actor.data.data.skills.ref.melee.value}`:
                      `+${this.actor.data.data.stats.ref.current}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${this.actor.data.data.skills.ref.melee.value}[${game.i18n.localize("WITCHER.SkRefMelee")}]`;
                      this.actor.data.data.skills.ref.melee.modifiers.forEach(item => totalModifiers += Number(item.value));
                    break;
                  case "Small Blades":
                    attFormula += !displayRollDetails ? `+${this.actor.data.data.stats.ref.current}+${this.actor.data.data.skills.ref.smallblades.value}`:
                      `+${this.actor.data.data.stats.ref.current}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${this.actor.data.data.skills.ref.smallblades.value}[${game.i18n.localize("WITCHER.SkRefSmall")}]`;
                      this.actor.data.data.skills.ref.smallblades.modifiers.forEach(item => totalModifiers += Number(item.value));
                    break;
                  case "Staff/Spear":
                    attFormula += !displayRollDetails ? `+${this.actor.data.data.stats.ref.current}+${this.actor.data.data.skills.ref.staffspear.value}`:
                      `+${this.actor.data.data.stats.ref.current}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${this.actor.data.data.skills.ref.staffspear.value}[${game.i18n.localize("WITCHER.SkRefStaff")}]`;
                      this.actor.data.data.skills.ref.staffspear.modifiers.forEach(item => totalModifiers += Number(item.value));
                    break;
                  case "Swordsmanship":
                    attFormula += !displayRollDetails ? `+${this.actor.data.data.stats.ref.current}+${this.actor.data.data.skills.ref.swordsmanship.value}`:
                      `+${this.actor.data.data.stats.ref.current}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${this.actor.data.data.skills.ref.swordsmanship.value}[${game.i18n.localize("WITCHER.SkRefSwordmanship")}]`;
                      this.actor.data.data.skills.ref.swordsmanship.modifiers.forEach(item => totalModifiers += Number(item.value));
                    break;
                  case "Archery":
                    attFormula += !displayRollDetails ? `+${this.actor.data.data.stats.dex.current}+${this.actor.data.data.skills.dex.archery.value}`:
                      `+${this.actor.data.data.stats.dex.current}[${game.i18n.localize("WITCHER.Actor.Stat.Dex")}]+${this.actor.data.data.skills.dex.archery.value}[${game.i18n.localize("WITCHER.SkDexArchery")}]`;
                      this.actor.data.data.skills.dex.archery.modifiers.forEach(item => totalModifiers += Number(item.value));
                    break;
                  case "Athletics":
                    attFormula += !displayRollDetails ? `+${this.actor.data.data.stats.dex.current}+${this.actor.data.data.skills.dex.athletics.value}`:
                      `+${this.actor.data.data.stats.dex.current}[${game.i18n.localize("WITCHER.Actor.Stat.Dex")}]+${this.actor.data.data.skills.dex.athletics.value}[${game.i18n.localize("WITCHER.SkDexAthletics")}]`;
                      this.actor.data.data.skills.dex.athletics.modifiers.forEach(item => totalModifiers += Number(item.value));
                    break;
                  case "Crossbow":
                    attFormula += !displayRollDetails ? `+${this.actor.data.data.stats.dex.current}+${this.actor.data.data.skills.dex.crossbow.value}`:
                    `+${this.actor.data.data.stats.dex.current}[${game.i18n.localize("WITCHER.Actor.Stat.Dex")}]+${this.actor.data.data.skills.dex.crossbow.value}[${game.i18n.localize("WITCHER.SkDexCrossbow")}]`;
                    this.actor.data.data.skills.dex.crossbow.modifiers.forEach(item => totalModifiers += Number(item.value));
                    break;
                }

                if (customAtt != "0") {
                  attFormula +=  !displayRollDetails ? `+${customAtt}`:  `+${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]` ;
                }

                switch(range){
                  case "pointBlank":
                    attFormula = !displayRollDetails ? `${attFormula}+5`: `${attFormula}+5[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                    break;
                  case "medium":
                    attFormula = !displayRollDetails ? `${attFormula}-2`: `${attFormula}-2[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                    break;
                  case "long":
                    attFormula = !displayRollDetails ? `${attFormula}-4`: `${attFormula}-4[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                    break;
                  case "extreme":
                    attFormula = !displayRollDetails ? `${attFormula}-6`: `${attFormula}-6[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                    break;
                }
                
                if (customDmg != "0") {
                  damageFormula += "+"+customDmg;
                }                
                let touchedLocation = ""
                let LocationFormula = `(${game.i18n.localize("WITCHER.Chat.FullDmg")})`
                switch(location){
                  case "randomHuman":
                    let randomHumanLocation = getRandomInt(10)
                    switch(randomHumanLocation){
                      case 1:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationHead")}`;
                        LocationFormula = `*3`;
                        break;
                      case 2:
                      case 3:
                      case 4:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
                        break;
                      case 5:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
                        LocationFormula = `*0.5`;
                        break;
                      case 6:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
                        LocationFormula = `*0.5`;
                        break;
                      case 7:
                      case 8:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
                        LocationFormula = `*0.5`;
                        break;
                      case 9:
                      case 10:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
                        LocationFormula = `*0.5`;
                        break;
                      default:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
                    }
                    break;
                  case "randomMonster":
                    let randomMonsterLocation = getRandomInt(10)
                    switch(randomMonsterLocation){
                      case 1:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationHead")}`;
                        LocationFormula = `*3`;
                        break;
                      case 2:
                      case 3:
                      case 4:
                      case 5:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
                      break;
                      case 6:
                      case 7:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Dialog.attackLimb")}`;
                        LocationFormula = `*0.5`;
                        break;
                      case 8:
                      case 9:
                        touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Dialog.attackLimb")}`;
                        LocationFormula = `*0.5`;
                        break;
                      case 10:
                        touchedLocation = `${game.i18n.localize("WITCHER.Dialog.attackTail")}`;
                        LocationFormula = `*0.5`;
                        break;
                      default:
                        touchedLocation = "Torso";
                    }
                    break;
                  case "head":
                    touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationHead")}`;
                    attFormula = !displayRollDetails ? `${attFormula}-6`:  `${attFormula}-6[${game.i18n.localize("WITCHER.Armor.Location")}]` ;
                    LocationFormula = `*3`;
                    break;
                  case "torso":
                    touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
                    attFormula = !displayRollDetails ? `${attFormula}-1`: `${attFormula}-1[${game.i18n.localize("WITCHER.Armor.Location")}]`;
                    break;
                  case "arm":
                    touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
                    attFormula = !displayRollDetails ? `${attFormula}-3`: `${attFormula}-3[${game.i18n.localize("WITCHER.Armor.Location")}]`;
                    LocationFormula = `*0.5`;
                    break;
                  case "leg":
                    touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
                    attFormula = !displayRollDetails ? `${attFormula}-2`: `${attFormula}-2[${game.i18n.localize("WITCHER.Armor.Location")}]`;
                    LocationFormula = `*0.5`;
                    break;
                  case "tail":
                    touchedLocation = `${game.i18n.localize("WITCHER.Dialog.attackTail")}`;
                    attFormula = !displayRollDetails ? `${attFormula}-2`: `${attFormula}-2[${game.i18n.localize("WITCHER.Armor.Location")}]`;
                    LocationFormula = `*0.5`;
                    break;
                }
                if (strike == "joint" || strike == "strong") {
                  attFormula = !displayRollDetails ? `${attFormula}-3`:  `${attFormula}-3[${game.i18n.localize("WITCHER.Dialog.attackStrike")}]`;
                }

                if (totalModifiers < 0){
                  attFormula +=  !displayRollDetails ? `${totalModifiers}` :  `${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]`
                }
                if (totalModifiers > 0){
                  attFormula += !displayRollDetails ? `+${totalModifiers}`:  `+${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]` 
                }

                let allEffects = item.data.data.effects
                if (ammunition){
                  let item = this.actor.items.get(ammunition);
                  let newQuantity = item.data.data.quantity - 1;
                  item.update({"data.quantity": newQuantity})
                  allEffects.push(...item.data.data.effects)
                } 

                if (item.data.data.enhancementItems) {
                  item.data.data.enhancementItems.forEach(element => {
                    if (element && JSON.stringify(element) != '{}'){
                      let enhancement = this.actor.items.get(element._id);
                      allEffects.push(...enhancement.data.data.effects)
                    }
                  });
                }

                let effects = JSON.stringify(item.data.data.effects)
                messageData.flavor = `<div class="attack-message"><h1><img src="${item.img}" class="item-img" />Attack: ${item.name}</h1>`;
                messageData.flavor += `<span>  ${game.i18n.localize("WITCHER.Armor.Location")}: ${touchedLocation} = ${LocationFormula} </span>`;
                messageData.flavor += `<button class="damage" data-img="${item.img}" data-dmg-type="${item.data.data.type}" data-name="${item.name}" data-dmg="${damageFormula}" data-location="${touchedLocation}"  data-location-formula="${LocationFormula}" data-strike="${strike}" data-effects='${effects}'>${game.i18n.localize("WITCHER.table.Damage")}</button>`;
                let roll = new Roll(attFormula).roll()
                if (roll.dice[0].results[0].result == 10){  
                  messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
                };
                if (roll.dice[0].results[0].result == 1){  
                  messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
                };
                
                if (item.data.data.rollOnlyDmg) {
                  rollDamage(item.img, item.name, damageFormula, touchedLocation, LocationFormula, strike, item.data.data.effects, item.data.data.type)
                }
                else{
                  roll.toMessage(messageData);
                }
              }
            }
          }
        }
      }).render(true)  
    
    }

    _onSpellDisplay(event) {
      event.preventDefault(); 
      let section = event.currentTarget.closest(".spell");
      switch(section.dataset.spelltype) {
        case "noviceSpell":
          this.actor.update({ 'data.pannels.noviceSpellIsOpen': this.actor.data.data.pannels.noviceSpellIsOpen ? false : true});
          break;
        case "journeymanSpell":
          this.actor.update({ 'data.pannels.journeymanSpellIsOpen': this.actor.data.data.pannels.journeymanSpellIsOpen ? false : true});
          break;
        case "masterSpell":
          this.actor.update({ 'data.pannels.masterSpellIsOpen': this.actor.data.data.pannels.masterSpellIsOpen ? false : true});
          break;
        case "ritual":
          this.actor.update({ 'data.pannels.ritualIsOpen': this.actor.data.data.pannels.ritualIsOpen ? false : true});
          break;
        case "hex":
          this.actor.update({ 'data.pannels.hexIsOpen': this.actor.data.data.pannels.hexIsOpen ? false : true});
          break;
      }
    }


    _onLifeEventDisplay(event) {
      event.preventDefault(); 
      let section = event.currentTarget.closest(".lifeEvents");
      switch(section.dataset.event) {
          case "10": this.actor.update({ 'data.general.lifeEvents.10.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "20": this.actor.update({ 'data.general.lifeEvents.20.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "30": this.actor.update({ 'data.general.lifeEvents.30.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "40": this.actor.update({ 'data.general.lifeEvents.40.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "50": this.actor.update({ 'data.general.lifeEvents.50.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "60": this.actor.update({ 'data.general.lifeEvents.60.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "70": this.actor.update({ 'data.general.lifeEvents.70.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "80": this.actor.update({ 'data.general.lifeEvents.80.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "90": this.actor.update({ 'data.general.lifeEvents.90.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "100": this.actor.update({ 'data.general.lifeEvents.100.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "110": this.actor.update({ 'data.general.lifeEvents.110.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "120": this.actor.update({ 'data.general.lifeEvents.120.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "130": this.actor.update({ 'data.general.lifeEvents.130.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "140": this.actor.update({ 'data.general.lifeEvents.140.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "150": this.actor.update({ 'data.general.lifeEvents.150.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "160": this.actor.update({ 'data.general.lifeEvents.160.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "170": this.actor.update({ 'data.general.lifeEvents.170.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "180": this.actor.update({ 'data.general.lifeEvents.180.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "190": this.actor.update({ 'data.general.lifeEvents.190.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
          case "200": this.actor.update({ 'data.general.lifeEvents.200.isOpened': this.actor.data.data.general.lifeEvents[section.dataset.event].isOpened ? false : true}); break;
        }
    }

    _onStatModifierDisplay(event){
      event.preventDefault(); 
      let stat = event.currentTarget.closest(".stat-display").dataset.stat;
      switch(stat) {
        case "int": this.actor.update({ 'data.stats.int.isOpened': this.actor.data.data.stats.int.isOpened ? false : true}); break;
        case "ref": this.actor.update({ 'data.stats.ref.isOpened': this.actor.data.data.stats.ref.isOpened ? false : true}); break;
        case "dex": this.actor.update({ 'data.stats.dex.isOpened': this.actor.data.data.stats.dex.isOpened ? false : true}); break;
        case "body": this.actor.update({ 'data.stats.body.isOpened': this.actor.data.data.stats.body.isOpened ? false : true}); break;
        case "spd": this.actor.update({ 'data.stats.spd.isOpened': this.actor.data.data.stats.spd.isOpened ? false : true}); break;
        case "emp": this.actor.update({ 'data.stats.emp.isOpened': this.actor.data.data.stats.emp.isOpened ? false : true}); break;
        case "cra": this.actor.update({ 'data.stats.cra.isOpened': this.actor.data.data.stats.cra.isOpened ? false : true}); break;
        case "will": this.actor.update({ 'data.stats.will.isOpened': this.actor.data.data.stats.will.isOpened ? false : true}); break;
        case "luck": this.actor.update({ 'data.stats.luck.isOpened': this.actor.data.data.stats.luck.isOpened ? false : true}); break;
        case "stun": this.actor.update({ 'data.coreStats.stun.isOpened': this.actor.data.data.coreStats.stun.isOpened ? false : true}); break;
        case "run": this.actor.update({ 'data.coreStats.run.isOpened': this.actor.data.data.coreStats.run.isOpened ? false : true}); break;
        case "leap": this.actor.update({ 'data.coreStats.leap.isOpened': this.actor.data.data.coreStats.leap.isOpened ? false : true}); break;
        case "enc": this.actor.update({ 'data.coreStats.enc.isOpened': this.actor.data.data.coreStats.enc.isOpened ? false : true}); break;
        case "rec": this.actor.update({ 'data.coreStats.rec.isOpened': this.actor.data.data.coreStats.rec.isOpened ? false : true}); break;
        case "woundTreshold": this.actor.update({ 'data.coreStats.woundTreshold.isOpened': this.actor.data.data.coreStats.woundTreshold.isOpened ? false : true}); break;
      }
    }

    _onDerivedModifierDisplay(event){
      this.actor.update({ 'data.derivedStats.modifiersIsOpened': this.actor.data.data.derivedStats.modifiersIsOpened ? false : true});
    }

    _onSkillModifierDisplay(event){
      event.preventDefault(); 
      let skill = event.currentTarget.closest(".skill").dataset.skill;
      switch(skill) {
        case "awareness": this.actor.update({ 'data.skills.int.awareness.isOpened': this.actor.data.data.skills.int.awareness.isOpened ? false : true}); break;
        case "business": this.actor.update({ 'data.skills.int.business.isOpened': this.actor.data.data.skills.int.business.isOpened ? false : true}); break;
        case "deduction": this.actor.update({ 'data.skills.int.deduction.isOpened': this.actor.data.data.skills.int.deduction.isOpened ? false : true}); break;
        case "education": this.actor.update({ 'data.skills.int.education.isOpened': this.actor.data.data.skills.int.education.isOpened ? false : true}); break;
        case "commonsp": this.actor.update({ 'data.skills.int.commonsp.isOpened': this.actor.data.data.skills.int.commonsp.isOpened ? false : true}); break;
        case "eldersp": this.actor.update({ 'data.skills.int.eldersp.isOpened': this.actor.data.data.skills.int.eldersp.isOpened ? false : true}); break;
        case "dwarven": this.actor.update({ 'data.skills.int.dwarven.isOpened': this.actor.data.data.skills.int.dwarven.isOpened ? false : true}); break;
        case "monster": this.actor.update({ 'data.skills.int.monster.isOpened': this.actor.data.data.skills.int.monster.isOpened ? false : true}); break;
        case "socialetq": this.actor.update({ 'data.skills.int.socialetq.isOpened': this.actor.data.data.skills.int.socialetq.isOpened ? false : true}); break;
        case "streetwise": this.actor.update({ 'data.skills.int.streetwise.isOpened': this.actor.data.data.skills.int.streetwise.isOpened ? false : true}); break;
        case "tactics": this.actor.update({ 'data.skills.int.tactics.isOpened': this.actor.data.data.skills.int.tactics.isOpened ? false : true}); break;
        case "teaching": this.actor.update({ 'data.skills.int.teaching.isOpened': this.actor.data.data.skills.int.teaching.isOpened ? false : true}); break;
        case "wilderness": this.actor.update({ 'data.skills.int.wilderness.isOpened': this.actor.data.data.skills.int.wilderness.isOpened ? false : true}); break;
        
        case "brawling": this.actor.update({ 'data.skills.ref.brawling.isOpened': this.actor.data.data.skills.ref.brawling.isOpened ? false : true}); break;
        case "dodge": this.actor.update({ 'data.skills.ref.dodge.isOpened': this.actor.data.data.skills.ref.dodge.isOpened ? false : true}); break;
        case "melee": this.actor.update({ 'data.skills.ref.melee.isOpened': this.actor.data.data.skills.ref.melee.isOpened ? false : true}); break;
        case "riding": this.actor.update({ 'data.skills.ref.riding.isOpened': this.actor.data.data.skills.ref.riding.isOpened ? false : true}); break;
        case "sailing": this.actor.update({ 'data.skills.ref.sailing.isOpened': this.actor.data.data.skills.ref.sailing.isOpened ? false : true}); break;
        case "smallblades": this.actor.update({ 'data.skills.ref.smallblades.isOpened': this.actor.data.data.skills.ref.smallblades.isOpened ? false : true}); break;
        case "staffspear": this.actor.update({ 'data.skills.ref.staffspear.isOpened': this.actor.data.data.skills.ref.staffspear.isOpened ? false : true}); break;
        case "swordsmanship": this.actor.update({ 'data.skills.ref.swordsmanship.isOpened': this.actor.data.data.skills.ref.swordsmanship.isOpened ? false : true}); break;
        
        case "courage": this.actor.update({ 'data.skills.will.courage.isOpened': this.actor.data.data.skills.will.courage.isOpened ? false : true}); break;
        case "hexweave": this.actor.update({ 'data.skills.will.hexweave.isOpened': this.actor.data.data.skills.will.hexweave.isOpened ? false : true}); break;
        case "intimidation": this.actor.update({ 'data.skills.will.intimidation.isOpened': this.actor.data.data.skills.will.intimidation.isOpened ? false : true}); break;
        case "spellcast": this.actor.update({ 'data.skills.will.spellcast.isOpened': this.actor.data.data.skills.will.spellcast.isOpened ? false : true}); break;
        case "resistmagic": this.actor.update({ 'data.skills.will.resistmagic.isOpened': this.actor.data.data.skills.will.resistmagic.isOpened ? false : true}); break;
        case "resistcoerc": this.actor.update({ 'data.skills.will.resistcoerc.isOpened': this.actor.data.data.skills.will.resistcoerc.isOpened ? false : true}); break;
        case "ritcraft": this.actor.update({ 'data.skills.will.ritcraft.isOpened': this.actor.data.data.skills.will.ritcraft.isOpened ? false : true}); break;
 
        case "archery": this.actor.update({ 'data.skills.dex.archery.isOpened': this.actor.data.data.skills.dex.archery.isOpened ? false : true}); break;
        case "athletics": this.actor.update({ 'data.skills.dex.athletics.isOpened': this.actor.data.data.skills.dex.athletics.isOpened ? false : true}); break;
        case "crossbow": this.actor.update({ 'data.skills.dex.crossbow.isOpened': this.actor.data.data.skills.dex.crossbow.isOpened ? false : true}); break;
        case "sleight": this.actor.update({ 'data.skills.dex.sleight.isOpened': this.actor.data.data.skills.dex.sleight.isOpened ? false : true}); break;
        case "stealth": this.actor.update({ 'data.skills.dex.stealth.isOpened': this.actor.data.data.skills.dex.stealth.isOpened ? false : true}); break;
        
        case "alchemy": this.actor.update({ 'data.skills.cra.alchemy.isOpened': this.actor.data.data.skills.cra.alchemy.isOpened ? false : true}); break;
        case "crafting": this.actor.update({ 'data.skills.cra.crafting.isOpened': this.actor.data.data.skills.cra.crafting.isOpened ? false : true}); break;
        case "disguise": this.actor.update({ 'data.skills.cra.disguise.isOpened': this.actor.data.data.skills.cra.disguise.isOpened ? false : true}); break;
        case "firstaid": this.actor.update({ 'data.skills.cra.firstaid.isOpened': this.actor.data.data.skills.cra.firstaid.isOpened ? false : true}); break;
        case "forgery": this.actor.update({ 'data.skills.cra.forgery.isOpened': this.actor.data.data.skills.cra.forgery.isOpened ? false : true}); break;
        case "picklock": this.actor.update({ 'data.skills.cra.picklock.isOpened': this.actor.data.data.skills.cra.picklock.isOpened ? false : true}); break;
        case "trapcraft": this.actor.update({ 'data.skills.cra.trapcraft.isOpened': this.actor.data.data.skills.cra.trapcraft.isOpened ? false : true}); break;

        case "physique": this.actor.update({ 'data.skills.body.physique.isOpened': this.actor.data.data.skills.body.physique.isOpened ? false : true}); break;
        case "endurance": this.actor.update({ 'data.skills.body.endurance.isOpened': this.actor.data.data.skills.body.endurance.isOpened ? false : true}); break;
        
        case "charisma": this.actor.update({ 'data.skills.emp.charisma.isOpened': this.actor.data.data.skills.emp.charisma.isOpened ? false : true}); break;
        case "deceit": this.actor.update({ 'data.skills.emp.deceit.isOpened': this.actor.data.data.skills.emp.deceit.isOpened ? false : true}); break;
        case "finearts": this.actor.update({ 'data.skills.emp.finearts.isOpened': this.actor.data.data.skills.emp.finearts.isOpened ? false : true}); break;
        case "gambling": this.actor.update({ 'data.skills.emp.gambling.isOpened': this.actor.data.data.skills.emp.gambling.isOpened ? false : true}); break;
        case "grooming": this.actor.update({ 'data.skills.emp.grooming.isOpened': this.actor.data.data.skills.emp.grooming.isOpened ? false : true}); break;
        case "perception": this.actor.update({ 'data.skills.emp.perception.isOpened': this.actor.data.data.skills.emp.perception.isOpened ? false : true}); break;
        case "leadership": this.actor.update({ 'data.skills.emp.leadership.isOpened': this.actor.data.data.skills.emp.leadership.isOpened ? false : true}); break;
        case "persuasion": this.actor.update({ 'data.skills.emp.persuasion.isOpened': this.actor.data.data.skills.emp.persuasion.isOpened ? false : true}); break;
        case "performance": this.actor.update({ 'data.skills.emp.performance.isOpened': this.actor.data.data.skills.emp.performance.isOpened ? false : true}); break;
        case "seduction": this.actor.update({ 'data.skills.emp.seduction.isOpened': this.actor.data.data.skills.emp.seduction.isOpened ? false : true}); break;
      }
    }
    _onSkillDisplay(event) {
      event.preventDefault(); 
      let section = event.currentTarget.closest(".skill");
      switch(section.dataset.skilltype) {
        case "int":
          this.actor.update({ 'data.pannels.intIsOpen': this.actor.data.data.pannels.intIsOpen ? false : true});
          break;
        case "ref":
          this.actor.update({ 'data.pannels.refIsOpen': this.actor.data.data.pannels.refIsOpen ? false : true});
          break;
        case "dex":
          this.actor.update({ 'data.pannels.dexIsOpen': this.actor.data.data.pannels.dexIsOpen ? false : true});
          break;
        case "body":
          this.actor.update({ 'data.pannels.bodyIsOpen': this.actor.data.data.pannels.bodyIsOpen ? false : true});
          break;
        case "emp":
          this.actor.update({ 'data.pannels.empIsOpen': this.actor.data.data.pannels.empIsOpen ? false : true});
          break;
        case "cra":
          this.actor.update({ 'data.pannels.craIsOpen': this.actor.data.data.pannels.craIsOpen ? false : true});
          break;
        case "will":
          this.actor.update({ 'data.pannels.willIsOpen': this.actor.data.data.pannels.willIsOpen ? false : true});
          break;
      }
    }

    _onSubstanceDisplay(event) {
      event.preventDefault(); 
      let section = event.currentTarget.closest(".substance");

      switch(section.dataset.subtype) {
        case "vitriol":
          this.actor.update({ 'data.pannels.vitriolIsOpen': this.actor.data.data.pannels.vitriolIsOpen ? false : true});
          break;
        case "rebis":
          this.actor.update({ 'data.pannels.rebisIsOpen': this.actor.data.data.pannels.rebisIsOpen ? false : true});
          break;
        case "aether":
          this.actor.update({ 'data.pannels.aetherIsOpen': this.actor.data.data.pannels.aetherIsOpen ? false : true});
          break;
        case "quebrith":
          this.actor.update({ 'data.pannels.quebrithIsOpen': this.actor.data.data.pannels.quebrithIsOpen ? false : true});
          break;
        case "hydragenum":
          this.actor.update({ 'data.pannels.hydragenumIsOpen': this.actor.data.data.pannels.hydragenumIsOpen ? false : true});
          break;
        case "vermilion":
          this.actor.update({ 'data.pannels.vermilionIsOpen': this.actor.data.data.pannels.vermilionIsOpen ? false : true});
          break;
        case "sol":
          this.actor.update({ 'data.pannels.solIsOpen': this.actor.data.data.pannels.solIsOpen ? false : true});
          break;
        case "caelum":
          this.actor.update({ 'data.pannels.caelumIsOpen': this.actor.data.data.pannels.caelumIsOpen ? false : true});
          break;
        case "fulgur":
          this.actor.update({ 'data.pannels.fulgurIsOpen': this.actor.data.data.pannels.fulgurIsOpen ? false : true});
          break;
      }
    }

    calc_total_skills_profession(data){
      let totalSkills = 0;
      if (data.profession) {
        totalSkills += Number(data.profession.data.definingSkill.level);
        totalSkills += Number(data.profession.data.skillPath1.skill1.level) +  Number(data.profession.data.skillPath1.skill2.level) + Number(data.profession.data.skillPath1.skill3.level)
        totalSkills += Number(data.profession.data.skillPath2.skill1.level) +  Number(data.profession.data.skillPath2.skill2.level) + Number(data.profession.data.skillPath2.skill3.level)
        totalSkills += Number(data.profession.data.skillPath3.skill1.level) +  Number(data.profession.data.skillPath3.skill2.level) + Number(data.profession.data.skillPath3.skill3.level)  
      }
      return totalSkills;
    }

    calc_total_skills(data) {
      let totalSkills = 0;
      for (let element in data.data.skills) {
        for (let skill in data.data.skills[element]) {
          let skillLabel = game.i18n.localize(data.data.skills[element][skill].label)
          if (skillLabel?.includes("(2)")){
            totalSkills += data.data.skills[element][skill].value * 2;
          }
          else{
            totalSkills += data.data.skills[element][skill].value;
          }
        }
      }
      return totalSkills;
    }

    calc_total_stats(data) {
      let totalStats = 0;
      for (let element in data.data.stats) {
        totalStats += data.data.stats[element].max;
      }
      return totalStats;
    }
}
