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
		if (actor.data.data.customStat === true){
				return null;
		}
		const thisActor = actor;
		const stats = thisActor.data.data.stats;
		const base = Math.floor((stats.body.current + stats.will.current)/2);
		const baseMax = Math.floor((stats.body.max + stats.will.max)/2);
		const meleeBonus = Math.ceil((stats.body.current-6)/2)*2;

		thisActor.update({ 
				'data.derivedStats.hp.max': base * 5,
				'data.derivedStats.sta.max': base * 5,
				'data.derivedStats.resolve.max': Math.floor((stats.will.current + stats.int.current)/2*5),
				'data.derivedStats.focus.max': Math.floor((stats.will.current + stats.int.current)/2*3),
				'data.coreStats.rec.value': base,
				'data.coreStats.stun.value': Math.clamped(base, 1, 10),
				'data.coreStats.enc.value': stats.body.current*10,
				'data.coreStats.run.value': stats.spd.current*3,
				'data.coreStats.leap.value': Math.floor(stats.spd.current*3/5),
		'data.coreStats.woundTreshold.value': baseMax+1,
				'data.attackStats.meleeBonus': meleeBonus,
				'data.attackStats.punch.value': `1d6+${meleeBonus}`,
				'data.attackStats.kick.value': `1d6+${meleeBonus}`,
		});
}

function removeWoundTreshold(actor){
		console.log("removing wound treshold")
		actor.update({ 
				'data.woundTresholdApplied': false,
				'data.stats.ref.current': actor.data.data.stats.ref.max,
				'data.stats.dex.current': actor.data.data.stats.dex.max,
				'data.stats.int.current': actor.data.data.stats.int.max,
				'data.stats.will.current': actor.data.data.stats.will.max,
		 });
}

function applyWoundTreshold(actor){
		console.log("applying wound treshold")
		let newRef = Math.floor(actor.data.data.stats.ref.max/2);
		let newDex= Math.floor(actor.data.data.stats.dex.max/2);
		let newInt = Math.floor(actor.data.data.stats.int.max/2);
		let newWill = Math.floor(actor.data.data.stats.will.max/2);

		actor.update({ 
				'data.woundTresholdApplied': true,
				'data.stats.ref.current': newRef,
				'data.stats.dex.current': newDex,
				'data.stats.int.current': newInt,
				'data.stats.will.current': newWill,
		});
}

function rollSkillCheck(thisActor, statNum, skillNum){
		console.log("coucou")
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

export { updateDerived, rollSkillCheck, genId, applyWoundTreshold, removeWoundTreshold };