
import { genId } from "../witcher.js";

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
      data.data = data.data.data
      this.options.classes.push(`item-${this.item.data.type}`)

      if (this.item.type == "weapon") {
        let appliedId = false;
        this.item.data.data.effects.forEach(element => {
          if (element.id == undefined) {
            appliedId = true
            element.id = genId()
          }
        });
        if (appliedId) {
          this.item.update({'data.effects': this.item.data.data.effects});
        }
      }
      return data;
    }

    
    activateListeners(html) {
      super.activateListeners(html);

      html.find(".add-effect").on("click", this._onAddEffect.bind(this));
      html.find(".remove-effect").on("click", this._oRemoveEffect.bind(this));
      
      html.find(".list-edit").on("blur", this._onEffectEdit.bind(this));
    }


    _onEffectEdit(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      
      let field = element.dataset.field;
      let value = element.value
      let effects = this.item.data.data.effects
      let objIndex = effects.findIndex((obj => obj.id == itemId));
      effects[objIndex][field] = value
      
      this.item.update({'data.effects': effects});
    }

    _oRemoveEffect(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let newEffectList  = this.item.data.data.effects.filter(item => item.id !== itemId)
      this.item.update({'data.effects': newEffectList});
    }

    _onAddEffect(event) {
      event.preventDefault();
      let newEffectList  = []
      if (this.item.data.effects){
        newEffectList = this.item.data.data.effects
      }
      newEffectList.push({id: genId(), name: "effect", percentage: ""})
      this.item.update({'data.effects': newEffectList});
    }
  }
