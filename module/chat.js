import { ExecuteDefense, ApplyDamage } from "../scripts/actions.js";
import { getRandomInt } from "./witcher.js";

export function addChatListeners(html){
    html.on('click',"button.damage", onDamage)
    html.on('click',"a.crit-roll", onCritRoll)
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
export async function buttonDialog(data)
{
  return await new Promise(async (resolve) => {
    let buttons = {}, dialog;

    data.buttons.forEach(([str, callback])=>{
      buttons[str] = {
        label : str,
        callback
      }
    });
  
    dialog = new Dialog({
      title : data.title , 
      content : data.content, 
      buttons, 
      close : () => resolve() 
    },{
      width : 300,
    });

    await dialog._render(true);
  });
}

function onCritRoll(event) {
  let current = event.currentTarget.parentElement.parentElement.parentElement.getElementsByClassName("dice-total")
  if(!current.length){
    current = event.currentTarget.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("dice-total")
  }
  let isSuccess = event.currentTarget.getElementsByClassName("dice-sucess")
  let totalValue = Number(current[0].innerText)
  let rollResult = new Roll("1d10x10").roll()
  if (isSuccess.length){
    totalValue += Number(rollResult.total)
  }else {
    totalValue--
    totalValue -= Number(rollResult.total)
  }
  let messageData = {}
  messageData.flavor = `<div>${game.i18n.localize("WITCHER.CritTotal")}: ${totalValue}</div>`
  rollResult.toMessage(messageData)
}

function onDamage(event) {
    let img = event.currentTarget.getAttribute("data-img")
    let name = event.currentTarget.getAttribute("data-name")
    let damageFormula = event.currentTarget.getAttribute("data-dmg")
    let touchedLocation = event.currentTarget.getAttribute("data-location")
    let damageType = event.currentTarget.getAttribute("data-dmg-type")
    let locationFormula = ""
    let strike = ""
    if (touchedLocation != "random") {
      locationFormula = event.currentTarget.getAttribute("data-location-formula")
      strike = event.currentTarget.getAttribute("data-strike")
    } else {
      let randomHumanLocation = getRandomInt(10)
      switch(randomHumanLocation){
        case 1:
          touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationHead")}`;
          locationFormula = `*3`;
          break;
        case 2:
        case 3:
        case 4:
          touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
          break;
        case 5:
          touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
          locationFormula = `*0.5`;
          break;
        case 6:
          touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
          locationFormula = `*0.5`;
          break;
        case 7:
        case 8:
          touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
          locationFormula = `*0.5`;
          break;
        case 9:
        case 10:
          touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
          locationFormula = `*0.5`;
          break;
        default:
          touchedLocation = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
      }
    }
    let effects = JSON.parse(event.currentTarget.getAttribute("data-effects"))
    rollDamage(img, name, damageFormula, touchedLocation, locationFormula, strike, effects, damageType);

}

export async function rollDamage(img, name, damageFormula, location, locationFormula, strike, effects, damageType) {
  let messageData = {}
  messageData.flavor = `<div class="damage-message" data-location="${location}" data-dmg-type="${damageType}" data-strike="${strike}" data-effects='${effects}'>${game.i18n.localize("WITCHER.table.Damage")}><h1><img src="${img}" class="item-img" />${game.i18n.localize("WITCHER.table.Damage")}: ${name} </h1>`;

  if (strike == "strong") {
    damageFormula = `(${damageFormula})*2`;
    messageData.flavor += `<div>${game.i18n.localize("WITCHER.Dialog.strikeStrong")}</div>`;
  }
  messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Dialog.attackLocation")}:</b> ${location} = ${locationFormula} </div>`;
  messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Dialog.damageType")}:</b> ${damageType} </div>`;
  messageData.flavor += `<div>${game.i18n.localize("WITCHER.Damage.RemoveSP")}</div>`;
  if (effects) {
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
  new Roll(damageFormula).roll().toMessage(messageData)
}

export function addChatMessageContextOptions(html, options){
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
          if (game.user.character){
            defenderActor = game.user.character
          }else {
            return ui.notifications.error(game.i18n.localize("WITCHER.Context.SelectActor"));
          }
        }else {
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
          if (game.user.character){
            defenderActor = game.user.character
          }else {
            return ui.notifications.error(game.i18n.localize("WITCHER.Context.SelectActor"));
          }
        }else {
          defenderActor = defender[0].actor
        }
        ExecuteDefense(defenderActor)
      }
    }
  );
  console.log(options)
  return options;
}