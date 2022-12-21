import { extendedRoll } from "../module/chat.js";

export function getRandomInt(max) {
	return Math.floor(Math.random() * (max + 1)) + 1;
}

/*
On any change to the Stats, the Derived Stats need to be updated appropriately. The base = Will+Body/2. HP and Stamina = base * 5.
Recovery and Stun = base. Stun can be a maximum of 10. Encumbrance = Body*10. Run = Speed*3. Leap = Run/5. Punch and Kick bonuses are determined 
with the Hand to Hand Table, page 48 of Witcher TRPG Handbook.

@param {Actor} actor - The actor passed in from actor-sheet.js to have its properties updated
*/
function updateDerived(actor){
	const thisActor = actor;
	const stats = thisActor.system.stats;
	const base = Math.floor((stats.body.current + stats.will.current)/2);
	const baseMax = Math.floor((stats.body.max + stats.will.max)/2);
	const meleeBonus = Math.ceil((stats.body.current-6)/2)*2;

	let intTotalModifiers = 0;
	let refTotalModifiers = 0;
	let dexTotalModifiers = 0;
	let bodyTotalModifiers = 0;
	let spdTotalModifiers = 0;
	let empTotalModifiers = 0;
	let craTotalModifiers = 0;
	let willTotalModifiers = 0;
	let luckTotalModifiers = 0;
	let intDivider = 1;
	let refDivider = 1;
	let dexDivider = 1;
	let bodyDivider = 1;
	let spdDivider = 1;
	let empDivider = 1;
	let craDivider = 1;
	let willDivider = 1;
	let luckDivider = 1;
	thisActor.system.stats.int.modifiers.forEach(item => intTotalModifiers += Number(item.value));
	thisActor.system.stats.ref.modifiers.forEach(item => refTotalModifiers += Number(item.value));
	thisActor.system.stats.dex.modifiers.forEach(item => dexTotalModifiers += Number(item.value));
	thisActor.system.stats.body.modifiers.forEach(item => bodyTotalModifiers += Number(item.value));
	thisActor.system.stats.spd.modifiers.forEach(item => spdTotalModifiers += Number(item.value));
	thisActor.system.stats.emp.modifiers.forEach(item => empTotalModifiers += Number(item.value));
	thisActor.system.stats.cra.modifiers.forEach(item => craTotalModifiers += Number(item.value));
	thisActor.system.stats.will.modifiers.forEach(item => willTotalModifiers += Number(item.value));
	thisActor.system.stats.luck.modifiers.forEach(item => luckTotalModifiers += Number(item.value));
	
	let activeEffects =  thisActor.items.filter(function(item) {return item.type=="effect"});
	activeEffects.forEach(item => {
		if (!item.system.isActive) {
			return
		}
		item.system.stats.forEach(stat => {
			switch(stat.stat){
				case "WITCHER.Actor.Stat.Int": 
					if (stat.modifier.includes("/")){intDivider = Number(stat.modifier.replace("/", ''));}
					else {intTotalModifiers += Number(stat.modifier)}
					break;
				case "WITCHER.Actor.Stat.Ref":
					if (stat.modifier.includes("/")){refDivider = Number(stat.modifier.replace("/", ''));}
					else {refTotalModifiers += Number(stat.modifier)}
					break;
				case "WITCHER.Actor.Stat.Dex":
					if (stat.modifier.includes("/")){dexDivider = Number(stat.modifier.replace("/", ''));}
					else {dexTotalModifiers += Number(stat.modifier)}
					break;
				case "WITCHER.Actor.Stat.Body":
					if (stat.modifier.includes("/")){bodyDivider = Number(stat.modifier.replace("/", ''));}
					else {bodyTotalModifiers += Number(stat.modifier)}
					break;
				case "WITCHER.Actor.Stat.Spd": 
					if (stat.modifier.includes("/")){spdDivider = Number(stat.modifier.replace("/", ''));}
					else {spdTotalModifiers += Number(stat.modifier)}
					break;
				case "WITCHER.Actor.Stat.Emp":
					if (stat.modifier.includes("/")){empDivider = Number(stat.modifier.replace("/", ''));}
					else {empTotalModifiers += Number(stat.modifier)}
					break;
				case "WITCHER.Actor.Stat.Cra":
					if (stat.modifier.includes("/")){craDivider = Number(stat.modifier.replace("/", ''));}
					else {craTotalModifiers += Number(stat.modifier)}
					break;
				case "WITCHER.Actor.Stat.Will":
					if (stat.modifier.includes("/")){willDivider = Number(stat.modifier.replace("/", ''));}
					else {willTotalModifiers += Number(stat.modifier)}
					break;
				case "WITCHER.Actor.Stat.Luck":
					if (stat.modifier.includes("/")){luckDivider = Number(stat.modifier.replace("/", ''));}
					else {luckTotalModifiers += Number(stat.modifier)}
					break;
			}
		})});

	let stunTotalModifiers = 0;
	let runTotalModifiers = 0;
	let leapTotalModifiers = 0;
	let encTotalModifiers = 0;
	let recTotalModifiers = 0;
	let wtTotalModifiers = 0;
	let stunDivider = 1;
	let runDivider = 1;
	let leapDivider = 1;
	let encDivider = 1;
	let recDivider = 1;
	let wtDivider= 1;
	thisActor.system.coreStats.stun.modifiers.forEach(item => stunTotalModifiers += Number(item.value));
	thisActor.system.coreStats.run.modifiers.forEach(item => runTotalModifiers += Number(item.value));
	thisActor.system.coreStats.leap.modifiers.forEach(item => leapTotalModifiers += Number(item.value));
	thisActor.system.coreStats.enc.modifiers.forEach(item => encTotalModifiers += Number(item.value));
	thisActor.system.coreStats.rec.modifiers.forEach(item => recTotalModifiers += Number(item.value));
	thisActor.system.coreStats.woundTreshold.modifiers.forEach(item => wtTotalModifiers += Number(item.value));

	let curentEncumbrance = (thisActor.system.stats.body.max + bodyTotalModifiers) * 10  + encTotalModifiers
	var totalWeights = 0
	thisActor.items.forEach(item => {if (item.system.weight && item.system.quantity) {totalWeights += (Number(item.system.weight) *  Number(item.system.quantity))}})
	totalWeights += calc_currency_weight(thisActor.system.currency);
	let encDiff = 0
	if (curentEncumbrance < totalWeights){
		encDiff = Math.ceil((totalWeights-curentEncumbrance) / 5)
	}
	let armorEnc = getArmorEcumbrance(thisActor)

	activeEffects.forEach(item => {
		if (!item.system.isActive) {
			return
		}
		item.system.derived.forEach(derived => {
			switch(derived.derivedStat){
				case "WITCHER.Actor.CoreStat.Stun":
					if (derived.modifier.includes("/")){stunDivider = Number(derived.modifier.replace("/", ''));}
					else {stunTotalModifiers += Number(derived.modifier)}
					break;
				case "WITCHER.Actor.CoreStat.Run":
					if (derived.modifier.includes("/")){runDivider = Number(derived.modifier.replace("/", ''));}
					else {runTotalModifiers += Number(derived.modifier)}
					break;
				case "WITCHER.Actor.CoreStat.Leap":
					if (derived.modifier.includes("/")){leapDivider = Number(derived.modifier.replace("/", ''));}
					else {leapTotalModifiers += Number(derived.modifier)}
					break;
				case "WITCHER.Actor.CoreStat.Enc":
					if (derived.modifier.includes("/")){encDivider = Number(derived.modifier.replace("/", ''));}
					else {encTotalModifiers += Number(derived.modifier)}
					break;
				case "WITCHER.Actor.CoreStat.Rec":
					if (derived.modifier.includes("/")){recDivider = Number(derived.modifier.replace("/", ''));}
					else {recTotalModifiers += Number(derived.modifier)}
					break;
				case "WITCHER.Actor.CoreStat.woundTreshold":
					if (derived.modifier.includes("/")){wtDivider = Number(derived.modifier.replace("/", ''));}
					else {wtTotalModifiers += Number(derived.modifier)}
					break;
			}
		})});

	let curInt =  Math.floor((thisActor.system.stats.int.max + intTotalModifiers) / intDivider);
	let curRef =  Math.floor((thisActor.system.stats.ref.max + refTotalModifiers - armorEnc - encDiff) / refDivider);
	let curDex =  Math.floor((thisActor.system.stats.dex.max + dexTotalModifiers - armorEnc - encDiff) / dexDivider);
	let curBody =  Math.floor((thisActor.system.stats.body.max + bodyTotalModifiers) / bodyDivider);
	let curSpd =  Math.floor((thisActor.system.stats.spd.max + spdTotalModifiers - encDiff) / spdDivider);
	let curEmp =  Math.floor((thisActor.system.stats.emp.max + empTotalModifiers) / empDivider);
	let curCra =  Math.floor((thisActor.system.stats.cra.max + craTotalModifiers) / craDivider);
	let curWill =  Math.floor((thisActor.system.stats.will.max + willTotalModifiers) / willDivider);
	let curLuck =  Math.floor((thisActor.system.stats.luck.max + luckTotalModifiers) / luckDivider);
	let isDead = false;
	let isWounded = false;
	let HPvalue = thisActor.system.derivedStats.hp.value;
	if (HPvalue <= 0) {
		isDead = true
		curInt = Math.floor((thisActor.system.stats.int.max + intTotalModifiers)/3/intDivider)
		curRef =Math.floor(( thisActor.system.stats.ref.max + refTotalModifiers - armorEnc - encDiff)/3/dexDivider)
		curDex = Math.floor((thisActor.system.stats.dex.max + dexTotalModifiers - armorEnc - encDiff)/3/refDivider)
		curBody = Math.floor((thisActor.system.stats.body.max + bodyTotalModifiers)/3/bodyDivider)
		curSpd = Math.floor((thisActor.system.stats.spd.max + spdTotalModifiers - encDiff)/3/spdDivider)
		curEmp = Math.floor((thisActor.system.stats.emp.max + empTotalModifiers)/3/empDivider)
		curCra = Math.floor((thisActor.system.stats.cra.max + craTotalModifiers)/3/craDivider)
		curWill = Math.floor((thisActor.system.stats.will.max + willTotalModifiers)/3/willDivider)
		curLuck = Math.floor((thisActor.system.stats.luck.max + luckTotalModifiers)/3/luckDivider)
	}
	else if (HPvalue < thisActor.system.coreStats.woundTreshold.current > 0) {
		isWounded = true
		curRef = Math.floor((thisActor.system.stats.ref.max + refTotalModifiers - armorEnc - encDiff)/2/refDivider)
		curDex = Math.floor((thisActor.system.stats.dex.max + dexTotalModifiers - armorEnc - encDiff)/2/dexDivider)
		curInt = Math.floor((thisActor.system.stats.int.max + intTotalModifiers)/2/intDivider)
		curWill = Math.floor((thisActor.system.stats.will.max + willTotalModifiers)/2/willDivider)
	}

	let hpTotalModifiers = 0;
	let staTotalModifiers = 0;
	let resTotalModifiers = 0;
	let focusTotalModifiers = 0;
	let hpDivider = 1;
	let staDivider = 1;
	thisActor.system.derivedStats.hp.modifiers.forEach(item => hpTotalModifiers += Number(item.value));
	thisActor.system.derivedStats.sta.modifiers.forEach(item => staTotalModifiers += Number(item.value));
	thisActor.system.derivedStats.resolve.modifiers.forEach(item => resTotalModifiers += Number(item.value));
	thisActor.system.derivedStats.focus.modifiers.forEach(item => focusTotalModifiers += Number(item.value));
	activeEffects.forEach(item => {
		item.system.derived.forEach(derived => {
			switch(derived.derivedStat){
				case "WITCHER.Actor.DerStat.HP": 
					if (derived.modifier.includes("/")){hpDivider = Number(derived.modifier.replace("/", ''));}
					else {hpTotalModifiers += Number(derived.modifier)}
					break;
				case "WITCHER.Actor.DerStat.Sta":
					if (derived.modifier.includes("/")){staDivider = Number(derived.modifier.replace("/", ''));}
					else {staTotalModifiers += Number(derived.modifier)}
					break;
			}
		})});

	let curHp = thisActor.system.derivedStats.hp.max + hpTotalModifiers;
	let curSta = thisActor.system.derivedStats.sta.max + staTotalModifiers;
	let curRes = thisActor.system.derivedStats.resolve.max + resTotalModifiers;
	let curFocus = thisActor.system.derivedStats.focus.max + focusTotalModifiers;

	
	let unmodifiedMaxHp = baseMax * 5

	if (thisActor.system.customStat != true){
		curHp = Math.floor((base * 5 + hpTotalModifiers)/hpDivider)
		curSta = Math.floor((base * 5 + staTotalModifiers)/staDivider) 
		curRes = (Math.floor((curWill + curInt)/2)*5) + resTotalModifiers
		curFocus = (Math.floor((curWill + curInt)/2)*3) + focusTotalModifiers
	}

	thisActor.update({ 
        'system.deathStateApplied': isDead,
        'system.woundTresholdApplied': isWounded,
        'system.stats.int.current': curInt,
        'system.stats.ref.current': curRef,
        'system.stats.dex.current': curDex,
        'system.stats.body.current': curBody,
        'system.stats.spd.current': curSpd,
        'system.stats.emp.current': curEmp,
        'system.stats.cra.current': curCra,
        'system.stats.will.current': curWill,
        'system.stats.luck.current': curLuck,

		'system.derivedStats.hp.max': curHp,
		'system.derivedStats.hp.unmodifiedMax': unmodifiedMaxHp,
		'system.derivedStats.sta.max': curSta,
		'system.derivedStats.resolve.max': curRes,
		'system.derivedStats.focus.max': curFocus,

		'system.coreStats.stun.current': Math.floor((Math.clamped(base, 1, 10) + stunTotalModifiers)/stunDivider),
		'system.coreStats.stun.max': Math.clamped(baseMax, 1, 10),

		'system.coreStats.enc.current': Math.floor((stats.body.current*10  + encTotalModifiers)/encDivider),
		'system.coreStats.enc.max': stats.body.current*10,

		'system.coreStats.run.current':  Math.floor((stats.spd.current*3 +runTotalModifiers)/runDivider),
		'system.coreStats.run.max': stats.spd.current*3,

		'system.coreStats.leap.current': Math.floor((stats.spd.current*3/5)+leapTotalModifiers)/leapDivider,
		'system.coreStats.leap.max': Math.floor(stats.spd.max*3/5),

		'system.coreStats.rec.current': Math.floor((base + recTotalModifiers)/recDivider),
		'system.coreStats.rec.max': baseMax,
		
		'system.coreStats.woundTreshold.current': Math.floor((baseMax+wtTotalModifiers)/wtDivider),
		'system.coreStats.woundTreshold.max': baseMax,

		'system.attackStats.meleeBonus': meleeBonus,
		'system.attackStats.punch.value': `1d6+${meleeBonus}`,
		'system.attackStats.kick.value': `1d6+${4 + meleeBonus}`,
	});
}

function getArmorEcumbrance(actor){
	let encumbranceModifier = 0
	let armors = actor.items.filter(function(item) {return item.type=="armor"});
	armors.forEach(item => {
		if (item.system.equiped || item.system.equiped == "checked") {
			encumbranceModifier += item.system.encumb
		}
	});
	return encumbranceModifier
}

function rollSkillCheck(thisActor, statNum, skillNum){
    let parentStat = "";
    let skillName = "";
    let stat = 0;
    let skill = 0;
    let array;

	switch(statNum){
		case 0:
			parentStat = game.i18n.localize("WITCHER.StInt");
			array = getIntSkillMod(thisActor, skillNum);
			stat = thisActor.system.stats.int.current;
			break;
		case 1:
			parentStat = game.i18n.localize("WITCHER.StRef");
			array = getRefSkillMod(thisActor, skillNum);
			stat = thisActor.system.stats.ref.current;
			break;
		case 2:
			parentStat = game.i18n.localize("WITCHER.StDex");
			array = getDexSkillMod(thisActor, skillNum);
			stat = thisActor.system.stats.dex.current;
			break;
		case 3:
			parentStat = game.i18n.localize("WITCHER.StBody");
			array = getBodySkillMod(thisActor, skillNum);
			stat = thisActor.system.stats.body.current;
			break;
		case 4:
			parentStat = game.i18n.localize("WITCHER.StEmp");
			array = getEmpSkillMod(thisActor, skillNum);
			stat = thisActor.system.stats.emp.current;
			break;
		case 5:
			parentStat = game.i18n.localize("WITCHER.StCra");
			array = getCraSkillMod(thisActor, skillNum);
			stat = thisActor.system.stats.cra.current;
			break;
		case 6:
			parentStat = game.i18n.localize("WITCHER.StWill");
			array = getWillSkillMod(thisActor, skillNum);
			stat = thisActor.system.stats.will.current;
			break;
	}
	let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

	skillName = array[0];
	skill = array[1];
	skillName = skillName.replace(" (2)", "");
	let messageData = {
		speaker: thisActor.getSpeaker(),
		flavor: `${parentStat}: ${skillName} Check`,
	}
	let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${parentStat}]+${skill}[${skillName}]` ;
	if (thisActor.type == "character") {
		if (statNum == 4 && (skillNum == 0 || skillNum == 6 || skillNum == 7 || skillNum == 9)){
			if (thisActor.system.general.socialStanding == "tolerated" || thisActor.system.general.socialStanding == "toleratedFeared") {
				rollFormula += !displayRollDetails ? `-1` : `-1[${game.i18n.localize("WITCHER.socialStanding.tolerated")}]` ;
			} else if (thisActor.system.general.socialStanding == "hated" || thisActor.system.general.socialStanding == "hatedFeared") {
				rollFormula += !displayRollDetails ? `-2` : `-2[${game.i18n.localize("WITCHER.socialStanding.hated")}]` ;
			} 
		}
		if (statNum == 4 && skillNum == 0 && (thisActor.system.general.socialStanding == "feared" || thisActor.system.general.socialStanding == "hatedFeared" || thisActor.system.general.socialStanding == "toleratedFeared")){
			rollFormula += !displayRollDetails ? `-1` : `-1[${game.i18n.localize("WITCHER.socialStanding.feared")}]` ;
		}
		if (statNum == 6 && skillNum == 2 && (thisActor.system.general.socialStanding == "feared" || thisActor.system.general.socialStanding == "hatedFeared" || thisActor.system.general.socialStanding == "toleratedFeared")){
			rollFormula += !displayRollDetails ? `+1` : `+1[${game.i18n.localize("WITCHER.socialStanding.feared")}]` ;
		}
	}

	if (array[2]) {
		rollFormula = addModifiers(array[2], rollFormula)
	}

	let activeEffects =  thisActor.items.filter(function(item) {return item.type=="effect"});
	activeEffects.forEach(item => {
		if (!item.system.isActive) {
			return
		}
		item.system.skills.forEach(skill => {
			if (skillName == game.i18n.localize(skill.skill)){
				if (skill.modifier.includes("/")){rollFormula += !displayRollDetails ? `/${Number(skill.modifier.replace("/", ''))}` : `/${Number(skill.modifier.replace("/", ''))}[${item.name}]`}
				else {rollFormula += !displayRollDetails ? `+${skill.modifier}` : `+${skill.modifier}[${item.name}]`}
			}
		})});

	let armorEnc = getArmorEcumbrance(thisActor)
	if (armorEnc > 0 && (skillName == "Hex Weaving" || skillName == "Ritual Crafting" || skillName == "Spell Casting")){
		rollFormula += !displayRollDetails ? `-${armorEnc}`: `-${armorEnc}[${game.i18n.localize("WITCHER.Armor.EncumbranceValue")}]`
	}
	new Dialog({
		title: `${game.i18n.localize("WITCHER.Dialog.Skill")}: ${skillName}`, 
		content: `<label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input name="customModifiers" value=0></label>`,
		buttons: {
		  LocationRandom: {
			label: game.i18n.localize("WITCHER.Button.Continue"), 
			callback: async html => {
				let customAtt = html.find("[name=customModifiers]")[0].value;
				if (customAtt < 0){
					rollFormula += !displayRollDetails ? `${customAtt}`: `${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
				}
				if (customAtt > 0){
					rollFormula += !displayRollDetails ? `+${customAtt}` : `+${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
				}

              let result = await extendedRoll(rollFormula, messageData, 0, false)
              result.roll.toMessage(messageData);
			}
		  }
		}}).render(true) 
}

function getIntSkillMod(actor, skillNum){
	switch(skillNum){
		case 0:
			return [game.i18n.localize("WITCHER.SkIntAwareness"), actor.system.skills.int.awareness.value,  actor.system.skills.int.awareness.modifiers]
		case 1:
			return [game.i18n.localize("WITCHER.SkIntBusiness"), actor.system.skills.int.business.value, actor.system.skills.int.business.modifiers]
		case 2:
			return [game.i18n.localize("WITCHER.SkIntDeduction"), actor.system.skills.int.deduction.value, actor.system.skills.int.deduction.modifiers]
		case 3:
			return [game.i18n.localize("WITCHER.SkIntEducation"), actor.system.skills.int.education.value, actor.system.skills.int.education.modifiers]
		case 4:
			return [game.i18n.localize("WITCHER.SkIntCommon"), actor.system.skills.int.commonsp.value, actor.system.skills.int.commonsp.modifiers]
		case 5:
			return [game.i18n.localize("WITCHER.SkIntElder"), actor.system.skills.int.eldersp.value, actor.system.skills.int.eldersp.modifiers]
		case 6:
			return [game.i18n.localize("WITCHER.SkIntDwarven"), actor.system.skills.int.dwarven.value, actor.system.skills.int.dwarven.modifiers]
		case 7:
			return [game.i18n.localize("WITCHER.SkIntMonster"), actor.system.skills.int.monster.value, actor.system.skills.int.monster.modifiers]
		case 8:
			return [game.i18n.localize("WITCHER.SkIntSocialEt"), actor.system.skills.int.socialetq.value, actor.system.skills.int.socialetq.modifiers]
		case 9:
			return [game.i18n.localize("WITCHER.SkIntStreet"), actor.system.skills.int.streetwise.value, actor.system.skills.int.streetwise.modifiers]
		case 10:
			return [game.i18n.localize("WITCHER.SkIntTactics"), actor.system.skills.int.tactics.value, actor.system.skills.int.tactics.modifiers]
		case 11:
			return [game.i18n.localize("WITCHER.SkIntTeaching"), actor.system.skills.int.teaching.value, actor.system.skills.int.teaching.modifiers]
		case 12:
			return [game.i18n.localize("WITCHER.SkIntWilderness"), actor.system.skills.int.wilderness.value, actor.system.skills.int.wilderness.modifiers]
	}
}

function getRefSkillMod(actor, skillNum){
	switch(skillNum){
		case 0:
			return [game.i18n.localize("WITCHER.SkRefBrawling"), actor.system.skills.ref.brawling.value, actor.system.skills.ref.brawling.modifiers]
		case 1:
			return [game.i18n.localize("WITCHER.SkRefDodge"), actor.system.skills.ref.dodge.value, actor.system.skills.ref.dodge.modifiers]
		case 2:
			return [game.i18n.localize("WITCHER.SkRefMelee"), actor.system.skills.ref.melee.value, actor.system.skills.ref.melee.modifiers]
		case 3:
			return [game.i18n.localize("WITCHER.SkRefRiding"), actor.system.skills.ref.riding.value, actor.system.skills.ref.riding.modifiers]
		case 4:
			return [game.i18n.localize("WITCHER.SkRefSailing"), actor.system.skills.ref.sailing.value, actor.system.skills.ref.sailing.modifiers]
		case 5:
			return [game.i18n.localize("WITCHER.SkRefSmall"), actor.system.skills.ref.smallblades.value, actor.system.skills.ref.smallblades.modifiers]
		case 6:
			return [game.i18n.localize("WITCHER.SkRefStaff"), actor.system.skills.ref.staffspear.value, actor.system.skills.ref.staffspear.modifiers]
		case 7:
			return [game.i18n.localize("WITCHER.SkRefSwordsmanship"), actor.system.skills.ref.swordsmanship.value, actor.system.skills.ref.swordsmanship.modifiers]
	}
}

function getDexSkillMod(actor, skillNum){
	switch(skillNum){
		case 0:
			return [game.i18n.localize("WITCHER.SkDexArchery"), actor.system.skills.dex.archery.value, actor.system.skills.dex.archery.modifiers]
		case 1:
			return [game.i18n.localize("WITCHER.SkDexAthletics"), actor.system.skills.dex.athletics.value, actor.system.skills.dex.athletics.modifiers]
		case 2:
			return [game.i18n.localize("WITCHER.SkDexCrossbow"), actor.system.skills.dex.crossbow.value, actor.system.skills.dex.crossbow.modifiers]
		case 3:
			return [game.i18n.localize("WITCHER.SkDexSleight"), actor.system.skills.dex.sleight.value, actor.system.skills.dex.sleight.modifiers]
		case 4:
			return [game.i18n.localize("WITCHER.SkDexStealth"), actor.system.skills.dex.stealth.value, actor.system.skills.dex.stealth.modifiers]
	}
}

function getBodySkillMod(actor, skillNum){
	switch(skillNum){
		case 0:
			return [game.i18n.localize("WITCHER.SkBodyPhys"), actor.system.skills.body.physique.value, actor.system.skills.body.physique.modifiers]
		case 1:
			return [game.i18n.localize("WITCHER.SkBodyEnd"), actor.system.skills.body.endurance.value, actor.system.skills.body.endurance.modifiers]
	}
}

function getEmpSkillMod(actor, skillNum){
	switch(skillNum){
		case 0:
			return [game.i18n.localize("WITCHER.SkEmpCharisma"), actor.system.skills.emp.charisma.value, actor.system.skills.emp.charisma.modifiers]
		case 1:
			return [game.i18n.localize("WITCHER.SkEmpDeceit"), actor.system.skills.emp.deceit.value, actor.system.skills.emp.deceit.modifiers]
		case 2:
			return [game.i18n.localize("WITCHER.SkEmpArts"), actor.system.skills.emp.finearts.value, actor.system.skills.emp.finearts.modifiers]
		case 3:
			return [game.i18n.localize("WITCHER.SkEmpGambling"), actor.system.skills.emp.gambling.value, actor.system.skills.emp.gambling.modifiers]
		case 4:
			return [game.i18n.localize("WITCHER.SkEmpGrooming"), actor.system.skills.emp.grooming.value, actor.system.skills.emp.grooming.modifiers]
		case 5:
			return [game.i18n.localize("WITCHER.SkEmpHumanPerc"), actor.system.skills.emp.perception.value, actor.system.skills.emp.perception.modifiers]
		case 6:
			return [game.i18n.localize("WITCHER.SkEmpLeadership"), actor.system.skills.emp.leadership.value, actor.system.skills.emp.leadership.modifiers]
		case 7:
			return [game.i18n.localize("WITCHER.SkEmpPersuasion"), actor.system.skills.emp.persuasion.value, actor.system.skills.emp.persuasion.modifiers]
		case 8:
			return [game.i18n.localize("WITCHER.SkEmpPerformance"), actor.system.skills.emp.performance.value, actor.system.skills.emp.performance.modifiers]
		case 9:
			return [game.i18n.localize("WITCHER.SkEmpSeduction"), actor.system.skills.emp.seduction.value, actor.system.skills.emp.seduction.modifiers]
	}
}

function getCraSkillMod(actor, skillNum){
	switch(skillNum){
		case 0:
			return [game.i18n.localize("WITCHER.SkCraAlchemy"), actor.system.skills.cra.alchemy.value, actor.system.skills.cra.alchemy.modifiers]
		case 1:
			return [game.i18n.localize("WITCHER.SkCraCrafting"), actor.system.skills.cra.crafting.value, actor.system.skills.cra.crafting.modifiers]
		case 2:
			return [game.i18n.localize("WITCHER.SkCraDisguise"), actor.system.skills.cra.disguise.value, actor.system.skills.cra.disguise.modifiers]
		case 3:
			return [game.i18n.localize("WITCHER.SkCraAid"), actor.system.skills.cra.firstaid.value, actor.system.skills.cra.firstaid.modifiers]
		case 4:
			return [game.i18n.localize("WITCHER.SkCraForge"), actor.system.skills.cra.forgery.value, actor.system.skills.cra.forgery.modifiers]
		case 5:
			return [game.i18n.localize("WITCHER.SkCraPick"), actor.system.skills.cra.picklock.value, actor.system.skills.cra.picklock.modifiers]
		case 6:
			return [game.i18n.localize("WITCHER.SkCraTrapCraft"), actor.system.skills.cra.trapcraft.value, actor.system.skills.cra.trapcraft.modifiers]
	}
}

function getWillSkillMod(actor, skillNum){
	switch(skillNum){
		case 0:
			return [game.i18n.localize("WITCHER.SkWillCourage"), actor.system.skills.will.courage.value, actor.system.skills.will.courage.modifiers]
		case 1:
			return [game.i18n.localize("WITCHER.SkWillHex"), actor.system.skills.will.hexweave.value, actor.system.skills.will.hexweave.modifiers]
		case 2:
			return [game.i18n.localize("WITCHER.SkWillIntim"), actor.system.skills.will.intimidation.value, actor.system.skills.will.intimidation.modifiers]
		case 3:
			return [game.i18n.localize("WITCHER.SkWillSpellcast"), actor.system.skills.will.spellcast.value, actor.system.skills.will.spellcast.modifiers]
		case 4:
			return [game.i18n.localize("WITCHER.SkWillResistMag"), actor.system.skills.will.resistmagic.value, actor.system.skills.will.resistmagic.modifiers]
		case 5:
			return [game.i18n.localize("WITCHER.SkWillResistCoer"), actor.system.skills.will.resistcoerc.value, actor.system.skills.will.resistcoerc.modifiers]
		case 6:
			return [game.i18n.localize("WITCHER.SkWillRitCraft"), actor.system.skills.will.ritcraft.value, actor.system.skills.will.ritcraft.modifiers]
	}
}

function genId() {
		// Math.random should be unique because of its seeding algorithm.
		// Convert it to base 36 (numbers + letters), and grab the first 9 characters
		// after the decimal.
		return '_' + Math.random().toString(36).substr(2, 9);
	};
	
function calc_currency_weight(currency) {
	let totalPieces = 0;
	totalPieces += Number(currency.bizant);
	totalPieces += Number(currency.ducat);
	totalPieces += Number(currency.lintar);
	totalPieces += Number(currency.floren);
	totalPieces += Number(currency.crown);
	totalPieces += Number(currency.oren);
	totalPieces += Number(currency.falsecoin);
	return Number(totalPieces * 0.001)
}

function addModifiers(modifiers, formula) {
	let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
	modifiers.forEach(item => {
	  if (item.value < 0){
		formula +=  !displayRollDetails ? `${item.value}` :  `${item.value}[${item.name}]`
	  }
	  if (item.value > 0){
		formula += !displayRollDetails ? `+${item.value}`:  `+${item.value}[${item.name}]` 
	  }
	});
	return formula;
  }

export { updateDerived, rollSkillCheck, genId, calc_currency_weight, addModifiers};