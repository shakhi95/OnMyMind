import { dayKey } from '../lib/dates';
import { makeEvent, taskEventContent } from '../lib/topicEvents';
import type { AppState, Dump, Journal, Task, Topic, TopicEvent, TopicEventKind } from '../types';

const iso = (daysAgo: number, hour: number, minute = 0) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const key = (daysAgo: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return dayKey(date);
};

const dump = (
  id: string,
  content: string,
  createdAt: string,
  topicIds: string[] = [],
): Dump => ({
  id,
  content,
  createdAt,
  updatedAt: createdAt,
  topicIds,
});

const evt = (
  id: string,
  content: string,
  daysAgo: number,
  hour: number,
  minute = 0,
  kind: TopicEventKind = 'thinking',
  extras: Partial<TopicEvent> = {},
): TopicEvent =>
  makeEvent(kind, content, {
    id,
    createdAt: iso(daysAgo, hour, minute),
    date: key(daysAgo),
    ...extras,
  });

const started = (id: string, daysAgo: number, hour: number, minute = 0) =>
  evt(id, 'Topic started', daysAgo, hour, minute, 'started');

/**
 * Dense sample dataset spanning the last 15 days.
 * Covers dumps, optional empty dump, all topic statuses, decisions,
 * standalone + topic tasks, revisits, empty/sparse/heavy days.
 */
export function buildSampleState(): AppState {
  const topics: Topic[] = [
    {
      id: 'tp-website',
      title: 'Personal website',
      status: 'active',
      createdAt: iso(14, 9),
      updatedAt: iso(0, 10, 20),
      events: [
        started('n-web-0', 14, 9),
        evt('n-web-1', 'I keep avoiding this. Fear of picking the wrong stack.', 14, 9, 30),
        evt('n-web-2', 'Maybe a simple static site is enough for now.', 10, 20, 0),
        evt('n-web-d', 'I will ship a one-page site first.', 7, 21, 0, 'decision'),
        evt('n-web-3', 'Homepage draft is halfway. Still need projects section.', 2, 11, 0),
        evt('n-web-4', 'Came back to this again today. Domain shopping later.', 0, 10, 15),
      ],
    },
    {
      id: 'tp-money',
      title: 'Money & runway',
      status: 'active',
      createdAt: iso(13, 8),
      updatedAt: iso(1, 19),
      events: [
        started('n-mon-0', 13, 8),
        evt('n-mon-1', 'Anxiety spikes when I open the banking app.', 13, 8, 20),
        evt('n-mon-2', 'Need a clearer monthly burn number.', 8, 18, 0),
        evt('n-mon-d', 'Track burn every Sunday. No big purchases this month.', 5, 20, 0, 'decision'),
        evt('n-mon-3', 'Updated the spreadsheet. Feels slightly better.', 1, 19, 0),
      ],
    },
    {
      id: 'tp-move',
      title: 'Should I move?',
      status: 'later',
      createdAt: iso(12, 21),
      updatedAt: iso(4, 22),
      events: [
        started('n-mov-0', 12, 21),
        evt('n-mov-1', 'City feels heavy. Quiet place sounds appealing.', 12, 21),
        evt('n-mov-2', 'Not ready to decide. Parking this on purpose.', 4, 22),
        evt('n-mov-s', 'Set aside for later', 4, 22, 5, 'status', { fromStatus: 'active', toStatus: 'later' }),
      ],
    },
    {
      id: 'tp-guitar',
      title: 'Learning guitar',
      status: 'later',
      createdAt: iso(11, 16),
      updatedAt: iso(6, 17),
      events: [
        started('n-gui-0', 11, 16),
        evt('n-gui-1', 'Want joy, not another productivity project.', 11, 16),
        evt('n-gui-2', 'Maybe after the website ships.', 6, 17),
        evt('n-gui-s', 'Set aside for later', 6, 17, 10, 'status', { fromStatus: 'active', toStatus: 'later' }),
      ],
    },
    {
      id: 'tp-laptop',
      title: 'New laptop?',
      status: 'resolved',
      createdAt: iso(12, 10),
      updatedAt: iso(9, 15),
      events: [
        started('n-lap-0', 12, 10),
        evt('n-lap-1', 'Current one is slow but usable.', 12, 10),
        evt('n-lap-d', 'Keep it for another year. No new laptop.', 9, 15, 0, 'decision'),
        evt('n-lap-s', 'Marked resolved', 9, 15, 10, 'status', { fromStatus: 'active', toStatus: 'resolved' }),
      ],
    },
    {
      id: 'tp-conversation',
      title: 'That conversation',
      status: 'resolved',
      createdAt: iso(10, 22),
      updatedAt: iso(8, 9),
      events: [
        started('n-con-0', 10, 22),
        evt('n-con-1', 'Still replaying what I said.', 10, 22),
        evt('n-con-d', 'Send a short clarifying message. Then let it go.', 8, 9, 0, 'decision'),
        evt('n-con-2', 'Message sent. I feel lighter.', 8, 12),
        evt('n-con-s', 'Marked resolved', 8, 12, 30, 'status', { fromStatus: 'active', toStatus: 'resolved' }),
      ],
    },
    {
      id: 'tp-side',
      title: 'Side project idea',
      status: 'dropped',
      createdAt: iso(9, 14),
      updatedAt: iso(3, 11),
      events: [
        started('n-sid-0', 9, 14),
        evt('n-sid-1', 'Cool idea but not the right season.', 9, 14),
        evt('n-sid-2', 'Consciously dropping this. Capacity is limited.', 3, 11),
        evt('n-sid-s', 'Let go', 3, 11, 15, 'status', { fromStatus: 'active', toStatus: 'dropped' }),
      ],
    },
    {
      id: 'tp-health',
      title: 'Sleep & energy',
      status: 'active',
      createdAt: iso(7, 7),
      updatedAt: iso(0, 7, 40),
      events: [
        started('n-hea-0', 7, 7),
        evt('n-hea-1', 'Waking up tired three days in a row.', 7, 7),
        evt('n-hea-d', 'No screens after 11pm for two weeks. Experiment.', 3, 22, 0, 'decision'),
        evt('n-hea-2', 'Slept better last night. Keep the experiment going.', 0, 7, 40),
      ],
    },
    {
      id: 'tp-family',
      title: "Mom's birthday",
      status: 'active',
      createdAt: iso(5, 12),
      updatedAt: iso(0, 16),
      events: [
        started('n-fam-0', 5, 12),
        evt('n-fam-1', 'Need a gift idea that feels personal.', 5, 12),
        evt('n-fam-2', 'Photo book? Or a long call and flowers.', 0, 16),
      ],
    },
    {
      id: 'tp-career',
      title: 'Career direction',
      status: 'later',
      createdAt: iso(14, 18),
      updatedAt: iso(11, 19),
      events: [
        started('n-car-0', 14, 18),
        evt('n-car-1', 'Am I building the right skills?', 14, 18),
        evt('n-car-2', 'Too big to force tonight. Revisit next month.', 11, 19),
        evt('n-car-s', 'Set aside for later', 11, 19, 20, 'status', { fromStatus: 'active', toStatus: 'later' }),
      ],
    },
  ];

  const journals: Record<string, Journal> = {};

  // Day 14 — first heavy dump + topic birth
  journals[key(14)] = {
    dumps: [
      dump(
        'd-14a',
        'Lots on my mind. Website, career, whether I am wasting time.\nI want a calmer system for this.',
        iso(14, 8, 10), ['tp-website', 'tp-career']),
    ],
  };

  // Day 13
  journals[key(13)] = {
    dumps: [
      dump('d-13a', 'Money worry this morning. Need facts, not rumination.', iso(13, 7, 45), ['tp-money']),
    ],
  };

  // Day 12 — dump with no topic links + move + laptop
  journals[key(12)] = {
    dumps: [
      dump(
        'd-12a',
        'Quiet morning. Wondering about moving away.\nAlso: do I really need a new laptop?',
        iso(12, 9, 0), ['tp-move', 'tp-laptop', 'tp-guitar', 'tp-career']),
    ],
  };

  // Day 10 — conversation
  journals[key(10)] = {
    dumps: [
      dump('d-10a', 'That conversation will not leave my head.', iso(10, 21, 10), ['tp-conversation']),
    ],
  };

  // Day 9 — side project + laptop decision day spillover
  journals[key(9)] = {
    dumps: [
      dump('d-9a', 'New idea for a side project. Tempting. Dangerous.', iso(9, 13, 20), ['tp-side', 'tp-laptop']),
      dump('d-9b', '', iso(9, 19, 0)), // empty dump edge case
    ],
  };

  // Day 8 — decision follow-through
  journals[key(8)] = {
    dumps: [
      dump('d-8a', 'Sent the clarifying message. Breathing easier.', iso(8, 11, 0), ['tp-conversation']),
    ],
  };

  // Day 7 — health starts; dump-only no topic links
  journals[key(7)] = {
    dumps: [
      dump(
        'd-7a',
        'Woke up exhausted. Sleep has been messy.\nJust dumping — no topics yet.',
        iso(7, 6, 50),
      ),
    ],
  };

  // Day 6 — sparse
  journals[key(6)] = {
    dumps: [
      dump('d-6a', 'Guitar crossed my mind while walking.', iso(6, 17, 10), ['tp-guitar']),
    ],
  };

  // Day 5 — family
  journals[key(5)] = {
    dumps: [
      dump('d-5a', "Mom's birthday is coming. Want something meaningful.", iso(5, 12, 5), ['tp-family', 'tp-money']),
    ],
  };

  // Day 4 — move parked to later
  journals[key(4)] = {
    dumps: [
      dump('d-4a', 'Not ready to decide about moving. Setting it aside on purpose.', iso(4, 21, 40), ['tp-move']),
    ],
  };

  // Day 3 — drop side project + sleep decision
  journals[key(3)] = {
    dumps: [
      dump('d-3a', 'Capacity check: the side project has to go.', iso(3, 10, 0), ['tp-side', 'tp-health']),
      dump('d-3b', 'Second dump tonight. Screens off experiment starts now.', iso(3, 22, 15), ['tp-health']),
    ],
  };

  // Day 2 — website progress
  journals[key(2)] = {
    dumps: [
      dump('d-2a', 'Worked on homepage. Projects section still empty.', iso(2, 10, 30), ['tp-website']),
    ],
  };

  // Day 1
  journals[key(1)] = {
    dumps: [
      dump('d-1a', 'Money spreadsheet updated. Website still calling.', iso(1, 18, 20), ['tp-money', 'tp-website']),
    ],
  };

  // Today (day 0) — multi dump, mix of new + revisit + one dump with no topic links
  journals[key(0)] = {
    dumps: [
      dump(
        'd-0a',
        'Morning dump.\nSleep was better. Website and mom gift are loud today.\nLinking a few topics that stand out.',
        iso(0, 7, 20), ['tp-health', 'tp-website', 'tp-family']),
      dump(
        'd-0b',
        'Afternoon: gift ideas spinning. Also buy toothpaste.',
        iso(0, 15, 45),
        ['tp-family'],
      ),
      dump(
        'd-0c',
        'Late dump with no topic links attached — testing optional empty dump.',
        iso(0, 22, 10),
      ),
    ],
  };

  const tasks: Task[] = [
    {
      id: 'task-domain',
      title: 'Buy domain for personal site',
      status: 'done',
      topicId: 'tp-website',
      createdAt: iso(10, 11),
      updatedAt: iso(7, 16),
    },
    {
      id: 'task-repo',
      title: 'Create website repository',
      status: 'done',
      topicId: 'tp-website',
      createdAt: iso(9, 12),
      updatedAt: iso(6, 14),
    },
    {
      id: 'task-homepage',
      title: 'Build homepage draft',
      status: 'open',
      topicId: 'tp-website',
      createdAt: iso(6, 15),
    },
    {
      id: 'task-projects',
      title: 'Write projects section',
      status: 'open',
      topicId: 'tp-website',
      createdAt: iso(2, 11),
    },
    {
      id: 'task-burn',
      title: 'Update monthly burn spreadsheet',
      status: 'done',
      topicId: 'tp-money',
      createdAt: iso(6, 9),
      updatedAt: iso(1, 18),
    },
    {
      id: 'task-gift',
      title: 'Order gift for mom',
      status: 'open',
      topicId: 'tp-family',
      createdAt: iso(5, 13),
    },
    {
      id: 'task-screens',
      title: 'Phone charger outside bedroom for two weeks',
      status: 'open',
      topicId: 'tp-health',
      createdAt: iso(3, 22, 30),
    },
    {
      id: 'task-clarify',
      title: 'Send clarifying message',
      status: 'done',
      topicId: 'tp-conversation',
      createdAt: iso(9, 10),
      updatedAt: iso(8, 11),
    },
    {
      id: 'task-toothpaste',
      title: 'Buy toothpaste',
      status: 'open',
      createdAt: iso(0, 15, 50),
    },
    {
      id: 'task-walk',
      title: 'Evening walk without headphones',
      status: 'done',
      createdAt: iso(2, 17),
      updatedAt: iso(2, 19),
    },
    {
      id: 'task-newsletter',
      title: 'Unsubscribe from unused newsletters',
      status: 'dropped',
      createdAt: iso(11, 20),
      updatedAt: iso(4, 12),
    },
    {
      id: 'task-side-mvp',
      title: 'Sketch side project MVP',
      status: 'dropped',
      topicId: 'tp-side',
      createdAt: iso(9, 15),
      updatedAt: iso(3, 10, 30),
    },
  ];

  const withTaskEvents = topics.map((topic) => {
    const related = tasks.filter((task) => task.topicId === topic.id);
    const taskEvents: TopicEvent[] = [];
    related.forEach((task) => {
      const created = new Date(task.createdAt);
      taskEvents.push(
        makeEvent('task_added', task.title, {
          id: `ev-${task.id}-add`,
          createdAt: task.createdAt,
          date: dayKey(created),
          taskId: task.id,
        }),
      );
      if (task.status === 'done' || task.status === 'dropped') {
        const when = task.updatedAt || task.createdAt;
        taskEvents.push(
          makeEvent(task.status === 'done' ? 'task_done' : 'task_dropped', taskEventContent(task.status, task.title), {
            id: `ev-${task.id}-status`,
            createdAt: when,
            date: dayKey(new Date(when)),
            taskId: task.id,
          }),
        );
      }
    });
    if (!taskEvents.length) return topic;
    const events = [...topic.events, ...taskEvents].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    return { ...topic, events };
  });

  return { journals, topics: withTaskEvents, tasks };
}

