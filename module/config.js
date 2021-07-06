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
    Humanoids: "Humanoids",
    Necrophages: "Necrophages",
    Specters: "Specters",
    Beasts: "Beasts",
    CursedOnes: "CursedOnes",
    Hybrids: "Hybrids",
    Insectoids: "Insectoids",
    Elementa: "Elementa",
    Relicts: "Relicts",
    Ogroids: "Ogroids",
    Draconids: "Draconids",
    Vampires: "Vampires",
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
    SimpleCrackedJaw:
      "The blow cracked your jaw, making it hard to speak clearly. You are at a -2 to Magical Skills & Verbal Combat (Charisma, Persuasion, Seduction, Leadership, Deceit, Social Etiquette and Intimidation.)",
    SimpleDisfiguringScar:
      "The blow mangled your face in some way. You are grotesque and difficult to look at. You take a -3 to empathic Verbal Combat (Charisma, Persuasion, Deceit, Social Etiquette, and Leadership)",
    SimpleCrackedRibs:
      "The blow cracked your ribs, making it painful to breathe and exert strength. You take a -2 to BODY. This does not affect health points",
    SimpleForeignObject:
      "The blow lodged a piece of clothing or armor in your wound, causing an infection. Your Recovery and Critical Healing are affected.",
    SimpleSprainedArm:
      "The blow sprained your arm, making it difficult to manoeuvre. You take a -2 to actions that use the arm.",
    SimpleSprainedLeg:
      "The blow sprained your leg, making it difficult to walk and manoeuvre. You take a -2 to SPD, Dodge/Escape, and Athletics.",
    ComplexMinorHeadWound:
      "The blow rattled your brain and caused some internal bleeding. It's hard to think straight. You take a -1 to INT, WILL and STUN.",
    ComplexLostTeeth:
      "The blow knocked out some teeth. Roll 1d10 to see how many teeth are lost. You take a -3 to magical skills and Verbal Combat.",
    ComplexRupturedSpleen:
      "A tear in your spleen begins bleeding profusely, making you woozy. Make a Stun save every 5 rounds. This wound induced bleeding.",
    ComplexBrokenRibs:
      "The blow breaks your ribs, causing immense pain when you bend and strain. Take a -2 to BODY and a -1 to REF and DEX.",
    ComplexFracturedArm:
      "The blow fractures your arm. You take a -3 to actions with that arm.",
    ComplexFracturedLeg:
      "The blow fractues your leg. You take a -3 to SPD, Dodge/Escape, and Athletics.",
    DifficultSkullFracture:
      "The blow fractures a part of your skull, weakening your head and causing bleeding. You take a -1 to INT and DEX, and take quadruple damage from head wounds.",
    DifficultConcussion:
      "The blow caused a minor concussion. Make a Stun save every 1d6 rounds and take a -2 to INT, REF, and DEX.",
    DifficultTornStomach:
      "The blow rips through your stomach, pouring its contents into your gut. You take a -2 to all actions and 4 points of acid damage per round.",
    DifficultSuckingChestWound:
      "The wound tears your lung, which fills your chest with air, crusing organs. You take a -3 to BODY and SPD. You also start suffocating.",
    DifficultCompoundArmFracture:
      "The blow crushes your arm. Bone sticks out of the skin. The arm is rendered useless and you start bleeding.",
    DifficultCompoundLegFracture:
      "The blow snaps your leg, rendering it useless. Quarter SPD, Dodge/Escape, and Athletics. This induces bleeding.",
    DeadlyDecapitated:
      "The blow either snaps your neck or separates your head from your shoulders. You die immediately.",
    DeadlyDamagedEye:
      "The blow cuts into or indents your eyeball. You take a -5 to sight-based Awareness and -4 to DEX. This wounds begins bleeding.",
    DeadlyHearthDamage:
      "The blow damages your heart. Make an immediate Death save. If you survive, the wound is bleeding and you must quarter your Stamina, SPD, and BODY.",
    DeadlySepticShock:
      "The blow damages your intestines, letting waste enter your blood stream. Quarter your Stamina, take a -3 INT, WILL, REF, and DEX. You are poisoned.",
    DeadlyDismemberedArm:
      "The blow renders your arm from your body or damages it beyond repair. The arm cannot be used and you start bleeding.",
    DeadlyDismemberedLeg:
      "The blow tears your leg from your body or damages it beyond repair. Quarter your SPD, Dodge/Escape, and Athletics. This wound begins bleeding.",
};

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
