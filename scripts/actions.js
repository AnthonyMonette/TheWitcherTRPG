function ApplyDamage(actor, value, location){ 
}

function ExecuteDefense(actor){ 
    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

    let weapons = actor.items.filter(function(item) {return item.type=="weapon" &&  !item.data.data.isAmmo && item.data.data.isMelee});
    let shields = actor.items.filter(function(item) {return item.type=="armor" &&  item.data.data.location == "Shield"});
    let options = `<option value="Brawling"> ${game.i18n.localize("WITCHER.SkRefBrawling")} </option>`;
    weapons.forEach(item => options += `<option value="${item.data.data.attackSkill}" itemId="${item._id}" type="Weapon"> ${item.name} (${item.data.data.attackSkill})</option>`);
    shields.forEach(item => options += `<option value="Melee" itemId="${item._id}" type="Shield"> ${item.name} (Melee)</option>`);

    const content = `
    <div class="flex">
        <label>${game.i18n.localize("WITCHER.Dialog.DefenseExtra")}: <input type="checkbox" name="isExtraDefense"></label> <br />
    </div>
    <label>${game.i18n.localize("WITCHER.Dialog.DefenseWith")}: </label><select name="form">${options}</select><br />
    <label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input class="small" name="customDef" value=0></label> <br />`;

    let messageData = {
    speaker: {alias: actor.name},
    flavor: `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}</h1>`,
    }

    new Dialog({
    title: `${game.i18n.localize("WITCHER.Dialog.DefenseTitle")}`, 
    content,
    buttons: {
      Dodge: {
        label: `${game.i18n.localize("WITCHER.Dialog.ButtonDodge")}`, 
        callback: (html) => {
          let isExtraDefense = html.find("[name=isExtraDefense]").prop("checked");
          let customDef = html.find("[name=customDef]")[0].value;
          if (isExtraDefense) {
            let newSta = actor.data.data.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({ 
              'data.derivedStats.sta.value': newSta
            });
          }
          let stat = actor.data.data.stats.ref.current;
          let skill = actor.data.data.skills.ref.dodge.value;
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefDodge")}`;
          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonDodge")}</h1><p>${displayFormula}</p>`;
          let rollFormula =  !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${skill}[${game.i18n.localize("WITCHER.SkRefDodge")}]`;

          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}`: `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]` ;
          }

          let totalModifiers = 0;
          actor.data.data.skills.ref.dodge.modifiers.forEach(item => totalModifiers += Number(item.value));
          if (totalModifiers < 0){
            rollFormula +=  !displayRollDetails ? `${totalModifiers}` :  `${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]`
          }
          if (totalModifiers > 0){
            rollFormula += !displayRollDetails ? `+${totalModifiers}`:  `+${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]` 
          }

          let roll = new Roll(rollFormula).roll()
          if (roll.dice[0].results[0].result == 10){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
          };
          roll.toMessage(messageData);
        }
      },
      Reposition: {
        label: `${game.i18n.localize("WITCHER.Dialog.ButtonReposition")}`,
        callback: (html) => {
          let isExtraDefense = html.find("[name=isExtraDefense]").prop("checked");
          let customDef = html.find("[name=customDef]")[0].value;
          if (isExtraDefense) {
            let newSta = actor.data.data.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({ 
              'data.derivedStats.sta.value': newSta
            });
          }
          let stat = actor.data.data.stats.dex.current;
          let skill = actor.data.data.skills.dex.athletics.value;
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.StDex")} + ${game.i18n.localize("WITCHER.SkDexAthletics")}`;
          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonReposition")}</h1><p>${displayFormula}</p>`;
          let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${game.i18n.localize("WITCHER.StDex")}]+${skill}[${game.i18n.localize("WITCHER.SkDexAthletics")}]` ;
          
          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}`: `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]` ;
          }


          let totalModifiers = 0;
          actor.data.data.skills.dex.athletics.modifiers.forEach(item => totalModifiers += Number(item.value));
          if (totalModifiers < 0){
            rollFormula +=  !displayRollDetails ? `${totalModifiers}` :  `${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]`
          }
          if (totalModifiers > 0){
            rollFormula += !displayRollDetails ? `+${totalModifiers}`:  `+${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]` 
          }

          let roll = new Roll(rollFormula).roll()
          if (roll.dice[0].results[0].result == 10){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
          };
          roll.toMessage(messageData);
        }
      },
      Block: {
        label: `${game.i18n.localize("WITCHER.Dialog.ButtonBlock")}`,
        callback: (html) => {
          let isExtraDefense = html.find("[name=isExtraDefense]").prop("checked");
          let customDef = html.find("[name=customDef]")[0].value;
          if (isExtraDefense) {
            let newSta = actor.data.data.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({ 
              'data.derivedStats.sta.value': newSta
            });
          }
          let defense = html.find("[name=form]")[0].value;
          let stat = actor.data.data.stats.ref.current;
          let skill = 0;
          let skillName = "";
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.Dialog.Defense")}`;
          
          let totalModifiers = 0;
          switch(defense){
            case "Brawling":
              skill = actor.data.data.skills.ref.brawling.value;
              skillName = actor.data.data.skills.ref.brawling.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefBrawling")}`;
              actor.data.data.skills.ref.brawling.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Melee":
              skill = actor.data.data.skills.ref.melee.value;
              skillName = actor.data.data.skills.ref.melee.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefMelee")}`;
              actor.data.data.skills.ref.melee.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Small Blades":
              skill = actor.data.data.skills.ref.smallblades.value;
              skillName = actor.data.data.skills.ref.smallblades.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSmall")}`;
              actor.data.data.skills.ref.smallblades.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Staff/Spear":
              skill = actor.data.data.skills.ref.staffspear.value;
              skillName = actor.data.data.skills.ref.staffspear.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefStaff")}`;
              actor.data.data.skills.ref.staffspear.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Swordsmanship":
              skill = actor.data.data.skills.ref.swordsmanship.value;
              skillName = actor.data.data.skills.ref.swordsmanship.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSwordmanship")}`;
              actor.data.data.skills.ref.swordsmanship.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
          }

          let item_id = html.find("[name=form]")[0].selectedOptions[0].getAttribute('itemid')
          let type = html.find("[name=form]")[0].selectedOptions[0].getAttribute('type')
          if (item_id){
            let item = actor.items.get(item_id);
            if (type == "Weapon") {
              item.update({'data.reliable': item.data.data.reliable - 1})
              if (item.data.data.reliable - 1 <= 0) {
                return ui.notifications.error(game.i18n.localize("WITCHER.Weapon.Broken"));
              }
            }
            else {
              item.update({'data.reliability': item.data.data.reliability - 1})
              if (item.data.data.reliability - 1 <= 0) {
                return ui.notifications.error(game.i18n.localize("WITCHER.Shield.Broken"));
              }
            }
          }

          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonBlock")}</h1><p>${displayFormula}</p>`;
          let rollFormula =  !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${skill}[${game.i18n.localize(skillName)}]`;
          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}`: `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]` ;
          }
          
          if (totalModifiers < 0){
            rollFormula +=  !displayRollDetails ? `${totalModifiers}` :  `${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]`
          }
          if (totalModifiers > 0){
            rollFormula += !displayRollDetails ? `+${totalModifiers}`:  `+${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]` 
          }

          let roll = new Roll(rollFormula).roll()
          if (roll.dice[0].results[0].result == 10){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
          };
          roll.toMessage(messageData);
        }
      },
      Parry: {
        label: `${game.i18n.localize("WITCHER.Dialog.ButtonParry")}`,
        callback: (html) => {
          let isExtraDefense = html.find("[name=isExtraDefense]").prop("checked");
          let customDef = html.find("[name=customDef]")[0].value;
          if (isExtraDefense) {
            let newSta = actor.data.data.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({ 
              'data.derivedStats.sta.value': newSta
            });
          }
          let defense = html.find("[name=form]")[0].value;
          let stat = actor.data.data.stats.ref.current;
          let skill = 0;
          let skillName = "";
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.Dialog.ButtonParry")}`;
          let totalModifiers = 0;
          switch(defense){
            case "Brawling":
              skill = actor.data.data.skills.ref.brawling.value;
              skillName = actor.data.data.skills.ref.brawling.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefBrawling")} - 3`;
              actor.data.data.skills.ref.brawling.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Melee":
              skill = actor.data.data.skills.ref.melee.value;
              skillName = actor.data.data.skills.ref.melee.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefMelee")} - 3`;
              actor.data.data.skills.ref.melee.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Small Blades":
              skill = actor.data.data.skills.ref.smallblades.value;
              skillName = actor.data.data.skills.ref.smallblades.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSmall")} - 3`;
              actor.data.data.skills.ref.smallblades.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Staff/Spear":
              skill = actor.data.data.skills.ref.staffspear.value;
              skillName = actor.data.data.skills.ref.staffspear.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefStaff")} - 3`;
              actor.data.data.skills.ref.staffspear.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Swordsmanship":
              skill = actor.data.data.skills.ref.swordsmanship.value;
              skillName = actor.data.data.skills.ref.swordsmanship.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSwordmanship")} - 3`;
              actor.data.data.skills.ref.swordsmanship.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
          }

          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonParry")}</h1><p>${displayFormula}</p>`;
          let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}-3` : `1d10+${stat}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${skill}[${game.i18n.localize(skillName)}]-3[${game.i18n.localize("WITCHER.Dialog.ButtonParry")}]`;
          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}`: `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]` ;
          }
          
          if (totalModifiers < 0){
            rollFormula +=  !displayRollDetails ? `${totalModifiers}` :  `${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]`
          }
          if (totalModifiers > 0){
            rollFormula += !displayRollDetails ? `+${totalModifiers}`:  `+${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]` 
          }

          let roll = new Roll(rollFormula).roll()
          if (roll.dice[0].results[0].result == 10){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
          };
          roll.toMessage(messageData);
        }
      },
      ParryAgainstThrown: {
        label: `${game.i18n.localize("WITCHER.Dialog.ButtonParryThrown")}`,
        callback: (html) => {
          let isExtraDefense = html.find("[name=isExtraDefense]").prop("checked");
          let customDef = html.find("[name=customDef]")[0].value;
          if (isExtraDefense) {
            let newSta = actor.data.data.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({ 
              'data.derivedStats.sta.value': newSta
            });
          }
          let defense = html.find("[name=form]")[0].value;
          let stat = actor.data.data.stats.ref.current;
          let skill = 0;
          let skillName = ""
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.Dialog.ButtonParry")}`;
          let totalModifiers = 0;
          switch(defense){
            case "Brawling":
              skill = actor.data.data.skills.ref.brawling.value;
              skillName = actor.data.data.skills.ref.brawling.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefBrawling")} - 5`;
              actor.data.data.skills.ref.brawling.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Melee":
              skill = actor.data.data.skills.ref.melee.value;
              skillName = actor.data.data.skills.ref.melee.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefMelee")} - 5`;
              actor.data.data.skills.ref.melee.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Small Blades":
              skill = actor.data.data.skills.ref.smallblades.value;
              skillName = actor.data.data.skills.ref.smallblades.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSmall")} - 5`;
              actor.data.data.skills.ref.smallblades.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Staff/Spear":
              skill = actor.data.data.skills.ref.staffspear.value;
              skillName = actor.data.data.skills.ref.staffspear.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefStaff")} - 5`;
              actor.data.data.skills.ref.staffspear.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
            case "Swordsmanship":
              skill = actor.data.data.skills.ref.swordsmanship.value;
              skillName = actor.data.data.skills.ref.swordsmanship.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSwordmanship")} - 5`;
              actor.data.data.skills.ref.swordsmanship.modifiers.forEach(item => totalModifiers += Number(item.value));
              break;
          }

          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonParry")}</h1><p>${displayFormula}</p>`;
          let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}-5` : `1d10+${stat}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${skill}[${game.i18n.localize(skillName)}]-5[${game.i18n.localize("WITCHER.Dialog.ButtonParry")}]`;
          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}`: `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]` ;
          }
          
          if (totalModifiers < 0){
            rollFormula +=  !displayRollDetails ? `${totalModifiers}` :  `${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]`
          }
          if (totalModifiers > 0){
            rollFormula += !displayRollDetails ? `+${totalModifiers}`:  `+${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]` 
          }

          let roll = new Roll(rollFormula).roll()
          if (roll.dice[0].results[0].result == 10){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
          };
          roll.toMessage(messageData);
        }
      }
    }
  }).render(true)  
}

export {ExecuteDefense};