import {witcher} from "../module/config.js";
import { buttonDialog } from "../module/chat.js";

async function ApplyDamage(actor, dmgType, location, totalDamage){ 
    let armors = actor.items.filter(function(item) {return item.type=="armor" && item.data.data.equiped})

    let headArmors = armors.filter(function(item) {return item.data.data.location =="Head" || item.data.data.location == "FullCover"})
    let torsoAmors = armors.filter(function(item) {return item.data.data.location =="Torso" || item.data.data.location == "FullCover"})
    let legArmors = armors.filter(function(item) {return item.data.data.location =="Leg" || item.data.data.location == "FullCover"})

    let naturalArmors = armors.filter(function(item) {return item.data.data.type == "Natural"})
    
    let damageTypeloc =""
    switch(dmgType) {
      case"slashing": damageTypeloc = "WITCHER.Armor.Slashing"; break;
      case"bludgeoning": damageTypeloc = "WITCHER.Armor.Bludgeoning"; break;
      case"piercing": damageTypeloc = "WITCHER.Armor.Piercing"; break;
      case"elemental": damageTypeloc = "WITCHER.Armor.Elemental"; break;
    }

    const locationOptions = `
    <option value="Empty"></option>
    <option value="Head"> ${game.i18n.localize("WITCHER.Dialog.attackHead")} </option>
    <option value="Torso"> ${game.i18n.localize("WITCHER.Dialog.attackTorso")} </option>
    <option value="L. Arm"> ${game.i18n.localize("WITCHER.Dialog.attackLArm")} </option>
    <option value="R. Arm"> ${game.i18n.localize("WITCHER.Dialog.attackRArm")} </option>
    <option value="L. Leg"> ${game.i18n.localize("WITCHER.Dialog.attackLLeg")} </option>
    <option value="R. Leg"> ${game.i18n.localize("WITCHER.Dialog.attackRLeg")} </option>
    <option value="Tail/wing"> ${game.i18n.localize("WITCHER.Dialog.attackTail")} </option>
    `;    
    const silverOptions = `
    <option></option>
    <option value="1d6">1d6</option>
    <option value="2d6">2d6</option>
    <option value="3d6">3d6</option>
    <option value="4d6">4d6</option>
    <option value="5d6">5d6</option>
    `;

    let content = `<label>${game.i18n.localize("WITCHER.Damage.damageType")}: <b>${game.i18n.localize(damageTypeloc)}</b></label> <br />
      <label>${game.i18n.localize("WITCHER.Damage.CurrentLocation")}: <b>${location}</b></label> <br />
      <label>${game.i18n.localize("WITCHER.Damage.ChangeLocation")}: <select name="changeLocation">${locationOptions}</select></label> <br />`

    if (actor.type == "monster"){ 
        content += `<label>${game.i18n.localize("WITCHER.Damage.resistSilver")}: <input type="checkbox" name="resistNonSilver"></label><br />
                    <label>${game.i18n.localize("WITCHER.Damage.resistMeteorite")}: <input type="checkbox" name="resistNonMeteorite"></label><br />`
    }
    content += `<label>${game.i18n.localize("WITCHER.Damage.isVulnerable")}: <input type="checkbox" name="vulnerable"></label><br />
    <label>${game.i18n.localize("WITCHER.Damage.oilDmg")}: <input type="checkbox" name="oilDmg"></label><br />
    <label>${game.i18n.localize("WITCHER.Damage.silverDmg")}: <select name="silverDmg">${silverOptions}</select></label><br />`

    let cancel = true;
    let damageType = dmgType.capitalize();
    let resistSilver = false;
    let resistMeteorite = false;
    let newLocation = false;
    let isVulnerable = false;
    let addOilDmg = false;
    let silverDmg;

    let infoTotalDmg = totalDamage

    let dialogData = {
        buttons : [
            [`${game.i18n.localize("WITCHER.Button.Continue")}`, 
             (html)=>{  
                newLocation = html.find("[name=changeLocation]")[0].value;
                resistSilver = html.find("[name=resistNonSilver]").prop("checked");
                resistMeteorite = html.find("[name=resistNonMeteorite]").prop("checked");
                isVulnerable = html.find("[name=vulnerable]").prop("checked");
                addOilDmg = html.find("[name=oilDmg]").prop("checked");
                silverDmg = html.find("[name=silverDmg]")[0].value;
                cancel = false
             } ]],
        title : game.i18n.localize("WITCHER.Context.applyDmg"),
        content : content
    }
    await buttonDialog(dialogData)

    if (cancel) {
      return
  }

    if (silverDmg){
      let silverRoll = await new Roll(silverDmg).roll()
      totalDamage = Number(totalDamage) + silverRoll.total
      infoTotalDmg += `+${silverRoll.total}[${game.i18n.localize("WITCHER.Damage.silver")}]`
    }

    if (newLocation != "Empty"){
      location = newLocation
    }
    if (addOilDmg){
      totalDamage = Number(totalDamage) + 5
      infoTotalDmg += `+5[${game.i18n.localize("WITCHER.Damage.oil")}]`
    }

    infoTotalDmg = totalDamage +": " +infoTotalDmg;

    let armorSet = {};
    let totalSP = 0
    let displaySP = ""
    let values;
    if (actor.type =="character"){
        switch(location){
            case "Head":
                armorSet = getArmors(headArmors)
                values = getArmorSp(armorSet["lightArmor"]?.data.data.headStopping, armorSet["mediumArmor"]?.data.data.headStopping, armorSet["heavyArmor"]?.data.data.headStopping)
                displaySP = values[0]
                totalSP = values[1]
                break;
            case "Torso":
                armorSet = getArmors(torsoAmors)
                values = getArmorSp(armorSet["lightArmor"]?.data.data.torsoStopping, armorSet["mediumArmor"]?.data.data.torsoStopping, armorSet["heavyArmor"]?.data.data.torsoStopping)
                displaySP = values[0]
                totalSP = values[1]
                break;
            case "R. Arm":
                armorSet = getArmors(torsoAmors)
                values = getArmorSp(armorSet["lightArmor"]?.data.data.rightArmStopping, armorSet["mediumArmor"]?.data.data.rightArmStopping, armorSet["heavyArmor"]?.data.data.rightArmStopping)
                displaySP = values[0]
                totalSP = values[1]
                break;
            case "L. Arm":
                armorSet = getArmors(torsoAmors)
                values = getArmorSp(armorSet["lightArmor"]?.data.data.leftArmStopping, armorSet["mediumArmor"]?.data.data.leftArmStopping, armorSet["heavyArmor"]?.data.data.leftArmStopping)
                displaySP = values[0]
                totalSP = values[1]
                break;
            case "R. Leg":
                armorSet = getArmors(legArmors)
                values = getArmorSp(armorSet["lightArmor"]?.data.data.rightLegStopping, armorSet["mediumArmor"]?.data.data.rightLegStopping, armorSet["heavyArmor"]?.data.data.rightLegStopping)
                displaySP = values[0]
                totalSP = values[1]
                break;
            case "L. Leg":
                armorSet = getArmors(legArmors)
                values = getArmorSp(armorSet["lightArmor"]?.data.data.leftLegStopping, armorSet["mediumArmor"]?.data.data.leftLegStopping, armorSet["heavyArmor"]?.data.data.leftLegStopping)
                displaySP = values[0]
                totalSP = values[1]
                break;
        }
        naturalArmors.forEach(armor => {
            switch(location){
                case "Head": totalSP = Number(totalSP) + Number(armor?.data.data.headStopping); displaySP += `+${armor?.data.data.headStopping}`; break;
                case "Torso": totalSP = Number(totalSP) + Number(armor?.data.data.torsoStopping); displaySP += `+${armor?.data.data.torsoStopping}`; break;
                case "R. Arm": totalSP = Number(totalSP) + Number(armor?.data.data.rightArmStopping); displaySP += `+${armor?.data.data.rightArmStopping}`; break;
                case "L. Arm": totalSP = Number(totalSP) + Number(armor?.data.data.leftArmStopping); displaySP += `+${armor?.data.data.leftArmStopping}`; break;
                case "R. Leg": totalSP = Number(totalSP) + Number(armor?.data.data.rightLegStopping); displaySP += `+${armor?.data.data.rightLegStopping}`; break;
                case "L. Leg": totalSP = Number(totalSP) + Number(armor?.data.data.leftLegStopping); displaySP += `+${armor?.data.data.leftLegStopping}`; break;
            }
            displaySP += `[${game.i18n.localize("WITCHER.Armor.Natural")}]`;
        })
    } else {
        switch(location){
            case "Head":
                totalSP = actor.data.data.armorHead;
                displaySP = actor.data.data.armorHead;
                break;
            case "Torso":
            case "R. Arm":
            case "L. Arm":
                totalSP = actor.data.data.armorUpper;
                displaySP = actor.data.data.armorUpper;
                break;
            case "R. Leg":
            case "L. Leg":
              totalSP = actor.data.data.armorLower;
              displaySP = actor.data.data.armorLower;
              break;
            case "Tail/wing":
              totalSP = actor.data.data.armorTailWing;
              displaySP = actor.data.data.armorTailWing;
              break;
        }
    }
    
    if (actor.type =="character" && !armorSet) {
        return
    }

    totalDamage -= totalSP < 0 ? 0: totalSP;

    let infoAfterSPReduction = totalDamage < 0 ? 0: totalDamage

    if (totalDamage <=0){
        let messageContent = `${game.i18n.localize("WITCHER.Damage.initial")}: ${infoTotalDmg} <br />
        ${game.i18n.localize("WITCHER.Damage.totalSP")}: ${displaySP}<br />
        ${game.i18n.localize("WITCHER.Damage.afterSPReduct")} ${infoAfterSPReduction}<br /><br />
        ${game.i18n.localize("WITCHER.Damage.NotEnough")}
        `;
        let messageData = {
            user: game.user.id,
            content: messageContent,
            speaker: {alias: actor.name},
        }
        let rollResult = await new Roll("1").roll()
        rollResult.toMessage(messageData)
        return
    }
    switch(location){
        case "Head": totalDamage *= 3; break;
        case "R. Arm":
        case "L. Arm":
        case "R. Leg":
        case "L. Leg":
        case "Tail/wing":totalDamage *= 0.5; break;
    }
    let infoAfterLocation = totalDamage
    switch (damageType) {
        case "Slashing":
            if (armorSet["lightArmor"]?.data.data.slashing || armorSet["mediumArmor"]?.data.data.slashing || armorSet["heavyArmor"]?.data.data.slashing){
                totalDamage *= 0.5
            }
            break;
        case "Blundgeoning":
            if (armorSet["lightArmor"]?.data.data.bludgeoning || armorSet["mediumArmor"]?.data.data.bludgeoning || armorSet["heavyArmor"]?.data.data.bludgeoning){
                totalDamage *= 0.5
            }
            break;
        case "Piercing":
            if (armorSet["lightArmor"]?.data.data.piercing || armorSet["mediumArmor"]?.data.data.piercing || armorSet["heavyArmor"]?.data.data.piercing){
                totalDamage *= 0.5
            }
            break;
    }

    if (resistSilver || resistMeteorite) {
        totalDamage *= 0.5
    }
    if (isVulnerable) {
      totalDamage *= 2
    }
    let infoAfterResistance = totalDamage
    if (actor.type =="character") {
      switch(location){
          case "Head":
              if (armorSet["lightArmor"]) { let lightArmorSP = armorSet["lightArmor"].data.data.headStopping -1; if (lightArmorSP < 0) {lightArmorSP = 0}
                  armorSet["lightArmor"].update({ 'data.headStopping': lightArmorSP})}
              if (armorSet["mediumArmor"]) {let mediumArmorSP = armorSet["mediumArmor"].data.data.headStopping -1; if (mediumArmorSP < 0) {mediumArmorSP = 0}
                  armorSet["mediumArmor"].update({ 'data.headStopping': mediumArmorSP})}
              if (armorSet["heavyArmor"]) { let heavyArmorSP = armorSet["heavyArmor"].data.data.headStopping -1; if (heavyArmorSP < 0) {heavyArmorSP = 0}
                  armorSet["heavyArmor"].update({ 'data.headStopping': heavyArmorSP})}
              break;
          case "Torso":
              if (armorSet["lightArmor"]) { let lightArmorSP = armorSet["lightArmor"].data.data.torsoStopping -1; if (lightArmorSP < 0) {lightArmorSP = 0}
                  armorSet["lightArmor"].update({ 'data.torsoStopping': lightArmorSP})}
              if (armorSet["mediumArmor"]) {let mediumArmorSP = armorSet["mediumArmor"].data.data.torsoStopping -1; if (mediumArmorSP < 0) {mediumArmorSP = 0}
                  armorSet["mediumArmor"].update({ 'data.torsoStopping': mediumArmorSP})}
              if (armorSet["heavyArmor"]) { let heavyArmorSP = armorSet["heavyArmor"].data.data.torsoStopping -1; if (heavyArmorSP < 0) {heavyArmorSP = 0}
                  armorSet["heavyArmor"].update({ 'data.torsoStopping': heavyArmorSP})}
              break;
          case "R. Arm":
              if (armorSet["lightArmor"]) { let lightArmorSP = armorSet["lightArmor"].data.data.rightArmStopping -1; if (lightArmorSP < 0) {lightArmorSP = 0}
                  armorSet["lightArmor"].update({ 'data.rightArmStopping': lightArmorSP})}
              if (armorSet["mediumArmor"]) {let mediumArmorSP = armorSet["mediumArmor"].data.data.rightArmStopping -1; if (mediumArmorSP < 0) {mediumArmorSP = 0}
                  armorSet["mediumArmor"].update({ 'data.rightArmStopping': mediumArmorSP})}
              if (armorSet["heavyArmor"]) { let heavyArmorSP = armorSet["heavyArmor"].data.data.rightArmStopping -1; if (heavyArmorSP < 0) {heavyArmorSP = 0}
                  armorSet["heavyArmor"].update({ 'data.rightArmStopping': heavyArmorSP})}
              break;
          case "L. Arm":
              if (armorSet["lightArmor"]) { let lightArmorSP = armorSet["lightArmor"].data.data.leftArmStopping -1; if (lightArmorSP < 0) {lightArmorSP = 0}
                  armorSet["lightArmor"].update({ 'data.leftArmStopping': lightArmorSP})}
              if (armorSet["mediumArmor"]) {let mediumArmorSP = armorSet["mediumArmor"].data.data.leftArmStopping -1; if (mediumArmorSP < 0) {mediumArmorSP = 0}
                  armorSet["mediumArmor"].update({ 'data.leftArmStopping': mediumArmorSP})}
              if (armorSet["heavyArmor"]) { let heavyArmorSP = armorSet["heavyArmor"].data.data.leftArmStopping -1; if (heavyArmorSP < 0) {heavyArmorSP = 0}
                  armorSet["heavyArmor"].update({ 'data.leftArmStopping': heavyArmorSP})}
              break;
          case "R. Leg":
              if (armorSet["lightArmor"]) { let lightArmorSP = armorSet["lightArmor"].data.data.rightLegStopping -1; if (lightArmorSP < 0) {lightArmorSP = 0}
                  armorSet["lightArmor"].update({ 'data.rightLegStopping': lightArmorSP})}
              if (armorSet["mediumArmor"]) {let mediumArmorSP = armorSet["mediumArmor"].data.data.rightLegStopping -1; if (mediumArmorSP < 0) {mediumArmorSP = 0}
                  armorSet["mediumArmor"].update({ 'data.rightLegStopping': mediumArmorSP})}
              if (armorSet["heavyArmor"]) { let heavyArmorSP = armorSet["heavyArmor"].data.data.rightLegStopping -1; if (heavyArmorSP < 0) {heavyArmorSP = 0}
                  armorSet["heavyArmor"].update({ 'data.rightLegStopping': heavyArmorSP})}
              break;
          case "L. Leg":
              if (armorSet["lightArmor"]) { let lightArmorSP = armorSet["lightArmor"].data.data.leftLegStopping -1; if (lightArmorSP < 0) {lightArmorSP = 0}
                  armorSet["lightArmor"].update({ 'data.leftLegStopping': lightArmorSP})}
              if (armorSet["mediumArmor"]) {let mediumArmorSP = armorSet["mediumArmor"].data.data.leftLegStopping -1; if (mediumArmorSP < 0) {mediumArmorSP = 0}
                  armorSet["mediumArmor"].update({ 'data.leftLegStopping': mediumArmorSP})}
              if (armorSet["heavyArmor"]) { let heavyArmorSP = armorSet["heavyArmor"].data.data.leftLegStopping -1; if (heavyArmorSP < 0) {heavyArmorSP = 0}
                  armorSet["heavyArmor"].update({ 'data.leftLegStopping': heavyArmorSP})}
              break;
      }
    }else {
      let newArmorSP = 0
      switch(location){
        case "Head":
          newArmorSP = actor.data.data.armorHead -1; 
          actor.update({ 'data.armorHead': newArmorSP < 0 ? 0 : newArmorSP});
          break;
        case "Torso":
        case "R. Arm":
        case "L. Arm":
          newArmorSP = actor.data.data.armorUpper -1; 
          actor.update({ 'data.armorUpper': newArmorSP < 0 ? 0 : newArmorSP});
          break;
        case "R. Leg":
        case "L. Leg":
          newArmorSP = actor.data.data.armorLower -1; 
          actor.update({ 'data.armorLower': newArmorSP < 0 ? 0 : newArmorSP});
          break;
        case "Tail/wing":
          newArmorSP = actor.data.data.armorTailWing -1; 
          actor.update({ 'data.armorTailWing': newArmorSP < 0 ? 0 : newArmorSP});
          break;
      }
    }
    let messageContent = `${game.i18n.localize("WITCHER.Damage.initial")}: ${infoTotalDmg} <br />
    ${game.i18n.localize("WITCHER.Damage.totalSP")}: ${displaySP}<br />
    ${game.i18n.localize("WITCHER.Damage.afterSPReduct")} ${infoAfterSPReduction}<br />
    ${game.i18n.localize("WITCHER.Damage.afterLocationModifier")} ${infoAfterLocation}<br />
    ${game.i18n.localize("WITCHER.Damage.afterResistances")} ${infoAfterResistance}<br /><br />
    ${game.i18n.localize("WITCHER.Damage.totalApplied")} ${Math.floor(totalDamage)}
    `;
    let messageData = {
        user: game.user.id,
        content: messageContent,
        speaker: {alias: actor.name},
    }
    let rollResult = await new Roll("1").roll()
    rollResult.toMessage(messageData)

    actor?.update({ 
        'data.derivedStats.hp.value': actor.data.data.derivedStats.hp.value - Math.floor(totalDamage)
    });
    
}

function getArmors(armors) {
    let lightCount =0, mediumCount =0, heavyCount =0;
    let lightArmor, mediumArmor, heavyArmor;
    armors.forEach(item => {
        if ( item.data.data.type == "Light") { lightCount++;  lightArmor = item}
        if ( item.data.data.type == "Medium") { mediumCount++;  mediumArmor = item }
        if ( item.data.data.type == "Heavy") { heavyCount++;  heavyArmor = item }
    });
    if (lightCount > 1 || mediumCount > 1 || heavyCount > 1 ) {
        ui.notifications.error(game.i18n.localize("WITCHER.Armor.tooMuch"))
        return
    }
    return {
        lightArmor: lightArmor,
        mediumArmor: mediumArmor,
        heavyArmor: heavyArmor
    };
}

function getArmorSp(lightArmorSP, mediumArmorSP, heavyArmorSP){
    let totalSP = 0
    let displaySP = ""
    if (heavyArmorSP) {
        totalSP = heavyArmorSP
        displaySP = heavyArmorSP
    }
    if (mediumArmorSP){
        if (heavyArmorSP) { 
            let diff = getArmorDiffBonus(heavyArmorSP, mediumArmorSP)
            totalSP = Number(totalSP) + Number(diff)
            displaySP +=  "+" + diff
        }
        else  {
            displaySP = mediumArmorSP
            totalSP = mediumArmorSP
        }
    }
    if (lightArmorSP){
        if (mediumArmorSP) { 
            let diff = getArmorDiffBonus(mediumArmorSP, lightArmorSP)
            totalSP = Number(totalSP) + Number(diff)
            displaySP +=  `+${diff}[${game.i18n.localize("WITCHER.Armor.LayerBonus")}]`
        }
        else if (heavyArmorSP) { 
            let diff = getArmorDiffBonus(heavyArmorSP, lightArmorSP)
            totalSP = Number(totalSP) + Number(diff)
            displaySP +=  `+${diff}[${game.i18n.localize("WITCHER.Armor.LayerBonus")}]`
        }
        else  {
            totalSP = lightArmorSP
            displaySP = lightArmorSP
        }
    }
    return [displaySP, totalSP]
}

function getArmorDiffBonus(OverArmor, UnderArmor) {
    let diff = OverArmor - UnderArmor
    
    if (UnderArmor <= 0 || OverArmor <= 0) {
        return 0
    }

    if (diff < 0) { diff *= -1}

    if (diff > 20) {
        return 0
    }else if (diff > 15) {
        return 2
    }else if (diff > 9) {
        return 3
    }else if (diff > 5) {
        return 4
    }else if (diff >= 0) {
        return 5
    }
    return 0

}

function BlockAttack(actor){
  let weapons = actor.items.filter(function(item) {return item.type=="weapon" &&  !item.data.data.isAmmo && witcher.meleeSkills.includes(item.data.data.attackSkill)});
  let shields = actor.items.filter(function(item) {return item.type=="armor" &&  item.data.data.location == "Shield"});
  let options = `<option value="Brawling"> ${game.i18n.localize("WITCHER.SkRefBrawling")} </option>`;
  weapons.forEach(item => options += `<option value="${item.data.data.attackSkill}" itemId="${item.id}" type="Weapon"> ${item.name} (${item.data.data.attackSkill})</option>`);
  shields.forEach(item => options += `<option value="Melee" itemId="${item.id}" type="Shield"> ${item.name} (Melee)</option>`);

  const content = `<label>${game.i18n.localize("WITCHER.Dialog.DefenseWith")}: </label><select name="form">${options}</select><br />`;

  new Dialog({
  title: `${game.i18n.localize("WITCHER.Dialog.DefenseTitle")}`, 
  content,
  buttons: {
    Block: {
      label: `${game.i18n.localize("WITCHER.Dialog.ButtonBlock")}`, 
      callback: (html) => {  
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
      }
    }}
  }).render(true)
}

function ExecuteDefense(actor){ 
    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

    let weapons = actor.items.filter(function(item) {return item.type=="weapon" &&  !item.data.data.isAmmo && witcher.meleeSkills.includes(item.data.data.attackSkill)});
    let shields = actor.items.filter(function(item) {return item.type=="armor" &&  item.data.data.location == "Shield"});
    let options = `<option value="Brawling"> ${game.i18n.localize("WITCHER.SkRefBrawling")} </option>`;
    weapons.forEach(item => options += `<option value="${item.data.data.attackSkill}" itemId="${item.id}" type="Weapon"> ${item.name} (${item.data.data.attackSkill})</option>`);
    shields.forEach(item => options += `<option value="Melee" itemId="${item.id}" type="Shield"> ${item.name} (Melee)</option>`);

    const content = `
    <div class="flex">
        <label>${game.i18n.localize("WITCHER.Dialog.DefenseExtra")}: <input type="checkbox" name="isExtraDefense"></label> <br />
    </div>
    <label>${game.i18n.localize("WITCHER.Dialog.DefenseWith")}: </label><select name="form">${options}</select><br />
    <label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input type="Number" class="small" name="customDef" value=0></label> <br />`;

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
        callback: async html => {
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

          let roll = await new Roll(rollFormula).roll()
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
        callback: async html => {
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

          let roll = await new Roll(rollFormula).roll()
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
        callback: async html => {
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

          let roll = await new Roll(rollFormula).roll()
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
        callback: async html => {
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

          let roll = await new Roll(rollFormula).roll()
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
        callback: async html => {
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

          let roll = await new Roll(rollFormula).roll()
          if (roll.dice[0].results[0].result == 10){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
          };
          roll.toMessage(messageData);
        }
      },
      MagicResist: {
        label: `${game.i18n.localize("WITCHER.Dialog.ButtonMagicResist")}`, 
        callback: async html => {
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
          let stat = actor.data.data.stats.will.current;
          let skill = actor.data.data.skills.will.resistmagic.value;
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Will")} + ${game.i18n.localize("WITCHER.SkWillResistMagLable")}`;
          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonMagicResist")}</h1><p>${displayFormula}</p>`;
          let rollFormula =  !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${game.i18n.localize("WITCHER.Actor.Stat.Will")}]+${skill}[${game.i18n.localize("WITCHER.SkWillResistMagLable")}]`;

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

          let roll = await new Roll(rollFormula).roll()
          if (roll.dice[0].results[0].result == 10){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1){  
            messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
          };
          roll.toMessage(messageData);
        }
      },
    }
  }).render(true)  
}

export {ExecuteDefense, BlockAttack, ApplyDamage};