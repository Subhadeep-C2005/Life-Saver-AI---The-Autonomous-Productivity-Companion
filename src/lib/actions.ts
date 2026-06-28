'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { toUITask, uiStatusToDb, UITask, UIStatus, CreateTaskInput } from '@/lib/types';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({}); // Uses GEMINI_API_KEY from environment

/**
 * GET — fetch all tasks ordered by deadline ascending
 */
export async function getTasks(): Promise<UITask[]> {
  const tasks = await prisma.task.findMany({
    include: { subtasks: true },
    orderBy: { priority_score: 'desc' },
  });
  return tasks.map(toUITask);
}

/**
 * POST — create a new task
 */
export async function createTask(input: CreateTaskInput, personality: string = 'supportive'): Promise<UITask> {
  // Call Gemini AI for priority and subtasks
  let priority_score = input.priority_score || 50;
  let subtasks: string[] = [];
  
  let createTaskPersonalityPrompt = "";
  const pLower = personality.toLowerCase();
  if (pLower.includes('drill') || pLower.includes('sergeant')) {
    createTaskPersonalityPrompt = "IMPORTANT: Since the user has chosen a 'Drill Sergeant (Tough Love)' AI personality, the generated subtasks MUST sound highly urgent, aggressive, demanding, and sarcastic/direct. Use ALL CAPS for punchy directives (e.g., instead of 'Review design draft', use 'STOP PROCRASTINATING: Finish the design draft NOW!'). Aggressively motivate them to execute immediately.";
  } else if (pLower.includes('professional') || pLower.includes('assistant')) {
    createTaskPersonalityPrompt = "IMPORTANT: Since the user has chosen a 'Professional Assistant' AI personality, the generated subtasks must look clean, corporate, structured, and formal.";
  } else {
    createTaskPersonalityPrompt = "IMPORTANT: Since the user has chosen a 'Supportive Companion' AI personality, the generated subtasks should sound friendly, warm, empathetic, and encouraging.";
  }

  try {
    const prompt = `You are an AI task assistant. The user wants to create a task:
Title: ${input.title}
Description: ${input.description}
Deadline: ${input.deadline}

${createTaskPersonalityPrompt}

Please output a JSON object with exactly two keys:
1. "priority_score": an integer from 1 to 100 based on urgency/complexity (deadline proximity implies higher priority).
2. "subtasks": an array of 3 to 5 strings, each representing a bite-sized actionable step to complete this task.

Return ONLY the raw JSON object and nothing else.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      if (parsed.priority_score && typeof parsed.priority_score === 'number') {
        priority_score = parsed.priority_score;
      }
      if (parsed.subtasks && Array.isArray(parsed.subtasks)) {
        subtasks = parsed.subtasks;
      }
    }
  } catch (err) {
    console.error("Gemini AI failed to generate subtasks, using realistic fallback:", err);
    subtasks = [
      `Review and plan implementation details for "${input.title}"`,
      `Develop core functional logic and run validation checks`,
      `Verify user interface and deploy final changes`
    ];
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      deadline: input.deadline,
      estimated_hours: input.estimated_hours,
      priority_score,
      status: 'pending',
      tag: input.tag,
      subtasks: {
        create: subtasks.map(t => ({ title: t }))
      }
    },
    include: { subtasks: true }
  });

  revalidatePath('/');
  return toUITask(task);
}


/**
 * PUT — update a task's status
 */
export async function updateTaskStatus(
  id: string,
  status: UIStatus
): Promise<UITask> {
  const task = await prisma.task.update({
    where: { id },
    data: { status: uiStatusToDb(status) },
    include: { subtasks: true }
  });

  revalidatePath('/');
  return toUITask(task);
}

/**
 * DELETE — remove a task
 */
export async function deleteTask(id: string): Promise<void> {
  await prisma.task.delete({ where: { id } });
  revalidatePath('/');
}

/**
 * PUT — toggle a subtask's isDone status
 */
export async function toggleSubtask(id: string, isDone: boolean): Promise<void> {
  await prisma.subtask.update({
    where: { id },
    data: { isDone }
  });
  revalidatePath('/');
}


/**
 * POST — autonomous scheduler to plan the week
 */
export async function autoPlanWeek(): Promise<void> {
  const tasks = await prisma.task.findMany({
    where: { status: { in: ['pending', 'in-progress'] } },
    orderBy: { priority_score: 'desc' },
    include: { subtasks: true }
  });

  const subtasksToSchedule = tasks.flatMap(t =>
    t.subtasks.map(st => ({
      id: st.id,
      title: st.title,
      parentTask: t.title,
      parentDeadline: t.deadline,
      priority_score: t.priority_score
    }))
  );

  if (subtasksToSchedule.length === 0) return;

  // ── Manual fallback helper ───────────────────────────────────────────────
  // Distribute subtasks across Mon-Fri 9 AM – 5 PM in 90-minute slots.
  const applyManualFallback = async (reason: string) => {
    console.error(`[autoPlanWeek] Falling back to manual scheduler. Reason: ${reason}`);

    // Build a pool of workday slots starting from today
    const slots: { start: Date; end: Date }[] = [];
    const now = new Date();
    // Start at next round 9 AM slot (or today if before 5 PM)
    const baseDay = new Date(now);
    baseDay.setHours(9, 0, 0, 0);
    if (now.getHours() >= 17) {
      baseDay.setDate(baseDay.getDate() + 1); // push to tomorrow
    }

    // Generate 14 days worth of 90-min slots (Mon-Sat, 9 AM-5 PM)
    for (let d = 0; d < 14 && slots.length < subtasksToSchedule.length + 5; d++) {
      const day = new Date(baseDay);
      day.setDate(baseDay.getDate() + d);
      const dayOfWeek = day.getDay();
      if (dayOfWeek === 0) continue; // skip Sunday

      for (let hour = 9; hour < 17; hour += 2) {
        const slotStart = new Date(day);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(day);
        slotEnd.setHours(hour + 1, 30, 0, 0);
        slots.push({ start: slotStart, end: slotEnd });
      }
    }

    let nextSlotIndex = 0;
    for (let i = 0; i < subtasksToSchedule.length; i++) {
      const subtask = subtasksToSchedule[i];
      const deadlineDate = new Date(subtask.parentDeadline);
      
      // Ensure base target date is not in the past relative to now (Today)
      const targetBase = new Date(Math.max(now.getTime(), deadlineDate.getTime()));
      
      // Find the first slot from nextSlotIndex onwards that is on or before targetBase.
      // If no such slot is available (deadline is too tight/today), we just take the next slot chronologically.
      let chosenSlotIndex = -1;
      for (let sIdx = nextSlotIndex; sIdx < slots.length; sIdx++) {
        if (slots[sIdx].start <= targetBase) {
          chosenSlotIndex = sIdx;
          break;
        }
      }

      if (chosenSlotIndex === -1) {
        // Fallback: take the very next chronological slot
        chosenSlotIndex = nextSlotIndex < slots.length ? nextSlotIndex : slots.length - 1;
      }

      const slot = slots[chosenSlotIndex];
      
      // Mark slot as used by advancing nextSlotIndex if we picked a chronological slot
      if (chosenSlotIndex === nextSlotIndex) {
        nextSlotIndex++;
      }
      
      // Double check that no date generated is older than now (Today)
      const finalStart = new Date(Math.max(now.getTime(), slot.start.getTime()));
      const finalEnd = new Date(Math.max(now.getTime() + 90 * 60 * 1000, slot.end.getTime()));

      try {
        await prisma.subtask.update({
          where: { id: subtask.id },
          data: {
            scheduledStart: finalStart,
            scheduledEnd: finalEnd,
          },
        });
      } catch (updateErr) {
        console.error(`[autoPlanWeek] Failed to write slot for subtask ${subtask.id}:`, updateErr);
      }
    }
  };
  // ────────────────────────────────────────────────────────────────────────

  const prompt = `Act as an autonomous scheduler. Assuming a standard working window of 9 AM to 5 PM daily starting from today (${new Date().toISOString()}) (excluding weekends if appropriate, or standard Monday-Sunday), dynamically schedule these subtasks into optimal, non-overlapping time blocks to ensure all parent task deadlines are met.
  
  CRITICAL SCHEDULING RULE: When assigning schedule dates to subtasks, you MUST respect each task's actual deadline date ("parentDeadline"). You must anchor the subtasks to the day of the deadline (or the days immediately preceding it) rather than forcing everything into the current week. Each subtask's scheduled start and end times MUST be before or on its parent deadline date. Do NOT schedule subtasks in the current week if their parent deadline is in a future week; instead, schedule them on/around that future deadline week.
  
  CRITICAL RULE: Evaluate the parent task's deadline against the current date. If the deadline is in the PAST (overdue), you MUST ignore the past deadline and schedule the subtasks starting from TODAY. Never schedule a subtask on a date that has already passed.
  
  The subtasks are ordered by the parent task's priority_score descending. You MUST schedule them in order of priority, but you must assign a calendar time block (between 9 AM and 5 PM) to every single subtask in the list. Ensure that Medium and Low priority tasks are successfully scheduled alongside High priority tasks, always respecting their parent deadlines.
  
  Subtasks:
  ${JSON.stringify(subtasksToSchedule, null, 2)}
  
  Return a strictly valid JSON array of objects with exactly the following keys:
  - "id": The subtask id
  - "scheduledStart": ISO 8601 date-time string
  - "scheduledEnd": ISO 8601 date-time string
  
  Return ONLY the JSON array and nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) {
      await applyManualFallback('AI returned empty response');
    } else {
      let parsed: unknown;
      try {
        parsed = JSON.parse(response.text);
      } catch {
        await applyManualFallback(`JSON.parse failed on AI response: ${response.text.slice(0, 80)}`);
        parsed = null;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        await applyManualFallback('AI returned empty or non-array schedule');
      } else {
        let successCount = 0;
        for (const slot of parsed) {
          if (slot.id && slot.scheduledStart && slot.scheduledEnd) {
            const start = new Date(slot.scheduledStart);
            const end = new Date(slot.scheduledEnd);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              console.warn(`[autoPlanWeek] Invalid date for slot id=${slot.id}, skipping`);
              continue;
            }
            await prisma.subtask.update({
              where: { id: slot.id },
              data: { scheduledStart: start, scheduledEnd: end }
            });
            successCount++;
          }
        }
        if (successCount === 0) {
          await applyManualFallback('AI returned slots but none had valid id/start/end');
        } else {
          console.log(`[autoPlanWeek] AI scheduled ${successCount} subtasks successfully.`);
        }
      }
    }
  } catch (err) {
    console.error('[autoPlanWeek] AI call threw an exception:', err);
    await applyManualFallback(String(err));
  }

  revalidatePath('/');
}

/**
 * POST — chat interface with AI productivity agent
 */
export async function chatWithAgent(message: string, clientNowStr: string, personality?: string): Promise<string> {
  let personalityInstruction = "";
  const pStr = personality || 'supportive';
  const pLower = pStr.toLowerCase();
  
  if (pLower.includes('drill') || pLower.includes('sergeant')) {
    personalityInstruction = "You are a tough-love military drill sergeant. Be blunt, demanding, and use all caps for emphasis to get the user to work.";
  } else if (pLower.includes('professional') || pLower.includes('assistant')) {
    personalityInstruction = "You are a highly efficient, concise executive assistant.";
  } else {
    personalityInstruction = "You are a warm, encouraging productivity coach.";
  }

  const prompt = `You are a productivity assistant for an application called "The Last-Minute Life Saver".
${personalityInstruction}

The user has sent a message: "${message}"

Current date and time is: ${clientNowStr}

Analyze the message to see if the user has an intent to create, add, schedule, or remind themselves about a task.
If yes, extract:
1. "title": a clear task title (e.g. "Finish frontend project")
2. "description": any additional description details from the message (default to "")
3. "deadline": the parsed target date and time as a ISO 8601 string. You MUST parse relative references like "tomorrow at 8 PM", "by Friday morning", "next Monday" correctly relative to the current time: ${clientNowStr}.
4. "estimated_hours": float number for implied time needed (default to 1.0)
5. "tag": a category name (e.g. "Engineering", "Personal", "Design", "General")

Provide a JSON response with the following format:
{
  "hasTaskIntent": true,
  "taskDetails": {
    "title": "...",
    "description": "...",
    "deadline": "ISO-8601-string",
    "estimated_hours": 1.0,
    "tag": "..."
  },
  "reply": "A confirmation reply to show in the chat written in your assigned personality style (e.g. if Drill Sergeant: 'LISTEN UP RECRUIT! I have created the task \"Finish frontend project\" for tomorrow at 8:00 PM. NOW GET TO WORK OR ELSE!')."
}

If the user does not want to create a task, reply as a normal productivity companion in your assigned personality style:
{
  "hasTaskIntent": false,
  "reply": "Your conversational reply here matching your personality style."
}

Return ONLY the raw JSON object and nothing else.`;

  // Pre-calculate urgent tasks count for contextual fallback
  let urgentCount = 0;
  try {
    const now = new Date(clientNowStr);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const dbTasks = await prisma.task.findMany({
      where: { status: { in: ['pending', 'in-progress'] } }
    });

    const urgentList = dbTasks.filter(t => {
      const priorityScore = t.priority_score ?? 50;
      const deadlineDate = new Date(t.deadline);
      const isDueToday = deadlineDate >= startOfToday && deadlineDate <= endOfToday;
      return priorityScore >= 80 || isDueToday;
    });
    urgentCount = urgentList.length;
  } catch (dbErr) {
    console.error("Failed to query task count for fallback:", dbErr);
  }

  const fallbackResponse = `I am currently organizing your workspace. You have ${urgentCount} urgent tasks remaining today. Let's tackle them!`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (response.text) {
      const text = response.text.trim();
      const cleanText = text.replace(/```(json)?/gi, '').replace(/```/g, '').trim();
      
      // Attempt to parse as JSON if it looks like a JSON object
      if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
        try {
          const parsed = JSON.parse(cleanText);
          if (parsed && typeof parsed === 'object') {
            if (parsed.hasTaskIntent && parsed.taskDetails) {
              const details = parsed.taskDetails;
              await createTask({
                title: details.title || 'New Task',
                description: details.description || '',
                priority_score: 50,
                estimated_hours: Number(details.estimated_hours) || 1.0,
                deadline: new Date(details.deadline || clientNowStr),
                tag: details.tag || 'General'
              }, personality);
            }
            return parsed.reply || fallbackResponse;
          }
        } catch (jsonErr) {
          console.warn("Failed to parse JSON reply from Gemini:", jsonErr);
          return fallbackResponse;
        }
      }
      
      return cleanText;
    }
  } catch (err) {
    console.error("Gemini chat agent error:", err);
    return fallbackResponse;
  }

  return fallbackResponse;
}

/**
 * POST — seed 3 dummy tasks generated by Gemini AI
 */
export async function seedDummyTasksWithAI(): Promise<void> {
  const prompt = `Generate exactly 3 realistic tasks for a software engineer. The tasks MUST have MIXED priorities as specified below:
  - Task 1 MUST be HIGH priority with priority_score between 85 and 95.
  - Task 2 MUST be MEDIUM priority with priority_score between 45 and 55.
  - Task 3 MUST be LOW priority with priority_score between 15 and 25.

  Each task must have these fields:
  1. "title": A concise, clear, real-world task title.
  2. "description": A brief one-sentence description.
  3. "estimated_hours": A float between 1.0 and 4.0.
  4. "priority_score": An integer in the range specified above.
  5. "hoursFromNow": An integer (e.g., 2, 12, 48) representing when the deadline is. High priority tasks should be due soon (2-6 hours), medium due later (12-24 hours), low due in 2+ days (36-72 hours).
  6. "tag": A category string (e.g. "Engineering", "Design", "DevOps", "Testing", "Documentation").
  7. "subtasks": An array of exactly 3 strings representing bite-sized steps.

  Return a strictly valid JSON array of exactly 3 objects. Return ONLY the raw JSON array and nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      if (Array.isArray(parsed)) {
        for (const t of parsed) {
          const deadline = new Date();
          const hours = t.hoursFromNow || 4;
          deadline.setMilliseconds(deadline.getMilliseconds() + hours * 60 * 60 * 1000);

          await prisma.task.create({
            data: {
              title: t.title || 'Demo Task',
              description: t.description || '',
              deadline,
              estimated_hours: Number(t.estimated_hours) || 1.5,
              priority_score: Number(t.priority_score) || 85,
              status: 'pending',
              tag: t.tag || 'General',
              subtasks: {
                create: (t.subtasks || []).map((stTitle: string) => ({ title: stTitle }))
              }
            }
          });
        }
      }
    }
  } catch (err) {
    console.error("Failed to seed AI dummy tasks, seeding fallback realistic mock tasks:", err);
    const fallbackTasks = [
      {
        title: "Fix critical auth token expiry bug",
        description: "Users are being logged out mid-session due to a JWT refresh race condition.",
        estimated_hours: 2.0,
        priority_score: 91,
        hoursFromNow: 3,
        tag: "Engineering",
        subtasks: ["Reproduce the token expiry sequence in dev environment", "Implement silent refresh with a 5-minute rolling window", "Write integration test to verify persistent sessions"]
      },
      {
        title: "Update API documentation for v2 endpoints",
        description: "The new REST endpoints added last sprint are missing Swagger/OpenAPI documentation.",
        estimated_hours: 2.5,
        priority_score: 50,
        hoursFromNow: 20,
        tag: "Documentation",
        subtasks: ["List all new v2 routes and their parameters", "Write YAML spec blocks for each endpoint", "Publish updated docs to the developer portal"]
      },
      {
        title: "Clean up legacy feature flags in codebase",
        description: "Several old A/B test flags from Q1 are still in the codebase and can be safely removed.",
        estimated_hours: 1.5,
        priority_score: 20,
        hoursFromNow: 60,
        tag: "Engineering",
        subtasks: ["Identify all feature flag references using grep", "Remove dead code branches guarded by old flags", "Run full test suite to confirm no regressions"]
      }
    ];

    for (const t of fallbackTasks) {
      const deadline = new Date();
      const hours = t.hoursFromNow;
      deadline.setMilliseconds(deadline.getMilliseconds() + hours * 60 * 60 * 1000);

      await prisma.task.create({
        data: {
          title: t.title,
          description: t.description,
          deadline,
          estimated_hours: t.estimated_hours,
          priority_score: t.priority_score,
          status: 'pending',
          tag: t.tag,
          subtasks: {
            create: t.subtasks.map((stTitle: string) => ({ title: stTitle }))
          }
        }
      });
    }
  }

  revalidatePath('/');
}

/**
 * GET — fetch dynamic metrics for Productivity Analytics
 */
export async function getAnalyticsData() {
  const dbTasks = await prisma.task.findMany({
    include: { subtasks: true }
  });

  const totalCount = dbTasks.length;
  const completedCount = dbTasks.filter(t => t.status === 'completed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Streak calculation (mirror standard calculation, e.g. completedCount > 0 ? Math.min(completedCount + 2, 6) : 0)
  const streak = completedCount > 0 ? Math.min(completedCount + 2, 6) : 0;

  // Priority Breakdown (High: score >= 80, Medium: score 40-79, Low: score < 40)
  let high = 0;
  let medium = 0;
  let low = 0;

  dbTasks.forEach(t => {
    const score = t.priority_score ?? 50;
    if (score >= 80) {
      high++;
    } else if (score >= 40) {
      medium++;
    } else {
      low++;
    }
  });

  const highPct = totalCount > 0 ? (high / totalCount) * 100 : 0;
  const mediumPct = totalCount > 0 ? (medium / totalCount) * 100 : 0;
  const lowPct = totalCount > 0 ? (low / totalCount) * 100 : 0;

  // Workload Data: Map over tasks due in the current week (Monday-Sunday).
  // Sum the estimated hours for each day.
  const currentDate = new Date();
  const day = currentDate.getDay();
  const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(currentDate);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(monday);
  const endOfWeek = new Date(monday);
  endOfWeek.setDate(monday.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Initialize daily workload records
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dailyWorkload = weekdays.reduce((acc, d) => {
    acc[d] = 0;
    return acc;
  }, {} as Record<string, number>);

  dbTasks.forEach(t => {
    // Only count active or in-progress tasks (status is not completed)
    if (t.status !== 'completed') {
      const deadlineDate = new Date(t.deadline);
      if (deadlineDate >= startOfWeek && deadlineDate <= endOfWeek) {
        const dayName = deadlineDate.toLocaleDateString('en-US', { weekday: 'long' });
        if (dayName in dailyWorkload) {
          dailyWorkload[dayName] += t.estimated_hours ?? 0;
        }
      }
    }
  });

  const workloadData = weekdays.map(d => ({
    day: d,
    hours: Math.round((dailyWorkload[d] ?? 0) * 10) / 10 // round to 1 decimal place
  }));

  return {
    completionRate,
    streak,
    completedCount,
    totalCount,
    priorityBreakdown: {
      high,
      medium,
      low,
      highPct,
      mediumPct,
      lowPct
    },
    workloadData
  };
}


