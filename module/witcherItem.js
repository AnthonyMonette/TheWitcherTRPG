export default class WitcherItem extends Item {
  chatTemplate = {
    "weapon": "systems/TheWitcherTRPG/templates/partials/chat/weapon-chat.html"
  }

  async roll() {
  }

  async createSpellVisualEffectIfApplicable(token) {
    let spell = this;
    if (spell.type == "spell" && token && spell.system.createTemplate) {
      let distance = Number(spell.system.templateSize)
      let direction = 0
      let angle = 0
      let width = 1
      switch (spell.system.templateType) {
        case "rect":
          distance = Math.hypot(Number(spell.system.templateSize))
          direction = 45
          width = token.target.value;
          break;
        case "cone":
          angle = 45;
          break;
      }

      let effect = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
        t: spell.system.templateType,
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
        flags: { "witcher": { "origin": { "name": spell.name } } }
      }], { keepId: true });

      spell.visualEffectId = effect[0]._id;
    }
  }

  async deleteSpellVisualEffect() {
    let spell = this;
    if (spell.visualEffectId && spell.system.visualEffectDuration > 0) {
      setTimeout(() => {
        canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [spell.visualEffectId])
      }, spell.system.visualEffectDuration * 1000);
    }
  }
}