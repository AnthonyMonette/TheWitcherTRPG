import { buttonDialog } from "../chat.js";

function onChangeSkillList(actor) {
    let content = ``
    for (let parent in actor.system.skills) {
        let skills =  actor.system.skills[parent]
        content += `<h2>${parent}</h2>`
        for (let skill in skills) {
            content += `<input type="checkbox" name="display${skill}" ${skills[skill].isVisible? "checked": "unchecked"}> ${game.i18n.localize(skills[skill].label)}<br />`
        }
    }
    new Dialog({
        title: `${game.i18n.localize("WITCHER.Monster.SkillList")}`, 
        content,
        buttons: {
            Cancel: {
                label:`${game.i18n.localize("WITCHER.Button.Cancel")}`, 
                callback: ()=>{}}, 
            Apply: {
                label: `${game.i18n.localize("WITCHER.Dialog.Apply")}`, 
                callback: (html) => {
                actor.update({ 'system.skills.int.awareness.isVisible': html.find("[name=displayawareness]").prop("checked"),
                    'system.skills.int.business.isVisible': html.find("[name=displaybusiness]").prop("checked"),
                    'system.skills.int.deduction.isVisible': html.find("[name=displaydeduction]").prop("checked"),
                    'system.skills.int.education.isVisible': html.find("[name=displayeducation]").prop("checked"),
                    'system.skills.int.commonsp.isVisible': html.find("[name=displaycommonsp]").prop("checked"),
                    'system.skills.int.eldersp.isVisible': html.find("[name=displayeldersp]").prop("checked"),
                    'system.skills.int.dwarven.isVisible': html.find("[name=displaydwarven]").prop("checked"),
                    'system.skills.int.monster.isVisible': html.find("[name=displaymonster]").prop("checked"),
                    'system.skills.int.socialetq.isVisible': html.find("[name=displaysocialetq]").prop("checked"),
                    'system.skills.int.streetwise.isVisible': html.find("[name=displaystreetwise]").prop("checked"),
                    'system.skills.int.tactics.isVisible': html.find("[name=displaytactics]").prop("checked"),
                    'system.skills.int.teaching.isVisible': html.find("[name=displayteaching]").prop("checked"),
                    'system.skills.int.wilderness.isVisible': html.find("[name=displaywilderness]").prop("checked"),
                    'system.skills.ref.brawling.isVisible': html.find("[name=displaybrawling]").prop("checked"),
                    'system.skills.ref.dodge.isVisible': html.find("[name=displaydodge]").prop("checked"),
                    'system.skills.ref.melee.isVisible': html.find("[name=displaymelee]").prop("checked"),
                    'system.skills.ref.riding.isVisible': html.find("[name=displayriding]").prop("checked"),
                    'system.skills.ref.sailing.isVisible': html.find("[name=displaysailing]").prop("checked"),
                    'system.skills.ref.smallblades.isVisible': html.find("[name=displaysmallblades]").prop("checked"),
                    'system.skills.ref.staffspear.isVisible': html.find("[name=displaystaffspear]").prop("checked"),
                    'system.skills.ref.swordsmanship.isVisible': html.find("[name=displayswordsmanship]").prop("checked"),
                    'system.skills.will.courage.isVisible': html.find("[name=displaycourage]").prop("checked"),
                    'system.skills.will.hexweave.isVisible': html.find("[name=displayhexweave]").prop("checked"),
                    'system.skills.will.intimidation.isVisible': html.find("[name=displayintimidation]").prop("checked"),
                    'system.skills.will.spellcast.isVisible': html.find("[name=displayspellcast]").prop("checked"),
                    'system.skills.will.resistmagic.isVisible': html.find("[name=displayresistmagic]").prop("checked"),
                    'system.skills.will.resistcoerc.isVisible': html.find("[name=displayresistcoerc]").prop("checked"),
                    'system.skills.will.ritcraft.isVisible': html.find("[name=displayritcraft]").prop("checked"),
                    'system.skills.dex.archery.isVisible': html.find("[name=displayarchery]").prop("checked"),
                    'system.skills.dex.athletics.isVisible': html.find("[name=displayathletics]").prop("checked"),
                    'system.skills.dex.crossbow.isVisible': html.find("[name=displaycrossbow]").prop("checked"),
                    'system.skills.dex.sleight.isVisible': html.find("[name=displaysleight]").prop("checked"),
                    'system.skills.dex.stealth.isVisible': html.find("[name=displaystealth]").prop("checked"),
                    'system.skills.cra.alchemy.isVisible': html.find("[name=displayalchemy]").prop("checked"),
                    'system.skills.cra.crafting.isVisible': html.find("[name=displaycrafting]").prop("checked"),
                    'system.skills.cra.disguise.isVisible': html.find("[name=displaydisguise]").prop("checked"),
                    'system.skills.cra.firstaid.isVisible': html.find("[name=displayfirstaid]").prop("checked"),
                    'system.skills.cra.forgery.isVisible': html.find("[name=displayforgery]").prop("checked"),
                    'system.skills.cra.picklock.isVisible': html.find("[name=displaypicklock]").prop("checked"),
                    'system.skills.cra.trapcraft.isVisible': html.find("[name=displaytrapcraft]").prop("checked"),
                    'system.skills.body.physique.isVisible': html.find("[name=displayphysique]").prop("checked"),
                    'system.skills.body.endurance.isVisible': html.find("[name=displayendurance]").prop("checked"),
                    'system.skills.emp.charisma.isVisible': html.find("[name=displaycharisma]").prop("checked"),
                    'system.skills.emp.deceit.isVisible': html.find("[name=displaydeceit]").prop("checked"),
                    'system.skills.emp.finearts.isVisible': html.find("[name=displayfinearts]").prop("checked"),
                    'system.skills.emp.gambling.isVisible': html.find("[name=displaygambling]").prop("checked"),
                    'system.skills.emp.grooming.isVisible': html.find("[name=displaygrooming]").prop("checked"),
                    'system.skills.emp.perception.isVisible': html.find("[name=displayperception]").prop("checked"),
                    'system.skills.emp.leadership.isVisible': html.find("[name=displayleadership]").prop("checked"),
                    'system.skills.emp.persuasion.isVisible': html.find("[name=displaypersuasion]").prop("checked"),
                    'system.skills.emp.performance.isVisible': html.find("[name=displayperformance]").prop("checked"),
                    'system.skills.emp.seduction.isVisible': html.find("[name=displayseduction]").prop("checked"),
                })}
            }
        }
    }).render(true) 
}
    
async function  exportLoot(actor) {
    let content =  `${ game.i18n.localize("WITCHER.Loot.MultipleExport")} <input type="number" class="small" name="multiple" value=1><br />`
    let cancel = true
    let multiplier = 0
    let dialogData = {
        buttons : [
        [`${game.i18n.localize("WITCHER.Button.Cancel")}`, ()=>{} ],
        [`${game.i18n.localize("WITCHER.Button.Continue")}`, (html)=>{  
            multiplier = html.find("[name=multiple]")[0].value;
            cancel = false
        } ]
    ],
        title : game.i18n.localize("WITCHER.Monster.exportLoot"),
        content : content
    }
    await buttonDialog(dialogData)
    if (cancel) {
        return
    } else {

        let newLoot = await Actor.create(actor);
        await newLoot.update({
            "folder": null,
            "name" : newLoot.name + "--" + `${game.i18n.localize("WITCHER.Loot.Name")}`,
            "type" : "loot"
        });
        
        newLoot.items.forEach(async item=>{
            let newQuantity = item.system.quantity
            if (typeof(newQuantity) === 'string' && item.system.quantity.includes("d")){
                let total = 0
                for (let i = 0; i < multiplier; i++) {
                    let roll = await new Roll(item.system.quantity).evaluate({async: true})
                    total +=  Math.ceil(roll.total)
                }
                newQuantity = total
            } else {
                
                newQuantity = Number(newQuantity) * multiplier
            }
            item.update({ 'system.quantity': newQuantity})
        });
    
        newLoot.sheet.render(true)

    }
}

export { onChangeSkillList, exportLoot};