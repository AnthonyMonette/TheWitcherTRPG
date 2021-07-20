export const witcher = {};

witcher.statTypes = {
    none: "",
    int: "int",
    ref: "ref",
    dex: "dex",
    body: "body",
    spd: "spd",
    emp: "emp",
    cra: "cra",
    will: "will",
    luck: "luck"
}

witcher.substanceTypes = {
    vitriol: "Vitriol",
    rebis: "Rebis",
    aether: "Aether",
    quebrith: "Quebrith",
    hydragenum: "Hydragenum",
    vermilion: "Vermilion",
    sol: "Sol",
    caelum: "Caelum",
    fulgur: "Fulgur"
}

witcher.Avalability = {
    E: "Everywhere",
    C: "Common",
    P: "Poor",
    R: "Rare",
}

witcher.Concealment = {
    T: "Tiny",
    S: "Small",
    L: "Large",
    NA: "CantHide",
}

witcher.MonsterTypes = {
    Humanoid: "Humanoid",
    Necrophage: "Necrophage",
    Specter: "Specter",
    Beast: "Beast",
    CursedOne: "CursedOne",
    Hybrid: "Hybrid",
    Insectoid: "Insectoid",
    Elementa: "Elementa",
    Relict: "Relict",
    Ogroid: "Ogroid",
    Draconid: "Draconid",
    Vampire: "Vampire",
}

witcher.CritGravity = {
    Simple: "Simple",
    Complex: "Complex",
    Difficult: "Difficult",
    Deadly: "Deadly",
};

witcher.CritGravityDefaultEffect = {
    Simple: "SimpleCrackedJaw",
    Complex: "ComplexMinorHeadWound",
    Difficult: "DifficultSkullFracture",
    Deadly: "DeadlyDecapitated",
};

witcher.CritMod = {
    None: "None",
    Stabilized: "Stabilized",
    Treated: "Treated",
};

witcher.CritDescription = {
    SimpleCrackedJaw: "The blow cracked your jaw, making it hard to speak clearly.",
    SimpleDisfiguringScar: "The blow mangled your face in some way. You are grotesque and difficult to look at.",
    SimpleCrackedRibs: "The blow cracked your ribs, making it painful to breathe and exert strength.",
    SimpleForeignObject: "The blow lodged a piece of clothing or armor in your wound, causing an infection.",
    SimpleSprainedArm: "The blow sprained your arm, making it difficult to manoeuvre.",
    SimpleSprainedLeg: "The blow sprained your leg, making it difficult to walk and manoeuvre.",
    ComplexMinorHeadWound: "The blow rattled your brain and caused some internal bleeding. It's hard to think straight.",
    ComplexLostTeeth: "The blow knocked out some teeth. Roll 1d10 to see how many teeth are lost.",
    ComplexRupturedSpleen: "A tear in your spleen begins bleeding profusely, making you woozy.",
    ComplexBrokenRibs: "The blow breaks your ribs, causing immense pain when you bend and strain.",
    ComplexFracturedArm: "The blow fractures your arm.",
    ComplexFracturedLeg: "The blow fractues your leg.",
    DifficultSkullFracture: "The blow fractures a part of your skull, weakening your head and causing bleeding.",
    DifficultConcussion: "The blow caused a minor concussion.",
    DifficultTornStomach: "The blow rips through your stomach, pouring its contents into your gut.",
    DifficultSuckingChestWound: "The wound tears your lung, which fills your chest with air, crusing organs.",
    DifficultCompoundArmFracture: "The blow crushes your arm. Bone sticks out of the skin.",
    DifficultCompoundLegFracture: "The blow snaps your leg, rendering it useless.",
    DeadlyDecapitated: "The blow either snaps your neck or separates your head from your shoulders.",
    DeadlyDamagedEye: "The blow cuts into or indents your eyeball.",
    DeadlyHearthDamage: "The blow damages your heart.",
    DeadlySepticShock: "The blow damages your intestines, letting waste enter your blood stream.",
    DeadlyDismemberedArm: "The blow renders your arm from your body or damages it beyond repair.",
    DeadlyDismemberedLeg: "The blow tears your leg from your body or damages it beyond repair.",
};

witcher.CritModDescription = {
  SimpleCrackedJaw: { None: "You are at a -2 to Magical Skills & Verbal Combat (Charisma, Persuasion, Seduction, Leadership, Deceit, Social Etiquette and Intimidation.)", Stabilized: "You are at a -1 to Magical Skills & Verbal Combat.", Treated: "You are at a -1 to Magical Skills."},
  SimpleDisfiguringScar: { None: "You take a -3 to empathic Verbal Combat (Charisma, Persuasion, Deceit, Social Etiquette, and Leadership)", Stabilized: "You take a -1 to emphatic Verbal Combat.", Treated: "You take a -1 to Seduction."},
  SimpleCrackedRibs: { None: "You take a -2 to BODY. This does not affect health points.", Stabilized: "You are at a -1 to BODY. ", Treated: "You take a -10 to Encumberance."},
  SimpleForeignObject: { None: "Your Recovery and Critical Healing are affected.", Stabilized: "Your Recovery & Critical Healing are halved.", Treated: "You take a -2 to Recovery and a -1 to your Critical Healing."},
  SimpleSprainedArm: { None: "You take a -2 to actions that use the arm.", Stabilized: "You are at a -1 to actions with that arm.", Treated: "You take a -1 to Physique."},
  SimpleSprainedLeg: { None: "You take a -2 to SPD, Dodge/Escape, and Athletics.", Stabilized: "You take a -1 to SPD, Dodge/Escape, and Athletics.", Treated: "You take a -1 to SPD."},
  ComplexMinorHeadWound: { None: " You take a -1 to INT, WILL and STUN.", Stabilized: "You are at a -1 to INT and WILL.", Treated: "You are at a -1 to WILL."},
  ComplexLostTeeth: { None: "You take a -3 to magical skills and Verbal Combat.", Stabilized: "You take a -2 to magical skills and Verbal Combat.", Treated: "You take a -1 to magical skills and Verbal Combat."},
  ComplexRupturedSpleen: { None: "Make a Stun save every 5 rounds. This wound induced bleeding.", Stabilized: "You must make a Stun save every 10 Rounds.", Treated: "You take a -2 to Stun."},
  ComplexBrokenRibs: { None: "Take a -2 to BODY and a -1 to REF and DEX.", Stabilized: "You are at a -1 to BODY and REF.", Treated: "You are at a -1 to BODY."},
  ComplexFracturedArm: { None: " You take a -3 to actions with that arm.", Stabilized: "You take a -2 to actions with that arm.", Treated: "You take a -1 to actions with that arm."},
  ComplexFracturedLeg: { None: "You take a -3 to SPD, Dodge/Escape, and Athletics.", Stabilized: "You take a -2 to SPD, Dodgle/Escape, and Athletics.", Treated: "-1 to SPD, Dodge/Escape, and Athletics."},
  DifficultSkullFracture: { None: "You take a -1 to INT and DEX, and take quadruple damage from head wounds.", Stabilized: "Take a -1 to INTL and DEX and quadruple damage from head wounds.", Treated: "You take quadruple damage from head wounds."},
  DifficultConcussion: { None: " Make a Stun save every 1d6 rounds and take a -2 to INT, REF, and DEX.", Stabilized: "You take a -1 to INT, REF, and DEX.", Treated: "You take a -1 to INT and DEX."},
  DifficultTornStomach: { None: "You take a -2 to all actions and 4 points of acid damage per round.", Stabilized: "You take a -2 to all actions.", Treated: "You take a -1 to all actions."},
  DifficultSuckingChestWound: { None: "You take a -3 to BODY and SPD. You also start suffocating.", Stabilized: "You take a -2 to BODY and SPD.", Treated: "You take a -1 to BODY and SPD."},
  DifficultCompoundArmFracture: { None: "The arm is rendered useless and you start bleeding.", Stabilized: "That arm is useless.", Treated: "That arm must remain in a sling, but it can hold things."},
  DifficultCompoundLegFracture: { None: "Quarter SPD, Dodge/Escape, and Athletics. This induces bleeding.", Stabilized: "Halves SPD, Dodge/Escape, and Athletics.", Treated: "-2 to SPD, Dodge/Escape, and Athletics."},
  DeadlyDecapitated: { None: "You die immediately.", Stabilized: "This wound cannot be stabilized.", Treated: "This wound cannot be treated."},
  DeadlyDamagedEye: { None: "You take a -5 to sight-based Awareness and -4 to DEX. This wounds begins bleeding.", Stabilized: "You take a -3 to sight-based Awareness and -2 to DEX.", Treated: "Permanent -1 to sight-based Awareness and DEX."},
  DeadlyHearthDamage: { None: "Make an immediate Death save. If you survive, the wound is bleeding and you must quarter your Stamina, SPD, and BODY.", Stabilized: "You halve your Stamina, SPD, and BODY.", Treated: "You take a +2 damage from bleeding permanently."},
  DeadlySepticShock: { None: "Quarter your Stamina, take a -3 INT, WILL, REF, and DEX. You are poisoned.", Stabilized: "Your Stamina is halved and you take a -1 to INT, WILL, REF, and DEX.", Treated: "You take a -5 to Stamina permanently."},
  DeadlyDismemberedArm: { None: "The arm cannot be used and you start bleeding.", Stabilized: "That arm is useless.", Treated: "That arm can be replaced with a prosthetic."},
  DeadlyDismemberedLeg: { None: "Quarter your SPD, Dodge/Escape, and Athletics. This wound begins bleeding.", Stabilized: "You quarter your SPD, Dodge/Escape, and Athletics.", Treated: "The leg can be replaced with a prosthetic."},
}

witcher.CritSimple = {
    SimpleCrackedJaw: "Cracked Jaw",
    SimpleDisfiguringScar: "Disfiguring Scar",
    SimpleCrackedRibs: "Cracked Ribs",
    SimpleForeignObject: "Foreign Object",
    SimpleSprainedArm: "Sprained Arm",
    SimpleSprainedLeg: "Sprained Leg",
};

witcher.CritComplex = {
    ComplexMinorHeadWound: "Minor Head Wound",
    ComplexLostTeeth: "Lost Teeth",
    ComplexRupturedSpleen: "Ruptured Spleen",
    ComplexBrokenRibs: "Broken Ribs",
    ComplexFracturedArm: "Fractured Arm",
    ComplexFracturedLeg: "Fractured Leg",
};

witcher.CritDifficult = {
    DifficultSkullFracture: "Skull Fracture",
    DifficultConcussion: "Concussion",
    DifficultTornStomach: "Torn Stomach",
    DifficultSuckingChestWound: "Sucking Chest Wound",
    DifficultCompoundArmFracture: "Compound Arm Fracture",
    DifficultCompoundLegFracture: "Compound Leg Fracture",
};

witcher.CritDeadly = {
    DeadlyDecapitated: "Decapitated",
    DeadlyDamagedEye: "Damaged Eye",
    DeadlyHearthDamage: "Hearth Damage",
    DeadlySepticShock: "Septic Shock",
    DeadlyDismemberedArm: "Dismembered Arm",
    DeadlyDismemberedLeg: "Dismembered Leg",
};
