import WitcherActorSheet from "./WitcherActorSheet.js";

export default class WitcherCharacterSheet extends WitcherActorSheet {
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
}