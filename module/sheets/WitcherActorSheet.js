import { RollCustomMessage } from "../chat.js";
import { witcher } from "../config.js";
import { getRandomInt, updateDerived, rollSkillCheck, applyWoundTreshold, removeWoundTreshold, genId } from "../witcher.js";

export default class WitcherActorSheet extends ActorSheet {
    constructor(...args) {
      super(...args);
      this.actor.update({
        "data.CritDescription": witcher.CritDescription,
      });
      this.actor.update({
        "data.CritModDescription": witcher.CritModDescription,
      });
      this.actor.update({
        "data.CritGravity": witcher.CritGravity,
      });
      this.actor.update({
        "data.CritGravityDefaultEffect": witcher.CritGravityDefaultEffect,
      });
      this.actor.update({
        "data.CritMod": witcher.CritMod,
      });
      this.actor.update({
        "data.CritSimple": witcher.CritSimple,
      });
      this.actor.update({
        "data.CritComplex": witcher.CritComplex,
      });
      this.actor.update({
        "data.CritDifficult": witcher.CritDifficult,
      });
      this.actor.update({
        "data.CritDeadly": witcher.CritDeadly,
      });
    }
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
      data.config = CONFIG.witcher;
      CONFIG.Combat.initiative.formula = "1d10 + @stats.ref.current"

      if (!this.actor.data.data.woundTresholdApplied && this.actor.data.data.derivedStats.hp.value < this.actor.data.data.coreStats.woundTreshold.value) {
        applyWoundTreshold(this.actor)
      }

      if (this.actor.data.data.woundTresholdApplied && this.actor.data.data.derivedStats.hp.value >= this.actor.data.data.coreStats.woundTreshold.value) {
        removeWoundTreshold(this.actor)
      }

      data.weapons = data.items.filter(function(item) {return item.type=="weapon"});
      data.armors = data.items.filter(function(item) {return item.type=="armor" || item.type == "enhancement"});
      data.components = data.items.filter(function(item) {return item.type=="component" &&  item.data.type!="substances"});
      data.allComponents = data.items.filter(function(item) {return item.type=="component"});
      data.valuables = data.items.filter(function(item) {return item.type=="valuable" || item.type == "mount" || item.type =="alchemical" || item.type =="mutagen" });
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


      data.loots =  data.items.filter(function(item) {return item.type=="component" || item.type == "valuable" || item.type=="diagrams" || item.type=="armor" || item.type=="alchemical"});
      data.notes =  data.items.filter(function(item) {return item.type=="note"});

      data.totalWeight =  data.items.weight();
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
      
      html.find("input.stats").on("change", updateDerived(this.actor));

      let thisActor = this.actor;
      
      html.find(".inline-edit").change(this._onInlineEdit.bind(this));
      html.find(".item-edit").on("click", this._onItemEdit.bind(this));
      html.find(".item-weapon-display").on("click", this._onItemDisplayInfo.bind(this));
      html.find(".item-armor-display").on("click", this._onItemDisplayInfo.bind(this));
      html.find(".item-valuable-display").on("click", this._onItemDisplayInfo.bind(this));
      html.find(".item-delete").on("click", this._onItemDelete.bind(this));
      html.find(".add-item").on("click", this._onItemAdd.bind(this));

      html.find(".skill-display").on("click", this._onSkillDisplay.bind(this));
      html.find(".item-substance-display").on("click", this._onSubstanceDisplay.bind(this));
      html.find(".spell-display").on("click", this._onSpellDisplay.bind(this));

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
        console.log(ev)
        let itemId = ev.target.dataset.id
        let item = this.actor.getOwnedItem(itemId);
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

    async _onDrop(event, data) {
      let dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (dragData.type === "itemDrop") {
        this.actor.createEmbeddedDocuments("Item", [dragData.item]);
      } else {
        super._onDrop(event, data);
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

      console.log(itemData)
      this.actor.createOwnedItem(itemData)
    }
    
    async _alchemyCraft(event) {
      let itemId = event.currentTarget.closest(".item").dataset.itemId;
      let item = this.actor.getOwnedItem(itemId);

      const content = `<label>Crafting a ${item.data.name}</label> <br /> Work in progress`;

      let messageData = {
        speaker: {alias: this.actor.name},
        flavor: `<h1>Crafting</h1>`,
      }

      new Dialog({
        title: `Performing an alchemy action`, 
        content,
        buttons: {
          Craft: {
            label: "Craft", 
            callback: (html) => {
              let stat = this.actor.data.data.stats.cra.current;
              let skill = this.actor.data.data.skills.cra.alchemy.value;
              messageData.flavor = `<h1>Crafting an alchemical</h1>`,
              messageData.flavor += `Alchemy DC: ${item.data.data.alchemyDC}`;

              if (!item.data.data.alchemyDC || item.data.data.alchemyDC == 0){
                stat = this.actor.data.data.stats.cra.current;
                skill = this.actor.data.data.skills.cra.crafting.value;
                messageData.flavor = `Crafting DC: ${item.data.data.craftingDC}`;
              }
              let rollFormula = `1d10+${stat}+${skill}`;
              new Roll(rollFormula).roll().toMessage(messageData);
            }
          }
        }}).render(true) 
    }


    async _onSpellRoll(event, itemId = null) {
      if (!itemId){
        itemId = event.currentTarget.closest(".item").dataset.itemId;
      }
      let spellItem = this.actor.getOwnedItem(itemId);
      let formula = `1d10`
      formula += `+${this.actor.data.data.stats.will.current}`
      switch(spellItem.data.data.class) {
        case "Witcher":
        case "Invocations":
        case "Spells":
          formula += `+${this.actor.data.data.skills.will.spellcast.value}`;
          break;
        case "Rituals":
          formula += `+${this.actor.data.data.skills.will.ritcraft.value}`;
          break;
        case "Hexes":
          formula += `+${this.actor.data.data.skills.will.hexweave.value}`;
          break;
      }
      let staCostTotal = spellItem.data.data.stamina;
      let staCostdisplay = spellItem.data.data.stamina;
      if (staCostTotal != "V" || staCostTotal != "Varivable"){
        let staFocus = 0 
        if (this.actor.data.data.focus1) {
          staFocus = Number(this.actor.data.data.focus1.value) + Number(this.actor.data.data.focus2.value) + Number(this.actor.data.data.focus3.value) + Number(this.actor.data.data.focus4.value) 
        }
        
        staCostTotal -= staFocus
        if (staCostTotal < 0) {
          staCostTotal = 0
        }

        let newSta = this.actor.data.data.derivedStats.sta.value - staCostTotal
        this.actor.update({ 
          'data.derivedStats.sta.value': newSta
        });
        staCostdisplay += `-${staFocus}[Focus]`
      }

      let rollResult = new Roll(formula).roll()
      await RollCustomMessage(rollResult, "systems/TheWitcherTRPG/templates/partials/chat/spell-chat.html", this.actor, {
        type: "Spell Roll",
        title: spellItem.name,
        staCost: staCostdisplay,
        effet: spellItem.data.data.effect,
        range:spellItem.data.data.range,
        duration:spellItem.data.data.duration,
        defence:spellItem.data.data.defence,
        preparationTime:spellItem.data.data.preparationTime,
        components:spellItem.data.data.components,
        alternateComponents:spellItem.data.data.alternateComponents,
        dificultyCheck:spellItem.data.data.dificultyCheck,
        liftRequirement:spellItem.data.data.liftRequirement
      })
    }

    async _onProfessionRoll(event) {
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

      let rollResult = new Roll(`1d10+${statValue}+${level}`).roll()
      await RollCustomMessage(rollResult, "systems/TheWitcherTRPG/templates/partials/chat/profession-chat.html", this.actor, {
        type: "Stats Roll",
        title: name,
        effet: effet,
        statName: statName,
        difficulty: statValue
      })
    }

    async _onInitRoll(event) {
      this.actor.rollInitiative({createCombatants: true, rerollInitiative: true})
    }

    async _onCritRoll(event) {
      let rollResult = new Roll("1d10x10").roll()
      await RollCustomMessage(rollResult, "systems/TheWitcherTRPG/templates/partials/chat/crit-chat.html", this.actor, {
        type: "Stats Roll",
      })
    }

    async _onDeathSaveRoll(event) {
      let rollResult = new Roll("1d10").roll()
      await RollCustomMessage(rollResult, "systems/TheWitcherTRPG/templates/partials/chat/stat-chat.html", this.actor, {
        type: "Stats Roll",
        statName: "WITCHER.DeathSave",
        difficulty: this.actor.data.data.coreStats.stun.value
      })
    }

    async _onDefenceRoll(event) {
      const options = `
      <option value="brawling"> Brawling </option>
      <option value="melee"> Melee </option>
      <option value="smallblades"> Small Blades </option>
      <option value="staffspear"> Staff/Spear </option>
      <option value="swordsmanship"> Swordsmanship </option>
      `;
      const content = `
      <div class="flex">
       <label>Extra defense: <input type="checkbox" name="isExtraDefense"></label> <br />
      </div>
      <label>Defense with: </label><select name="form">${options}</select>`;

      let messageData = {
        speaker: {alias: this.actor.name},
        flavor: `<h1>Defense</h1>`,
      }

      new Dialog({
        title: `Performing a defense action`, 
        content,
        buttons: {
          Dodge: {
            label: "Dodge", 
            callback: (html) => {
              let isExtraDefense = html.find("[name=isExtraDefense]").prop("checked");
              if (isExtraDefense) {
                let newSta = this.actor.data.data.derivedStats.sta.value - 1
                this.actor.update({ 
                  'data.derivedStats.sta.value': newSta
                });
              }
              let stat = this.actor.data.data.stats.ref.current;
              let skill = this.actor.data.data.skills.ref.dodge.value;
              let displayFormula = `1d10 + Ref + Dodge/Escape`;
              messageData.flavor = `<h1>Defense: Dodge</h1><p>${displayFormula}</p>`;
              let rollFormula = `1d10+${stat}+${skill}`;
              new Roll(rollFormula).roll().toMessage(messageData);
            }
          },
          Reposition: {
            label: "Reposition",
            callback: (html) => {
              let isExtraDefense = html.find("[name=isExtraDefense]").prop("checked");
              if (isExtraDefense) {
                let newSta = this.actor.data.data.derivedStats.sta.value - 1
                this.actor.update({ 
                  'data.derivedStats.sta.value': newSta
                });
              }
              let stat = this.actor.data.data.stats.dex.current;
              let skill = this.actor.data.data.skills.dex.athletics.value;
              let displayFormula = `1d10 + Dex + Athletics`;
              messageData.flavor = `<h1>Defense: Reposition</h1><p>${displayFormula}</p>`;
              let rollFormula = `1d10+${stat}+${skill}`;
              new Roll(rollFormula).roll().toMessage(messageData);
            }
          },
          Block: {
            label: "Block",
            callback: (html) => {
              let isExtraDefense = html.find("[name=isExtraDefense]").prop("checked");
              if (isExtraDefense) {
                let newSta = this.actor.data.data.derivedStats.sta.value - 1
                this.actor.update({ 
                  'data.derivedStats.sta.value': newSta
                });
              }
              let defense = html.find("[name=form]")[0].value;
              let stat = this.actor.data.data.stats.ref.current;
              let skill = 0;
              let displayFormula = `1d10 + Ref + Defense`;
              switch(defense){
                case "brawling":
                  skill = this.actor.data.data.skills.ref.brawling.value;
                  displayFormula = `1d10 + Ref + Brawling`;
                  break;
                case "melee":
                  skill = this.actor.data.data.skills.ref.melee.value;
                  displayFormula = `1d10 + Ref + Melee`;
                  break;
                case "smallblades":
                  skill = this.actor.data.data.skills.ref.smallblades.value;
                  displayFormula = `1d10 + Ref + Small Blades`;
                  break;
                case "staffspear":
                  skill = this.actor.data.data.skills.ref.staffspear.value;
                  displayFormula = `1d10 + Ref + Staff/Spear`;
                  break;
                case "swordsmanship":
                  skill = this.actor.data.data.skills.ref.swordsmanship.value;
                  displayFormula = `1d10 + Ref + Swordsmanship`;
                  break;
              }

              messageData.flavor = `<h1>Defense: Block</h1><p>${displayFormula}</p>`;
              let rollFormula = `1d10+${stat}+${skill}`;
              new Roll(rollFormula).roll().toMessage(messageData);
            }
          },
          Parry: {
            label: "Parry",
            callback: (html) => {
              let isExtraDefense = html.find("[name=isExtraDefense]").prop("checked");
              if (isExtraDefense) {
                let newSta = this.actor.data.data.derivedStats.sta.value - 1
                this.actor.update({ 
                  'data.derivedStats.sta.value': newSta
                });
              }
              let defense = html.find("[name=form]")[0].value;
              let stat = this.actor.data.data.stats.ref.current;
              let skill = 0;
              let displayFormula = `1d10 + Ref + Parry`;
              switch(defense){
                case "brawling":
                  skill = this.actor.data.data.skills.ref.brawling.value;
                  displayFormula = `1d10 + Ref + Brawling - 3`;
                  break;
                case "melee":
                  skill = this.actor.data.data.skills.ref.melee.value;
                  displayFormula = `1d10 + Ref + Melee - 3`;
                  break;
                case "smallblades":
                  skill = this.actor.data.data.skills.ref.smallblades.value;
                  displayFormula = `1d10 + Ref + Small Blades - 3`;
                  break;
                case "staffspear":
                  skill = this.actor.data.data.skills.ref.staffspear.value;
                  displayFormula = `1d10 + Ref + Staff/Spear - 3`;
                  break;
                case "swordsmanship":
                  skill = this.actor.data.data.skills.ref.swordsmanship.value;
                  displayFormula = `1d10 + Ref + Swordsmanship - 3`;
                  break;
              }

              messageData.flavor = `<h1>Defense: Parry</h1><p>${displayFormula}</p>`;
              let rollFormula = `1d10+${stat}+${skill}-3`;
              new Roll(rollFormula).roll().toMessage(messageData);
            }
          },
          ParryAgainstThrown: {
            label: "Parry Thrown weapon",
            callback: (html) => {
              let isExtraDefense = html.find("[name=isExtraDefense]").prop("checked");
              if (isExtraDefense) {
                let newSta = this.actor.data.data.derivedStats.sta.value - 1
                this.actor.update({ 
                  'data.derivedStats.sta.value': newSta
                });
              }
              let defense = html.find("[name=form]")[0].value;
              let stat = this.actor.data.data.stats.ref.current;
              let skill = 0;
              let displayFormula = `1d10 + Ref + Parry`;
              switch(defense){
                case "brawling":
                  skill = this.actor.data.data.skills.ref.brawling.value;
                  displayFormula = `1d10 + Ref + Brawling - 5`;
                  break;
                case "melee":
                  skill = this.actor.data.data.skills.ref.melee.value;
                  displayFormula = `1d10 + Ref + Melee - 5`;
                  break;
                case "smallblades":
                  skill = this.actor.data.data.skills.ref.smallblades.value;
                  displayFormula = `1d10 + Ref + Small Blades - 5`;
                  break;
                case "staffspear":
                  skill = this.actor.data.data.skills.ref.staffspear.value;
                  displayFormula = `1d10 + Ref + Staff/Spear - 5`;
                  break;
                case "swordsmanship":
                  skill = this.actor.data.data.skills.ref.swordsmanship.value;
                  displayFormula = `1d10 + Ref + Swordsmanship - 5`;
                  break;
              }

              messageData.flavor = `<h1>Defense: Parry</h1><p>${displayFormula}</p>`;
              let rollFormula = `1d10+${stat}+${skill}-5`;
              new Roll(rollFormula).roll().toMessage(messageData);
            }
          }
        }
      }).render(true)  
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
            statValue = this.actor.data.data.stats.int.current;
            statName = "WITCHER.StLuck";
            break;
      }

      let rollResult = new Roll("1d10").roll()
      await RollCustomMessage(rollResult, "systems/TheWitcherTRPG/templates/partials/chat/stat-chat.html", this.actor, {
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

    _onFocusIn(event) {
      event.currentTarget.select();
    }

    _onItemRoll(event, itemId = null) {
      if (!itemId){
        itemId = event.currentTarget.closest(".item").dataset.itemId;
      }
      let item = this.actor.getOwnedItem(itemId);
      let formula = item.data.data.damage

      if (item.data.data.isMelee){
        formula += this.actor.data.data.attackStats.meleeBonus
      }

      let messageData = {
        speaker: {alias: this.actor.name},
        flavor: `<h1>Attack: ${item.name}</h1>`,
      }
      const locationOptions = `
      <option value="randomHuman"> Random Human </option>
      <option value="randomMonster"> Random Monster </option>
      <option value="head"> Head </option>
      <option value="torso"> Torso </option>
      <option value="arm"> Arm </option>
      <option value="leg"> Leg </option>
      <option value="tail"> Tail/wing </option>
      `;
      const AttackModifierOptions = `
      <div class="flex">
        <div>
          <label><input type="checkbox" name="isFastDraw"> Fast Draw</label> <br />
          <label><input type="checkbox" name="isProne"> You are prone</label> <br />
          <label><input type="checkbox" name="isPinned"> Target pinned</label> <br />
          <label><input type="checkbox" name="isActivelyDodging"> Target actively dodging</label> <br />
          <label><input type="checkbox" name="isMoving"> Moving target REF > 10</label> <br />
        </div>
        <div>
          <label><input type="checkbox" name="isAmbush"> Ambush</label> <br />
          <label><input type="checkbox" name="isRicochet"> Ricochet</label> <br />
          <label><input type="checkbox" name="isBlinded"> You are blinded</label> <br />
          <label><input type="checkbox" name="isSilhouetted"> Silhouetted</label> <br />
          <label><input type="checkbox" name="isAiming"> Aiming rounds: </label> <input class="small" name="customAim" value=0> <br />
        </div>
      </div>
      `;
      const opponentSizeOptions = `
      <option value="medium"> Medium </option>
      <option value="small"> Small</option>
      <option value="large"> Large </option>
      <option value="huge"> Huge </option>
      `;
      const rangeOptions = `
      <option value="none"> None </option>
      <option value="pointBlank"> Point Blank </option>
      <option value="close"> Close</option>
      <option value="medium"> Medium </option>
      <option value="long"> Long </option>
      <option value="extreme"> Extreme </option>
      `;
      const StrikeOptions = `
      <option value="normal"> Normal Strike </option>
      <option value="fast"> Fast Strike </option>
      <option value="strong"> Strong Strike </option>
      <option value="joint"> Joint Strike </option>
      `;


      let content = `<h2>${item.name} Attack will use: ${item.data.data.attackSkill}</h2> 
                     <div class="flex">
                      <label>Extra attack: <input type="checkbox" name="isExtraAttack"></label> <br />
                     </div>
                     <label>Hit Location: <select name="location">${locationOptions}</select></label> <br />
                     <label>Attack Modifiers:</label> <br />${AttackModifierOptions}
                     <label>Opponent Size Modifiers: <select name="size">${opponentSizeOptions}</select></label> <br />
                     <label>Range Modifiers: <select name="range">${rangeOptions}</select></label> <br />
                     <label>Custom Modifiers: <input name="customAtt" value=0></label> <br />
                     <label>Strike type: <select name="strike">${StrikeOptions}</select></label> <br /><br />
                     <h2>${item.name} damage: ${formula}</h2> 
                     <label>Melee Bonus: ${this.actor.data.data.attackStats.meleeBonus} </label><br />
                     <label>Custom Damage Modifiers: <input name="customDmg" value=0></label> <br /><br />
                     `;


      new Dialog({
        title: `Performing an Attack with: ${item.name}`, 
        content,
        buttons: {
          Roll: {
            label: "Roll",
            callback: (html) => {
              let isExtraAttack = html.find("[name=isExtraAttack]").prop("checked");

              let location = html.find("[name=location]")[0].value;

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

              let size = html.find("[name=size]")[0].value;
              let range = html.find("[name=range]")[0].value;
              let customAtt = html.find("[name=customAtt]")[0].value;
              let strike = html.find("[name=strike]")[0].value;

              let customDmg = html.find("[name=customDmg]")[0].value;
              let attacknumber = 1;
              
              if (isExtraAttack) {
                let newSta = this.actor.data.data.derivedStats.sta.value - 3
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

                if (item.data.data.isMelee){
                  attFormula += `+${this.actor.data.data.stats.ref.current}`;
                } 
                else { 
                  attFormula += `+${this.actor.data.data.stats.dex.current}`;
                }
                
                switch(item.data.data.attackSkill){
                  case "Brawling":
                    attFormula += `+${this.actor.data.data.skills.ref.brawling.value}`;
                    break;
                  case "Melee":
                    attFormula += `+${this.actor.data.data.skills.ref.melee.value}`;
                    break;
                  case "Small Blades":
                    attFormula += `+${this.actor.data.data.skills.ref.smallblades.value}`;
                    break;
                  case "Staff/Spear":
                    attFormula += `+${this.actor.data.data.skills.ref.staffspear.value}`;
                    break;
                  case "Swordsmanship":
                    attFormula += `+${this.actor.data.data.skills.ref.swordsmanship.value}`;
                    break;
                  case "Archery":
                    attFormula += `+${this.actor.data.data.skills.dex.archery.value}`;
                    break;
                  case "Athletics":
                    attFormula += `+${this.actor.data.data.skills.dex.athletics.value}`;
                    break;
                  case "Crossbow":
                    attFormula += `+${this.actor.data.data.skills.dex.crossbow.value}`;
                    break;
                }

                if (customAtt != "0") {
                  attFormula += "+"+customAtt;
                }
                switch(range){
                  case "pointBlank":
                    attFormula = `${attFormula}+5`;
                    break;
                  case "medium":
                    attFormula = `${attFormula}-2`;
                    break;
                  case "long":
                    attFormula = `${attFormula}-4`;
                    break;
                  case "extreme":
                    attFormula = `${attFormula}-6`;
                    break;
                }

                switch(size){
                  case "small":
                    attFormula = `${attFormula}+2`;
                    break;
                  case "large":
                    attFormula = `${attFormula}-2`;
                    break;
                  case "huge":
                    attFormula = `${attFormula}-4`;
                    break;
                }

                
                if (customDmg != "0") {
                  damageFormula += "+"+customDmg;
                }                
                let touchedLocation = ""
                switch(location){
                  case "randomHuman":
                    let randomHumanLocation = getRandomInt(10)
                    switch(randomHumanLocation){
                      case 1:
                        touchedLocation = "Head";
                        damageFormula = `(${damageFormula})*3`;
                        break;
                      case 2:
                      case 3:
                      case 4:
                        touchedLocation = "Torso";
                        break;
                      case 5:
                        touchedLocation = "R Arm";
                        damageFormula = `(${damageFormula})*0.5`;
                        break;
                      case 6:
                        touchedLocation = "L Arm";
                        damageFormula = `(${damageFormula})*0.5`;
                        break;
                      case 7:
                      case 8:
                        touchedLocation = "R Leg";
                        damageFormula = `(${damageFormula})*0.5`;
                        break;
                      case 9:
                      case 10:
                        touchedLocation = "L Leg";
                        damageFormula = `(${damageFormula})*0.5`;
                        break;
                      default:
                        touchedLocation = "Torso";
                    }
                    break;
                  case "randomMonster":
                    let randomMonsterLocation = getRandomInt(10)
                    switch(randomMonsterLocation){
                      case 1:
                        touchedLocation = "Head";
                        damageFormula = `(${damageFormula})*3`;
                        break;
                      case 2:
                      case 3:
                      case 4:
                      case 5:
                        touchedLocation = "Torso";
                      break;
                      case 6:
                      case 7:
                        touchedLocation = "R Limb";
                        damageFormula = `(${damageFormula})*0.5`;
                        break;
                      case 8:
                      case 9:
                        touchedLocation = "L Limb";
                        damageFormula = `(${damageFormula})*0.5`;
                        break;
                      case 10:
                        touchedLocation = "Tail or Wing";
                        damageFormula = `(${damageFormula})*0.5`;
                        break;
                      default:
                        touchedLocation = "Torso";
                    }
                    break;
                  case "head":
                    touchedLocation = "Head";
                    attFormula = `${attFormula}-6`;
                    damageFormula = `(${damageFormula})*3`;
                    break;
                  case "torso":
                    touchedLocation = "Torso";
                    attFormula = `${attFormula}-1`;
                    break;
                  case "arm":
                    touchedLocation = "Arm";
                    attFormula = `${attFormula}-3`;
                    damageFormula = `(${damageFormula})*0.5`;
                    break;
                  case "leg":
                    touchedLocation = "Leg";
                    attFormula = `${attFormula}-2`;
                    damageFormula = `(${damageFormula})*0.5`;
                    break;
                  case "tail":
                    touchedLocation = "Tail or Wing";
                    attFormula = `${attFormula}-2`;
                    damageFormula = `(${damageFormula})*0.5`;
                    break;
                }
                if (strike == "joint" || strike == "strong") {
                  attFormula = `${attFormula}-3`;
                }

                let effects = JSON.stringify(item.data.data.effects)
                messageData.flavor = `<h1><img src="${item.img}" class="item-img" />Attack: ${item.name}</h1>`;
                messageData.flavor += `<button class="damage" data-img="${item.img}" data-name="${item.name}" data-dmg="${damageFormula}" data-location="${touchedLocation}" data-strike="${strike}" data-effects='${effects}'>Damage</button>`;
                new Roll(attFormula).roll().toMessage(messageData)
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

    calc_total_skills(data) {
      let totalSkills = 0;
      for (let element in data.data.skills) {
        for (let skill in data.data.skills[element]) {
          let skillLabel = game.i18n.localize(data.data.skills[element][skill].label)
          if (skillLabel.includes("(2)")){
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
