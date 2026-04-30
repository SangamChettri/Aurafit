const { prisma } = require('../config/prisma');

const exercises = [
  // Chest
  {
    name: 'Bench Press',
    category: 'Barbell',
    muscleGroup: 'Chest',
    equipment: 'Barbell, Bench',
    instructions: 'Lie flat on a bench with feet planted on the floor. Grip the barbell slightly wider than shoulder-width. Lower the bar to your chest with control, then press up explosively until arms are fully extended.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Incline Bench Press',
    category: 'Barbell',
    muscleGroup: 'Chest',
    equipment: 'Barbell, Incline Bench',
    instructions: 'Set bench to 30-45 degree incline. Grip barbell slightly wider than shoulders. Lower to upper chest, then press up until arms are locked out. Focus on squeezing the upper chest.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Dumbbell Fly',
    category: 'Dumbbell',
    muscleGroup: 'Chest',
    equipment: 'Dumbbells, Bench',
    instructions: 'Lie on bench holding dumbbells above chest with slight elbow bend. Lower arms out to sides in a wide arc until you feel chest stretch. Bring dumbbells back up, squeezing chest at top.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Cable Fly',
    category: 'Cable',
    muscleGroup: 'Chest',
    equipment: 'Cable Machine',
    instructions: 'Set cables to shoulder height. Step forward with staggered stance. With slight elbow bend, bring handles together in front of chest, squeezing pecs. Return slowly with control.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Push-ups',
    category: 'Bodyweight',
    muscleGroup: 'Chest',
    equipment: 'None',
    instructions: 'Start in plank position with hands under shoulders. Lower body until chest nearly touches floor. Push back up to starting position, keeping core tight throughout.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Dips',
    category: 'Bodyweight',
    muscleGroup: 'Chest',
    equipment: 'Parallel Bars',
    instructions: 'Grip parallel bars and lift body. Lean forward slightly to target chest. Lower until elbows reach 90 degrees. Press up powerfully to starting position.',
    isCustom: false,
    isActive: true
  },

  // Back
  {
    name: 'Pull-ups',
    category: 'Bodyweight',
    muscleGroup: 'Back',
    equipment: 'Pull-up Bar',
    instructions: 'Grip bar slightly wider than shoulders with palms facing away. Hang with arms fully extended. Pull body up until chin clears bar. Lower with control to full extension.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Barbell Row',
    category: 'Barbell',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    instructions: 'Hinge at hips with flat back, holding barbell with overhand grip. Pull bar to lower chest/upper abs, squeezing shoulder blades together. Lower bar with control.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Lat Pulldown',
    category: 'Machine',
    muscleGroup: 'Back',
    equipment: 'Lat Pulldown Machine',
    instructions: 'Sit with thighs secured under pads. Grip bar wider than shoulders. Pull bar down to upper chest while leaning slightly back. Squeeze lats at bottom, then slowly return.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Seated Cable Row',
    category: 'Cable',
    muscleGroup: 'Back',
    equipment: 'Cable Row Machine',
    instructions: 'Sit with knees slightly bent, chest up. Grip handle with both hands. Pull handle to lower abdomen, squeezing shoulder blades. Extend arms fully on return without rounding back.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'T-Bar Row',
    category: 'Barbell',
    muscleGroup: 'Back',
    equipment: 'T-Bar Row Machine or Landmine',
    instructions: 'Straddle the bar with flat back. Grip handles and pull weight up toward chest. Squeeze shoulder blades at top. Lower weight with control, keeping core engaged.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Face Pull',
    category: 'Cable',
    muscleGroup: 'Back',
    equipment: 'Cable Machine, Rope Attachment',
    instructions: 'Set cable at upper chest height. Grip rope with thumbs facing you. Pull toward face, separating hands and rotating externally. Squeeze rear delts at peak contraction.',
    isCustom: false,
    isActive: true
  },

  // Shoulders
  {
    name: 'Overhead Press',
    category: 'Barbell',
    muscleGroup: 'Shoulders',
    equipment: 'Barbell',
    instructions: 'Stand with feet shoulder-width apart. Rack barbell at upper chest. Press weight directly overhead until arms lock out. Lower with control to starting position.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Arnold Press',
    category: 'Dumbbell',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    instructions: 'Start with dumbbells at shoulder height, palms facing you. Rotate palms outward as you press overhead. Reverse the motion on the way down.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Lateral Raise',
    category: 'Dumbbell',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    instructions: 'Stand holding dumbbells at sides. With slight elbow bend, raise arms out to sides until parallel with floor. Lower slowly with control.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Front Raise',
    category: 'Dumbbell',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    instructions: 'Hold dumbbells in front of thighs. With slight elbow bend, raise arms forward and up to shoulder height. Lower with control. Alternate or lift both together.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Rear Delt Fly',
    category: 'Dumbbell',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells, Bench',
    instructions: 'Sit on bench edge, lean forward with chest on knees. Hold dumbbells under legs. Raise arms out to sides, squeezing rear delts. Lower with control.',
    isCustom: false,
    isActive: true
  },

  // Biceps
  {
    name: 'Barbell Curl',
    category: 'Barbell',
    muscleGroup: 'Biceps',
    equipment: 'Barbell',
    instructions: 'Stand holding barbell with underhand grip, arms extended. Curl bar up toward chest, keeping elbows tucked. Squeeze biceps at top, then lower slowly.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Hammer Curl',
    category: 'Dumbbell',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbells',
    instructions: 'Hold dumbbells with neutral grip (palms facing each other). Curl weights up while keeping elbows stationary. Lower with control, targeting brachialis.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Concentration Curl',
    category: 'Dumbbell',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbell, Bench',
    instructions: 'Sit on bench, lean forward with elbow resting on inner thigh. Curl dumbbell up toward shoulder, squeezing bicep. Lower slowly and repeat.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Cable Curl',
    category: 'Cable',
    muscleGroup: 'Biceps',
    equipment: 'Cable Machine, Bar Attachment',
    instructions: 'Stand facing cable machine with bar at lower position. Curl bar up toward chest, keeping elbows at sides. Squeeze at top and lower with tension.',
    isCustom: false,
    isActive: true
  },

  // Triceps
  {
    name: 'Tricep Pushdown',
    category: 'Cable',
    muscleGroup: 'Triceps',
    equipment: 'Cable Machine, Rope or Bar',
    instructions: 'Stand facing cable with elbows tucked at sides. Push bar/rope down until arms fully extend. Squeeze triceps, then return to starting position.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Skull Crushers',
    category: 'Barbell',
    muscleGroup: 'Triceps',
    equipment: 'Barbell or EZ-Bar, Bench',
    instructions: 'Lie on bench holding bar over chest. Lower bar toward forehead by bending elbows. Keep upper arms stationary. Extend arms to return to start.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Overhead Tricep Extension',
    category: 'Dumbbell',
    muscleGroup: 'Triceps',
    equipment: 'Dumbbell or Plate',
    instructions: 'Hold dumbbell overhead with both hands. Lower weight behind head by bending elbows. Extend arms back up, focusing on tricep contraction.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Diamond Push-ups',
    category: 'Bodyweight',
    muscleGroup: 'Triceps',
    equipment: 'None',
    instructions: 'Form diamond shape with hands under chest. Lower body keeping elbows tucked close to sides. Push back up, focusing on tricep engagement.',
    isCustom: false,
    isActive: true
  },

  // Legs
  {
    name: 'Squat',
    category: 'Barbell',
    muscleGroup: 'Legs',
    equipment: 'Barbell, Squat Rack',
    instructions: 'Place barbell on upper back/shoulders. Stand with feet shoulder-width apart. Lower hips back and down until thighs parallel to floor. Drive through heels to stand.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Romanian Deadlift',
    category: 'Barbell',
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    instructions: 'Hold barbell with overhand grip, feet hip-width apart. Hinge at hips pushing glutes back while keeping legs nearly straight. Lower bar along legs until hamstrings stretch, then return.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Leg Press',
    category: 'Machine',
    muscleGroup: 'Legs',
    equipment: 'Leg Press Machine',
    instructions: 'Sit in machine with back flat against pad. Place feet shoulder-width on platform. Release safety and lower weight by bending knees to 90 degrees. Press back to start.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Leg Curl',
    category: 'Machine',
    muscleGroup: 'Legs',
    equipment: 'Leg Curl Machine',
    instructions: 'Lie face down with ankles under pad. Curl legs up toward glutes by contracting hamstrings. Squeeze at top, then lower with control.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Leg Extension',
    category: 'Machine',
    muscleGroup: 'Legs',
    equipment: 'Leg Extension Machine',
    instructions: 'Sit with back against pad, ankles behind roller. Extend legs until fully straight, squeezing quadriceps. Lower weight slowly with control.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Calf Raise',
    category: 'Machine',
    muscleGroup: 'Legs',
    equipment: 'Calf Raise Machine',
    instructions: 'Position shoulders under pads, balls of feet on platform. Lower heels below platform level to stretch calves. Push up onto toes, squeezing calves at top.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Hip Thrust',
    category: 'Barbell',
    muscleGroup: 'Legs',
    equipment: 'Barbell, Bench',
    instructions: 'Sit with back against bench, barbell across hips. Drive through heels to lift hips until body forms straight line. Squeeze glutes at top, lower with control.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Lunges',
    category: 'Bodyweight',
    muscleGroup: 'Legs',
    equipment: 'None',
    instructions: 'Step forward with one leg, lowering hips until both knees reach 90 degrees. Push off front foot to return to standing. Alternate legs with each rep.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Step-ups',
    category: 'Bodyweight',
    muscleGroup: 'Legs',
    equipment: 'Bench or Box',
    instructions: 'Step up onto bench with one foot, driving through heel. Bring other foot up to meet it. Step back down and repeat, alternating leading leg.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Glute Bridge',
    category: 'Bodyweight',
    muscleGroup: 'Legs',
    equipment: 'None',
    instructions: 'Lie on back with knees bent, feet flat on floor. Lift hips off floor until body forms straight line from shoulders to knees. Squeeze glutes at top, lower slowly.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Box Jump',
    category: 'Bodyweight',
    muscleGroup: 'Legs',
    equipment: 'Plyo Box',
    instructions: 'Stand facing box with feet shoulder-width apart. Drop into quarter squat and explode upward, jumping onto box. Land softly with both feet, stand fully.',
    isCustom: false,
    isActive: true
  },

  // Core
  {
    name: 'Plank',
    category: 'Bodyweight',
    muscleGroup: 'Core',
    equipment: 'None',
    instructions: 'Support body on forearms and toes with elbows under shoulders. Keep body in straight line from head to heels. Hold position while breathing normally.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Crunches',
    category: 'Bodyweight',
    muscleGroup: 'Core',
    equipment: 'None',
    instructions: 'Lie on back with knees bent, feet flat. Place hands behind head. Lift shoulders off floor by contracting abs, curling upper body toward knees. Lower with control.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Russian Twist',
    category: 'Bodyweight',
    muscleGroup: 'Core',
    equipment: 'None',
    instructions: 'Sit with knees bent, lean back slightly. Lift feet off floor. Rotate torso side to side, touching hands to floor beside hips each time. Keep core tight.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Hanging Leg Raise',
    category: 'Bodyweight',
    muscleGroup: 'Core',
    equipment: 'Pull-up Bar',
    instructions: 'Hang from bar with straight arms. Lift legs by curling hips and knees up toward chest. Lower with control, avoiding swinging.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Ab Wheel Rollout',
    category: 'Other',
    muscleGroup: 'Core',
    equipment: 'Ab Wheel',
    instructions: 'Kneel holding ab wheel in front of knees. Roll forward extending body into plank position. Roll back to starting position using core strength.',
    isCustom: false,
    isActive: true
  },

  // Full Body
  {
    name: 'Deadlift',
    category: 'Barbell',
    muscleGroup: 'FullBody',
    equipment: 'Barbell',
    instructions: 'Stand with feet hip-width apart, barbell over mid-foot. Grip bar just outside legs. Hinge at hips, keeping back flat, and stand up with bar. Lower with control.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Kettlebell Swing',
    category: 'Other',
    muscleGroup: 'FullBody',
    equipment: 'Kettlebell',
    instructions: 'Stand with feet shoulder-width apart, kettlebell between legs. Hinge at hips and swing kettlebell up to chest height using hip power. Let it fall back between legs.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Turkish Get-Up',
    category: 'Other',
    muscleGroup: 'FullBody',
    equipment: 'Kettlebell or Dumbbell',
    instructions: 'Lie on back holding weight overhead with one arm. Rise to standing while keeping weight overhead at all times. Reverse motion to return to floor.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Farmers Walk',
    category: 'Other',
    muscleGroup: 'FullBody',
    equipment: 'Dumbbells or Kettlebells',
    instructions: 'Hold heavy weights at sides with arms straight. Walk forward maintaining upright posture, tight core, and steady pace. Continue for set distance or time.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Burpees',
    category: 'Bodyweight',
    muscleGroup: 'FullBody',
    equipment: 'None',
    instructions: 'Drop into squat, kick feet back to plank. Do push-up, jump feet back to hands. Explode up into jump with arms overhead. Land and immediately repeat.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Clean and Press',
    category: 'Barbell',
    muscleGroup: 'FullBody',
    equipment: 'Barbell',
    instructions: 'Start with barbell on floor. Explosively pull bar to shoulders in clean motion. Dip slightly then press bar overhead. Lower bar to floor to complete rep.',
    isCustom: false,
    isActive: true
  },

  // Cardio
  {
    name: 'Treadmill Run',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Treadmill',
    instructions: 'Set treadmill to desired speed and incline. Maintain steady running form with upright posture, arms pumping naturally. Adjust intensity as needed for goals.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Rowing Machine',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Rowing Machine',
    instructions: 'Sit on machine, secure feet in straps. Grip handle, push through legs, lean back slightly, pull handle to lower chest. Reverse sequence to starting position.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Jump Rope',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Jump Rope',
    instructions: 'Hold rope handles with elbows at sides. Rotate wrists to swing rope over head and under feet. Jump just enough to clear rope, land softly on balls of feet.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Battle Ropes',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Battle Ropes',
    instructions: 'Stand with feet shoulder-width apart, knees slightly bent. Hold rope ends with arms extended. Create alternating waves by moving arms up and down rapidly.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Cycling',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Stationary Bike',
    instructions: 'Adjust seat height so legs almost fully extend at bottom of pedal stroke. Maintain steady cadence, adjusting resistance for intensity. Keep upper body relaxed.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Stair Climber',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Stair Climber Machine',
    instructions: 'Step onto machine, select program. Place hands lightly on rails for balance. Step continuously, pushing through full foot. Maintain upright posture throughout.',
    isCustom: false,
    isActive: true
  },
  {
    name: 'Mountain Climbers',
    category: 'Bodyweight',
    muscleGroup: 'Cardio',
    equipment: 'None',
    instructions: 'Start in plank position. Drive one knee toward chest, then quickly switch legs in running motion. Keep hips low and core tight throughout exercise.',
    isCustom: false,
    isActive: true
  }
];

async function seedExercises() {
  console.log(`Seeding ${exercises.length} exercises...`);

  let created = 0;
  let skipped = 0;

  for (const exercise of exercises) {
    try {
      const existing = await prisma.exerciseLibrary.findFirst({
        where: { name: exercise.name }
      });

      if (existing) {
        console.log(`  Skipped: ${exercise.name} (already exists)`);
        skipped++;
        continue;
      }

      await prisma.exerciseLibrary.create({
        data: exercise
      });
      console.log(`  Created: ${exercise.name}`);
      created++;
    } catch (error) {
      console.error(`  Error creating ${exercise.name}:`, error.message);
    }
  }

  console.log(`\nComplete! Created: ${created}, Skipped: ${skipped}, Total: ${exercises.length}`);
}

seedExercises()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
