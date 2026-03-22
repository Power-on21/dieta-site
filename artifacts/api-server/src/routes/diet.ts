import { Router, type IRouter, type Request, type Response } from "express";
import { db, dietProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SaveDietProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

function calcTMB(gender: string, weightKg: number, heightCm: number, age: number): number {
  if (gender === "male") {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  }
  return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
}

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function calcTDEE(tmb: number, activityLevel: string): number {
  return tmb * (activityMultipliers[activityLevel] ?? 1.2);
}

function calcTargetCalories(tdee: number, goal: string): number {
  if (goal === "lose") return tdee - 500;
  if (goal === "gain") return tdee + 300;
  return tdee;
}

function generateDietPlan(targetCalories: number, goal: string, restrictions: string | null | undefined) {
  const isVegetarian = restrictions?.toLowerCase().includes("vegetarian") || restrictions?.toLowerCase().includes("vegetariana");
  const isVegan = restrictions?.toLowerCase().includes("vegan") || restrictions?.toLowerCase().includes("vegana");

  const protein = Math.round((targetCalories * 0.30) / 4);
  const carbs = Math.round((targetCalories * 0.45) / 4);
  const fat = Math.round((targetCalories * 0.25) / 9);

  const breakfastCals = Math.round(targetCalories * 0.25);
  const snack1Cals = Math.round(targetCalories * 0.10);
  const lunchCals = Math.round(targetCalories * 0.30);
  const snack2Cals = Math.round(targetCalories * 0.10);
  const dinnerCals = Math.round(targetCalories * 0.25);

  const breakfastProtein = Math.round(breakfastCals * 0.30 / 4);
  const breakfastCarbs = Math.round(breakfastCals * 0.45 / 4);
  const breakfastFat = Math.round(breakfastCals * 0.25 / 9);

  const lunchProtein = Math.round(lunchCals * 0.30 / 4);
  const lunchCarbs = Math.round(lunchCals * 0.45 / 4);
  const lunchFat = Math.round(lunchCals * 0.25 / 9);

  const dinnerProtein = Math.round(dinnerCals * 0.30 / 4);
  const dinnerCarbs = Math.round(dinnerCals * 0.45 / 4);
  const dinnerFat = Math.round(dinnerCals * 0.25 / 9);

  const snackProtein = Math.round(snack1Cals * 0.20 / 4);
  const snackCarbs = Math.round(snack1Cals * 0.55 / 4);
  const snackFat = Math.round(snack1Cals * 0.25 / 9);

  const meals = [
    {
      name: "Café da Manhã",
      time: "07:00",
      calories: breakfastCals,
      protein: breakfastProtein,
      carbs: breakfastCarbs,
      fat: breakfastFat,
      foods: isVegan ? [
        { name: "Aveia em flocos", quantity: "60g", calories: Math.round(breakfastCals * 0.35), protein: 6, carbs: 38, fat: 3 },
        { name: "Banana", quantity: "1 unidade média (100g)", calories: Math.round(breakfastCals * 0.20), protein: 1, carbs: 23, fat: 0 },
        { name: "Leite de aveia", quantity: "200ml", calories: Math.round(breakfastCals * 0.20), protein: 2, carbs: 14, fat: 2 },
        { name: "Pasta de amendoim", quantity: "20g", calories: Math.round(breakfastCals * 0.25), protein: 5, carbs: 3, fat: 10 },
      ] : isVegetarian ? [
        { name: "Pão integral", quantity: "2 fatias (60g)", calories: Math.round(breakfastCals * 0.30), protein: 6, carbs: 28, fat: 2 },
        { name: "Ovos mexidos", quantity: "2 ovos", calories: Math.round(breakfastCals * 0.30), protein: 12, carbs: 1, fat: 10 },
        { name: "Fruta (maçã)", quantity: "1 unidade (150g)", calories: Math.round(breakfastCals * 0.20), protein: 0, carbs: 20, fat: 0 },
        { name: "Café com leite desnatado", quantity: "200ml", calories: Math.round(breakfastCals * 0.20), protein: 7, carbs: 10, fat: 0 },
      ] : [
        { name: "Pão integral", quantity: "2 fatias (60g)", calories: Math.round(breakfastCals * 0.25), protein: 6, carbs: 28, fat: 2 },
        { name: "Ovo mexido", quantity: "2 ovos", calories: Math.round(breakfastCals * 0.25), protein: 12, carbs: 1, fat: 10 },
        { name: "Presunto de peru", quantity: "30g", calories: Math.round(breakfastCals * 0.15), protein: 7, carbs: 1, fat: 2 },
        { name: "Fruta (mamão)", quantity: "150g", calories: Math.round(breakfastCals * 0.20), protein: 1, carbs: 18, fat: 0 },
        { name: "Café com leite", quantity: "150ml", calories: Math.round(breakfastCals * 0.15), protein: 5, carbs: 7, fat: 0 },
      ],
    },
    {
      name: "Lanche da Manhã",
      time: "10:00",
      calories: snack1Cals,
      protein: snackProtein,
      carbs: snackCarbs,
      fat: snackFat,
      foods: isVegan ? [
        { name: "Banana", quantity: "1 unidade (100g)", calories: Math.round(snack1Cals * 0.50), protein: 1, carbs: 23, fat: 0 },
        { name: "Amendoim torrado", quantity: "20g", calories: Math.round(snack1Cals * 0.50), protein: 5, carbs: 4, fat: 9 },
      ] : [
        { name: "Iogurte natural desnatado", quantity: "150g", calories: Math.round(snack1Cals * 0.55), protein: 10, carbs: 12, fat: 0 },
        { name: "Mel", quantity: "5g", calories: Math.round(snack1Cals * 0.20), protein: 0, carbs: 4, fat: 0 },
        { name: "Castanha-do-Pará", quantity: "2 unidades (10g)", calories: Math.round(snack1Cals * 0.25), protein: 2, carbs: 1, fat: 7 },
      ],
    },
    {
      name: "Almoço",
      time: "12:30",
      calories: lunchCals,
      protein: lunchProtein,
      carbs: lunchCarbs,
      fat: lunchFat,
      foods: isVegan ? [
        { name: "Arroz integral", quantity: "120g cozido", calories: Math.round(lunchCals * 0.30), protein: 4, carbs: 45, fat: 1 },
        { name: "Feijão carioca", quantity: "100g cozido", calories: Math.round(lunchCals * 0.20), protein: 8, carbs: 21, fat: 1 },
        { name: "Grão-de-bico refogado", quantity: "80g", calories: Math.round(lunchCals * 0.20), protein: 9, carbs: 20, fat: 3 },
        { name: "Salada verde (alface, tomate, pepino)", quantity: "100g", calories: Math.round(lunchCals * 0.10), protein: 2, carbs: 5, fat: 0 },
        { name: "Azeite de oliva", quantity: "1 colher sopa (10ml)", calories: Math.round(lunchCals * 0.10), protein: 0, carbs: 0, fat: 9 },
        { name: "Brócolis no vapor", quantity: "80g", calories: Math.round(lunchCals * 0.10), protein: 3, carbs: 6, fat: 0 },
      ] : isVegetarian ? [
        { name: "Arroz integral", quantity: "120g cozido", calories: Math.round(lunchCals * 0.28), protein: 4, carbs: 45, fat: 1 },
        { name: "Feijão", quantity: "100g cozido", calories: Math.round(lunchCals * 0.18), protein: 8, carbs: 21, fat: 1 },
        { name: "Ovo cozido", quantity: "2 unidades", calories: Math.round(lunchCals * 0.20), protein: 13, carbs: 1, fat: 11 },
        { name: "Salada (alface, tomate, cenoura)", quantity: "100g", calories: Math.round(lunchCals * 0.09), protein: 2, carbs: 8, fat: 0 },
        { name: "Azeite de oliva", quantity: "1 colher sopa", calories: Math.round(lunchCals * 0.10), protein: 0, carbs: 0, fat: 9 },
        { name: "Couve refogada", quantity: "60g", calories: Math.round(lunchCals * 0.05), protein: 2, carbs: 4, fat: 1 },
        { name: "Purê de batata-doce", quantity: "80g", calories: Math.round(lunchCals * 0.10), protein: 1, carbs: 20, fat: 0 },
      ] : [
        { name: "Arroz integral", quantity: "120g cozido", calories: Math.round(lunchCals * 0.22), protein: 4, carbs: 45, fat: 1 },
        { name: "Feijão carioca", quantity: "100g cozido", calories: Math.round(lunchCals * 0.15), protein: 8, carbs: 21, fat: 1 },
        { name: "Frango grelhado", quantity: "150g", calories: Math.round(lunchCals * 0.28), protein: 35, carbs: 0, fat: 5 },
        { name: "Salada (alface, tomate, beterraba)", quantity: "100g", calories: Math.round(lunchCals * 0.08), protein: 2, carbs: 8, fat: 0 },
        { name: "Azeite de oliva", quantity: "1 colher sopa", calories: Math.round(lunchCals * 0.09), protein: 0, carbs: 0, fat: 9 },
        { name: "Couve refogada no alho", quantity: "60g", calories: Math.round(lunchCals * 0.05), protein: 2, carbs: 4, fat: 1 },
        { name: "Batata-doce cozida", quantity: "80g", calories: Math.round(lunchCals * 0.13), protein: 1, carbs: 20, fat: 0 },
      ],
    },
    {
      name: "Lanche da Tarde",
      time: "16:00",
      calories: snack2Cals,
      protein: snackProtein,
      carbs: snackCarbs,
      fat: snackFat,
      foods: isVegan ? [
        { name: "Tapioca com pasta de amendoim", quantity: "30g tapioca + 15g pasta", calories: Math.round(snack2Cals * 0.70), protein: 5, carbs: 22, fat: 8 },
        { name: "Suco de laranja natural", quantity: "200ml", calories: Math.round(snack2Cals * 0.30), protein: 1, carbs: 21, fat: 0 },
      ] : [
        { name: "Barra de proteína", quantity: "1 unidade (40g)", calories: Math.round(snack2Cals * 0.55), protein: 10, carbs: 20, fat: 5 },
        { name: "Maçã", quantity: "1 unidade média (130g)", calories: Math.round(snack2Cals * 0.30), protein: 0, carbs: 19, fat: 0 },
        { name: "Amendoim", quantity: "15g", calories: Math.round(snack2Cals * 0.15), protein: 4, carbs: 3, fat: 7 },
      ],
    },
    {
      name: "Jantar",
      time: "19:30",
      calories: dinnerCals,
      protein: dinnerProtein,
      carbs: dinnerCarbs,
      fat: dinnerFat,
      foods: isVegan ? [
        { name: "Macarrão integral", quantity: "80g cozido", calories: Math.round(dinnerCals * 0.30), protein: 5, carbs: 35, fat: 1 },
        { name: "Molho de tomate caseiro", quantity: "100g", calories: Math.round(dinnerCals * 0.10), protein: 2, carbs: 10, fat: 1 },
        { name: "Lentilha cozida", quantity: "100g", calories: Math.round(dinnerCals * 0.25), protein: 9, carbs: 20, fat: 0 },
        { name: "Abobrinha e cenoura refogadas", quantity: "100g", calories: Math.round(dinnerCals * 0.10), protein: 2, carbs: 8, fat: 2 },
        { name: "Azeite", quantity: "5ml", calories: Math.round(dinnerCals * 0.10), protein: 0, carbs: 0, fat: 5 },
        { name: "Salada de folhas verdes", quantity: "80g", calories: Math.round(dinnerCals * 0.05), protein: 1, carbs: 3, fat: 0 },
        { name: "Abacate", quantity: "30g", calories: Math.round(dinnerCals * 0.10), protein: 0, carbs: 2, fat: 5 },
      ] : isVegetarian ? [
        { name: "Omelete de legumes", quantity: "3 ovos + legumes (200g)", calories: Math.round(dinnerCals * 0.40), protein: 20, carbs: 8, fat: 15 },
        { name: "Arroz integral", quantity: "80g cozido", calories: Math.round(dinnerCals * 0.25), protein: 3, carbs: 30, fat: 1 },
        { name: "Salada de rúcula e tomate", quantity: "100g", calories: Math.round(dinnerCals * 0.10), protein: 2, carbs: 5, fat: 0 },
        { name: "Azeite", quantity: "5ml", calories: Math.round(dinnerCals * 0.08), protein: 0, carbs: 0, fat: 5 },
        { name: "Abacate", quantity: "40g", calories: Math.round(dinnerCals * 0.17), protein: 1, carbs: 2, fat: 7 },
      ] : [
        { name: "Salmão grelhado", quantity: "150g", calories: Math.round(dinnerCals * 0.35), protein: 28, carbs: 0, fat: 12 },
        { name: "Quinoa cozida", quantity: "80g", calories: Math.round(dinnerCals * 0.22), protein: 5, carbs: 25, fat: 2 },
        { name: "Brócolis no vapor", quantity: "100g", calories: Math.round(dinnerCals * 0.08), protein: 3, carbs: 7, fat: 0 },
        { name: "Abobrinha grelhada", quantity: "80g", calories: Math.round(dinnerCals * 0.07), protein: 1, carbs: 5, fat: 0 },
        { name: "Azeite de oliva", quantity: "5ml", calories: Math.round(dinnerCals * 0.09), protein: 0, carbs: 0, fat: 5 },
        { name: "Salada de folhas verdes", quantity: "80g", calories: Math.round(dinnerCals * 0.06), protein: 1, carbs: 3, fat: 0 },
        { name: "Abacate", quantity: "30g", calories: Math.round(dinnerCals * 0.13), protein: 0, carbs: 2, fat: 5 },
      ],
    },
  ];

  return {
    totalCalories: targetCalories,
    totalProtein: protein,
    totalCarbs: carbs,
    totalFat: fat,
    meals,
  };
}

router.get("/diet/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [profile] = await db
    .select()
    .from(dietProfilesTable)
    .where(eq(dietProfilesTable.userId, req.user.id));

  res.json({ profile: profile ?? null });
});

router.put("/diet/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = SaveDietProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input data" });
    return;
  }

  const { age, gender, weightKg, heightCm, activityLevel, goal, restrictions } = parsed.data;

  const tmb = calcTMB(gender, weightKg, heightCm, age);
  const tdee = calcTDEE(tmb, activityLevel);
  const targetCalories = calcTargetCalories(tdee, goal);

  const profileData = {
    userId: req.user.id,
    age,
    gender,
    weightKg,
    heightCm,
    activityLevel,
    goal,
    restrictions: restrictions ?? null,
    tmb: Math.round(tmb),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
  };

  const [profile] = await db
    .insert(dietProfilesTable)
    .values(profileData)
    .onConflictDoUpdate({
      target: dietProfilesTable.userId,
      set: {
        ...profileData,
        updatedAt: new Date(),
      },
    })
    .returning();

  res.json({ profile });
});

router.get("/diet/plan", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [profile] = await db
    .select()
    .from(dietProfilesTable)
    .where(eq(dietProfilesTable.userId, req.user.id));

  if (!profile) {
    res.status(404).json({ error: "Profile not found. Please complete your profile first." });
    return;
  }

  const plan = generateDietPlan(profile.targetCalories, profile.goal, profile.restrictions);

  res.json({ plan, profile });
});

export default router;
