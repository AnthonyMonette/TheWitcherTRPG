function doesWeaponNeedMeleeSkillToAttack(witcher, item) {
    if (item.system.attackSkill) {
        //Check whether item attack skill is melee
        //Since actor can throw bombs relying on Athletic which is also a melee attack skill
        //We need specific logic for bomb throws
        let meleeSkill = witcher.meleeSkills.includes(item.system.attackSkill)
        let rangedSkill = witcher.rangedSkills.includes(item.system.attackSkill)

        if (meleeSkill && rangedSkill) {
            return meleeSkill && !item.system.usingAmmo && !item.system.isThrowable;
        } else {
            return meleeSkill;
        }
    }
}

function isWeaponThrowable(item) {
    return item.system.isThrowable;
}

function isEnoughThrowableWeapon(actor, item) {
    if (item.system.isThrowable) {
        let throwableItems
        throwableItems = actor.items.filter(function (weapon) { return item.type == "weapon" && weapon.name == item.name });

        let quantity = 0
        if (throwableItems[0].system.quantity >= 0) {
            quantity = throwableItems[0].system.quantity
        } else {
            quantity = throwableItems.sum("quantity")
        }
        return quantity > 0
    } else {
        return false
    }
}

export { doesWeaponNeedMeleeSkillToAttack, isWeaponThrowable, isEnoughThrowableWeapon };