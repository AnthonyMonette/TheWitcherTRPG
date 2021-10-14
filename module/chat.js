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
  let rollResult = new Roll("1d10x10").roll()
  rollResult.toMessage()
}

function onDamage(event) {
    let img = event.currentTarget.getAttribute("data-img")
    let name = event.currentTarget.getAttribute("data-name")
    let damageFormula = event.currentTarget.getAttribute("data-dmg")
    let location = event.currentTarget.getAttribute("data-location")
    let locationFormula = event.currentTarget.getAttribute("data-location-formula")
    let strike = event.currentTarget.getAttribute("data-strike")
    let effects = JSON.parse(event.currentTarget.getAttribute("data-effects"))
    rollDamage(img, name, damageFormula, location, locationFormula, strike, effects);

}

export async function rollDamage(img, name, damageFormula, location, locationFormula, strike, effects) {
  let messageData = {}
  messageData.flavor = `<h1><img src="${img}" class="item-img" />Damage: ${name} </h1>`;

  if (strike == "strong") {
    damageFormula = `(${damageFormula})*2`;
    messageData.flavor += `<div>Strong Attack</div>`;
  }
  messageData.flavor += `<div><b>Location:</b> ${location} = ${locationFormula} </div>`;
  messageData.flavor += `<div>Remove SP before applying location modifier.</div>`;
  if (effects) {
    messageData.flavor += `<b>Effects:</b>`;
    effects.forEach(element => {
      messageData.flavor += `<div class="flex">${element.name}`;
      if (element.percentage) {
        let rollPercentage = getRandomInt(100);
        messageData.flavor += `<div>(${element.percentage}%) <b>Rolled:</b> ${rollPercentage}</div>`;
      }
      messageData.flavor += `</div>`;
    });
  }
  new Roll(damageFormula).roll().toMessage(messageData)
}