import { witcher } from "../module/config.js";
import { buttonDialog } from "../module/chat.js";
import { addModifiers } from "../module/witcher.js";

async function ApplyDamage(actor, dmgType, location, totalDamage) {
  let armors = actor.getList("armor").filter(a => a.system.equipped);

  let headArmors = armors.filter(h => h.system.location == "Head" || h.system.location == "FullCover")
  let torsoArmors = armors.filter(t => t.system.location == "Torso" || t.system.location == "FullCover")
  let legArmors = armors.filter(l => l.system.location == "Leg" || l.system.location == "FullCover")

  let naturalArmors = armors.filter(n => n.system.type == "Natural")

  let damageTypeloc = ""
  switch (dmgType) {
    case "slashing": damageTypeloc = "WITCHER.Armor.Slashing"; break;
    case "bludgeoning": damageTypeloc = "WITCHER.Armor.Bludgeoning"; break;
    case "piercing": damageTypeloc = "WITCHER.Armor.Piercing"; break;
    case "elemental": damageTypeloc = "WITCHER.Armor.Elemental"; break;
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

  if (actor.type == "monster") {
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
    buttons: [
      [`${game.i18n.localize("WITCHER.Button.Continue")}`,
      (html) => {
        newLocation = html.find("[name=changeLocation]")[0].value;
        resistSilver = html.find("[name=resistNonSilver]").prop("checked");
        resistMeteorite = html.find("[name=resistNonMeteorite]").prop("checked");
        isVulnerable = html.find("[name=vulnerable]").prop("checked");
        addOilDmg = html.find("[name=oilDmg]").prop("checked");
        silverDmg = html.find("[name=silverDmg]")[0].value;
        cancel = false
      }]],
    title: game.i18n.localize("WITCHER.Context.applyDmg"),
    content: content
  }
  await buttonDialog(dialogData)

  if (cancel) {
    return
  }

  if (silverDmg) {
    let silverRoll = await new Roll(silverDmg).evaluate({ async: true })
    totalDamage = Number(totalDamage) + silverRoll.total
    infoTotalDmg += `+${silverRoll.total}[${game.i18n.localize("WITCHER.Damage.silver")}]`
  }

  if (newLocation != "Empty") {
    location = newLocation
  }
  if (addOilDmg) {
    totalDamage = Number(totalDamage) + 5
    infoTotalDmg += `+5[${game.i18n.localize("WITCHER.Damage.oil")}]`
  }

  //infoTotalDmg = totalDamage + ": " + infoTotalDmg;

  let armorSet = {};
  let totalSP = 0
  let displaySP = ""
  let values;
  if (actor.type == "character") {
    switch (location) {
      case "Head":
        armorSet = getArmors(headArmors)
        values = getArmorSp(armorSet["lightArmor"]?.system.headStopping, armorSet["mediumArmor"]?.system.headStopping, armorSet["heavyArmor"]?.system.headStopping)
        displaySP = values[0]
        totalSP = values[1]
        break;
      case "Torso":
        armorSet = getArmors(torsoArmors)
        values = getArmorSp(armorSet["lightArmor"]?.system.torsoStopping, armorSet["mediumArmor"]?.system.torsoStopping, armorSet["heavyArmor"]?.system.torsoStopping)
        displaySP = values[0]
        totalSP = values[1]
        break;
      case "R. Arm":
        armorSet = getArmors(torsoArmors)
        values = getArmorSp(armorSet["lightArmor"]?.system.rightArmStopping, armorSet["mediumArmor"]?.system.rightArmStopping, armorSet["heavyArmor"]?.system.rightArmStopping)
        displaySP = values[0]
        totalSP = values[1]
        break;
      case "L. Arm":
        armorSet = getArmors(torsoArmors)
        values = getArmorSp(armorSet["lightArmor"]?.system.leftArmStopping, armorSet["mediumArmor"]?.system.leftArmStopping, armorSet["heavyArmor"]?.system.leftArmStopping)
        displaySP = values[0]
        totalSP = values[1]
        break;
      case "R. Leg":
        armorSet = getArmors(legArmors)
        values = getArmorSp(armorSet["lightArmor"]?.system.rightLegStopping, armorSet["mediumArmor"]?.system.rightLegStopping, armorSet["heavyArmor"]?.system.rightLegStopping)
        displaySP = values[0]
        totalSP = values[1]
        break;
      case "L. Leg":
        armorSet = getArmors(legArmors)
        values = getArmorSp(armorSet["lightArmor"]?.system.leftLegStopping, armorSet["mediumArmor"]?.system.leftLegStopping, armorSet["heavyArmor"]?.system.leftLegStopping)
        displaySP = values[0]
        totalSP = values[1]
        break;
    }
    naturalArmors.forEach(armor => {
      switch (location) {
        case "Head": totalSP = Number(totalSP) + Number(armor?.system.headStopping); displaySP += `+${armor?.system.headStopping}`; break;
        case "Torso": totalSP = Number(totalSP) + Number(armor?.system.torsoStopping); displaySP += `+${armor?.system.torsoStopping}`; break;
        case "R. Arm": totalSP = Number(totalSP) + Number(armor?.system.rightArmStopping); displaySP += `+${armor?.system.rightArmStopping}`; break;
        case "L. Arm": totalSP = Number(totalSP) + Number(armor?.system.leftArmStopping); displaySP += `+${armor?.system.leftArmStopping}`; break;
        case "R. Leg": totalSP = Number(totalSP) + Number(armor?.system.rightLegStopping); displaySP += `+${armor?.system.rightLegStopping}`; break;
        case "L. Leg": totalSP = Number(totalSP) + Number(armor?.system.leftLegStopping); displaySP += `+${armor?.system.leftLegStopping}`; break;
      }
      displaySP += `[${game.i18n.localize("WITCHER.Armor.Natural")}]`;
    })
  } else {
    switch (location) {
      case "Head":
        totalSP = actor.system.armorHead;
        displaySP = actor.system.armorHead;
        break;
      case "Torso":
      case "R. Arm":
      case "L. Arm":
        totalSP = actor.system.armorUpper;
        displaySP = actor.system.armorUpper;
        break;
      case "R. Leg":
      case "L. Leg":
        totalSP = actor.system.armorLower;
        displaySP = actor.system.armorLower;
        break;
      case "Tail/wing":
        totalSP = actor.system.armorTailWing;
        displaySP = actor.system.armorTailWing;
        break;
    }
  }

  if (actor.type == "character" && !armorSet) {
    return
  }

  totalDamage -= totalSP < 0 ? 0 : totalSP;

  let infoAfterSPReduction = totalDamage < 0 ? 0 : totalDamage

  if (totalDamage <= 0) {
    let messageContent = `${game.i18n.localize("WITCHER.Damage.initial")}: <span class="error-display">${infoTotalDmg}</span><br />
        ${game.i18n.localize("WITCHER.Damage.totalSP")}: <span class="error-display">${displaySP}</span><br />
        ${game.i18n.localize("WITCHER.Damage.afterSPReduct")} <span class="error-display">${infoAfterSPReduction}</span><br /><br />
        ${game.i18n.localize("WITCHER.Damage.NotEnough")}
        `;
    let messageData = {
      user: game.user.id,
      content: messageContent,
      speaker: actor.getSpeaker(),
      flags: actor.getNoDamageFlags(),
    }
    let rollResult = await new Roll("1").evaluate({ async: true })
    rollResult.toMessage(messageData)
    return
  }
  switch (location) {
    case "Head": totalDamage *= 3; break;
    case "R. Arm":
    case "L. Arm":
    case "R. Leg":
    case "L. Leg":
    case "Tail/wing": totalDamage *= 0.5; break;
  }
  let infoAfterLocation = totalDamage
  switch (damageType) {
    case "Slashing":
      if (armorSet["lightArmor"]?.system.slashing || armorSet["mediumArmor"]?.system.slashing || armorSet["heavyArmor"]?.system.slashing) {
        totalDamage *= 0.5
      }
      break;
    case "Blundgeoning":
      if (armorSet["lightArmor"]?.system.bludgeoning || armorSet["mediumArmor"]?.system.bludgeoning || armorSet["heavyArmor"]?.system.bludgeoning) {
        totalDamage *= 0.5
      }
      break;
    case "Piercing":
      if (armorSet["lightArmor"]?.system.piercing || armorSet["mediumArmor"]?.system.piercing || armorSet["heavyArmor"]?.system.piercing) {
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
  if (actor.type == "character") {
    switch (location) {
      case "Head":
        if (armorSet["lightArmor"]) {
          let lightArmorSP = armorSet["lightArmor"].system.headStopping - 1; if (lightArmorSP < 0) { lightArmorSP = 0 }
          armorSet["lightArmor"].update({ 'system.headStopping': lightArmorSP })
        }
        if (armorSet["mediumArmor"]) {
          let mediumArmorSP = armorSet["mediumArmor"].system.headStopping - 1; if (mediumArmorSP < 0) { mediumArmorSP = 0 }
          armorSet["mediumArmor"].update({ 'system.headStopping': mediumArmorSP })
        }
        if (armorSet["heavyArmor"]) {
          let heavyArmorSP = armorSet["heavyArmor"].system.headStopping - 1; if (heavyArmorSP < 0) { heavyArmorSP = 0 }
          armorSet["heavyArmor"].update({ 'system.headStopping': heavyArmorSP })
        }
        break;
      case "Torso":
        if (armorSet["lightArmor"]) {
          let lightArmorSP = armorSet["lightArmor"].system.torsoStopping - 1; if (lightArmorSP < 0) { lightArmorSP = 0 }
          armorSet["lightArmor"].update({ 'system.torsoStopping': lightArmorSP })
        }
        if (armorSet["mediumArmor"]) {
          let mediumArmorSP = armorSet["mediumArmor"].system.torsoStopping - 1; if (mediumArmorSP < 0) { mediumArmorSP = 0 }
          armorSet["mediumArmor"].update({ 'system.torsoStopping': mediumArmorSP })
        }
        if (armorSet["heavyArmor"]) {
          let heavyArmorSP = armorSet["heavyArmor"].system.torsoStopping - 1; if (heavyArmorSP < 0) { heavyArmorSP = 0 }
          armorSet["heavyArmor"].update({ 'system.torsoStopping': heavyArmorSP })
        }
        break;
      case "R. Arm":
        if (armorSet["lightArmor"]) {
          let lightArmorSP = armorSet["lightArmor"].system.rightArmStopping - 1; if (lightArmorSP < 0) { lightArmorSP = 0 }
          armorSet["lightArmor"].update({ 'system.rightArmStopping': lightArmorSP })
        }
        if (armorSet["mediumArmor"]) {
          let mediumArmorSP = armorSet["mediumArmor"].system.rightArmStopping - 1; if (mediumArmorSP < 0) { mediumArmorSP = 0 }
          armorSet["mediumArmor"].update({ 'system.rightArmStopping': mediumArmorSP })
        }
        if (armorSet["heavyArmor"]) {
          let heavyArmorSP = armorSet["heavyArmor"].system.rightArmStopping - 1; if (heavyArmorSP < 0) { heavyArmorSP = 0 }
          armorSet["heavyArmor"].update({ 'system.rightArmStopping': heavyArmorSP })
        }
        break;
      case "L. Arm":
        if (armorSet["lightArmor"]) {
          let lightArmorSP = armorSet["lightArmor"].system.leftArmStopping - 1; if (lightArmorSP < 0) { lightArmorSP = 0 }
          armorSet["lightArmor"].update({ 'system.leftArmStopping': lightArmorSP })
        }
        if (armorSet["mediumArmor"]) {
          let mediumArmorSP = armorSet["mediumArmor"].system.leftArmStopping - 1; if (mediumArmorSP < 0) { mediumArmorSP = 0 }
          armorSet["mediumArmor"].update({ 'system.leftArmStopping': mediumArmorSP })
        }
        if (armorSet["heavyArmor"]) {
          let heavyArmorSP = armorSet["heavyArmor"].system.leftArmStopping - 1; if (heavyArmorSP < 0) { heavyArmorSP = 0 }
          armorSet["heavyArmor"].update({ 'system.leftArmStopping': heavyArmorSP })
        }
        break;
      case "R. Leg":
        if (armorSet["lightArmor"]) {
          let lightArmorSP = armorSet["lightArmor"].system.rightLegStopping - 1; if (lightArmorSP < 0) { lightArmorSP = 0 }
          armorSet["lightArmor"].update({ 'system.rightLegStopping': lightArmorSP })
        }
        if (armorSet["mediumArmor"]) {
          let mediumArmorSP = armorSet["mediumArmor"].system.rightLegStopping - 1; if (mediumArmorSP < 0) { mediumArmorSP = 0 }
          armorSet["mediumArmor"].update({ 'system.rightLegStopping': mediumArmorSP })
        }
        if (armorSet["heavyArmor"]) {
          let heavyArmorSP = armorSet["heavyArmor"].system.rightLegStopping - 1; if (heavyArmorSP < 0) { heavyArmorSP = 0 }
          armorSet["heavyArmor"].update({ 'system.rightLegStopping': heavyArmorSP })
        }
        break;
      case "L. Leg":
        if (armorSet["lightArmor"]) {
          let lightArmorSP = armorSet["lightArmor"].system.leftLegStopping - 1; if (lightArmorSP < 0) { lightArmorSP = 0 }
          armorSet["lightArmor"].update({ 'system.leftLegStopping': lightArmorSP })
        }
        if (armorSet["mediumArmor"]) {
          let mediumArmorSP = armorSet["mediumArmor"].system.leftLegStopping - 1; if (mediumArmorSP < 0) { mediumArmorSP = 0 }
          armorSet["mediumArmor"].update({ 'system.leftLegStopping': mediumArmorSP })
        }
        if (armorSet["heavyArmor"]) {
          let heavyArmorSP = armorSet["heavyArmor"].system.leftLegStopping - 1; if (heavyArmorSP < 0) { heavyArmorSP = 0 }
          armorSet["heavyArmor"].update({ 'system.leftLegStopping': heavyArmorSP })
        }
        break;
    }
  } else {
    let newArmorSP = 0
    switch (location) {
      case "Head":
        newArmorSP = actor.system.armorHead - 1;
        actor.update({ 'system.armorHead': newArmorSP < 0 ? 0 : newArmorSP });
        break;
      case "Torso":
      case "R. Arm":
      case "L. Arm":
        newArmorSP = actor.system.armorUpper - 1;
        actor.update({ 'system.armorUpper': newArmorSP < 0 ? 0 : newArmorSP });
        break;
      case "R. Leg":
      case "L. Leg":
        newArmorSP = actor.system.armorLower - 1;
        actor.update({ 'system.armorLower': newArmorSP < 0 ? 0 : newArmorSP });
        break;
      case "Tail/wing":
        newArmorSP = actor.system.armorTailWing - 1;
        actor.update({ 'system.armorTailWing': newArmorSP < 0 ? 0 : newArmorSP });
        break;
    }
  }
  let messageContent = `${game.i18n.localize("WITCHER.Damage.initial")}: <span class="error-display">${infoTotalDmg}</span> <br />
    ${game.i18n.localize("WITCHER.Damage.totalSP")}: <span class="error-display">${displaySP}</span><br />
    ${game.i18n.localize("WITCHER.Damage.afterSPReduct")}: <span class="error-display">${infoAfterSPReduction}</span><br />
    ${game.i18n.localize("WITCHER.Damage.afterLocationModifier")}: <span class="error-display">${infoAfterLocation}</span><br />
    ${game.i18n.localize("WITCHER.Damage.afterResistances")}: <span class="error-display">${infoAfterResistance}</span><br /><br />
    ${game.i18n.localize("WITCHER.Damage.totalApplied")}: <span class="error-display">${Math.floor(totalDamage)}</span>
    `;
  let messageData = {
    user: game.user.id,
    content: messageContent,
    speaker: actor.getSpeaker(),
    flags: actor.getDamageFlags(),
  }
  let rollResult = await new Roll("1").evaluate({ async: true })
  rollResult.toMessage(messageData)

  actor?.update({
    'system.derivedStats.hp.value': actor.system.derivedStats.hp.value - Math.floor(totalDamage)
  });
}

function getArmors(armors) {
  let lightCount = 0, mediumCount = 0, heavyCount = 0;
  let lightArmor, mediumArmor, heavyArmor;
  armors.forEach(item => {
    if (item.system.type == "Light") { lightCount++; lightArmor = item }
    if (item.system.type == "Medium") { mediumCount++; mediumArmor = item }
    if (item.system.type == "Heavy") { heavyCount++; heavyArmor = item }
  });
  if (lightCount > 1 || mediumCount > 1 || heavyCount > 1) {
    ui.notifications.error(game.i18n.localize("WITCHER.Armor.tooMuch"))
    return
  }
  return {
    lightArmor: lightArmor,
    mediumArmor: mediumArmor,
    heavyArmor: heavyArmor
  };
}

function getArmorSp(lightArmorSP, mediumArmorSP, heavyArmorSP) {
  let totalSP = 0
  let displaySP = ""
  if (heavyArmorSP) {
    totalSP = heavyArmorSP
    displaySP = heavyArmorSP
  }
  if (mediumArmorSP) {
    if (heavyArmorSP) {
      let diff = getArmorDiffBonus(heavyArmorSP, mediumArmorSP)
      totalSP = Number(totalSP) + Number(diff)
      displaySP += "+" + diff
    }
    else {
      displaySP = mediumArmorSP
      totalSP = mediumArmorSP
    }
  }
  if (lightArmorSP) {
    if (mediumArmorSP) {
      let diff = getArmorDiffBonus(mediumArmorSP, lightArmorSP)
      totalSP = Number(totalSP) + Number(diff)
      displaySP += `+${diff}[${game.i18n.localize("WITCHER.Armor.LayerBonus")}]`
    }
    else if (heavyArmorSP) {
      let diff = getArmorDiffBonus(heavyArmorSP, lightArmorSP)
      totalSP = Number(totalSP) + Number(diff)
      displaySP += `+${diff}[${game.i18n.localize("WITCHER.Armor.LayerBonus")}]`
    }
    else {
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

  if (diff < 0) { diff *= -1 }

  if (diff > 20) {
    return 0
  } else if (diff > 15) {
    return 2
  } else if (diff > 9) {
    return 3
  } else if (diff > 5) {
    return 4
  } else if (diff >= 0) {
    return 5
  }
  return 0

}

function BlockAttack(actor) {
  let weapons = actor.items.filter(function (item) { return item.type == "weapon" && !item.system.isAmmo && witcher.meleeSkills.includes(item.system.attackSkill) });
  let shields = actor.items.filter(function (item) { return item.type == "armor" && item.system.location == "Shield" });
  let options = `<option value="Brawling"> ${game.i18n.localize("WITCHER.SkRefBrawling")} </option>`;
  weapons.forEach(item => options += `<option value="${item.system.attackSkill}" itemId="${item.id}" type="Weapon"> ${item.name} (${item.system.attackSkill})</option>`);
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
          if (item_id) {
            let item = actor.items.get(item_id);
            if (type == "Weapon") {
              item.update({ 'system.reliable': item.system.reliable - 1 })
              if (item.system.reliable - 1 <= 0) {
                return ui.notifications.error(game.i18n.localize("WITCHER.Weapon.Broken"));
              }
            }
            else {
              item.update({ 'system.reliability': item.system.reliability - 1 })
              if (item.system.reliability - 1 <= 0) {
                return ui.notifications.error(game.i18n.localize("WITCHER.Shield.Broken"));
              }
            }
          }
        }
      }
    }
  }).render(true)
}

function ExecuteDefense(actor) {
  let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

  let weapons = actor.items.filter(function (item) { return item.type == "weapon" && !item.system.isAmmo && witcher.meleeSkills.includes(item.system.attackSkill) });
  let shields = actor.items.filter(function (item) { return item.type == "armor" && item.system.location == "Shield" });
  let options = `<option value="Brawling"> ${game.i18n.localize("WITCHER.SkRefBrawling")} </option>`;
  weapons.forEach(item => options += `<option value="${item.system.attackSkill}" itemId="${item.id}" type="Weapon"> ${item.name} (${item.system.attackSkill})</option>`);
  shields.forEach(item => options += `<option value="Melee" itemId="${item.id}" type="Shield"> ${item.name} (Melee)</option>`);

  const content = `
    <div class="flex">
        <label>${game.i18n.localize("WITCHER.Dialog.DefenseExtra")}: <input type="checkbox" name="isExtraDefense"></label> <br />
    </div>
    <label>${game.i18n.localize("WITCHER.Dialog.DefenseWith")}: </label><select name="form">${options}</select><br />
    <label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input type="Number" class="small" name="customDef" value=0></label> <br />`;

  let messageData = {
    speaker: { alias: actor.name },
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
            let newSta = actor.system.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({
              'system.derivedStats.sta.value': newSta
            });
          }
          let stat = actor.system.stats.ref.current;
          let skill = actor.system.skills.ref.dodge.value;
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefDodge")}`;
          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonDodge")}</h1><p>${displayFormula}</p>`;
          let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${skill}[${game.i18n.localize("WITCHER.SkRefDodge")}]`;

          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}` : `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]`;
          }

          rollFormula = addModifiers(actor.system.skills.ref.dodge.modifiers, rollFormula)

          let roll = await new Roll(rollFormula).evaluate({ async: true })
          if (roll.dice[0].results[0].result == 10) {
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1) {
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
            let newSta = actor.system.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({
              'system.derivedStats.sta.value': newSta
            });
          }
          let stat = actor.system.stats.dex.current;
          let skill = actor.system.skills.dex.athletics.value;
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.StDex")} + ${game.i18n.localize("WITCHER.SkDexAthletics")}`;
          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonReposition")}</h1><p>${displayFormula}</p>`;
          let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${game.i18n.localize("WITCHER.StDex")}]+${skill}[${game.i18n.localize("WITCHER.SkDexAthletics")}]`;

          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}` : `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]`;
          }

          rollFormula = addModifiers(actor.system.skills.dex.athletics.modifiers, rollFormula)

          let roll = await new Roll(rollFormula).evaluate({ async: true })
          if (roll.dice[0].results[0].result == 10) {
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1) {
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
            let newSta = actor.system.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({
              'system.derivedStats.sta.value': newSta
            });
          }
          let defense = html.find("[name=form]")[0].value;
          let stat = actor.system.stats.ref.current;
          let skill = 0;
          let skillName = "";
          let modifiers;
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.Dialog.Defense")}`;
          switch (defense) {
            case "Brawling":
              skill = actor.system.skills.ref.brawling.value;
              skillName = actor.system.skills.ref.brawling.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefBrawling")}`;
              modifiers = actor.system.skills.ref.brawling.modifiers
              break;
            case "Melee":
              skill = actor.system.skills.ref.melee.value;
              skillName = actor.system.skills.ref.melee.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefMelee")}`;
              modifiers = actor.system.skills.ref.melee.modifiers
              break;
            case "Small Blades":
              skill = actor.system.skills.ref.smallblades.value;
              skillName = actor.system.skills.ref.smallblades.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSmall")}`;
              modifiers = actor.system.skills.ref.smallblades.modifiers
              break;
            case "Staff/Spear":
              skill = actor.system.skills.ref.staffspear.value;
              skillName = actor.system.skills.ref.staffspear.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefStaff")}`;
              modifiers = actor.system.skills.ref.staffspear.modifiers
              break;
            case "Swordsmanship":
              skill = actor.system.skills.ref.swordsmanship.value;
              skillName = actor.system.skills.ref.swordsmanship.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSwordsmanship")}`;
              modifiers = actor.system.skills.ref.swordsmanship.modifiers
              break;
          }

          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonBlock")}</h1><p>${displayFormula}</p>`;
          let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${skill}[${game.i18n.localize(skillName)}]`;
          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}` : `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]`;
          }
          rollFormula = addModifiers(modifiers, rollFormula)

          let roll = await new Roll(rollFormula).evaluate({ async: true })
          if (roll.dice[0].results[0].result == 10) {
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1) {
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
            let newSta = actor.system.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({
              'system.derivedStats.sta.value': newSta
            });
          }
          let defense = html.find("[name=form]")[0].value;
          let stat = actor.system.stats.ref.current;
          let skill = 0;
          let skillName = "";
          let modifiers;
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.Dialog.ButtonParry")}`;
          switch (defense) {
            case "Brawling":
              skill = actor.system.skills.ref.brawling.value;
              skillName = actor.system.skills.ref.brawling.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefBrawling")} - 3`;
              modifiers = actor.system.skills.ref.brawling.modifiers
              break;
            case "Melee":
              skill = actor.system.skills.ref.melee.value;
              skillName = actor.system.skills.ref.melee.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefMelee")} - 3`;
              modifiers = actor.system.skills.ref.melee.modifiers
              break;
            case "Small Blades":
              skill = actor.system.skills.ref.smallblades.value;
              skillName = actor.system.skills.ref.smallblades.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSmall")} - 3`;
              modifiers = actor.system.skills.ref.smallblades.modifiers
              break;
            case "Staff/Spear":
              skill = actor.system.skills.ref.staffspear.value;
              skillName = actor.system.skills.ref.staffspear.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefStaff")} - 3`;
              modifiers = actor.system.skills.ref.staffspear.modifiers
              break;
            case "Swordsmanship":
              skill = actor.system.skills.ref.swordsmanship.value;
              skillName = actor.system.skills.ref.swordsmanship.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSwordsmanship")} - 3`;
              modifiers = actor.system.skills.ref.swordsmanship.modifiers
              break;
          }

          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonParry")}</h1><p>${displayFormula}</p>`;
          let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}-3` : `1d10+${stat}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${skill}[${game.i18n.localize(skillName)}]-3[${game.i18n.localize("WITCHER.Dialog.ButtonParry")}]`;
          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}` : `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]`;
          }
          rollFormula = addModifiers(modifiers, rollFormula)

          let roll = await new Roll(rollFormula).evaluate({ async: true })
          if (roll.dice[0].results[0].result == 10) {
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1) {
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
            let newSta = actor.system.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({
              'system.derivedStats.sta.value': newSta
            });
          }
          let defense = html.find("[name=form]")[0].value;
          let stat = actor.system.stats.ref.current;
          let skill = 0;
          let skillName = ""
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.Dialog.ButtonParry")}`;
          switch (defense) {
            case "Brawling":
              skill = actor.system.skills.ref.brawling.value;
              skillName = actor.system.skills.ref.brawling.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefBrawling")} - 5`;
              modifiers = actor.system.skills.ref.brawling.modifiers
              break;
            case "Melee":
              skill = actor.system.skills.ref.melee.value;
              skillName = actor.system.skills.ref.melee.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefMelee")} - 5`;
              modifiers = actor.system.skills.ref.melee.modifiers
              break;
            case "Small Blades":
              skill = actor.system.skills.ref.smallblades.value;
              skillName = actor.system.skills.ref.smallblades.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSmall")} - 5`;
              modifiers = actor.system.skills.ref.smallblades.modifiers
              break;
            case "Staff/Spear":
              skill = actor.system.skills.ref.staffspear.value;
              skillName = actor.system.skills.ref.staffspear.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefStaff")} - 5`;
              modifiers = actor.system.skills.ref.staffspear.modifiers
              break;
            case "Swordsmanship":
              skill = actor.system.skills.ref.swordsmanship.value;
              skillName = actor.system.skills.ref.swordsmanship.label;
              displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Ref")} + ${game.i18n.localize("WITCHER.SkRefSwordsmanship")} - 5`;
              modifiers = actor.system.skills.ref.swordsmanship.modifiers
              break;
          }

          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonParry")}</h1><p>${displayFormula}</p>`;
          let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}-5` : `1d10+${stat}[${game.i18n.localize("WITCHER.Actor.Stat.Ref")}]+${skill}[${game.i18n.localize(skillName)}]-5[${game.i18n.localize("WITCHER.Dialog.ButtonParry")}]`;
          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}` : `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]`;
          }
          rollFormula = addModifiers(modifiers, rollFormula)

          let roll = await new Roll(rollFormula).evaluate({ async: true })
          if (roll.dice[0].results[0].result == 10) {
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1) {
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
            let newSta = actor.system.derivedStats.sta.value - 1
            if (newSta < 0) {
              return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
            }
            actor.update({
              'system.derivedStats.sta.value': newSta
            });
          }
          let stat = actor.system.stats.will.current;
          let skill = actor.system.skills.will.resistmagic.value;
          let displayFormula = `1d10 + ${game.i18n.localize("WITCHER.Actor.Stat.Will")} + ${game.i18n.localize("WITCHER.SkWillResistMagLable")}`;
          messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.Defense")}: ${game.i18n.localize("WITCHER.Dialog.ButtonMagicResist")}</h1><p>${displayFormula}</p>`;
          let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${game.i18n.localize("WITCHER.Actor.Stat.Will")}]+${skill}[${game.i18n.localize("WITCHER.SkWillResistMagLable")}]`;

          if (customDef != "0") {
            rollFormula += !displayFormula ? `+${customDef}` : `+${customDef}[${game.i18n.localize("WITCHER.Settings.Custom")}]`;
          }

          rollFormula = addModifiers(actor.system.skills.ref.dodge.modifiers, rollFormula)

          let roll = await new Roll(rollFormula).evaluate({ async: true })
          if (roll.dice[0].results[0].result == 10) {
            messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
          };
          if (roll.dice[0].results[0].result == 1) {
            messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
          };
          roll.toMessage(messageData);
        }
      },
    }
  }).render(true)
}

export { ExecuteDefense, BlockAttack, ApplyDamage };