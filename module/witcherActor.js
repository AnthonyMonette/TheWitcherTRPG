import { witcher } from "./config.js";
import { getRandomInt } from "./witcher.js";

export default class WitcherActor extends Actor {
  prepareData() {
    super.prepareData();
  }

  async rollItem(itemId) {
    this.sheet._onItemRoll(null, itemId)
  }

  async rollSpell(itemId) {
    this.sheet._onSpellRoll(null, itemId)
  }

  getControlledToken() {
    let tokens = game.canvas.tokens.controlled.slice()
    let token;
    if (tokens.length == 0) {
      if (game.user.character) {
        token = game.user.character.token
      } else if (this.token) {
        token = this.token
      } else {
        return ui.notifications.error(game.i18n.localize("WITCHER.Context.SelectActor"));
      }
    } else {
      token = tokens[0].document
    }

    return token;
  }

  getDamageFlags() {
    return {
      "witcher": { "origin": { "name": this.name } },
      "damage": true,
    }
  }

  getDefenceSuccessFlags(defenceSkill) {
    return {
      "witcher": { "origin": { "name": this.name } },
      "defenceSkill": defenceSkill,
      "defence": true,
    }
  }

  getNoDamageFlags() {
    return {
      "witcher": { "origin": { "name": this.name } },
      "damage": false,
    }
  }

  getDefenceFailFlags(defenceSkill) {
    return {
      "witcher": { "origin": { "name": this.name } },
      "defenceSkill": defenceSkill,
      "defence": false,
    }
  }

  getSpeaker() {
    return {
      "alias": this.name,
      "actor": this,
      "scene": game.scenes.current,
      "token": this.getControlledToken(),
    };
  }

  isEnoughThrowableWeapon(item) {
    if (item.system.isThrowable) {
      let throwableItems = this.items.filter(w => w.type == "weapon" && w.name == item.name);

      let quantity = throwableItems[0].system.quantity >= 0 ?
        throwableItems[0].system.quantity :
        throwableItems.sum("quantity");
      return quantity > 0
    } else {
      return false
    }
  }

  getSubstance(name) {
    return this.getList("component").filter(i => i.system.type == "substances" && i.system.substanceType == name);
  }

  getList(name) {
    switch (name) {
      case "alchemical":
      case "armor":
      case "component":
      case "diagrams":
      case "effect":
      case "enhancement":
      case "mount":
      case "mutagen":
      case "note":
      case "profession":
      case "race":
      case "spell":
      case "valuable":
      case "weapon":
        return this.items.filter(i => i.type == name)
      default:
        return ui.notifications.error(game.i18n.localize("WITCHER.err.NoItemsOfSpecificType"));
    }
  }

  // Find needed component in the items list based on the component name or based on the exact name of the substance in the players compendium
  // Components in the diagrams are only string fields.
  // It is possible for diagram to have component which is actually the substance
  // That is why we need to check whether specific component name could be a substance
  // Ideally we need to store some flag (substances list for diagrams) to the diagram components
  // which will indicate whether the component is substance or not.
  // Such modification may require either modification dozens of compendiums, or some additional parsers
  findNeededComponent(componentName) {
    return this.items.filter(function (item) {
      return item.type == "component" &&
        (item.name == componentName ||
          (item.system.type == "substances" &&
            ((game.i18n.localize("WITCHER.Inventory.Vitriol") == componentName
              && item.system.substanceType == "vitriol") ||
              (game.i18n.localize("WITCHER.Inventory.Rebis") == componentName
                && item.system.substanceType == "rebis") ||
              (game.i18n.localize("WITCHER.Inventory.Aether") == componentName
                && item.system.substanceType == "aether") ||
              (game.i18n.localize("WITCHER.Inventory.Quebrith") == componentName
                && item.system.substanceType == "quebrith") ||
              (game.i18n.localize("WITCHER.Inventory.Hydragenum") == componentName
                && item.system.substanceType == "hydragenum") ||
              (game.i18n.localize("WITCHER.Inventory.Vermilion") == componentName
                && item.system.substanceType == "vermilion") ||
              (game.i18n.localize("WITCHER.Inventory.Sol") == componentName
                && item.system.substanceType == "sol") ||
              (game.i18n.localize("WITCHER.Inventory.Caelum") == componentName
                && item.system.substanceType == "caelum") ||
              (game.i18n.localize("WITCHER.Inventory.Fulgur") == componentName
                && item.system.substanceType == "fulgur"))))
    });
  }

  async removeItem(itemId, quantityToRemove) {
    let foundItem = this.items.get(itemId)
    let newQuantity = foundItem.system.quantity - quantityToRemove
    if (newQuantity <= 0) {
      await this.items.get(itemId).delete()
    } else {
      await foundItem.update({ 'system.quantity': newQuantity < 0 ? 0 : newQuantity })
    }
  }

  getLocationObject(location) {
    let alias = "";
    let locationFormula = `(${game.i18n.localize("WITCHER.Chat.FullDmg")})`;
    let modifier = `+0`;
    switch (location) {
      case "randomHuman":
        let randomHumanLocation = getRandomInt(10)
        switch (randomHumanLocation) {
          case 1:
            location = "Head";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationHead")}`;
            locationFormula = `*3`;
            break;
          case 2:
          case 3:
          case 4:
            location = "Torso";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
            break;
          case 5:
            location = "R. Arm";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
            locationFormula = `*0.5`;
            break;
          case 6:
            location = "L. Arm";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
            locationFormula = `*0.5`;
            break;
          case 7:
          case 8:
            location = "R. Leg";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
            locationFormula = `*0.5`;
            break;
          case 9:
          case 10:
            location = "L. Leg";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
            locationFormula = `*0.5`;
            break;
          default:
            location = "Torso";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
            break;
        }
        break;
      case "randomMonster":
        let randomMonsterLocation = getRandomInt(10)
        switch (randomMonsterLocation) {
          case 1:
            location = "Head";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationHead")}`;
            locationFormula = `*3`;
            break;
          case 2:
          case 3:
          case 4:
          case 5:
            location = "Torso";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
            break;
          case 6:
          case 7:
            location = "R. Leg";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Dialog.attackLimb")}`;
            locationFormula = `*0.5`;
            break;
          case 8:
          case 9:
            location = "L. Leg";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Dialog.attackLimb")}`;
            locationFormula = `*0.5`;
            break;
          case 10:
            location = "Tail/Wing";
            alias = `${game.i18n.localize("WITCHER.Dialog.attackTail")}`;
            locationFormula = `*0.5`;
            break;
          default:
            location = "Torso";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
            break;
        }
        break;
      case "randomSpell":
        name = location;
        alias = `${game.i18n.localize("WITCHER.Location.All")}`;
        break;
      case "Head":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationHead")}`;
        locationFormula = `*3`;
        modifier = `-6`;
        break;
      case "Torso":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
        locationFormula = `*1`;
        modifier = `-1`;
        break;
      case "R. Arm":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
        locationFormula = `*0.5`;
        modifier = `-3`;
        break;
      case "L. Arm":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
        locationFormula = `*0.5`;
        modifier = `-3`;
        break;
      case "R. Leg":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
        locationFormula = `*0.5`;
        modifier = `-2`;
        break;
      case "L. Leg":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
        locationFormula = `*0.5`;
        modifier = `-2`;
        break;
      case "Tail/Wing":
        alias = `${game.i18n.localize("WITCHER.Dialog.attackTail")}`;
        locationFormula = `*0.5`;
        break;
      default:
        alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
        locationFormula = `*1`;
        modifier = `-2`;
        break;
    }

    return {
      name: location,
      alias: alias,
      locationFormula: locationFormula,
      modifier: modifier
    };
  }
}