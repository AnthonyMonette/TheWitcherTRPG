import { getRandomInt } from "./witcher.js";

export async function RollCustomMessage(rollResult, template, actor, extraData) {
    let templateContext = {
        ...extraData,
        roll: rollResult,
        tooltip: await rollResult.getTooltip()
    };
    let speaker = ChatMessage.getSpeaker(actor)
    speaker.alias =  actor.data.name
    let chatData = {
        user: game.user._if,
        speaker: speaker,
        roll: rollResult,
        content: await renderTemplate(template, templateContext),
        sound: CONFIG.sounds.dice
    }
    ChatMessage.create(chatData);
}

export function addChatListeners(html){
    html.on('click',"button.damage", onDamage)
}

function onDamage(event) {
    let messageData = {}
    console.log(event.currentTarget)
    let img = event.currentTarget.getAttribute("data-img")
    let name = event.currentTarget.getAttribute("data-name")
    let damageFormula = event.currentTarget.getAttribute("data-dmg")
    let location = event.currentTarget.getAttribute("data-location")
    let locationFormula = event.currentTarget.getAttribute("data-location-formula")
    let strike = event.currentTarget.getAttribute("data-strike")
    let effects = JSON.parse(event.currentTarget.getAttribute("data-effects"))

    messageData.flavor = `<h1><img src="${img}" class="item-img" />Damage: ${name} </h1>`;

    if (strike == "strong") {
      damageFormula = `(${damageFormula})*2`;
      messageData.flavor += `<div>Strong Attack</div>`;
    }
    messageData.flavor += `<div><b>Location:</b> ${location} = ${locationFormula} </div>`;
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
    console.log(damageFormula)
    new Roll(damageFormula).roll().toMessage(messageData)
}