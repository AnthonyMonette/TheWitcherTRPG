
import { RollCustomMessage } from "../chat.js";
import { getRandomInt, updateDerived, rollSkillCheck } from "../witcher.js";

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
      data.config = CONFIG.witcher;
      data.weapons = data.items.filter(function(item) {return item.type=="weapon"});
      data.armors = data.items.filter(function(item) {return item.type=="armor" || item.type == "enhancement"});
      data.components = data.items.filter(function(item) {return item.type=="component" &&  item.data.type!="substances"});
      data.valuables = data.items.filter(function(item) {return item.type=="valuable" || item.type == "mount" || item.type =="alchemical" || item.type =="mutagen" });
      data.diagrams = data.items.filter(function(item) {return item.type=="diagrams"});
      data.spells = data.items.filter(function(item) {return item.type=="spell"});
      data.professions = data.items.filter(function(item) {return item.type=="profession"});
      data.profession = data.professions[0];
      Array.prototype.sum = function (prop) {
        var total = 0
        for ( var i = 0, _len = this.length; i < _len; i++ ) {
            if (this[i]["data"][prop]){
              total += Number(this[i]["data"][prop])
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

      data.totalSkills = this.calc_total_skills(data)

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

      data.TotalWeight =  data.items.weight();

      data.noviceSpells = data.items.filter(function(item) {return item.type=="spell" &&  item.data.level=="novice" && (item.data.class=="Spells" || item.data.class=="Invocations" || item.data.class=="Witcher")});
      data.journeymanSpells = data.items.filter(function(item) {return item.type=="spell" &&  item.data.level=="journeyman" && (item.data.class=="Spells" || item.data.class=="Invocations" || item.data.class=="witcher")});
      data.masterSpells = data.items.filter(function(item) {return item.type=="spell" &&  item.data.level=="master" && (item.data.class=="Spells" || item.data.class=="Invocations" || item.data.class=="witcher")});
      data.hexes = data.items.filter(function(item) {return item.type=="spell" &&  item.data.class=="Hexes"});
      data.rituals = data.items.filter(function(item) {return item.type=="spell" &&  item.data.class=="Rituals"});

      
      return data;
    }

    activateListeners(html) {
      super.activateListeners(html);
      
      html.find("input.stats").on("change", updateDerived(this.actor));

      let thisActor = this.actor;
      
      html.find(".inline-edit").change(this._onInlineEdit.bind(this));
      html.find(".item-edit").on("click", this._onItemEdit.bind(this));
      html.find(".item-weapon-display").on("click", this._onItemDisplayInfo.bind(this));
      html.find(".item-armor-display").on("click", this._onItemDisplayInfo.bind(this));
      html.find(".item-valuable-display").on("click", this._onItemDisplayInfo.bind(this));
      html.find(".item-delete").on("click", this._onItemDelete.bind(this));

      html.find(".item-substance-display").on("click", this._onSubstanceDisplay.bind(this));
      html.find(".item-spell-display").on("click", this._onItemDisplayInfo.bind(this));

    

      html.find(".crit-roll").on("click", this._onCritRoll.bind(this));
      html.find(".death-roll").on("click", this._onDeathSaveRoll.bind(this));
      html.find(".stat-roll").on("click", this._onStatSaveRoll.bind(this));
      html.find(".item-roll").on("click", this._onItemRoll.bind(this));
      html.find(".profession-roll").on("click", this._onProfessionRoll.bind(this));
      html.find(".spell-roll").on("click", this._onSpellRoll.bind(this));
    

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
    }

    async _onSpellRoll(event) {
      let itemId = event.currentTarget.closest(".item").dataset.itemId;
      let spellItem = this.actor.getOwnedItem(itemId);
      let roll = "0"
      if (spellItem.data.data.roll){
        roll = spellItem.data.data.roll
      }
      
      let rollResult = new Roll(roll).roll()
      await RollCustomMessage(rollResult, "systems/TheWitcherTRPG/templates/partials/chat/spell-chat.html", {
        type: "Spell Roll",
        title: spellItem.name,
        staCost: spellItem.data.data.stamina,
        effet: spellItem.data.data.effect,
        range:spellItem.data.data.range,
        duration:spellItem.data.data.duration,
        defence:spellItem.data.data.defence
      })
    }

    async _onProfessionRoll(event) {
      console.log("profession roll")
      let stat = event.currentTarget.closest(".profession-display").dataset.stat;
      let level = event.currentTarget.closest(".profession-display").dataset.level;
      let name = event.currentTarget.closest(".profession-display").dataset.name;
      let effet = event.currentTarget.closest(".profession-display").dataset.effet;
      let statValue = 0
      let statName = 0
      switch(stat){
        case "int":
            statValue = this.actor.data.data.stats.int.max;
            statName = "WITCHER.StInt";
            break;
        case "ref":
            statValue = this.actor.data.data.stats.ref.max;
            statName = "WITCHER.StRef";
            break;
        case "dex":
            statValue = this.actor.data.data.stats.dex.max;
            statName = "WITCHER.StDex";
            break;
        case "body":
            statValue = this.actor.data.data.stats.body.max;
            statName = "WITCHER.StBody";
            break;
        case "spd":
            statValue = this.actor.data.data.stats.spd.max;
            statName = "WITCHER.StSpd";
            break;
        case "emp":
            statValue = this.actor.data.data.stats.emp.max;
            statName = "WITCHER.StEmp";
            break;
        case "cra":
            statValue = this.actor.data.data.stats.cra.max;
            statName = "WITCHER.StCra";
            break;
        case "will":
            statValue = this.actor.data.data.stats.will.max;
            statName = "WITCHER.StWill";
            break;
        case "luck":
            statValue = this.actor.data.data.stats.int.max;
            statName = "WITCHER.StLuck";
            break;
      }

      let rollResult = new Roll(`1d10+${statValue}+${level}`).roll()
      await RollCustomMessage(rollResult, "systems/TheWitcherTRPG/templates/partials/chat/profession-chat.html", {
        type: "Stats Roll",
        title: name,
        effet: effet,
        statName: statName,
        difficulty: statValue
      })
    }

    async _onCritRoll(event) {
      let rollResult = new Roll("1d10x10").roll()
      await RollCustomMessage(rollResult, "systems/TheWitcherTRPG/templates/partials/chat/crit-chat.html", {
        type: "Stats Roll",
      })
    }

    async _onDeathSaveRoll(event) {
      let rollResult = new Roll("1d10").roll()
      await RollCustomMessage(rollResult, "systems/TheWitcherTRPG/templates/partials/chat/stat-chat.html", {
        type: "Stats Roll",
        statName: "WITCHER.DeathSave",
        difficulty: this.actor.data.data.coreStats.stun.value
      })
    }

    async _onStatSaveRoll(event) {
      let stat = event.currentTarget.closest(".stat-display").dataset.stat;
      let statValue = 0
      let statName = 0
      switch(stat){
        case "int":
            statValue = this.actor.data.data.stats.int.max;
            statName = "WITCHER.StInt";
            break;
        case "ref":
            statValue = this.actor.data.data.stats.ref.max;
            statName = "WITCHER.StRef";
            break;
        case "dex":
            statValue = this.actor.data.data.stats.dex.max;
            statName = "WITCHER.StDex";
            break;
        case "body":
            statValue = this.actor.data.data.stats.body.max;
            statName = "WITCHER.StBody";
            break;
        case "spd":
            statValue = this.actor.data.data.stats.spd.max;
            statName = "WITCHER.StSpd";
            break;
        case "emp":
            statValue = this.actor.data.data.stats.emp.max;
            statName = "WITCHER.StEmp";
            break;
        case "cra":
            statValue = this.actor.data.data.stats.cra.max;
            statName = "WITCHER.StCra";
            break;
        case "will":
            statValue = this.actor.data.data.stats.will.max;
            statName = "WITCHER.StWill";
            break;
        case "luck":
            statValue = this.actor.data.data.stats.int.max;
            statName = "WITCHER.StLuck";
            break;
      }

      let rollResult = new Roll("1d10").roll()
      await RollCustomMessage(rollResult, "systems/TheWitcherTRPG/templates/partials/chat/stat-chat.html", {
        type: "Stats Roll",
        statName: statName,
        difficulty: statValue
      })
    }

    _onInlineEdit(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".item").dataset.itemId;
      let item = this.actor.getOwnedItem(itemId);
      console.log(item)
      let field = element.dataset.field;
      
      // Edit checkbox values
      let value = element.value
      if(value == "false") { 
        value = true
      }
      if(value == "true") { 
        value = false
      }
      
      return item.update({[field]: value});
    }
    
    _onItemEdit(event) {
      event.preventDefault(); 
      let itemId = event.currentTarget.closest(".item").dataset.itemId;
      let item = this.actor.getOwnedItem(itemId);

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

    _onItemRoll(event) {
      let itemId = event.currentTarget.closest(".item").dataset.itemId;
      let item = this.actor.getOwnedItem(itemId);
      let formula = item.data.data.damage

      if (item.data.data.isMelee){
        formula += this.actor.data.data.attackStats.meleeBonus
      }

      let messageData = {
        speaker: {alias: this.actor.data.data.general.name},
        flavor: `<h1>Attack: ${item.name}</h1>`,
      }

      new Dialog({
        title: `Performing an Attack with: ${item.name}`, 
        content: `<h2>${item.name} damage: ${formula}</h2>`,
        buttons: {
          LocationRandomHuman: {
            label: "Human", 
            callback: (html) => {
              let location = getRandomInt(10)
              switch(location){
                case 1:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Head`;
                  formula = `(${formula})*3`;
                  break;
                case 2:
                case 3:
                case 4:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Torso`;
                  break;
                case 5:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: R Arm`;
                  formula = `(${formula})*0.5`;
                  break;
                case 6:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: L Arm`;
                  formula = `(${formula})*0.5`;
                  break;
                case 7:
                case 8:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: R Leg`;
                  formula = `(${formula})*0.5`;
                  break;
                case 9:
                case 10:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: R Leg`;
                  formula = `(${formula})*0.5`;
                  break;
                default:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Torso`;
              }
              new Roll(formula).roll().toMessage(messageData)
            }
          },
          LocationRandomMonster: {
            label: "Monster", 
            callback: (html) => {
              let location = getRandomInt(10)
              switch(location){
                case 1:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Head`;
                  formula = `(${formula})*3`;
                  break;
                case 2:
                case 3:
                case 4:
                  case 5:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Torso`;
                  break;
                case 6:
                case 7:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: R Limb`;
                  formula = `(${formula})*0.5`;
                  break;
                case 8:
                  case 9:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: L Limb`;
                  formula = `(${formula})*0.5`;
                  break;
                case 10:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Tail or Wing`;
                  formula = `(${formula})*0.5`;
                  break;
                default:
                  messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Torso`;
              }
              new Roll(formula).roll().toMessage(messageData)
            }
          },
          LocationHead: {
            label: "Head", 
            callback: (html) => {
              messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Head`,
              new Roll(`(${formula})*3`).roll().toMessage(messageData)
            }
          },
          LocationTorso: {
            label: "Torso", 
            callback: (html) => {
              messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Torso`,
              new Roll(formula).roll().toMessage(messageData)
            }
          },
          LocationArm: {
            label: "Arm", 
            callback: (html) => {
              messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Arm`,
              new Roll(`(${formula})*0.5`).roll().toMessage(messageData)
            }
          },
          LocationLeg: {
            label: "Leg", 
            callback: (html) => {
              messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Leg`,
              new Roll(`(${formula})*0.5`).roll().toMessage(messageData)
            }
          },
          LocationTail: {
            label: "Tail", 
            callback: (html) => {
              messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Tail or Wing`,
              new Roll(`(${formula})*0.5`).roll().toMessage(messageData)
            }
          }
        }
      }).render(true)  
    
    }

    _onSubstanceDisplay(event) {
      event.preventDefault(); 
      let section = event.currentTarget.closest(".substance");
      let editor = $(section).find(".substance-list")
      editor.toggleClass("hidden");
      
      let chevronEditor = $(section).find(".fas")
      chevronEditor.toggleClass("fa-chevron-right");
      chevronEditor.toggleClass("fa-chevron-down");
    }

    calc_total_skills(data) {
      let totalSkills = 0;
      for (let element in data.data.skills) {
        for (let skill in data.data.skills[element]) {
          totalSkills += data.data.skills[element][skill].value;
        }
      }
      return totalSkills;
    }
}
