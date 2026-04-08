import savingsData from "@/data/mock-energy-savings.json";
import equipmentCatalog from "@/data/equipment-catalog.json";
import rebatePrograms from "@/data/rebate-programs.json";
import addressProfiles from "@/data/mock-address-profiles.json";

export type HomeSizeBucket = "small" | "medium" | "large";
export type HomeAgeBucket = "pre_1980" | "1980_to_2000" | "post_2000";
export type HeatingSystem = "gas_furnace" | "oil_furnace" | "electric_baseboard" | "propane_furnace";
export type UpgradeCategory = "heat_pump" | "insulation" | "electrical_panel" | "solar_pv" | "ev_charger" | "battery_storage" | "windows";

export interface HomeProfile {
  address: string;
  lat?: number;
  lng?: number;
  estimatedSqft: number;
  yearBuilt: number;
  footprintSqm: number;
  roofAreaSqm: number;
  climateZone: string;
  hasGarage: boolean;
  heatingSystemAssumption: string;
}

export interface IntakeAnswers {
  heatingSystem: HeatingSystem;
  homeSize: string;
  utilityTypes: string[];
  annualUtilitySpend: string;
  primaryGoals: string[];
}

export interface UpgradeRecommendation {
  category: UpgradeCategory;
  label: string;
  description: string;
  priority: "high" | "medium" | "low";
  costMin: number;
  costMax: number;
  annualSavingsMin: number;
  annualSavingsMax: number;
  co2Reduction: number;
  hasRebates: boolean;
}

export interface RebateResult {
  programId: string;
  name: string;
  administrator: string;
  level: string;
  amount: number;
  applicationUrl: string;
  notes: string;
  isLoan: boolean;
}

export interface ProjectSummary {
  totalCostMin: number;
  totalCostMax: number;
  totalRebates: number;
  netCostMin: number;
  netCostMax: number;
  annualSavingsMin: number;
  annualSavingsMax: number;
  paybackYearsMin: number;
  paybackYearsMax: number;
  co2ReductionTonnes: number;
  tenYearSavings: number[];
}

export function getHomeSizeBucket(sqft: number): HomeSizeBucket {
  if (sqft < 1200) return "small";
  if (sqft <= 2000) return "medium";
  return "large";
}

export function getHomeAgeBucket(yearBuilt: number): HomeAgeBucket {
  if (yearBuilt < 1980) return "pre_1980";
  if (yearBuilt <= 2000) return "1980_to_2000";
  return "post_2000";
}

export function lookupAddressProfile(address: string): HomeProfile {
  const normalizedAddress = address.toLowerCase().trim();
  const match = addressProfiles.profiles.find(
    (p) => normalizedAddress.includes(p.address.toLowerCase().split(",")[0].trim())
  );

  if (match) {
    return {
      address: match.address,
      estimatedSqft: match.estimatedSqft,
      yearBuilt: match.yearBuilt,
      footprintSqm: match.footprintSqm,
      roofAreaSqm: match.roofAreaSqm,
      climateZone: match.climateZone,
      hasGarage: match.hasGarage,
      heatingSystemAssumption: match.heatingSystemAssumption,
    };
  }

  return {
    address,
    estimatedSqft: addressProfiles.defaultProfile.estimatedSqft,
    yearBuilt: addressProfiles.defaultProfile.yearBuilt,
    footprintSqm: addressProfiles.defaultProfile.footprintSqm,
    roofAreaSqm: addressProfiles.defaultProfile.roofAreaSqm,
    climateZone: addressProfiles.defaultProfile.climateZone,
    hasGarage: addressProfiles.defaultProfile.hasGarage,
    heatingSystemAssumption: addressProfiles.defaultProfile.heatingSystemAssumption,
  };
}

export function getSavingsEstimate(
  category: UpgradeCategory,
  heatingSystem: HeatingSystem,
  homeSizeBucket: HomeSizeBucket,
  homeAgeBucket: HomeAgeBucket
): { annualSavingsLow: number; annualSavingsHigh: number; co2Reduction: number } {
  const match = savingsData.savings.find(
    (s) =>
      s.upgradeCategory === category &&
      s.heatingSystemReplaced === heatingSystem &&
      s.homeSizeBucket === homeSizeBucket &&
      s.homeAgeBucket === homeAgeBucket
  );

  if (match) {
    return {
      annualSavingsLow: match.annualSavingsLowCad,
      annualSavingsHigh: match.annualSavingsHighCad,
      co2Reduction: match.co2ReductionTonnesPerYear,
    };
  }

  const categoryMatch = savingsData.savings.find((s) => s.upgradeCategory === category);
  if (categoryMatch) {
    return {
      annualSavingsLow: categoryMatch.annualSavingsLowCad,
      annualSavingsHigh: categoryMatch.annualSavingsHighCad,
      co2Reduction: categoryMatch.co2ReductionTonnesPerYear,
    };
  }

  return { annualSavingsLow: 300, annualSavingsHigh: 600, co2Reduction: 0.5 };
}

export function getRecommendations(
  intake: IntakeAnswers,
  profile: HomeProfile
): UpgradeRecommendation[] {
  const sizeBucket = getHomeSizeBucket(profile.estimatedSqft);
  const ageBucket = getHomeAgeBucket(profile.yearBuilt);
  const recommendations: UpgradeRecommendation[] = [];

  const categories = Object.keys(equipmentCatalog) as UpgradeCategory[];

  for (const category of categories) {
    const catData = equipmentCatalog[category as keyof typeof equipmentCatalog];
    const products = catData.products;
    const costMin = Math.min(...products.map((p) => p.installedCostMin));
    const costMax = Math.max(...products.map((p) => p.installedCostMax));
    const hasRebates = products.some((p) => p.rebateEligible);

    const savings = getSavingsEstimate(category, intake.heatingSystem, sizeBucket, ageBucket);

    let priority: "high" | "medium" | "low" = "low";

    if (category === "heat_pump") {
      if (intake.heatingSystem === "gas_furnace" || intake.heatingSystem === "oil_furnace") {
        priority = "high";
      } else if (intake.heatingSystem === "electric_baseboard") {
        priority = "medium";
      }
    } else if (category === "insulation") {
      if (profile.yearBuilt < 1995) {
        priority = "high";
      } else if (profile.yearBuilt < 2005) {
        priority = "medium";
      }
    } else if (category === "windows") {
      if (profile.yearBuilt < 1990) {
        priority = "high";
      } else if (profile.yearBuilt < 2005) {
        priority = "medium";
      }
    } else if (category === "ev_charger") {
      if (intake.primaryGoals.includes("ev_charging")) {
        priority = "high";
      }
    } else if (category === "solar_pv") {
      if (intake.primaryGoals.includes("lower_bills") || intake.primaryGoals.includes("sustainability")) {
        priority = "medium";
      }
    } else if (category === "electrical_panel") {
      priority = "low";
    } else if (category === "battery_storage") {
      if (intake.primaryGoals.includes("energy_independence")) {
        priority = "medium";
      }
    }

    if (intake.primaryGoals.includes("lower_bills") && (category === "heat_pump" || category === "insulation")) {
      if (priority === "medium") priority = "high";
    }
    if (intake.primaryGoals.includes("comfort") && category === "insulation") {
      if (priority === "low") priority = "medium";
    }

    recommendations.push({
      category,
      label: catData.label,
      description: catData.description,
      priority,
      costMin,
      costMax,
      annualSavingsMin: savings.annualSavingsLow,
      annualSavingsMax: savings.annualSavingsHigh,
      co2Reduction: savings.co2Reduction,
      hasRebates,
    });
  }

  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return recommendations;
}

export function getApplicableRebates(
  selectedUpgrades: UpgradeCategory[],
  _address?: string
): RebateResult[] {
  const results: RebateResult[] = [];

  for (const program of rebatePrograms.programs) {
    if (!program.active) continue;

    const applicableUpgrades = selectedUpgrades.filter((u) =>
      program.eligibleUpgrades.includes(u)
    );

    if (applicableUpgrades.length === 0) continue;

    let amount = 0;
    if (program.isLoan) {
      amount = program.maxAmount;
    } else {
      const limits: Record<string, number> = program.perUpgradeLimits;
      for (const upgrade of applicableUpgrades) {
        const limit = limits[upgrade] ?? 0;
        amount += limit;
      }
      amount = Math.min(amount, program.maxAmount);
    }

    results.push({
      programId: program.id,
      name: program.name,
      administrator: program.administrator,
      level: program.level,
      amount,
      applicationUrl: program.applicationUrl,
      notes: program.notes,
      isLoan: program.isLoan,
    });
  }

  return results;
}

export function calculateProjectSummary(
  selectedUpgrades: UpgradeCategory[],
  selectedProducts: Record<string, string>,
  intake: IntakeAnswers,
  profile: HomeProfile
): ProjectSummary {
  const sizeBucket = getHomeSizeBucket(profile.estimatedSqft);
  const ageBucket = getHomeAgeBucket(profile.yearBuilt);

  let totalCostMin = 0;
  let totalCostMax = 0;
  let annualSavingsMin = 0;
  let annualSavingsMax = 0;
  let co2ReductionTonnes = 0;

  for (const category of selectedUpgrades) {
    const catData = equipmentCatalog[category as keyof typeof equipmentCatalog];
    if (!catData) continue;

    const productId = selectedProducts[category];
    const product = catData.products.find((p) => p.id === productId) || catData.products[0];

    totalCostMin += product.installedCostMin;
    totalCostMax += product.installedCostMax;

    const savings = getSavingsEstimate(category, intake.heatingSystem, sizeBucket, ageBucket);
    annualSavingsMin += savings.annualSavingsLow;
    annualSavingsMax += savings.annualSavingsHigh;
    co2ReductionTonnes += savings.co2Reduction;
  }

  const rebates = getApplicableRebates(selectedUpgrades);
  const totalRebates = rebates
    .filter((r) => !r.isLoan)
    .reduce((sum, r) => sum + r.amount, 0);

  const netCostMin = Math.max(0, totalCostMin - totalRebates);
  const netCostMax = Math.max(0, totalCostMax - totalRebates);

  const avgAnnualSavings = (annualSavingsMin + annualSavingsMax) / 2;
  const avgNetCost = (netCostMin + netCostMax) / 2;

  const paybackYearsMin = avgAnnualSavings > 0 ? netCostMin / avgAnnualSavings : 0;
  const paybackYearsMax = avgAnnualSavings > 0 ? netCostMax / avgAnnualSavings : 0;

  const tenYearSavings: number[] = [];
  for (let year = 1; year <= 10; year++) {
    tenYearSavings.push(Math.round(avgAnnualSavings * year));
  }

  return {
    totalCostMin,
    totalCostMax,
    totalRebates,
    netCostMin,
    netCostMax,
    annualSavingsMin,
    annualSavingsMax,
    paybackYearsMin: Math.round(paybackYearsMin * 10) / 10,
    paybackYearsMax: Math.round(paybackYearsMax * 10) / 10,
    co2ReductionTonnes: Math.round(co2ReductionTonnes * 10) / 10,
    tenYearSavings,
  };
}

export function getEnerGuideRating(yearBuilt: number, heatingSystem: HeatingSystem): number {
  let base = 50;
  if (yearBuilt >= 2010) base = 72;
  else if (yearBuilt >= 2000) base = 65;
  else if (yearBuilt >= 1990) base = 58;
  else if (yearBuilt >= 1980) base = 52;
  else base = 42;

  if (heatingSystem === "electric_baseboard") base -= 5;
  if (heatingSystem === "oil_furnace") base -= 8;

  return Math.max(20, Math.min(100, base));
}

export function getEstimatedAnnualEnergyCost(
  sqft: number,
  yearBuilt: number,
  heatingSystem: HeatingSystem
): number {
  let baseCostPerSqft = 2.5;

  if (yearBuilt < 1980) baseCostPerSqft = 3.2;
  else if (yearBuilt < 2000) baseCostPerSqft = 2.8;
  else baseCostPerSqft = 2.2;

  if (heatingSystem === "oil_furnace") baseCostPerSqft *= 1.3;
  if (heatingSystem === "electric_baseboard") baseCostPerSqft *= 1.15;

  return Math.round(sqft * baseCostPerSqft);
}
