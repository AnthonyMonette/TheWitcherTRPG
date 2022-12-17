import { witcher } from "./config.js";

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
      } else {
        return ui.notifications.error(game.i18n.localize("WITCHER.Context.SelectActor"));
      }
    } else {
      token = tokens[0]
    }

    return token;
  }

  getSpeaker() {
    return {
      "alias": this.name,
      "actor": this,
      "scene": game.scenes.current,
      "token": this.getControlledToken().document,
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
}