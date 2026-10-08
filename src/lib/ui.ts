import type { TopicStatus } from '../types';

export const fieldClass =
  'w-full rounded-md border border-line bg-[#141518] px-3 py-3 text-[13px] leading-relaxed text-ink outline-none placeholder:text-soft focus:border-edge focus:shadow-[0_0_0_2px_#36402e]';

export const inputClass =
  'block w-full rounded-md border border-line bg-surface px-3 py-2.5 text-xs text-ink outline-none focus:border-edge focus:shadow-[0_0_0_2px_#36402e]';

export const primaryBtnClass =
  'inline-flex cursor-pointer items-center gap-2 rounded-md border border-accent bg-accent px-3 py-2 text-[11px] font-semibold text-[#222329] hover:bg-[#d0d1e0]';

export const ghostBtnClass =
  'cursor-pointer border-0 bg-transparent px-2 py-2 text-[11px] text-soft hover:text-ink';

export const TOPIC_STATUS_CHIP: Record<TopicStatus, string> = {
  active: 'bg-panel text-accent',
  later: 'bg-[#332c20] text-[#d0b184]',
  resolved: 'bg-[#282a25] text-soft',
  dropped: 'bg-[#282a25] text-soft',
};

export const TOPICS_TAB_KEY = 'on-my-mind.topics-tab';
export const TASKS_TAB_KEY = 'on-my-mind.tasks-tab';
