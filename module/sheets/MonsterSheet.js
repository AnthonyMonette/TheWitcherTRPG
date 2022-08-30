import { buttonDialog } from "../chat.js";

function onChangeSkillList(actor) {
    let content = ``
    for (let parent in actor.data.data.skills) {
        let skills =  actor.data.data.skills[parent]
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
                actor.update({ 'data.skills.int.awareness.isVisible': html.find("[name=displayawareness]").prop("checked"),
                    'data.skills.int.business.isVisible': html.find("[name=displaybusiness]").prop("checked"),
                    'data.skills.int.deduction.isVisible': html.find("[name=displaydeduction]").prop("checked"),
                    'data.skills.int.education.isVisible': html.find("[name=displayeducation]").prop("checked"),
                    'data.skills.int.commonsp.isVisible': html.find("[name=displaycommonsp]").prop("checked"),
                    'data.skills.int.eldersp.isVisible': html.find("[name=displayeldersp]").prop("checked"),
                    'data.skills.int.dwarven.isVisible': html.find("[name=displaydwarven]").prop("checked"),
                    'data.skills.int.monster.isVisible': html.find("[name=displaymonster]").prop("checked"),
                    'data.skills.int.socialetq.isVisible': html.find("[name=displaysocialetq]").prop("checked"),
                    'data.skills.int.streetwise.isVisible': html.find("[name=displaystreetwise]").prop("checked"),
                    'data.skills.int.tactics.isVisible': html.find("[name=displaytactics]").prop("checked"),
                    'data.skills.int.teaching.isVisible': html.find("[name=displayteaching]").prop("checked"),
                    'data.skills.int.wilderness.isVisible': html.find("[name=displaywilderness]").prop("checked"),
                    'data.skills.ref.brawling.isVisible': html.find("[name=displaybrawling]").prop("checked"),
                    'data.skills.ref.dodge.isVisible': html.find("[name=displaydodge]").prop("checked"),
                    'data.skills.ref.melee.isVisible': html.find("[name=displaymelee]").prop("checked"),
                    'data.skills.ref.riding.isVisible': html.find("[name=displayriding]").prop("checked"),
                    'data.skills.ref.sailing.isVisible': html.find("[name=displaysailing]").prop("checked"),
                    'data.skills.ref.smallblades.isVisible': html.find("[name=displaysmallblades]").prop("checked"),
                    'data.skills.ref.staffspear.isVisible': html.find("[name=displaystaffspear]").prop("checked"),
                    'data.skills.ref.swordsmanship.isVisible': html.find("[name=displayswordsmanship]").prop("checked"),
                    'data.skills.will.courage.isVisible': html.find("[name=displaycourage]").prop("checked"),
                    'data.skills.will.hexweave.isVisible': html.find("[name=displayhexweave]").prop("checked"),
                    'data.skills.will.intimidation.isVisible': html.find("[name=displayintimidation]").prop("checked"),
                    'data.skills.will.spellcast.isVisible': html.find("[name=displayspellcast]").prop("checked"),
                    'data.skills.will.resistmagic.isVisible': html.find("[name=displayresistmagic]").prop("checked"),
                    'data.skills.will.resistcoerc.isVisible': html.find("[name=displayresistcoerc]").prop("checked"),
                    'data.skills.will.ritcraft.isVisible': html.find("[name=displayritcraft]").prop("checked"),
                    'data.skills.dex.archery.isVisible': html.find("[name=displayarchery]").prop("checked"),
                    'data.skills.dex.athletics.isVisible': html.find("[name=displayathletics]").prop("checked"),
                    'data.skills.dex.crossbow.isVisible': html.find("[name=displaycrossbow]").prop("checked"),
                    'data.skills.dex.sleight.isVisible': html.find("[name=displaysleight]").prop("checked"),
                    'data.skills.dex.stealth.isVisible': html.find("[name=displaystealth]").prop("checked"),
                    'data.skills.cra.alchemy.isVisible': html.find("[name=displayalchemy]").prop("checked"),
                    'data.skills.cra.crafting.isVisible': html.find("[name=displaycrafting]").prop("checked"),
                    'data.skills.cra.disguise.isVisible': html.find("[name=displaydisguise]").prop("checked"),
                    'data.skills.cra.firstaid.isVisible': html.find("[name=displayfirstaid]").prop("checked"),
                    'data.skills.cra.forgery.isVisible': html.find("[name=displayforgery]").prop("checked"),
                    'data.skills.cra.picklock.isVisible': html.find("[name=displaypicklock]").prop("checked"),
                    'data.skills.cra.trapcraft.isVisible': html.find("[name=displaytrapcraft]").prop("checked"),
                    'data.skills.body.physique.isVisible': html.find("[name=displayphysique]").prop("checked"),
                    'data.skills.body.endurance.isVisible': html.find("[name=displayendurance]").prop("checked"),
                    'data.skills.emp.charisma.isVisible': html.find("[name=displaycharisma]").prop("checked"),
                    'data.skills.emp.deceit.isVisible': html.find("[name=displaydeceit]").prop("checked"),
                    'data.skills.emp.finearts.isVisible': html.find("[name=displayfinearts]").prop("checked"),
                    'data.skills.emp.gambling.isVisible': html.find("[name=displaygambling]").prop("checked"),
                    'data.skills.emp.grooming.isVisible': html.find("[name=displaygrooming]").prop("checked"),
                    'data.skills.emp.perception.isVisible': html.find("[name=displayperception]").prop("checked"),
                    'data.skills.emp.leadership.isVisible': html.find("[name=displayleadership]").prop("checked"),
                    'data.skills.emp.persuasion.isVisible': html.find("[name=displaypersuasion]").prop("checked"),
                    'data.skills.emp.performance.isVisible': html.find("[name=displayperformance]").prop("checked"),
                    'data.skills.emp.seduction.isVisible': html.find("[name=displayseduction]").prop("checked"),
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

        let newLoot = await Actor.create(actor.data);
        await newLoot.update({
            "folder": null,
            "name" : newLoot.data.name + "--loot",
            "type" : "loot"
        });
        
        newLoot.items.forEach(async item=>{
            let newQuantity = item.data.data.quantity
            if (typeof(newQuantity) === 'string' && item.data.data.quantity.includes("d")){
                let total = 0
                for (let i = 0; i < multiplier; i++) {
                    let roll = await new Roll(item.data.data.quantity).roll()
                    total +=  Math.ceil(roll.total)
                }
                newQuantity = total
            } else {
                
                newQuantity = Number(newQuantity) * multiplier
            }
            item.update({ 'data.quantity': newQuantity})
        });
    
        newLoot.sheet.render(true)

    }
}

export { onChangeSkillList, exportLoot};