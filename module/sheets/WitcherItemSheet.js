export default class WitcherItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        width: 520,
        height: 480,
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      });
    }

    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/${this.item.data.type}-sheet.html`;
    }
}