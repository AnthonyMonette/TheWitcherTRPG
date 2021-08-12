export const witcher = {};

witcher.statTypes = {
    none: "",
    int: "WITCHER.Actor.Stat.Int",
    ref: "WITCHER.Actor.Stat.Ref",
    dex: "WITCHER.Actor.Stat.Dex",
    body: "WITCHER.Actor.Stat.Body",
    spd: "WITCHER.Actor.Stat.Spd",
    emp: "WITCHER.Actor.Stat.Emp",
    cra: "WITCHER.Actor.Stat.Cra",
    will: "WITCHER.Actor.Stat.Will",
    luck: "WITCHER.Actor.Stat.Luck",
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
    fulgur: "Fulgur",
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
    SimpleCrackedJaw: "WITCHER.CritWound.SimpleCrackedJaw",
    SimpleDisfiguringScar: "WITCHER.CritWound.SimpleDisfiguringScar",
    SimpleCrackedRibs: "WITCHER.CritWound.SimpleCrackedRibs",
    SimpleForeignObject: "WITCHER.CritWound.SimpleForeignObject",
    SimpleSprainedArm: "WITCHER.CritWound.SimpleSprainedArm",
    SimpleSprainedLeg: "WITCHER.CritWound.SimpleSprainedLeg",
    ComplexMinorHeadWound: "WITCHER.CritWound.ComplexMinorHeadWound",
    ComplexLostTeeth: "WITCHER.CritWound.ComplexLostTeeth",
    ComplexRupturedSpleen: "WITCHER.CritWound.ComplexRupturedSpleen",
    ComplexBrokenRibs: "WITCHER.CritWound.ComplexBrokenRibs",
    ComplexFracturedArm: "WITCHER.CritWound.ComplexFracturedArm",
    ComplexFracturedLeg: "WITCHER.CritWound.ComplexFracturedLeg",
    DifficultSkullFracture: "WITCHER.CritWound.DifficultSkullFracture",
    DifficultConcussion: "WITCHER.CritWound.DifficultConcussion",
    DifficultTornStomach: "WITCHER.CritWound.DifficultTornStomach",
    DifficultSuckingChestWound: "WITCHER.CritWound.DifficultSuckingChestWound",
    DifficultCompoundArmFracture: "WITCHER.CritWound.DifficultCompoundArmFracture",
    DifficultCompoundLegFracture: "WITCHER.CritWound.DifficultCompoundLegFracture",
    DeadlyDecapitated: "WITCHER.CritWound.DeadlyDecapitated",
    DeadlyDamagedEye: "WITCHER.CritWound.DeadlyDamagedEye",
    DeadlyHearthDamage: "WITCHER.CritWound.DeadlyHearthDamage",
    DeadlySepticShock: "WITCHER.CritWound.DeadlySepticShock",
    DeadlyDismemberedArm: "WITCHER.CritWound.DeadlyDismemberedArm",
    DeadlyDismemberedLeg: "WITCHER.CritWound.DeadlyDismemberedLeg",
};

witcher.CritModDescription = {
    SimpleCrackedJaw: { None: "WITCHER.CritWound.Mod.SimpleCrackedJaw.None", Stabilized: "WITCHER.CritWound.Mod.SimpleCrackedJaw.Stabilized", Treated: "WITCHER.CritWound.Mod.SimpleCrackedJaw.Treated"},
    SimpleDisfiguringScar: { None: "WITCHER.CritWound.Mod.SimpleDisfiguringScar.None", Stabilized: "WITCHER.CritWound.Mod.SimpleDisfiguringScar.Stabilized", Treated: "WITCHER.CritWound.Mod.SimpleDisfiguringScar.Treated"},
    SimpleCrackedRibs: { None: "WITCHER.CritWound.Mod.SimpleCrackedRibs.None", Stabilized: "WITCHER.CritWound.Mod.SimpleCrackedRibs.Stabilized", Treated: "WITCHER.CritWound.Mod.SimpleCrackedRibs.Treated"},
    SimpleForeignObject: { None: "WITCHER.CritWound.Mod.SimpleForeignObject.None", Stabilized: "WITCHER.CritWound.Mod.SimpleForeignObject.Stabilized", Treated: "WITCHER.CritWound.Mod.SimpleForeignObject.Treated"},
    SimpleSprainedArm: { None: "WITCHER.CritWound.Mod.SimpleSprainedArm.None", Stabilized: "WITCHER.CritWound.Mod.SimpleSprainedArm.Stabilized.", Treated: "WITCHER.CritWound.Mod.SimpleSprainedArm.Treated"},
    SimpleSprainedLeg: { None: "WITCHER.CritWound.Mod.SimpleSprainedLeg.None", Stabilized: "WITCHER.CritWound.Mod.SimpleSprainedLeg.Stabilized", Treated: "WITCHER.CritWound.Mod.SimpleSprainedLeg.Treated"},
    ComplexMinorHeadWound: { None: "WITCHER.CritWound.Mod.ComplexMinorHeadWound.None", Stabilized: "WITCHER.CritWound.Mod.ComplexMinorHeadWound.Stabilized", Treated: "WITCHER.CritWound.Mod.ComplexMinorHeadWound.Treated"},
    ComplexLostTeeth: { None: "WITCHER.CritWound.Mod.ComplexLostTeeth.None", Stabilized: "WITCHER.CritWound.Mod.ComplexLostTeeth.Stabilized", Treated: "WITCHER.CritWound.Mod.ComplexLostTeeth.Treated"},
    ComplexRupturedSpleen: { None: "WITCHER.CritWound.Mod.ComplexRupturedSpleen.None", Stabilized: "WITCHER.CritWound.Mod.ComplexRupturedSpleen.Stabilized", Treated: "WITCHER.CritWound.Mod.ComplexRupturedSpleen.Treated"},
    ComplexBrokenRibs: { None: "WITCHER.CritWound.Mod.ComplexBrokenRibs.None", Stabilized: "WITCHER.CritWound.Mod.ComplexBrokenRibs.Stabilized", Treated: "WITCHER.CritWound.Mod.ComplexBrokenRibs.Treated"},
    ComplexFracturedArm: { None: "WITCHER.CritWound.Mod.ComplexFracturedArm.None", Stabilized: "WITCHER.CritWound.Mod.ComplexFracturedArm.Stabilized", Treated: "WITCHER.CritWound.Mod.ComplexFracturedArm.Treated"},
    ComplexFracturedLeg: { None: "WITCHER.CritWound.Mod.ComplexFracturedLeg.None", Stabilized: "WITCHER.CritWound.Mod.ComplexFracturedLeg.Stabilized", Treated: "WITCHER.CritWound.Mod.ComplexFracturedLeg.Treated"},
    DifficultSkullFracture: { None: "WITCHER.CritWound.Mod.DifficultSkullFracture.None", Stabilized: "WITCHER.CritWound.Mod.DifficultSkullFracture.Stabilized", Treated: "WITCHER.CritWound.Mod.DifficultSkullFracture.Treated"},
    DifficultConcussion: { None: "WITCHER.CritWound.Mod.DifficultConcussion.None", Stabilized: "WITCHER.CritWound.Mod.DifficultConcussion.Stabilized", Treated: "WITCHER.CritWound.Mod.DifficultConcussion.Treated"},
    DifficultTornStomach: { None: "WITCHER.CritWound.Mod.DifficultTornStomach.None", Stabilized: "WITCHER.CritWound.Mod.DifficultTornStomach.Stabilized", Treated: "WITCHER.CritWound.Mod.DifficultTornStomach.Treated"},
    DifficultSuckingChestWound: { None: "WITCHER.CritWound.Mod.DifficultSuckingChestWound.None", Stabilized: "WITCHER.CritWound.Mod.DifficultSuckingChestWound.Stabilized", Treated: "WITCHER.CritWound.Mod.DifficultSuckingChestWound.Treated"},
    DifficultCompoundArmFracture: { None: "WITCHER.CritWound.Mod.DifficultCompoundArmFracture.None", Stabilized: "WITCHER.CritWound.Mod.DifficultCompoundArmFracture.Stabilized", Treated: "WITCHER.CritWound.Mod.DifficultCompoundArmFracture.Treated"},
    DifficultCompoundLegFracture: { None: "WITCHER.CritWound.Mod.DifficultCompoundLegFracture.None", Stabilized: "WITCHER.CritWound.Mod.DifficultCompoundLegFracture.Stabilized", Treated: "WITCHER.CritWound.Mod.DifficultCompoundLegFracture.Treated"},
    DeadlyDecapitated: { None: "WITCHER.CritWound.Mod.DeadlyDecapitated.None", Stabilized: "WITCHER.CritWound.Mod.DeadlyDecapitated.Stabilized", Treated: "WITCHER.CritWound.Mod.DeadlyDecapitated.Treated"},
    DeadlyDamagedEye: { None: "WITCHER.CritWound.Mod.DeadlyDamagedEye.None", Stabilized: "WITCHER.CritWound.Mod.DeadlyDamagedEye.Stabilized", Treated: "WITCHER.CritWound.Mod.DeadlyDamagedEye.Treated"},
    DeadlyHearthDamage: { None: "WITCHER.CritWound.Mod.DeadlyHearthDamage.None", Stabilized: "WITCHER.CritWound.Mod.DeadlyHearthDamage.Stabilized", Treated: "WITCHER.CritWound.Mod.DeadlyHearthDamage.Treated"},
    DeadlySepticShock: { None: "WITCHER.CritWound.Mod.DeadlySepticShock.None", Stabilized: "WITCHER.CritWound.Mod.DeadlySepticShock.Stabilized", Treated: "WITCHER.CritWound.Mod.DeadlySepticShock.Treated"},
    DeadlyDismemberedArm: { None: "WITCHER.CritWound.Mod.DeadlyDismemberedArm.None", Stabilized: "WITCHER.CritWound.Mod.DeadlyDismemberedArm.Stabilized", Treated: "WITCHER.CritWound.Mod.DeadlyDismemberedArm.Treated"},
    DeadlyDismemberedLeg: { None: "WITCHER.CritWound.Mod.DeadlyDismemberedLeg.None", Stabilized: "WITCHER.CritWound.Mod.DeadlyDismemberedLeg.Stabilized", Treated: "WITCHER.CritWound.Mod.DeadlyDismemberedLeg.Treated"},
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
