export async function RollCustomMessage(rollResult, template, extraData) {
    let templateContext = {
        ...extraData,
        roll: rollResult,
        tooltip: await rollResult.getTooltip()
    };

    let chatData = {
        user: game.user._if,
        speaker: ChatMessage.getSpeaker(),
        roll: rollResult,
        content: await renderTemplate(template, templateContext),
        sound: CONFIG.sounds.dice
    }
    ChatMessage.create(chatData);
}