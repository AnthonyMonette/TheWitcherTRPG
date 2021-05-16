export default class WitcherItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["witcher", "sheet", "item"],
        width: 520,
        height: 480,
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      });
    }

    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/${this.item.data.type}-sheet.html`;
    }

    /** @override */
    getData() {
      const data = super.getData();
      data.config = CONFIG.witcher;
      this.options.classes.push(`item-${this.item.data.type}`)
      return data;
    }

    
    activateListeners(html) {
      super.activateListeners(html);

      html.find(".add-perk").on("click", this._onAddPerk.bind(this));
    }


    _onAddPerk(event) {
      event.preventDefault();
      this.item.data.data.perks.push({name: "new Perk", description: ""})
    }
  }
