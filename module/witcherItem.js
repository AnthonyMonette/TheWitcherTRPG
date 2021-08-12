export default class WitcherItem extends Item {
    chatTemplate = {
        "weapon": "systems/TheWitcherTRPG/templates/partials/chat/weapon-chat.html"
    }

    async roll() {
        let formula = item.data.data.damage

        if (item.data.data.isMelee){
          formula += this.actor.data.data.attackStats.meleeBonus
        }
  
        let messageData = {
          speaker: {alias: this.actor.name},
          flavor: `<h1>Attack: ${item.name}</h1>`,
        }
  
        new Dialog({
          title: `Performing an Attack with: ${item.name}`, 
          content: `<h2>${item.name} damage: ${formula}[Melee]</h2>`,
          buttons: {
            LocationRandom: {
              label: "Random", 
              callback: (html) => {
                new Roll(formula).roll().toMessage(messageData)
              }
            },
            LocationHead: {
              label: "Head", 
              callback: (html) => {
                messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Head`,
                new Roll(`(${formula})*3`).roll().toMessage(messageData)
              }
            },
            LocationTorso: {
              label: "Torso", 
              callback: (html) => {
                messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Torso`,
                new Roll(formula).roll().toMessage(messageData)
              }
            },
            LocationArm: {
              label: "Arm", 
              callback: (html) => {
                messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Arm`,
                new Roll(`(${formula})*0.5`).roll().toMessage(messageData)
              }
            },
            LocationLeg: {
              label: "Leg", 
              callback: (html) => {
                messageData.flavor= `<h1>Attack: ${item.name}</h1>Location: Leg`,
                new Roll(`(${formula})*0.5`).roll().toMessage(messageData)
              }
            },
            close: {
              label: "Close"
            }
          }
        }).render(true)  
    }
}