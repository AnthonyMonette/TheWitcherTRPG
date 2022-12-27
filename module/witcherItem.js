import { witcher } from "./config.js";
import { extendedRoll } from "../module/chat.js";
import { RollConfig } from "./rollConfig.js";

export default class WitcherItem extends Item {
  chatTemplate = {
    "weapon": "systems/TheWitcherTRPG/templates/partials/chat/weapon-chat.html"
  }

  async roll() {
  }

  async createSpellVisualEffectIfApplicable(token) {
    if (this.type == "spell" && token && this.system.createTemplate) {
      let distance = Number(this.system.templateSize)
      let direction = 0
      let angle = 0
      let width = 1
      switch (this.system.templateType) {
        case "rect":
          distance = Math.hypot(Number(this.system.templateSize))
          direction = 45
          width = token.target.value;
          break;
        case "cone":
          angle = 45;
          break;
      }

      let effect = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
        t: this.system.templateType,
        user: game.user._id,
        distance: distance,
        direction: token.document.rotation - 90,
        //x: token.system.x + (token.system.width * 100) / 2,
        x: token.center.x,
        //y: token.system.y + (token.system.height * 100) / 2,
        y: token.center.y,
        fillColor: game.user.color,
        angle: angle,
        width: width,
        flags: this.getSpellFlags(),
      }], { keepId: true });

      this.visualEffectId = effect[0]._id;
    }
  }

  async deleteSpellVisualEffect() {
    if (this.visualEffectId && this.system.visualEffectDuration > 0) {
      setTimeout(() => {
        canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [this.visualEffectId])
      }, this.system.visualEffectDuration * 1000);
    }
  }

  getItemAttackSkill() {
    let alias = "";
    switch (this.system.attackSkill) {
      case "Brawling":
        alias = game.i18n.localize("WITCHER.SkRefBrawling")
        break;
      case "Melee":
        alias = game.i18n.localize("WITCHER.SkRefMelee");
        break;
      case "Small Blades":
        alias = game.i18n.localize("WITCHER.SkRefSmall");
        break;
      case "Staff/Spear":
        alias = game.i18n.localize("WITCHER.SkRefStaff");
        break;
      case "Swordsmanship":
        alias = game.i18n.localize("WITCHER.SkRefSwordsmanship");
        break;
      case "Archery":
        alias = game.i18n.localize("WITCHER.SkDexArchery");
        break;
      case "Athletics":
        alias = game.i18n.localize("WITCHER.SkDexAthletics");
        break;
      case "Crossbow":
        alias = game.i18n.localize("WITCHER.SkDexCrossbow");
        break;
      default:
        break;
    }

    return {
      "name": this.system.attackSkill,
      "alias": alias
    };
  }

  getAttackSkillFlags() {
    return {
      "witcher": { "origin": { "name": this.name } },
      "attackSkill": this.system.attackSkill,
      "item": this,
    }
  }

  getSpellFlags() {
    return {
      "witcher": { "origin": { "name": this.name } },
      "spell": this,
      "item": this,
    }
  }

  doesWeaponNeedMeleeSkillToAttack() {
    if (this.system.attackSkill) {
      //Check whether item attack skill is melee
      //Since actor can throw bombs relying on Athletic which is also a melee attack skill
      //We need specific logic for bomb throws
      let meleeSkill = witcher.meleeSkills.includes(this.system.attackSkill)
      let rangedSkill = witcher.rangedSkills.includes(this.system.attackSkill)

      if (meleeSkill && rangedSkill) {
        return meleeSkill && !this.system.usingAmmo && !this.system.isThrowable;
      } else {
        return meleeSkill;
      }
    }
  }

  isAlchemicalCraft() {
    return this.system.alchemyDC && this.system.alchemyDC > 0;
  }

  isWeaponThrowable() {
    return this.system.isThrowable;
  }

  populateAlchemyCraftComponentsList() {
    class alchemyComponent {
      name = "";
      alias = "";
      content = "";
      quantity = 0;

      constructor(name, alias, content, quantity) {
        this.name = name;
        this.alias = alias;
        this.content = content;
        this.quantity = quantity;
      }
    }

    let alchemyCraftComponents = [];
    alchemyCraftComponents.push(
      new alchemyComponent(
        "vitriol",
        game.i18n.localize("WITCHER.Inventory.Vitriol"),
        `<img src="systems/TheWitcherTRPG/assets/images/vitriol.png" class="substance-img" /> <b>${this.system.alchemyComponents.vitriol}</b>`,
        this.system.alchemyComponents.vitriol > 0 ? this.system.alchemyComponents.vitriol : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "rebis",
        game.i18n.localize("WITCHER.Inventory.Rebis"),
        `<img src="systems/TheWitcherTRPG/assets/images/rebis.png" class="substance-img" /> <b>${this.system.alchemyComponents.rebis}</b>`,
        this.system.alchemyComponents.rebis > 0 ? this.system.alchemyComponents.rebis : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "aether",
        game.i18n.localize("WITCHER.Inventory.Aether"),
        `<img src="systems/TheWitcherTRPG/assets/images/aether.png" class="substance-img" /> <b>${this.system.alchemyComponents.aether}</b>`,
        this.system.alchemyComponents.aether > 0 ? this.system.alchemyComponents.aether : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "quebrith",
        game.i18n.localize("WITCHER.Inventory.Quebrith"),
        `<img src="systems/TheWitcherTRPG/assets/images/quebrith.png" class="substance-img" /> <b>${this.system.alchemyComponents.quebrith}</b>`,
        this.system.alchemyComponents.quebrith > 0 ? this.system.alchemyComponents.quebrith : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "hydragenum",
        game.i18n.localize("WITCHER.Inventory.Hydragenum"),
        `<img src="systems/TheWitcherTRPG/assets/images/hydragenum.png" class="substance-img" /> <b>${this.system.alchemyComponents.hydragenum}</b>`,
        this.system.alchemyComponents.hydragenum > 0 ? this.system.alchemyComponents.hydragenum : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "vermilion",
        game.i18n.localize("WITCHER.Inventory.Vermilion"),
        `<img src="systems/TheWitcherTRPG/assets/images/vermilion.png" class="substance-img" /> <b>${this.system.alchemyComponents.vermilion}</b>`,
        this.system.alchemyComponents.vermilion > 0 ? this.system.alchemyComponents.vermilion : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "sol",
        game.i18n.localize("WITCHER.Inventory.Sol"),
        `<img src="systems/TheWitcherTRPG/assets/images/sol.png" class="substance-img" /> <b>${this.system.alchemyComponents.sol}</b>`,
        this.system.alchemyComponents.sol > 0 ? this.system.alchemyComponents.sol : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "caelum",
        game.i18n.localize("WITCHER.Inventory.Caelum"),
        `<img src="systems/TheWitcherTRPG/assets/images/caelum.png" class="substance-img" /> <b>${this.system.alchemyComponents.caelum}</b>`,
        this.system.alchemyComponents.caelum > 0 ? this.system.alchemyComponents.caelum : 0
      )
    );
    alchemyCraftComponents.push(
      new alchemyComponent(
        "fulgur",
        game.i18n.localize("WITCHER.Inventory.Fulgur"),
        `<img src="systems/TheWitcherTRPG/assets/images/fulgur.png" class="substance-img" /> <b>${this.system.alchemyComponents.fulgur}</b>`,
        this.system.alchemyComponents.fulgur > 0 ? this.system.alchemyComponents.fulgur : 0
      )
    );

    this.system.alchemyCraftComponents = alchemyCraftComponents;
    return alchemyCraftComponents;
  }

  /**
   * @param {string} rollFormula
   * @param {*} messageData 
   * @param {RollConfig} config 
   */
  async realCraft(rollFormula, messageData, config) {
    //we want to show message to the chat only after removal of items from inventory
    config.showResult = false

    //added crit rolls for craft & alchemy
    let roll = await extendedRoll(rollFormula, messageData, config)

    messageData.flavor += `<label><b> ${this.actor.name}</b></label><br/>`;

    let result = roll.total > config.threshold;
    let craftedItemName;
    if (this.system.associatedItem && this.system.associatedItem.name) {
      let craftingComponents = this.isAlchemicalCraft()
        ? this.system.alchemyCraftComponents.filter(c => Number(c.quantity) > 0)
        : this.system.craftingComponents.filter(c => Number(c.quantity) > 0);

      craftingComponents.forEach(c => {
        let componentsToDelete = this.isAlchemicalCraft()
          ? this.actor.getSubstance(c.name)
          : this.actor.findNeededComponent(c.name);

        let componentsCountToDelete = Number(c.quantity);
        let componentsLeftToDelete = componentsCountToDelete;
        let componentsCountDeleted = 0;

        componentsToDelete.forEach(toDelete => {
          let toDeleteCount = Math.min(Number(toDelete.system.quantity), componentsCountToDelete, componentsLeftToDelete);
          if (toDeleteCount <= 0) {
            return ui.notifications.info(`${game.i18n.localize("WITCHER.craft.SkipRemovalOfComponent")}: ${toDelete.name}`);
          }

          if (componentsCountDeleted < componentsCountToDelete) {
            this.actor.removeItem(toDelete._id, toDeleteCount)
            componentsCountDeleted += toDeleteCount;
            componentsLeftToDelete -= toDeleteCount;
            return ui.notifications.info(`${toDeleteCount} ${toDelete.name} ${game.i18n.localize("WITCHER.craft.ItemsSuccessfullyDeleted")} ${this.actor.name}`);
          }
        });

        if (componentsCountDeleted != componentsCountToDelete || componentsLeftToDelete != 0) {
          result = false;
          return ui.notifications.error(game.i18n.localize("WITCHER.err.CraftItemDeletion"));
        }
      });

      if (result) {
        let craftedItem = { ...this.system.associatedItem };
        Item.create(craftedItem, { parent: this.actor });
        craftedItemName = craftedItem.name;
      }
    } else {
      craftedItemName = game.i18n.localize("WITCHER.craft.SuccessfulCraftForNothing");
    }

    messageData.flavor += `<b>${craftedItemName}</b>`;
    roll.toMessage(messageData);
  }
}