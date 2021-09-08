
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
      if (data.data.data) {
        data.data = data.data.data
      }
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
      html.find(".add-modifier-stat").on("click", this._onAddModifierStat.bind(this));
      html.find(".add-modifier-skill").on("click", this._onAddModifierSkill.bind(this));
      html.find(".remove-effect").on("click", this._oRemoveEffect.bind(this));
      html.find(".remove-modifier-stat").on("click", this._onRemoveModifierStat.bind(this));
      html.find(".remove-modifier-skill").on("click", this._onRemoveModifierSkill.bind(this));
      
      html.find(".list-edit").on("blur", this._onEffectEdit.bind(this));
      html.find(".modifiers-edit").on("change", this._onModifierEdit.bind(this));
      html.find(".modifiers-edit-skills").on("change", this._onModifierSkillsEdit.bind(this));
      html.find("input").focusin(ev => this._onFocusIn(ev));
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

    _onModifierEdit(event) {
      event.preventDefault();
      console.log(`test`)
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let field = element.dataset.field;
      let value = element.value
      let effects = this.item.data.data.stats
      let objIndex = effects.findIndex((obj => obj.id == itemId));
      effects[objIndex][field] = value
      this.item.update({'data.stats': effects});
    }

    _onModifierSkillsEdit(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      
      let field = element.dataset.field;
      let value = element.value
      let effects = this.item.data.data.skills
      let objIndex = effects.findIndex((obj => obj.id == itemId));
      effects[objIndex][field] = value
      this.item.update({'data.skills': effects});
    }

    _oRemoveEffect(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let newEffectList  = this.item.data.data.effects.filter(item => item.id !== itemId)
      this.item.update({'data.effects': newEffectList});
    }

    _onRemoveModifierStat(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let newModifierList  = this.item.data.data.stats.filter(item => item.id !== itemId)
      this.item.update({'data.stats': newModifierList});
    }

    _onRemoveModifierSkill(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let newModifierList  = this.item.data.data.skills.filter(item => item.id !== itemId)
      this.item.update({'data.skills': newModifierList});
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

    _onAddModifierStat(event) {
      event.preventDefault();
      let newModifierList  = []
      if (this.item.data.data.stats){
        newModifierList = this.item.data.data.stats
      }
      newModifierList.push({id: genId(), stat: "none", modifier: 0})
      this.item.update({'data.stats': newModifierList});
    }

    _onAddModifierSkill(event) {
      event.preventDefault();
      let newModifierList  = []
      if (this.item.data.data.skills){
        newModifierList = this.item.data.data.skills
      }
      newModifierList.push({id: genId(), skill: "none", modifier: 0})
      this.item.update({'data.skills': newModifierList});
    }

    _onFocusIn(event) {
      event.currentTarget.select();
    }
  }
