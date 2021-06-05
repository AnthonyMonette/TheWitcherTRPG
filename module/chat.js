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

    messageData.flavor = `<h1><img src="${item.img}" class="item-img" />Damage: ${item.name} </h1>`;

    new Roll("1d10").roll().toMessage(messageData)
    // if (strike == "strong") {
    //   damageFormula = `(${damageFormula})*2`;
    //   messageData.flavor += `<div>Strong Attack</div>`;
    // }
    // else if(strike == "fast"){
    //   messageData.flavor += `<div>Fast Attack ${i + 1}</div>`;
    // }
    // messageData.flavor += `<div><b>Location:</b> ${touchedLocation}</div>`;
    // if (item.data.data.effects) {
    //   messageData.flavor += `<b>Effects:</b>`;
    //   item.data.data.effects.forEach(element => {
    //     messageData.flavor += `<div class="flex">${element.name}`;
    //     if (element.percentage) {
    //       let rollPercentage = getRandomInt(100);
    //       messageData.flavor += `<div>(${element.percentage}%) <b>Rolled:</b> ${rollPercentage}</div>`;
    //     }
    //     messageData.flavor += `</div>`;
    //   });
    // }
    // console.log(damageFormula)
    // new Roll(damageFormula).roll().toMessage(messageData)
}