
import { genId } from "../witcher.js";

export default class WitcherItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["witcher", "sheet", "item"],
        width: 520,
        height: 480,
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
        dragDrop: [{
          dragSelector: ".items-list .item",
          dropSelector: null
        }],
      });
    }

    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/${this.object.type}-sheet.html`;
    }

    /** @override */
    getData() {
      const data = super.getData();
      data.config = CONFIG.witcher;
    
      this.options.classes.push(`item-${this.item.type}`)
      if (data.item) {
        data.data = data.item.system
      }

      if (this.item.type == "weapon") {
        let appliedId = false;
        this.item.system.effects.forEach(element => {
          if (element.id == undefined) {
            appliedId = true
            element.id = genId()
          }
        });
        if (appliedId) {
          this.item.update({'system.effects': this.item.system.effects});
        }
      }
      return data;
    }

    
    activateListeners(html) {
      super.activateListeners(html);

      html.find(".add-effect").on("click", this._onAddEffect.bind(this));
      html.find(".add-modifier-stat").on("click", this._onAddModifierStat.bind(this));
      html.find(".add-modifier-skill").on("click", this._onAddModifierSkill.bind(this));
      html.find(".add-modifier-derived").on("click", this._onAddModifierDerived.bind(this));

      html.find(".add-component").on("click", this._onAddComponent.bind(this));
      html.find(".remove-component").on("click", this._onRemoveComponent.bind(this));

      html.find(".remove-effect").on("click", this._oRemoveEffect.bind(this));
      html.find(".remove-modifier-stat").on("click", this._onRemoveModifierStat.bind(this));
      html.find(".remove-modifier-skill").on("click", this._onRemoveModifierSkill.bind(this));
      html.find(".remove-modifier-derived").on("click", this._onRemoveModifierDerived.bind(this));
      
      html.find(".list-edit").on("blur", this._onEffectEdit.bind(this));
      html.find(".modifiers-edit").on("change", this._onModifierEdit.bind(this));
      html.find(".modifiers-edit-skills").on("change", this._onModifierSkillsEdit.bind(this));
      html.find(".modifiers-edit-derived").on("change", this._onModifierDerivedEdit.bind(this));
      html.find("input").focusin(ev => this._onFocusIn(ev));
      html.find(".damage-type").on("change", this._onDamageTypeEdit.bind(this));
      html.find(".dragable").on("dragstart", (ev) => {
        let itemId = ev.target.dataset.id
        let item = this.actor.items.get(itemId);
        ev.originalEvent.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            item: item,
            actor: this.actor,
            type: "itemDrop",
            }),
          )});

      const newDragDrop = new DragDrop({
        dragSelector:`.dragable`,
        dropSelector:`.window-content`,
        permissions: { dragstart: this._canDragStart.bind(this), drop: this._canDragDrop.bind(this) },
        callbacks: { dragstart: this._onDragStart.bind(this), drop: this._onDrop.bind(this) }
      })
      this._dragDrop.push(newDragDrop);
    }

    _onDrop(event) {
      if (this.item.type == "diagrams") {
        let dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
        let dragEventData = TextEditor.getDragEventData(event)
        if(dragEventData.pack) {
          let pack = game.packs.get(dragEventData.pack)
          pack.getDocument(dragEventData.id).then(item => {
            let newComponentList  = []
            if (this.item.system.craftingComponents){
              newComponentList = this.item.system.craftingComponents
            }
            newComponentList.push({id: genId(), name: item.system.name, quantity: 1})
            this.item.update({'system.craftingComponents': newComponentList});
          })
        } else {
          let item = game.items.get(dragEventData.id)
          if (item) {
            let newComponentList  = []
            if (this.item.system.craftingComponents){
              newComponentList = this.item.system.craftingComponents
            }
            newComponentList.push({id: genId(), name: item.system.name, quantity: 1})
            this.item.update({'system.craftingComponents': newComponentList});
          }
        }
      }
    }

    _onEffectEdit(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      
      let field = element.dataset.field;
      let value = element.value
      if (this.item.type == "diagrams") {
        let components = this.item.system.craftingComponents
        let objIndex = components.findIndex((obj => obj.id == itemId));
        components[objIndex][field] = value
        this.item.update({'system.craftingComponents': components});
      }
      else {
        let effects = this.item.system.effects
        let objIndex = effects.findIndex((obj => obj.id == itemId));
        effects[objIndex][field] = value

        this.item.update({'system.effects': effects});
      }
    }

    _onModifierEdit(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let field = element.dataset.field;
      let value = element.value
      let effects = this.item.system.stats
      let objIndex = effects.findIndex((obj => obj.id == itemId));
      effects[objIndex][field] = value
      this.item.update({'system.stats': effects});
    }
    
    _onDamageTypeEdit (event) {
      event.preventDefault();
      let element = event.currentTarget;
      let newval = Object.assign({}, this.item.system.type)
      newval[element.id] = !newval[element.id]
      let types=[]
      if(newval.slashing) types.push(game.i18n.localize("WITCHER.Armor.Slashing"))
      if(newval.piercing) types.push(game.i18n.localize("WITCHER.Armor.Piercing"))
      if(newval.bludgeoning) types.push(game.i18n.localize("WITCHER.Armor.Bludgeoning"))
      if(newval.elemental) types.push(game.i18n.localize("WITCHER.Armor.Elemental"))
      newval.text = types.join(", ")
      this.item.update({'system.type': newval});
    }
    
    _onModifierDerivedEdit(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      
      let field = element.dataset.field;
      let value = element.value
      let effects = this.item.system.derived
      let objIndex = effects.findIndex((obj => obj.id == itemId));
      effects[objIndex][field] = value
      this.item.update({'system.derived': effects});
    }

    _onModifierSkillsEdit(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      
      let field = element.dataset.field;
      let value = element.value
      let effects = this.item.system.skills
      let objIndex = effects.findIndex((obj => obj.id == itemId));
      effects[objIndex][field] = value
      this.item.update({'system.skills': effects});
    }

    _onRemoveComponent(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let newComponentList  = this.item.system.craftingComponents.filter(item => item.id !== itemId)
      this.item.update({'system.craftingComponents': newComponentList});
    }

    _oRemoveEffect(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let newEffectList  = this.item.system.effects.filter(item => item.id !== itemId)
      this.item.update({'system.effects': newEffectList});
    }

    _onRemoveModifierStat(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let newModifierList  = this.item.system.stats.filter(item => item.id !== itemId)
      this.item.update({'system.stats': newModifierList});
    }

    _onRemoveModifierSkill(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let newModifierList  = this.item.system.skills.filter(item => item.id !== itemId)
      this.item.update({'system.skills': newModifierList});
    }

    _onRemoveModifierDerived(event) {
      event.preventDefault();
      let element = event.currentTarget;
      let itemId = element.closest(".list-item").dataset.id;
      let newModifierList  = this.item.system.derived.filter(item => item.id !== itemId)
      this.item.update({'system.derived': newModifierList});
    }

    
    _onAddEffect(event) {
      event.preventDefault();
      let newEffectList  = []
      if (this.item.system.effects){
        newEffectList = this.item.system.effects
      }
      newEffectList.push({id: genId(), name: "effect", percentage: ""})
      this.item.update({'system.effects': newEffectList});
    }

    _onAddComponent(event) {
      event.preventDefault();
      let newComponentList  = []
      if (this.item.system.craftingComponents){
        newComponentList = this.item.system.craftingComponents
      }
      newComponentList.push({id: genId(), name: "component", quantity: ""})
      this.item.update({'system.craftingComponents': newComponentList});
    }

    _onAddModifierStat(event) {
      event.preventDefault();
      let newModifierList  = []
      if (this.item.system.stats){
        newModifierList = this.item.system.stats
      }
      newModifierList.push({id: genId(), stat: "none", modifier: 0})
      this.item.update({'system.stats': newModifierList});
    }

    _onAddModifierSkill(event) {
      event.preventDefault();
      let newModifierList  = []
      if (this.item.system.skills){
        newModifierList = this.item.system.skills
      }
      newModifierList.push({id: genId(), skill: "none", modifier: 0})
      this.item.update({'system.skills': newModifierList});
    }

    _onAddModifierDerived(event) {
      event.preventDefault();
      let newModifierList  = []
      if (this.item.system.derived){
        newModifierList = this.item.system.derived
      }
      newModifierList.push({id: genId(), derivedStat: "none", modifier: 0})
      this.item.update({'system.derived': newModifierList});
    }
    
    _onFocusIn(event) {
      event.currentTarget.select();
    }
  }
