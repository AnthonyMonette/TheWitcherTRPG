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
	console.log("stat-max")
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
	thisActor.data.data.stats.int.modifiers.forEach(item => intTotalModifiers += Number(item.value));
	thisActor.data.data.stats.ref.modifiers.forEach(item => refTotalModifiers += Number(item.value));
	thisActor.data.data.stats.dex.modifiers.forEach(item => dexTotalModifiers += Number(item.value));
	thisActor.data.data.stats.body.modifiers.forEach(item => bodyTotalModifiers += Number(item.value));
	thisActor.data.data.stats.spd.modifiers.forEach(item => spdTotalModifiers += Number(item.value));
	thisActor.data.data.stats.emp.modifiers.forEach(item => empTotalModifiers += Number(item.value));
	thisActor.data.data.stats.cra.modifiers.forEach(item => craTotalModifiers += Number(item.value));
	thisActor.data.data.stats.will.modifiers.forEach(item => willTotalModifiers += Number(item.value));
	thisActor.data.data.stats.luck.modifiers.forEach(item => luckTotalModifiers += Number(item.value));
	let curInt = thisActor.data.data.stats.int.max + intTotalModifiers;
	let curRef = thisActor.data.data.stats.ref.max + refTotalModifiers;
	let curDex = thisActor.data.data.stats.dex.max + dexTotalModifiers;
	let curBody = thisActor.data.data.stats.body.max + bodyTotalModifiers;
	let curSpd = thisActor.data.data.stats.spd.max + spdTotalModifiers;
	let curEmp = thisActor.data.data.stats.emp.max + empTotalModifiers;
	let curCra = thisActor.data.data.stats.cra.max + craTotalModifiers;
	let curWill = thisActor.data.data.stats.will.max + willTotalModifiers;
	let curLuck = thisActor.data.data.stats.luck.max + luckTotalModifiers;
	let isDead = false;
	let isWounded = false;
	let HPvalue = thisActor.data.data.derivedStats.hp.value;
	if (HPvalue <= 0) {
		isDead = true
		curInt = Math.floor((thisActor.data.data.stats.int.max + intTotalModifiers)/3)
		curRef =Math.floor(( thisActor.data.data.stats.ref.max + refTotalModifiers)/3)
		curDex = Math.floor((thisActor.data.data.stats.dex.max + dexTotalModifiers)/3)
		curBody = Math.floor((thisActor.data.data.stats.body.max + bodyTotalModifiers)/3)
		curSpd = Math.floor((thisActor.data.data.stats.spd.max + spdTotalModifiers)/3)
		curEmp = Math.floor((thisActor.data.data.stats.emp.max + empTotalModifiers)/3)
		curCra = Math.floor((thisActor.data.data.stats.cra.max + craTotalModifiers)/3)
		curWill = Math.floor((thisActor.data.data.stats.will.max + willTotalModifiers)/3)
		curLuck = Math.floor((thisActor.data.data.stats.luck.max + luckTotalModifiers)/3)
	}
	else if (HPvalue < thisActor.data.data.coreStats.woundTreshold.value > 0) {
		isWounded = true
		curRef = Math.floor((thisActor.data.data.stats.ref.max + refTotalModifiers)/2)
		curDex = Math.floor((thisActor.data.data.stats.dex.max + dexTotalModifiers)/2)
		curInt = Math.floor((thisActor.data.data.stats.int.max + intTotalModifiers)/2)
		curWill = Math.floor((thisActor.data.data.stats.will.max + willTotalModifiers)/2)
	}

	let stunTotalModifiers = 0;
	let runTotalModifiers = 0;
	let leapTotalModifiers = 0;
	let encTotalModifiers = 0;
	let recTotalModifiers = 0;
	let wtTotalModifiers = 0;
	thisActor.data.data.coreStats.stun.modifiers.forEach(item => stunTotalModifiers += Number(item.value));
	thisActor.data.data.coreStats.run.modifiers.forEach(item => runTotalModifiers += Number(item.value));
	thisActor.data.data.coreStats.leap.modifiers.forEach(item => leapTotalModifiers += Number(item.value));
	thisActor.data.data.coreStats.enc.modifiers.forEach(item => encTotalModifiers += Number(item.value));
	thisActor.data.data.coreStats.rec.modifiers.forEach(item => recTotalModifiers += Number(item.value));
	thisActor.data.data.coreStats.woundTreshold.modifiers.forEach(item => wtTotalModifiers += Number(item.value));

	let curHp = thisActor.data.data.derivedStats.hp.max;
	let curSta = thisActor.data.data.derivedStats.sta.max;
	let curRes = thisActor.data.data.derivedStats.resolve.max;
	let curFocus = thisActor.data.data.derivedStats.focus.max;

	if (thisActor.data.data.customStat != true){
		curHp = base * 5
		curSta = base * 5
		curRes = Math.floor((curWill + curInt)/2*5)
		curFocus = Math.floor((curWill + curInt)/2*3)
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
		'data.derivedStats.sta.max': curSta,
		'data.derivedStats.resolve.max': curRes,
		'data.derivedStats.focus.max': curFocus,

		'data.coreStats.stun.current': Math.clamped(base, 1, 10) + stunTotalModifiers,
		'data.coreStats.stun.max': Math.clamped(baseMax, 1, 10),

		'data.coreStats.enc.current': stats.body.current*10  + encTotalModifiers,
		'data.coreStats.enc.max': stats.body.current*10,

		'data.coreStats.run.current': stats.spd.current*3 +runTotalModifiers,
		'data.coreStats.run.max': stats.spd.current*3,

		'data.coreStats.leap.current': Math.floor(stats.spd.current*3/5)+leapTotalModifiers,
		'data.coreStats.leap.max': Math.floor(stats.spd.max*3/5),

		'data.coreStats.rec.current': base + recTotalModifiers,
		'data.coreStats.rec.max': baseMax,
		
		'data.coreStats.woundTreshold.current': baseMax+1+wtTotalModifiers,
		'data.coreStats.woundTreshold.max': baseMax+1,

		'data.attackStats.meleeBonus': meleeBonus,
		'data.attackStats.punch.value': `1d6+${meleeBonus}`,
		'data.attackStats.kick.value': `1d6+${4 + meleeBonus}`,
	});
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
			skillName = array[0];
			stat = thisActor.data.data.stats.int.current;
			skill = array[1];
			break;
		case 1:
			parentStat = game.i18n.localize("WITCHER.StRef");
			array = getRefSkillMod(thisActor, skillNum);
			skillName = array[0];
			stat = thisActor.data.data.stats.ref.current;
			skill = array[1];
			break;
		case 2:
			parentStat = game.i18n.localize("WITCHER.StDex");
			array = getDexSkillMod(thisActor, skillNum);
			skillName = array[0];
			stat = thisActor.data.data.stats.dex.current;
			skill = array[1];
			break;
		case 3:
			parentStat = game.i18n.localize("WITCHER.StBody");
			array = getBodySkillMod(thisActor, skillNum);
			skillName = array[0];
			stat = thisActor.data.data.stats.body.current;
			skill = array[1];
			break;
		case 4:
			parentStat = game.i18n.localize("WITCHER.StEmp");
			array = getEmpSkillMod(thisActor, skillNum);
			skillName = array[0];
			stat = thisActor.data.data.stats.emp.current;
			skill = array[1];
			break;
		case 5:
			parentStat = game.i18n.localize("WITCHER.StCra");
			array = getCraSkillMod(thisActor, skillNum);
			skillName = array[0];
			stat = thisActor.data.data.stats.cra.current;
			skill = array[1];
			break;
		case 6:
			parentStat = game.i18n.localize("WITCHER.StWill");
			array = getWillSkillMod(thisActor, skillNum);
			skillName = array[0];
			stat = thisActor.data.data.stats.will.current;
			skill = array[1];
			break;
	}

	skillName = skillName.replace(" (2)", "");
	let messageData = {
			speaker: {alias: thisActor.name},
			flavor: `${parentStat}: ${skillName} Check`,
	}
	let rollFormula = `1d10+${stat}+${skill}`
	new Roll(rollFormula).roll().toMessage(messageData)
}

function getIntSkillMod(actor, skillNum){
	switch(skillNum){
		case 0:
			return [game.i18n.localize("WITCHER.SkIntAwareness"), actor.data.data.skills.int.awareness.value]
		case 1:
			return [game.i18n.localize("WITCHER.SkIntBusiness"), actor.data.data.skills.int.business.value]
		case 2:
			return [game.i18n.localize("WITCHER.SkIntDeduction"), actor.data.data.skills.int.deduction.value]
		case 3:
			return [game.i18n.localize("WITCHER.SkIntEducation"), actor.data.data.skills.int.education.value]
		case 4:
			return [game.i18n.localize("WITCHER.SkIntCommon"), actor.data.data.skills.int.commonsp.value]
		case 5:
			return [game.i18n.localize("WITCHER.SkIntElder"), actor.data.data.skills.int.eldersp.value]
		case 6:
			return [game.i18n.localize("WITCHER.SkIntDwarven"), actor.data.data.skills.int.dwarven.value]
		case 7:
			return [game.i18n.localize("WITCHER.SkIntMonster"), actor.data.data.skills.int.monster.value]
		case 8:
			return [game.i18n.localize("WITCHER.SkIntSocialEt"), actor.data.data.skills.int.socialetq.value]
		case 9:
			return [game.i18n.localize("WITCHER.SkIntStreet"), actor.data.data.skills.int.streetwise.value]
		case 10:
			return [game.i18n.localize("WITCHER.SkIntTactics"), actor.data.data.skills.int.tactics.value]
		case 11:
			return [game.i18n.localize("WITCHER.SkIntTeaching"), actor.data.data.skills.int.teaching.value]
		case 12:
			return [game.i18n.localize("WITCHER.SkIntWilderness"), actor.data.data.skills.int.wilderness.value]
	}
}

function getRefSkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkRefBrawling"), actor.data.data.skills.ref.brawling.value]
				case 1:
						return [game.i18n.localize("WITCHER.SkRefDodge"), actor.data.data.skills.ref.dodge.value]
				case 2:
						return [game.i18n.localize("WITCHER.SkRefMelee"), actor.data.data.skills.ref.melee.value]
				case 3:
						return [game.i18n.localize("WITCHER.SkRefRiding"), actor.data.data.skills.ref.riding.value]
				case 4:
						return [game.i18n.localize("WITCHER.SkRefSailing"), actor.data.data.skills.ref.sailing.value]
				case 5:
						return [game.i18n.localize("WITCHER.SkRefSmall"), actor.data.data.skills.ref.smallblades.value]
				case 6:
						return [game.i18n.localize("WITCHER.SkRefStaff"), actor.data.data.skills.ref.staffspear.value]
				case 7:
						return [game.i18n.localize("WITCHER.SkRefSwordmanship"), actor.data.data.skills.ref.swordsmanship.value]
		}
}

function getDexSkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkDexArchery"), actor.data.data.skills.dex.archery.value]
				case 1:
						return [game.i18n.localize("WITCHER.SkDexAthletics"), actor.data.data.skills.dex.athletics.value]
				case 2:
						return [game.i18n.localize("WITCHER.SkDexCrossbow"), actor.data.data.skills.dex.crossbow.value]
				case 3:
						return [game.i18n.localize("WITCHER.SkDexSleight"), actor.data.data.skills.dex.sleight.value]
				case 4:
						return [game.i18n.localize("WITCHER.SkDexStealth"), actor.data.data.skills.dex.stealth.value]
		}
}

function getBodySkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkBodyPhys"), actor.data.data.skills.body.physique.value]
				case 1:
						return [game.i18n.localize("WITCHER.SkBodyEnd"), actor.data.data.skills.body.endurance.value]
		}
}

function getEmpSkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkEmpCharisma"), actor.data.data.skills.emp.charisma.value]
				case 1:
						return [game.i18n.localize("WITCHER.SkEmpDeceit"), actor.data.data.skills.emp.deceit.value]
				case 2:
						return [game.i18n.localize("WITCHER.SkEmpArts"), actor.data.data.skills.emp.finearts.value]
				case 3:
						return [game.i18n.localize("WITCHER.SkEmpGambling"), actor.data.data.skills.emp.gambling.value]
				case 4:
						return [game.i18n.localize("WITCHER.SkEmpGrooming"), actor.data.data.skills.emp.grooming.value]
				case 5:
						return [game.i18n.localize("WITCHER.SkEmpHumanPerc"), actor.data.data.skills.emp.perception.value]
				case 6:
						return [game.i18n.localize("WITCHER.SkEmpLeadership"), actor.data.data.skills.emp.leadership.value]
				case 7:
						return [game.i18n.localize("WITCHER.SkEmpPersuasion"), actor.data.data.skills.emp.persuasion.value]
				case 8:
						return [game.i18n.localize("WITCHER.SkEmpPerformance"), actor.data.data.skills.emp.performance.value]
				case 9:
						return [game.i18n.localize("WITCHER.SkEmpSeduction"), actor.data.data.skills.emp.seduction.value]
		}
}

function getCraSkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkCraAlchemy"), actor.data.data.skills.cra.alchemy.value]
				case 1:
						return [game.i18n.localize("WITCHER.SkCraCrafting"), actor.data.data.skills.cra.crafting.value]
				case 2:
						return [game.i18n.localize("WITCHER.SkCraDisguise"), actor.data.data.skills.cra.disguise.value]
				case 3:
						return [game.i18n.localize("WITCHER.SkCraAid"), actor.data.data.skills.cra.firstaid.value]
				case 4:
						return [game.i18n.localize("WITCHER.SkCraForge"), actor.data.data.skills.cra.forgery.value]
				case 5:
						return [game.i18n.localize("WITCHER.SkCraPick"), actor.data.data.skills.cra.picklock.value]
				case 6:
						return [game.i18n.localize("WITCHER.SkCraTrapCraft"), actor.data.data.skills.cra.trapcraft.value]
		}
}

function getWillSkillMod(actor, skillNum){
		switch(skillNum){
				case 0:
						return [game.i18n.localize("WITCHER.SkWillCourage"), actor.data.data.skills.will.courage.value]
				case 1:
						return [game.i18n.localize("WITCHER.SkWillHex"), actor.data.data.skills.will.hexweave.value]
				case 2:
						return [game.i18n.localize("WITCHER.SkWillIntim"), actor.data.data.skills.will.intimidation.value]
				case 3:
						return [game.i18n.localize("WITCHER.SkWillSpellcast"), actor.data.data.skills.will.spellcast.value]
				case 4:
						return [game.i18n.localize("WITCHER.SkWillResistMag"), actor.data.data.skills.will.resistmagic.value]
				case 5:
						return [game.i18n.localize("WITCHER.SkWillResistCoer"), actor.data.data.skills.will.resistcoerc.value]
				case 6:
						return [game.i18n.localize("WITCHER.SkWillRitCraft"), actor.data.data.skills.will.ritcraft.value]
		}
}

function genId() {
		// Math.random should be unique because of its seeding algorithm.
		// Convert it to base 36 (numbers + letters), and grab the first 9 characters
		// after the decimal.
		return '_' + Math.random().toString(36).substr(2, 9);
	};

export { updateDerived, rollSkillCheck, genId};