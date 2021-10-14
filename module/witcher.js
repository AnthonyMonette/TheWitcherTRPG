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
	const stats = thisActor.data.data.stats;
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
	thisActor.data.data.stats.int.modifiers.forEach(item => intTotalModifiers += Number(item.value));
	thisActor.data.data.stats.ref.modifiers.forEach(item => refTotalModifiers += Number(item.value));
	thisActor.data.data.stats.dex.modifiers.forEach(item => dexTotalModifiers += Number(item.value));
	thisActor.data.data.stats.body.modifiers.forEach(item => bodyTotalModifiers += Number(item.value));
	thisActor.data.data.stats.spd.modifiers.forEach(item => spdTotalModifiers += Number(item.value));
	thisActor.data.data.stats.emp.modifiers.forEach(item => empTotalModifiers += Number(item.value));
	thisActor.data.data.stats.cra.modifiers.forEach(item => craTotalModifiers += Number(item.value));
	thisActor.data.data.stats.will.modifiers.forEach(item => willTotalModifiers += Number(item.value));
	thisActor.data.data.stats.luck.modifiers.forEach(item => luckTotalModifiers += Number(item.value));
	
	let activeEffects =  thisActor.items.filter(function(item) {return item.type=="effect"});
	activeEffects.forEach(item => 
		item.data.data.stats.forEach(stat => {
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
		}));

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
	thisActor.data.data.coreStats.stun.modifiers.forEach(item => stunTotalModifiers += Number(item.value));
	thisActor.data.data.coreStats.run.modifiers.forEach(item => runTotalModifiers += Number(item.value));
	thisActor.data.data.coreStats.leap.modifiers.forEach(item => leapTotalModifiers += Number(item.value));
	thisActor.data.data.coreStats.enc.modifiers.forEach(item => encTotalModifiers += Number(item.value));
	thisActor.data.data.coreStats.rec.modifiers.forEach(item => recTotalModifiers += Number(item.value));
	thisActor.data.data.coreStats.woundTreshold.modifiers.forEach(item => wtTotalModifiers += Number(item.value));

	let curentEncumbrance = (thisActor.data.data.stats.body.max + bodyTotalModifiers) * 10  + encTotalModifiers
	var totalWeights = 0
	thisActor.items.forEach(item => {if (item.data.data.weight && item.data.data.quantity) {totalWeights += (Number(item.data.data.weight) *  Number(item.data.data.quantity))}})
	totalWeights += calc_currency_weight(thisActor.data.data.currency);
	let encDiff = 0
	if (curentEncumbrance < totalWeights){
		encDiff = Math.ceil((totalWeights-curentEncumbrance) / 5)
	}
	let armorEnc = getArmorEcumbrance(thisActor)

	activeEffects.forEach(item => 
		item.data.data.derived.forEach(derived => {
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
		}));

	let curInt =  Math.floor((thisActor.data.data.stats.int.max + intTotalModifiers) / intDivider);
	let curRef =  Math.floor((thisActor.data.data.stats.ref.max + refTotalModifiers - armorEnc - encDiff) / refDivider);
	let curDex =  Math.floor((thisActor.data.data.stats.dex.max + dexTotalModifiers - armorEnc - encDiff) / dexDivider);
	let curBody =  Math.floor((thisActor.data.data.stats.body.max + bodyTotalModifiers) / bodyDivider);
	let curSpd =  Math.floor((thisActor.data.data.stats.spd.max + spdTotalModifiers - encDiff) / spdDivider);
	let curEmp =  Math.floor((thisActor.data.data.stats.emp.max + empTotalModifiers) / empDivider);
	let curCra =  Math.floor((thisActor.data.data.stats.cra.max + craTotalModifiers) / craDivider);
	let curWill =  Math.floor((thisActor.data.data.stats.will.max + willTotalModifiers) / willDivider);
	let curLuck =  Math.floor((thisActor.data.data.stats.luck.max + luckTotalModifiers) / luckDivider);
	let isDead = false;
	let isWounded = false;
	let HPvalue = thisActor.data.data.derivedStats.hp.value;
	if (HPvalue <= 0) {
		isDead = true
		curInt = Math.floor((thisActor.data.data.stats.int.max + intTotalModifiers)/3/intDivider)
		curRef =Math.floor(( thisActor.data.data.stats.ref.max + refTotalModifiers - armorEnc - encDiff)/3/dexDivider)
		curDex = Math.floor((thisActor.data.data.stats.dex.max + dexTotalModifiers - armorEnc - encDiff)/3/refDivider)
		curBody = Math.floor((thisActor.data.data.stats.body.max + bodyTotalModifiers)/3/bodyDivider)
		curSpd = Math.floor((thisActor.data.data.stats.spd.max + spdTotalModifiers - encDiff)/3/spdDivider)
		curEmp = Math.floor((thisActor.data.data.stats.emp.max + empTotalModifiers)/3/empDivider)
		curCra = Math.floor((thisActor.data.data.stats.cra.max + craTotalModifiers)/3/craDivider)
		curWill = Math.floor((thisActor.data.data.stats.will.max + willTotalModifiers)/3/willDivider)
		curLuck = Math.floor((thisActor.data.data.stats.luck.max + luckTotalModifiers)/3/luckDivider)
	}
	else if (HPvalue < thisActor.data.data.coreStats.woundTreshold.current > 0) {
		isWounded = true
		curRef = Math.floor((thisActor.data.data.stats.ref.max + refTotalModifiers - armorEnc - encDiff)/2/refDivider)
		curDex = Math.floor((thisActor.data.data.stats.dex.max + dexTotalModifiers - armorEnc - encDiff)/2/dexDivider)
		curInt = Math.floor((thisActor.data.data.stats.int.max + intTotalModifiers)/2/intDivider)
		curWill = Math.floor((thisActor.data.data.stats.will.max + willTotalModifiers)/2/willDivider)
	}

	let hpTotalModifiers = 0;
	let staTotalModifiers = 0;
	let resTotalModifiers = 0;
	let focusTotalModifiers = 0;
	let hpDivider = 1;
	let staDivider = 1;
	thisActor.data.data.derivedStats.hp.modifiers.forEach(item => hpTotalModifiers += Number(item.value));
	thisActor.data.data.derivedStats.sta.modifiers.forEach(item => staTotalModifiers += Number(item.value));
	thisActor.data.data.derivedStats.resolve.modifiers.forEach(item => resTotalModifiers += Number(item.value));
	thisActor.data.data.derivedStats.focus.modifiers.forEach(item => focusTotalModifiers += Number(item.value));
	activeEffects.forEach(item => 
		item.data.data.derived.forEach(derived => {
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
		}));

	let curHp = thisActor.data.data.derivedStats.hp.max + hpTotalModifiers;
	let curSta = thisActor.data.data.derivedStats.sta.max + staTotalModifiers;
	let curRes = thisActor.data.data.derivedStats.resolve.max + resTotalModifiers;
	let curFocus = thisActor.data.data.derivedStats.focus.max + focusTotalModifiers;

	
	let unmodifiedMaxHp = baseMax * 5

	if (thisActor.data.data.customStat != true){
		curHp = Math.floor((base * 5 + hpTotalModifiers)/hpDivider)
		curSta = Math.floor((base * 5 + staTotalModifiers)/staDivider) 
		curRes = Math.floor((curWill + curInt)/2*5) + resTotalModifiers
		curFocus = Math.floor((curWill + curInt)/2*3) + focusTotalModifiers
	}

	thisActor.update({ 
        'data.deathStateApplied': isDead,
        'data.woundTresholdApplied': isWounded,
        'data.stats.int.current': curInt,
        'data.stats.ref.current': curRef,
        'data.stats.dex.current': curDex,
        'data.stats.body.current': curBody,
        'data.stats.spd.current': curSpd,
        'data.stats.emp.current': curEmp,
        'data.stats.cra.current': curCra,
        'data.stats.will.current': curWill,
        'data.stats.luck.current': curLuck,

		'data.derivedStats.hp.max': curHp,
		'data.derivedStats.hp.unmodifiedMax': unmodifiedMaxHp,
		'data.derivedStats.sta.max': curSta,
		'data.derivedStats.resolve.max': curRes,
		'data.derivedStats.focus.max': curFocus,

		'data.coreStats.stun.current': Math.floor((Math.clamped(base, 1, 10) + stunTotalModifiers)/stunDivider),
		'data.coreStats.stun.max': Math.clamped(baseMax, 1, 10),

		'data.coreStats.enc.current': Math.floor((stats.body.current*10  + encTotalModifiers)/encDivider),
		'data.coreStats.enc.max': stats.body.current*10,

		'data.coreStats.run.current':  Math.floor((stats.spd.current*3 +runTotalModifiers)/runDivider),
		'data.coreStats.run.max': stats.spd.current*3,

		'data.coreStats.leap.current': Math.floor((stats.spd.current*3/5)+leapTotalModifiers)/leapDivider,
		'data.coreStats.leap.max': Math.floor(stats.spd.max*3/5),

		'data.coreStats.rec.current': Math.floor((base + recTotalModifiers)/recDivider),
		'data.coreStats.rec.max': baseMax,
		
		'data.coreStats.woundTreshold.current': Math.floor((baseMax+wtTotalModifiers)/wtDivider),
		'data.coreStats.woundTreshold.max': baseMax,

		'data.attackStats.meleeBonus': meleeBonus,
		'data.attackStats.punch.value': `1d6+${meleeBonus}`,
		'data.attackStats.kick.value': `1d6+${4 + meleeBonus}`,
	});
}

function getArmorEcumbrance(actor){
	let encumbranceModifier = 0
	let armors = actor.items.filter(function(item) {return item.type=="armor"});
	armors.forEach(item => {
		if (item.data.data.equiped || item.data.data.equiped == "checked") {
			encumbranceModifier += item.data.data.encumb
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
			stat = thisActor.data.data.stats.int.current;
			break;
		case 1:
			parentStat = game.i18n.localize("WITCHER.StRef");
			array = getRefSkillMod(thisActor, skillNum);
			stat = thisActor.data.data.stats.ref.current;
			break;
		case 2:
			parentStat = game.i18n.localize("WITCHER.StDex");
			array = getDexSkillMod(thisActor, skillNum);
			stat = thisActor.data.data.stats.dex.current;
			break;
		case 3:
			parentStat = game.i18n.localize("WITCHER.StBody");
			array = getBodySkillMod(thisActor, skillNum);
			stat = thisActor.data.data.stats.body.current;
			break;
		case 4:
			parentStat = game.i18n.localize("WITCHER.StEmp");
			array = getEmpSkillMod(thisActor, skillNum);
			stat = thisActor.data.data.stats.emp.current;
			break;
		case 5:
			parentStat = game.i18n.localize("WITCHER.StCra");
			array = getCraSkillMod(thisActor, skillNum);
			stat = thisActor.data.data.stats.cra.current;
			break;
		case 6:
			parentStat = game.i18n.localize("WITCHER.StWill");
			array = getWillSkillMod(thisActor, skillNum);
			stat = thisActor.data.data.stats.will.current;
			break;
	}
	let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

	skillName = array[0];
	skill = array[1];
	skillName = skillName.replace(" (2)", "");
	let messageData = {
			speaker: {alias: thisActor.name},
			flavor: `${parentStat}: ${skillName} Check`,
	}
	let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${parentStat}]+${skill}[${skillName}]` ;

	if (array[2]) {
		let totalModifiers = 0;
		array[2].forEach(item => totalModifiers += Number(item.value));
        if (totalModifiers < 0){
			rollFormula +=  !displayRollDetails ? `${totalModifiers}` :  `${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]`
		}
		if (totalModifiers > 0){
			rollFormula += !displayRollDetails ? `+${totalModifiers}`:  `+${totalModifiers}[${game.i18n.localize("WITCHER.Settings.modifiers")}]` 
		}
	}

	let activeEffects =  thisActor.items.filter(function(item) {return item.type=="effect"});
	activeEffects.forEach(item => 
		item.data.data.skills.forEach(skill => {
			if (skillName == game.i18n.localize(skill.skill)){
				if (skill.modifier.includes("/")){rollFormula += !displayRollDetails ? `/${Number(skill.modifier.replace("/", ''))}` : `/${Number(skill.modifier.replace("/", ''))}[${item.name}]`}
				else {rollFormula += !displayRollDetails ? `+${skill.modifier}` : `+${skill.modifier}[${item.name}]`}
			}
		}));

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
			callback: (html) => {
				let customAtt = html.find("[name=customModifiers]")[0].value;
				if (customAtt < 0){
					rollFormula += !displayRollDetails ? `${customAtt}`: `${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
				}
				if (customAtt > 0){
					rollFormula += !displayRollDetails ? `+${customAtt}` : `+${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
				}

				let roll = new Roll(rollFormula).roll()
				if (roll.dice[0].results[0].result == 10){  
				  messageData.flavor += `<a class="crit-roll"><div class="dice-sucess"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div></a>`;
				};
				if (roll.dice[0].results[0].result == 1){  
				  messageData.flavor += `<a class="crit-roll"><div class="dice-fail"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div></a>`;
				};
				roll.toMessage(messageData);
			}
		  }
		}}).render(true) 
}

function getIntSkillMod(actor, skillNum){
	switch(skillNum){
		case 0:
			return [game.i18n.localize("WITCHER.SkIntAwareness"), actor.data.data.skills.int.awareness.value,  actor.data.data.skills.int.awareness.modifiers]
		case 1:
			return [game.i18n.localize("WITCHER.SkIntBusiness"), actor.data.data.skills.int.business.value, actor.data.data.skills.int.business.modifiers]
		case 2:
			return [game.i18n.localize("WITCHER.SkIntDeduction"), actor.data.data.skills.int.deduction.value, actor.data.data.skills.int.deduction.modifiers]
		case 3:
			return [game.i18n.localize("WITCHER.SkIntEducation"), actor.data.data.skills.int.education.value, actor.data.data.skills.int.education.modifiers]
		case 4:
			return [game.i18n.localize("WITCHER.SkIntCommon"), actor.data.data.skills.int.commonsp.value, actor.data.data.skills.int.commonsp.modifiers]
		case 5:
			return [game.i18n.localize("WITCHER.SkIntElder"), actor.data.data.skills.int.eldersp.value, actor.data.data.skills.int.eldersp.modifiers]
		case 6:
			return [game.i18n.localize("WITCHER.SkIntDwarven"), actor.data.data.skills.int.dwarven.value, actor.data.data.skills.int.dwarven.modifiers]
		case 7:
			return [game.i18n.localize("WITCHER.SkIntMonster"), actor.data.data.skills.int.monster.value, actor.data.data.skills.int.monster.modifiers]
		case 8:
			return [game.i18n.localize("WITCHER.SkIntSocialEt"), actor.data.data.skills.int.socialetq.value, actor.data.data.skills.int.socialetq.modifiers]
		case 9:
			return [game.i18n.localize("WITCHER.SkIntStreet"), actor.data.data.skills.int.streetwise.value, actor.data.data.skills.int.streetwise.modifiers]
		case 10:
			return [game.i18n.localize("WITCHER.SkIntTactics"), actor.data.data.skills.int.tactics.value, actor.data.data.skills.int.tactics.modifiers]
		case 11:
			return [game.i18n.localize("WITCHER.SkIntTeaching"), actor.data.data.skills.int.teaching.value, actor.data.data.skills.int.teaching.modifiers]
		case 12:
			return [game.i18n.localize("WITCHER.SkIntWilderness"), actor.data.data.skills.int.wilderness.value, actor.data.data.skills.int.wilderness.modifiers]
	}
}

function getRefSkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkRefBrawling"), actor.data.data.skills.ref.brawling.value, actor.data.data.skills.ref.brawling.modifiers]
				case 1:
						return [game.i18n.localize("WITCHER.SkRefDodge"), actor.data.data.skills.ref.dodge.value, actor.data.data.skills.ref.dodge.modifiers]
				case 2:
						return [game.i18n.localize("WITCHER.SkRefMelee"), actor.data.data.skills.ref.melee.value, actor.data.data.skills.ref.melee.modifiers]
				case 3:
						return [game.i18n.localize("WITCHER.SkRefRiding"), actor.data.data.skills.ref.riding.value, actor.data.data.skills.ref.riding.modifiers]
				case 4:
						return [game.i18n.localize("WITCHER.SkRefSailing"), actor.data.data.skills.ref.sailing.value, actor.data.data.skills.ref.sailing.modifiers]
				case 5:
						return [game.i18n.localize("WITCHER.SkRefSmall"), actor.data.data.skills.ref.smallblades.value, actor.data.data.skills.ref.smallblades.modifiers]
				case 6:
						return [game.i18n.localize("WITCHER.SkRefStaff"), actor.data.data.skills.ref.staffspear.value, actor.data.data.skills.ref.staffspear.modifiers]
				case 7:
						return [game.i18n.localize("WITCHER.SkRefSwordmanship"), actor.data.data.skills.ref.swordsmanship.value, actor.data.data.skills.ref.swordsmanship.modifiers]
		}
}

function getDexSkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkDexArchery"), actor.data.data.skills.dex.archery.value, actor.data.data.skills.dex.archery.modifiers]
				case 1:
						return [game.i18n.localize("WITCHER.SkDexAthletics"), actor.data.data.skills.dex.athletics.value, actor.data.data.skills.dex.athletics.modifiers]
				case 2:
						return [game.i18n.localize("WITCHER.SkDexCrossbow"), actor.data.data.skills.dex.crossbow.value, actor.data.data.skills.dex.crossbow.modifiers]
				case 3:
						return [game.i18n.localize("WITCHER.SkDexSleight"), actor.data.data.skills.dex.sleight.value, actor.data.data.skills.dex.sleight.modifiers]
				case 4:
						return [game.i18n.localize("WITCHER.SkDexStealth"), actor.data.data.skills.dex.stealth.value, actor.data.data.skills.dex.stealth.modifiers]
		}
}

function getBodySkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkBodyPhys"), actor.data.data.skills.body.physique.value, actor.data.data.skills.body.physique.modifiers]
				case 1:
						return [game.i18n.localize("WITCHER.SkBodyEnd"), actor.data.data.skills.body.endurance.value, actor.data.data.skills.body.endurance.modifiers]
		}
}

function getEmpSkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkEmpCharisma"), actor.data.data.skills.emp.charisma.value, actor.data.data.skills.emp.charisma.modifiers]
				case 1:
						return [game.i18n.localize("WITCHER.SkEmpDeceit"), actor.data.data.skills.emp.deceit.value, actor.data.data.skills.emp.deceit.modifiers]
				case 2:
						return [game.i18n.localize("WITCHER.SkEmpArts"), actor.data.data.skills.emp.finearts.value, actor.data.data.skills.emp.finearts.modifiers]
				case 3:
						return [game.i18n.localize("WITCHER.SkEmpGambling"), actor.data.data.skills.emp.gambling.value, actor.data.data.skills.emp.gambling.modifiers]
				case 4:
						return [game.i18n.localize("WITCHER.SkEmpGrooming"), actor.data.data.skills.emp.grooming.value, actor.data.data.skills.emp.grooming.modifiers]
				case 5:
						return [game.i18n.localize("WITCHER.SkEmpHumanPerc"), actor.data.data.skills.emp.perception.value, actor.data.data.skills.emp.perception.modifiers]
				case 6:
						return [game.i18n.localize("WITCHER.SkEmpLeadership"), actor.data.data.skills.emp.leadership.value, actor.data.data.skills.emp.leadership.modifiers]
				case 7:
						return [game.i18n.localize("WITCHER.SkEmpPersuasion"), actor.data.data.skills.emp.persuasion.value, actor.data.data.skills.emp.persuasion.modifiers]
				case 8:
						return [game.i18n.localize("WITCHER.SkEmpPerformance"), actor.data.data.skills.emp.performance.value, actor.data.data.skills.emp.performance.modifiers]
				case 9:
						return [game.i18n.localize("WITCHER.SkEmpSeduction"), actor.data.data.skills.emp.seduction.value, actor.data.data.skills.emp.seduction.modifiers]
		}
}

function getCraSkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkCraAlchemy"), actor.data.data.skills.cra.alchemy.value, actor.data.data.skills.cra.alchemy.modifiers]
				case 1:
						return [game.i18n.localize("WITCHER.SkCraCrafting"), actor.data.data.skills.cra.crafting.value, actor.data.data.skills.cra.crafting.modifiers]
				case 2:
						return [game.i18n.localize("WITCHER.SkCraDisguise"), actor.data.data.skills.cra.disguise.value, actor.data.data.skills.cra.disguise.modifiers]
				case 3:
						return [game.i18n.localize("WITCHER.SkCraAid"), actor.data.data.skills.cra.firstaid.value, actor.data.data.skills.cra.firstaid.modifiers]
				case 4:
						return [game.i18n.localize("WITCHER.SkCraForge"), actor.data.data.skills.cra.forgery.value, actor.data.data.skills.cra.forgery.modifiers]
				case 5:
						return [game.i18n.localize("WITCHER.SkCraPick"), actor.data.data.skills.cra.picklock.value, actor.data.data.skills.cra.picklock.modifiers]
				case 6:
						return [game.i18n.localize("WITCHER.SkCraTrapCraft"), actor.data.data.skills.cra.trapcraft.value, actor.data.data.skills.cra.trapcraft.modifiers]
		}
}

function getWillSkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkWillCourage"), actor.data.data.skills.will.courage.value, actor.data.data.skills.will.courage.modifiers]
				case 1:
						return [game.i18n.localize("WITCHER.SkWillHex"), actor.data.data.skills.will.hexweave.value, actor.data.data.skills.will.hexweave.modifiers]
				case 2:
						return [game.i18n.localize("WITCHER.SkWillIntim"), actor.data.data.skills.will.intimidation.value, actor.data.data.skills.will.intimidation.modifiers]
				case 3:
						return [game.i18n.localize("WITCHER.SkWillSpellcast"), actor.data.data.skills.will.spellcast.value, actor.data.data.skills.will.spellcast.modifiers]
				case 4:
						return [game.i18n.localize("WITCHER.SkWillResistMag"), actor.data.data.skills.will.resistmagic.value, actor.data.data.skills.will.resistmagic.modifiers]
				case 5:
						return [game.i18n.localize("WITCHER.SkWillResistCoer"), actor.data.data.skills.will.resistcoerc.value, actor.data.data.skills.will.resistcoerc.modifiers]
				case 6:
						return [game.i18n.localize("WITCHER.SkWillRitCraft"), actor.data.data.skills.will.ritcraft.value, actor.data.data.skills.will.ritcraft.modifiers]
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
	return Number(totalPieces * 0.01)
}

export { updateDerived, rollSkillCheck, genId, calc_currency_weight};