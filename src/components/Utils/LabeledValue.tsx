/**
 * Labeled Value Component
 *
 * A simple component to display a label and its corresponding value in a structured format.
 * Useful for displaying key-value pairs in forms, summaries, or details sections.
 */

import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number | ReactNode;
}

/**
 * Labeled Value Component
 * @param {string} label - The label or title for the value being displayed
 * @param {string | number | ReactNode} value - The value corresponding to the label
 * @returns {JSX.Element} A styled component displaying the label and value
 */
export default function LabeledValue({ label, value }: Props) {
  return (
    <div className="flex flex-col items-start">
      <p className="text-xs text-text-secondary">{label}</p>
      <div className="text-sm font-medium text-text-primary">{value}</div>
    </div>
  );
}