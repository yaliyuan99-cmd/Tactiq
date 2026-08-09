/**
 * Training curriculum — five progressive lessons that teach the command set
 * a few gestures at a time (never everything at once), each framed as a real
 * task the wearer would actually do.
 *
 * Progress is saved in this browser only (per signed-in user), and the UI
 * says so — there is no ring, so "progress" means simulator practice.
 */
import type { ContactId } from './gestures';

export interface LessonStep {
  /** What we ask the learner to do, in task language. */
  instruction: string;
  /** The contact that answers it. */
  target: ContactId;
  /** True when the step needs the sustained emergency hold. */
  hold?: boolean;
  /** Named for feedback ("Next", "Confirm"…). */
  commandName: string;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  summary: string;
  /** Contacts this lesson introduces (drawn emphasised on the hand). */
  teaches: ContactId[];
  steps: LessonStep[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    number: 1,
    title: 'Next and previous',
    summary:
      "The two commands you will use most: stepping the screen reader's focus forward and back — middle-finger base and ring-finger base.",
    teaches: ['middle-base', 'ring-base'],
    steps: [
      { instruction: 'A podcast list is open. Move to the next episode.', target: 'middle-base', commandName: 'Next' },
      { instruction: 'One too far — step back to the previous episode.', target: 'ring-base', commandName: 'Previous' },
      { instruction: 'Skim onwards: next item again.', target: 'middle-base', commandName: 'Next' },
      { instruction: 'And next once more.', target: 'middle-base', commandName: 'Next' },
      { instruction: 'Return to the previous item.', target: 'ring-base', commandName: 'Previous' },
    ],
  },
  {
    id: 'lesson-2',
    number: 2,
    title: 'Select and back',
    summary:
      "Saying yes and no: Confirm on the index tip activates what's in focus; Dismiss on the index base backs out — both on the finger wearing the ring.",
    teaches: ['index-tip', 'index-base'],
    steps: [
      { instruction: 'The episode you want is in focus. Play it.', target: 'index-tip', commandName: 'Confirm' },
      { instruction: 'An ad plays — go back to the list.', target: 'index-base', commandName: 'Dismiss / Back' },
      { instruction: 'A call comes in. Answer it.', target: 'index-tip', commandName: 'Confirm' },
      { instruction: 'Call finished — dismiss the call screen.', target: 'index-base', commandName: 'Dismiss / Back' },
      { instruction: 'One more time: activate the focused item.', target: 'index-tip', commandName: 'Confirm' },
    ],
  },
  {
    id: 'lesson-3',
    number: 3,
    title: 'Read and undo',
    summary:
      'Hear it again with Read on the ring tip; take it back with Undo on the middle tip — the command that makes every mistake recoverable.',
    teaches: ['ring-tip', 'middle-tip'],
    steps: [
      { instruction: 'You missed an announcement. Have it read again.', target: 'ring-tip', commandName: 'Read / Repeat' },
      { instruction: 'You tapped the wrong thing a moment ago. Undo it.', target: 'middle-tip', commandName: 'Undo' },
      { instruction: 'Re-read the current item once more.', target: 'ring-tip', commandName: 'Read / Repeat' },
      { instruction: 'And undo your last action again.', target: 'middle-tip', commandName: 'Undo' },
    ],
  },
  {
    id: 'lesson-4',
    number: 4,
    title: 'Your shortcuts',
    summary:
      'The two pinky points are yours: Shortcut 1 on the tip (shared with the 5-second emergency hold) and Shortcut 2 on the base.',
    teaches: ['pinky-tip', 'pinky-base'],
    steps: [
      { instruction: 'Fire your first personal shortcut (pinky tip, brief tap).', target: 'pinky-tip', commandName: 'Shortcut 1' },
      { instruction: 'Now your second shortcut (pinky base).', target: 'pinky-base', commandName: 'Shortcut 2' },
      { instruction: 'Practise the difference: Shortcut 1 again — just a brief tap.', target: 'pinky-tip', commandName: 'Shortcut 1' },
      {
        instruction:
          "Emergency drill: hold the pinky tip for a sustained five seconds. In real use this would engage your phone's SOS pathway.",
        target: 'pinky-tip',
        hold: true,
        commandName: 'Emergency',
      },
    ],
  },
  {
    id: 'lesson-5',
    number: 5,
    title: 'Full navigation challenge',
    summary:
      'Everything together at conversational pace — a realistic minute of phone use, hands only.',
    teaches: [
      'index-tip',
      'index-base',
      'middle-tip',
      'middle-base',
      'ring-tip',
      'ring-base',
      'pinky-tip',
      'pinky-base',
    ],
    steps: [
      { instruction: 'A message arrives. Have it read.', target: 'ring-tip', commandName: 'Read / Repeat' },
      { instruction: 'Not important — dismiss it.', target: 'index-base', commandName: 'Dismiss / Back' },
      { instruction: 'Back to your podcast list: next episode.', target: 'middle-base', commandName: 'Next' },
      { instruction: 'Next again.', target: 'middle-base', commandName: 'Next' },
      { instruction: 'That one — play it.', target: 'index-tip', commandName: 'Confirm' },
      { instruction: 'Actually, wrong episode. Undo.', target: 'middle-tip', commandName: 'Undo' },
      { instruction: 'Step back to the previous episode.', target: 'ring-base', commandName: 'Previous' },
      { instruction: 'Play this one.', target: 'index-tip', commandName: 'Confirm' },
      { instruction: 'Fire Shortcut 2.', target: 'pinky-base', commandName: 'Shortcut 2' },
      { instruction: 'Finish with Shortcut 1 — brief tap, not a hold.', target: 'pinky-tip', commandName: 'Shortcut 1' },
    ],
  },
];

export const LESSONS_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
);

// ---------------------------------------------------------------------------
// Progress records — browser-local, per signed-in user.
// ---------------------------------------------------------------------------

export interface TrainingLessonRecord {
  lessonId: string;
  completed: boolean;
  bestAccuracyPct: number;
  avgResponseMs: number;
  attempts: number;
  completedAt: string | null;
}

function storageKey(userId: string) {
  return `tactiq:${userId}:training`;
}

export function loadTrainingRecords(userId: string): TrainingLessonRecord[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]');
  } catch {
    return [];
  }
}

export function saveTrainingRecord(userId: string, record: TrainingLessonRecord) {
  const records = loadTrainingRecords(userId).filter((r) => r.lessonId !== record.lessonId);
  records.push(record);
  localStorage.setItem(storageKey(userId), JSON.stringify(records));
}
