/*
On any change to the Stats, the Derived Stats need to be updated appropriately. The base = Will+Body/2. HP and Stamina = base * 5.
Recovery and Stun = base. Stun can be a maximum of 10. Encumbrance = Body*10. Run = Speed*3. Leap = Run/5. Punch and Kick bonuses are determined 
with the Hand to Hand Table, page 48 of Witcher TRPG Handbook.

@param {Actor} actor - The actor passed in from actor-sheet.js to have its properties updated
*/
function updateDerived(actor){

    let thisActor = actor;

    let base = Math.floor((thisActor.data.data.stats.body.value+thisActor.data.data.stats.will.value)/2);
    let currentBody = thisActor.data.data.stats.body.value;

    let newHP = base*5;
    let newSta = base*5;
    let newRec = base;
    let newStun = base;
    let newEnc = thisActor.data.data.stats.body.value*10;
    let newRun = thisActor.data.data.core.spd.value*3;
    let newLeap = Math.floor(thisActor.data.data.derivedstats.run.value/5);

    let pBonus = 0;
    let kBonus = 0;

    switch(currentBody){
        case 1:
        case 2:
            pBonus = -4;
            break;
        case 3:
        case 4:
            pBonus = -2;
            kBonus = 2;
            break;
        case 5:
        case 6:
            pBonus = 0;
            kBonus = 4;
            break;
        case 7:
        case 8:
            pBonus = 2;
            kBonus = 6;
            break;
        case 9:
        case 10:
            pBonus = 4;
            kBonus = 8;
            break;
        case 11:
        case 12:
            pBonus = 6;
            kBonus = 10;
            break;
        case 13:
            pBonus = 8;
            kBonus = 12;
            break;
        default:
            pBonus = 0;
            kBonus = 0;
    }

    if(newStun > 10){
        newStun = 10;
    }

    thisActor.update({ 
        'data.core.hp.max': newHP,
        'data.core.sta.max': newSta,
        'data.derivedstats.rec.value': newRec,
        'data.derivedstats.stun.value': newStun,
        'data.derivedstats.enc.value': newEnc,
        'data.derivedstats.run.value': newRun,
        'data.derivedstats.leap.value': newLeap,
        'data.derivedstats.punch.value': `1d6+${pBonus}`,
        'data.derivedstats.kick.value': `1d6+${kBonus}`
     });

}

function rollSkillCheck(actor, statNum, skillNum){
    let thisActor = actor;
    let parentStat = "";
    let skillName = "";
    let base = 0;
    let array;

    switch(statNum){
        case 0:
            parentStat = game.i18n.localize("WITCHER.StInt");
            array = getIntSkillMod(thisActor, skillNum);
            skillName = array[0];
            base = array[1];
            break;
        case 1:
            parentStat = game.i18n.localize("WITCHER.StRef");
            array = getRefSkillMod(thisActor, skillNum);
            skillName = array[0];
            base = array[1];
            break;
        case 2:
            parentStat = game.i18n.localize("WITCHER.StDex");
            array = getDexSkillMod(thisActor, skillNum);
            skillName = array[0];
            base = array[1];
            break;
        case 3:
            parentStat = game.i18n.localize("WITCHER.StBody");
            array = getBodySkillMod(thisActor, skillNum);
            skillName = array[0];
            base = array[1];
            break;
        case 4:
            parentStat = game.i18n.localize("WITCHER.StEmp");
            array = getEmpSkillMod(thisActor, skillNum);
            skillName = array[0];
            base = array[1];
            break;
        case 5:
            parentStat = game.i18n.localize("WITCHER.StCra");
            array = getCraSkillMod(thisActor, skillNum);
            skillName = array[0];
            base = array[1];
            break;
        case 6:
            parentStat = game.i18n.localize("WITCHER.StWill");
            array = getWillSkillMod(thisActor, skillNum);
            skillName = array[0];
            base = array[1];
            break;
    }

    new Dialog({
        title: `Skill Check`, 
        content: `${parentStat}: ${skillName} Check`,
        buttons: {
          rollCheck: {
            label: "Roll Check", 
            callback: (html) => {
              let roll = new Roll(`1d10+${base}`).roll();
              roll.toMessage({
                rollMode: 'roll',
                speaker: {alias: thisActor.data.data.general.name},
                flavor: `${parentStat}: ${skillName} Check`,
              })      
            }//end callback for rollCheck
          },
          close: {
            label: "Close"
          }
        }
      }).render(true)  
    
}

function getIntSkillMod(actor, skillNum){

    let statVal = actor.data.data.stats.int.value;
    let skillName = ``;
    let totalBase = 0;

    switch(skillNum){
        case 0:
            skillName = game.i18n.localize("WITCHER.SkIntAwareness");
            totalBase = statVal + actor.data.data.skills.int.awareness.value;
            break;
        case 1:
            skillName = game.i18n.localize("WITCHER.SkIntBusiness");
            totalBase = statVal + actor.data.data.skills.int.business.value;
            break;
        case 2:
            skillName = game.i18n.localize("WITCHER.SkIntDeduction");
            totalBase = statVal + actor.data.data.skills.int.deduction.value;
            break;  
        case 3:
            skillName = game.i18n.localize("WITCHER.SkIntEducation");
            totalBase = statVal + actor.data.data.skills.int.education.value;
            break;
        case 4:
            skillName = game.i18n.localize("WITCHER.SkIntCommon");
            totalBase = statVal + actor.data.data.skills.int.commonsp.value;
            break;
        case 5:
            skillName = game.i18n.localize("WITCHER.SkIntElder");
            totalBase = statVal + actor.data.data.skills.int.eldersp.value;
            break;
        case 6:
            skillName = game.i18n.localize("WITCHER.SkIntDwarven");
            totalBase = statVal + actor.data.data.skills.int.dwarven.value;
            break;
        case 7:
            skillName = game.i18n.localize("WITCHER.SkIntMonster");
            totalBase = statVal + actor.data.data.skills.int.monster.value;
            break;  
        case 8:
            skillName = game.i18n.localize("WITCHER.SkIntSocialEt");
            totalBase = statVal + actor.data.data.skills.int.socialetq.value;
            break;
        case 9:
            skillName = game.i18n.localize("WITCHER.SkIntStreet");
            totalBase = statVal + actor.data.data.skills.int.streetwise.value;
            break;
        case 10:
            skillName = game.i18n.localize("WITCHER.SkIntTactics");
            totalBase = statVal + actor.data.data.skills.int.tactics.value;
            break;
        case 11:
            skillName = game.i18n.localize("WITCHER.SkIntTeaching");
            totalBase = statVal + actor.data.data.skills.int.teaching.value;
            break;
        case 12:
            skillName = game.i18n.localize("WITCHER.SkIntWilderness");
            totalBase = statVal + actor.data.data.skills.int.wilderness.value;
            break;  
    }

    return [skillName, totalBase];
}

function getRefSkillMod(actor, skillNum){

    let statVal = actor.data.data.stats.ref.value;
    let skillName = ``;
    let totalBase = 0;

    switch(skillNum){
        case 0:
            skillName = game.i18n.localize("WITCHER.SkRefBrawling");
            totalBase = statVal + actor.data.data.skills.ref.brawling.value;
            break;
        case 1:
            skillName = game.i18n.localize("WITCHER.SkRefDodge");
            totalBase = statVal + actor.data.data.skills.ref.dodge.value;
            break;
        case 2:
            skillName = game.i18n.localize("WITCHER.SkRefMelee");
            totalBase = statVal + actor.data.data.skills.ref.melee.value;
            break;  
        case 3:
            skillName = game.i18n.localize("WITCHER.SkRefRiding");
            totalBase = statVal + actor.data.data.skills.ref.riding.value;
            break;
        case 4:
            skillName = game.i18n.localize("WITCHER.SkRefSailing");
            totalBase = statVal + actor.data.data.skills.ref.sailing.value;
            break;
        case 5:
            skillName = game.i18n.localize("WITCHER.SkRefSmall");
            totalBase = statVal + actor.data.data.skills.ref.smallblades.value;
            break;
        case 6:
            skillName = game.i18n.localize("WITCHER.SkRefStaff");
            totalBase = statVal + actor.data.data.skills.ref.staffspear.value;
            break;
        case 7:
            skillName = game.i18n.localize("WITCHER.SkRefSwordmanship");
            totalBase = statVal + actor.data.data.skills.ref.swordsmanship.value;
            break;
    }

    return [skillName, totalBase];
}

function getDexSkillMod(actor, skillNum){

    let statVal = actor.data.data.stats.dex.value;
    let skillName = ``;
    let totalBase = 0;

    switch(skillNum){
        case 0:
            skillName = game.i18n.localize("WITCHER.SkDexArchery");
            totalBase = statVal + actor.data.data.skills.dex.archery.value;
            break;
        case 1:
            skillName = game.i18n.localize("WITCHER.SkDexAthletics");
            totalBase = statVal + actor.data.data.skills.dex.athletics.value;
            break;
        case 2:
            skillName = game.i18n.localize("WITCHER.SkDexCrossbow");
            totalBase = statVal + actor.data.data.skills.dex.crossbow.value;
            break;  
        case 3:
            skillName = game.i18n.localize("WITCHER.SkDexSleight");
            totalBase = statVal + actor.data.data.skills.dex.sleight.value;
            break;
        case 4:
            skillName = game.i18n.localize("WITCHER.SkDexStealth");
            totalBase = statVal + actor.data.data.skills.dex.stealth.value;
            break;
    }

    return [skillName, totalBase];
}

function getBodySkillMod(actor, skillNum){

    let statVal = actor.data.data.stats.body.value;
    let skillName = ``;
    let totalBase = 0;

    switch(skillNum){
        case 0:
            skillName = game.i18n.localize("WITCHER.SkBodyPhys");
            totalBase = statVal + actor.data.data.skills.body.physique.value;
            break;
        case 1:
            skillName = game.i18n.localize("WITCHER.SkBodyEnd");
            totalBase = statVal + actor.data.data.skills.body.endurance.value;
            break;
    }

    return [skillName, totalBase];
}

function getEmpSkillMod(actor, skillNum){

    let statVal = actor.data.data.stats.emp.value;
    let skillName = ``;
    let totalBase = 0;

    switch(skillNum){
        case 0:
            skillName = game.i18n.localize("WITCHER.SkEmpCharisma");
            totalBase = statVal + actor.data.data.skills.emp.charisma.value;
            break;
        case 1:
            skillName = game.i18n.localize("WITCHER.SkEmpDeceit");
            totalBase = statVal + actor.data.data.skills.emp.deceit.value;
            break;
        case 2:
            skillName = game.i18n.localize("WITCHER.SkEmpArts");
            totalBase = statVal + actor.data.data.skills.emp.finearts.value;
            break;  
        case 3:
            skillName = game.i18n.localize("WITCHER.SkEmpGambling");
            totalBase = statVal + actor.data.data.skills.emp.gambling.value;
            break;
        case 4:
            skillName = game.i18n.localize("WITCHER.SkEmpGrooming");
            totalBase = statVal + actor.data.data.skills.emp.grooming.value;
            break;
        case 5:
            skillName = game.i18n.localize("WITCHER.SkEmpHumanPerc");
            totalBase = statVal + actor.data.data.skills.emp.perception.value;
            break;
        case 6:
            skillName = game.i18n.localize("WITCHER.SkEmpLeadership");
            totalBase = statVal + actor.data.data.skills.emp.leadership.value;
            break;
        case 7:
            skillName = game.i18n.localize("WITCHER.SkEmpPersuasion");
            totalBase = statVal + actor.data.data.skills.emp.persuasion.value;
            break;  
        case 8:
            skillName = game.i18n.localize("WITCHER.SkEmpPerformance");
            totalBase = statVal + actor.data.data.skills.emp.performance.value;
            break;
        case 9:
            skillName = game.i18n.localize("WITCHER.SkEmpSeduction");
            totalBase = statVal + actor.data.data.skills.emp.seduction.value;
            break;
    }

    return [skillName, totalBase];
}

function getCraSkillMod(actor, skillNum){

    let statVal = actor.data.data.stats.cra.value;
    let skillName = ``;
    let totalBase = 0;

    switch(skillNum){
        case 0:
            skillName = game.i18n.localize("WITCHER.SkCraAlchemy");
            totalBase = statVal + actor.data.data.skills.cra.alchemy.value;
            break;
        case 1:
            skillName = game.i18n.localize("WITCHER.SkCraCrafting");
            totalBase = statVal + actor.data.data.skills.cra.crafting.value;
            break;
        case 2:
            skillName = game.i18n.localize("WITCHER.SkCraDisguise");
            totalBase = statVal + actor.data.data.skills.cra.disguise.value;
            break;  
        case 3:
            skillName = game.i18n.localize("WITCHER.SkCraAid");
            totalBase = statVal + actor.data.data.skills.cra.firstaid.value;
            break;
        case 4:
            skillName = game.i18n.localize("WITCHER.SkCraForge");
            totalBase = statVal + actor.data.data.skills.cra.forgery.value;
            break;
        case 5:
            skillName = game.i18n.localize("WITCHER.SkCraPick");
            totalBase = statVal + actor.data.data.skills.cra.picklock.value;
            break;
        case 6:
            skillName = game.i18n.localize("WITCHER.SkCraTrapCraft");
            totalBase = statVal + actor.data.data.skills.cra.trapcraft.value;
            break;
    }

    return [skillName, totalBase];
}

function getWillSkillMod(actor, skillNum){

    let statVal = actor.data.data.stats.will.value;
    let skillName = ``;
    let totalBase = 0;

    switch(skillNum){
        case 0:
            skillName = game.i18n.localize("WITCHER.SkWillCourage");
            totalBase = statVal + actor.data.data.skills.will.courage.value;
            break;
        case 1:
            skillName = game.i18n.localize("WITCHER.SkWillHex");
            totalBase = statVal + actor.data.data.skills.will.hexweave.value;
            break;
        case 2:
            skillName = game.i18n.localize("WITCHER.SkWillIntim");
            totalBase = statVal + actor.data.data.skills.will.intimidation.value;
            break;  
        case 3:
            skillName = game.i18n.localize("WITCHER.SkWillSpellcast");
            totalBase = statVal + actor.data.data.skills.will.spellcast.value;
            break;
        case 4:
            skillName = game.i18n.localize("WITCHER.SkWillResistMag");
            totalBase = statVal + actor.data.data.skills.will.resistmagic.value;
            break;
        case 5:
            skillName = game.i18n.localize("WITCHER.SkWillResistCoer");
            totalBase = statVal + actor.data.data.skills.will.resistcoerc.value;
            break;
        case 6:
            skillName = game.i18n.localize("WITCHER.SkWillRitCraft");
            totalBase = statVal + actor.data.data.skills.will.ritcraft.value;
            break;
    }

    return [skillName, totalBase];
}
export { updateDerived, rollSkillCheck };