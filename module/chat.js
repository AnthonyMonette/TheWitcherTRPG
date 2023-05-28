import { ExecuteDefence, BlockAttack, ApplyDamage } from "../scripts/actions.js";
import { getRandomInt } from "./witcher.js";

export function addChatListeners(html) {
  html.on('click', "button.damage", onDamage)
  html.on('click', "a.crit-roll", onCritRoll)
}

/*
  Button Dialog
    Send an array of buttons to create a dialog that will execute specific callbacks based on button pressed.

    returns a promise (no value)

  data = {
    buttons : [[`Label`, ()=>{Callback} ], ...]
    title : `title_label`,
    content : `Html_Content`
  }
*/
export async function buttonDialog(data) {
  return await new Promise(async (resolve) => {
    let buttons = {}, dialog;

    data.buttons.forEach(([str, callback]) => {
      buttons[str] = {
        label: str,
        callback
      }
    });

    dialog = new Dialog({
      title: data.title,
      content: data.content,
      buttons,
      close: () => resolve()
    }, {
      width: 300,
    });

    await dialog._render(true);
  });
}

async function onCritRoll(event) {
  let current = event.currentTarget.parentElement.parentElement.parentElement.getElementsByClassName("dice-total")
  if (!current.length) {
    current = event.currentTarget.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("dice-total")
  }
  let isSuccess = event.currentTarget.getElementsByClassName("dice-sucess")
  let totalValue = Number(current[0].innerText)
  let rollResult = await new Roll("1d10x10").evaluate({ async: true })
  if (isSuccess.length) {
    totalValue += Number(rollResult.total)
  } else {
    totalValue--
    totalValue -= Number(rollResult.total)
  }
  let messageData = {}
  messageData.flavor = `<h2>${game.i18n.localize("WITCHER.CritTotal")}: ${totalValue}</h2>`
  rollResult.toMessage(messageData)
}

function onDamage(event) {
  let img = event.currentTarget.getAttribute("data-img")
  let name = event.currentTarget.getAttribute("data-name")
  let damageFormula = event.currentTarget.getAttribute("data-dmg")
  let touchedLocation = JSON.parse(event.currentTarget.getAttribute("data-location"))
  let damageType = event.currentTarget.getAttribute("data-dmg-type")
  let locationFormula = ""
  let strike = ""
  if (touchedLocation.name != "randomSpell") {
    locationFormula = event.currentTarget.getAttribute("data-location-formula")
    strike = event.currentTarget.getAttribute("data-strike")
  } else {
    let actorName = event.currentTarget.parentElement.parentElement.parentElement.getElementsByClassName("message-sender")[0].getInnerHTML();
    let actor = game.actors.getName(actorName) || game.actors[0];
    touchedLocation = actor.getLocationObject("randomHuman");
    locationFormula = touchedLocation.locationFormula;
  }
  let effects = JSON.parse(event.currentTarget.getAttribute("data-effects"))
  rollDamage(img, name, damageFormula, touchedLocation, locationFormula, strike, effects, damageType);
}

export async function rollDamage(img, name, damageFormula, location, locationFormula, strike, effects, damageType) {
  let messageData = {}
  let locationJSON = JSON.stringify(location);
  messageData.flavor = `<div class="damage-message" data-location='${locationJSON}' data-dmg-type="${damageType}" data-strike="${strike}" data-effects='${effects}'><h1><img src="${img}" class="item-img" />${game.i18n.localize("WITCHER.table.Damage")}: ${name} </h1>`;

  if (damageFormula == "") {
    damageFormula = "0"
    ui.notifications.error(`${game.i18n.localize("WITCHER.NoDamageSpecified")}`)
  }

  if (strike == "strong") {
    damageFormula = `(${damageFormula})*2`;
    messageData.flavor += `<div>${game.i18n.localize("WITCHER.Dialog.strikeStrong")}</div>`;
  }
  messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Dialog.attackLocation")}:</b> ${location.alias} = ${locationFormula} </div>`;
  let damageTypeloc = ""
  switch (damageType) {
    case "slashing": damageTypeloc = "WITCHER.Armor.Slashing"; break;
    case "bludgeoning": damageTypeloc = "WITCHER.Armor.Bludgeoning"; break;
    case "piercing": damageTypeloc = "WITCHER.Armor.Piercing"; break;
    case "elemental": damageTypeloc = "WITCHER.Armor.Elemental"; break;
  }
  messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Dialog.damageType")}:</b> ${game.i18n.localize(damageTypeloc)} </div>`;
  messageData.flavor += `<div>${game.i18n.localize("WITCHER.Damage.RemoveSP")}</div>`;
  if (effects && effects.length > 0) {
    messageData.flavor += `<b>${game.i18n.localize("WITCHER.Item.Effect")}:</b>`;
    effects.forEach(element => {
      messageData.flavor += `<div class="flex">${element.name}`;
      if (element.percentage) {
        let rollPercentage = getRandomInt(100);
        messageData.flavor += `<div>(${element.percentage}%) <b>${game.i18n.localize("WITCHER.Effect.Rolled")}:</b> ${rollPercentage}</div>`;
      }
      messageData.flavor += `</div>`;
    });
  }
  (await new Roll(damageFormula).evaluate({ async: true })).toMessage(messageData)
}

/**
 * @param {string} rollFormula rollFormula to apply
 * @param {*} messageData messageData to display
 * @param {RollConfig} config Configuration for Extended roll
 */
export async function extendedRoll(rollFormula, messageData, config) {
  let roll = await new Roll(rollFormula).evaluate({ async: true })
  let rollTotal = Number(roll.total);

  //crit/fumble calculation
  if (config.showCrit && (isCrit(roll) || isFumble(roll))) {
    let extraRollDescription = isCrit(roll) ? `${game.i18n.localize("WITCHER.Crit")}` : `${game.i18n.localize("WITCHER.Fumble")}`;

    let critClass = config.reversal ? "dice-fail" : "dice-sucess"
    let fumbleClass = config.reversal ? "dice-sucess" : "dice-fail"
    messageData.flavor += isCrit(roll)
      ? `<div class="${critClass}"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div>`
      : `<div class="${fumbleClass}"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div>`;

    messageData.flavor += `<div>${rollFormula} = <b>${rollTotal}</b></div>`;

    //print crit/fumble roll
    let extraRollFormula = `1d10x10[${extraRollDescription}]`;
    let extraRoll = await new Roll(extraRollFormula).evaluate({ async: true });
    let extraRollTotal = Number(extraRoll.total);
    messageData.flavor += `<div>${extraRollFormula} = <b>${extraRollTotal}</b></div>`;

    //add/subtract extra result from the original one
    extraRollFormula = `${rollTotal}[${game.i18n.localize("WITCHER.BeforeCrit")}]`;
    if (isCrit(roll)) {
      extraRollFormula += `+${extraRollTotal}[${extraRollDescription}]`;
      rollTotal += extraRollTotal;
    } else {
      if (extraRollTotal >= rollTotal) {
        extraRollTotal = rollTotal;
      }
      extraRollFormula += `-${extraRollTotal}[${extraRollDescription}]`;
      rollTotal -= extraRollTotal;
    }

    //print add/subtract roll info
    extraRoll = await new Roll(extraRollFormula).evaluate({ async: true });
    roll = extraRoll;
  }

  //calculate overall success/failure for the attack/defence
  if (config.showSuccess && config.threshold >= 0) {
    let success
    if (!config.reversal) {
      success = config.defence ? roll.total >= config.threshold : roll.total > config.threshold
    } else {
      success = config.defence ? roll.total <= config.threshold : roll.total < config.threshold
    }

    let successHeader = config.thresholdDesc ? `: ${game.i18n.localize(config.thresholdDesc)}` : ""
    messageData.flavor += success
      ? `<div class="dice-sucess"><i>${game.i18n.localize("WITCHER.Chat.Success")}${successHeader}</i></br>${config.messageOnSuccess}</div>`
      : `<div class="dice-fail"><i>${game.i18n.localize("WITCHER.Chat.Fail")}${successHeader}</i></br>${config.messageOnFailure}</div>`;

    messageData.flags = success
      ? config.flagsOnSuccess
      : config.flagsOnFailure;
  }

  if (config.showResult) {
    roll.toMessage(messageData)
  }
  return config.showResult ? roll.total : roll
}

function isCrit(roll) {
  return roll.dice[0].results[0].result == 10;
}

function isFumble(roll) {
  return roll.dice[0].results[0].result == 1;
}

export function addChatMessageContextOptions(html, options) {
  let canDefend = li => li.find(".attack-message").length
  let canApplyDamage = li => li.find(".damage-message").length
  options.push(
    {
      name: `${game.i18n.localize("WITCHER.Context.applyDmg")}`,
      icon: '<i class="fas fa-user-minus"></i>',
      condition: canApplyDamage,
      callback: li => {
        let defender = canvas.tokens.controlled.slice()
        let defenderActor;
        if (defender.length == 0) {
          if (game.user.character) {
            defenderActor = game.user.character
          } else {
            return ui.notifications.error(game.i18n.localize("WITCHER.Context.SelectActor"));
          }
        } else {
          defenderActor = defender[0].actor
        }
        ApplyDamage(defenderActor,
          li.find(".damage-message")[0].dataset.dmgType,
          li.find(".damage-message")[0].dataset.location,
          li.find(".dice-total")[0].innerText)
      }
    },
    {
      name: `${game.i18n.localize("WITCHER.Context.Defense")}`,
      icon: '<i class="fas fa-shield-alt"></i>',
      condition: canDefend,
      callback: li => {
        let defender = canvas.tokens.controlled.slice()
        let defenderActor;
        if (defender.length == 0) {
          if (game.user.character) {
            defenderActor = game.user.character
          } else {
            return ui.notifications.error(game.i18n.localize("WITCHER.Context.SelectActor"));
          }
        } else {
          defenderActor = defender[0].actor
        }
        ExecuteDefence(defenderActor,
          li.find(".attack-message")[0].dataset.dmgType,
          li.find(".attack-message")[0].dataset.location,
          li.find(".dice-total")[0].innerText)
      }
    },
    {
      name: `${game.i18n.localize("WITCHER.Context.Blocked")}`,
      icon: '<i class="fas fa-shield-alt"></i>',
      condition: canDefend,
      callback: li => {
        let defender = canvas.tokens.controlled.slice()
        let defenderActor;
        if (defender.length == 0) {
          if (game.user.character) {
            defenderActor = game.user.character
          } else {
            return ui.notifications.error(game.i18n.localize("WITCHER.Context.SelectActor"));
          }
        } else {
          defenderActor = defender[0].actor
        }
        BlockAttack(defenderActor)
      }
    }
  );
  return options;
}