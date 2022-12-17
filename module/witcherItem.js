import { witcher } from "./config.js";

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
        flags: {
          "witcher": { "origin": { "name": this.name } },
          "spell": this
        }
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

  async realCraft(roll) {
    let craftMessage = {};

    //if (roll.dice[0].results[0].result == 10) {
    //  messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
    //};
    //if (roll.dice[0].results[0].result == 1) {
    //  messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
    //};
    //roll.toMessage(messageData);

    let craftDC = this.isAlchemicalCraft() ? this.system.alchemyDC : this.system.craftingDC;
    let craftSuccess = roll._total > craftDC;

    if (craftSuccess) {
      craftMessage.flavor = game.i18n.localize("WITCHER.craft.ItemsSuccessfullyCrafted");
    } else {
      craftMessage.flavor = game.i18n.localize("WITCHER.craft.ItemsNotCrafted");
    }
    craftMessage.flavor += `<label><b> ${this.actor.name}</b></label><br/>`;

    let craftedItemName;
    if (this.system.associatedItem && this.system.associatedItem.name) {
      let craftingComponents = this.system.craftingComponents.filter(c => Number(c.quantity) > 0);
      craftingComponents.forEach(c => {
        let componentsToDelete = this.actor.findNeededComponent(c.name);
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
          craftSuccess = false;
          return ui.notifications.error(game.i18n.localize("WITCHER.err.CraftItemDeletion"));
        }
      });

      if (craftSuccess) {
        let craftedItem = { ...this.system.associatedItem };
        Item.create(craftedItem, { parent: this.actor });
        craftedItemName = craftedItem.name;
      }
    } else {
      craftedItemName = game.i18n.localize("WITCHER.craft.SuccessfulCraftForNothing");
    }

    craftMessage.flavor += `<b>${craftedItemName}</b>`;
    roll.toMessage(craftMessage);
  }
}