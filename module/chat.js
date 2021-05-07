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