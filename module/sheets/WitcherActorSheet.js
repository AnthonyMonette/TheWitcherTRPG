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
      data.receips = data.items.filter(function(item) {return item.type=="diagram"});
      data.alchemicals = data.items.filter(function(item) {return item.type=="alchemical"});
      data.components = data.items.filter(function(item) {return item.type=="component"});
      data.valuables = data.items.filter(function(item) {return item.type=="valuable" || item.type == "mount"});
      data.diagrams = data.items.filter(function(item) {return item.type=="diagrams"});
      data.spells = data.items.filter(function(item) {return item.type=="spell"});
      return data;
    }

    activateListeners(html) {
      super.activateListeners(html);

      html.find(".inline-edit").change(this._onInlineEdit.bind(this));
      html.find(".item-edit").on("click", this._onItemEdit.bind(this));
    }


    _onInlineEdit(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".item").dataset.itemId;
      let item = this.actor.getOwnedItem(itemId);
      let field = element.dataset.field;
      console.log(item.name)
      console.log(field)

      return item.update({[field]: element.value});
    }
    
    _onItemEdit(event) {
      event.preventDefault(); 
      let element = event.currentTarget;
      let itemId = element.closest(".item").dataset.itemId;
      let item = this.actor.getOwnedItem(itemId);

      item.sheet.render(true)
    }
  }
