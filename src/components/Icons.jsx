import { C } from '../tokens';

export const IconCheck = ({ color = C.real, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5L6.5 12L13 4.5" stroke={color} strokeWidth="1.6" strokeLinecap="square" />
  </svg>
);

export const IconX = ({ color = C.fake, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4L12 12M12 4L4 12" stroke={color} strokeWidth="1.6" strokeLinecap="square" />
  </svg>
);

export const IconDash = ({ color = C.inkFaint, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8H13" stroke={color} strokeWidth="1.6" strokeLinecap="square" />
  </svg>
);

export const SourceIcon = ({ kind }) => {
  if (kind === 'support') return <IconCheck />;
  if (kind === 'contradict') return <IconX />;
  return <IconDash />;
};
