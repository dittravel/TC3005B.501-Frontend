/**
* Reminder component
* 
* Displays a reminder message to users about required fields in forms.
*/

interface ReminderProps {
  text: string;
  type?: 'info' | 'success' | 'warning' | 'alert';
}

/**
* Displays a reminder message to users about required fields in forms.
* @param {string} text - The reminder message to display.
* @param {'info' | 'success' | 'error' | 'warning'} type - The reminder type to determine colors (default: 'info').
* @returns {JSX.Element} - A styled reminder component.
*/
export default function Reminder({ text, type = 'info' }: ReminderProps) {
  const colorVariants = {
    info: {
      bg: 'bg-secondary/20',
      border: 'border-secondary',
      text: 'text-secondary',
      textContent: 'text-text-primary/80'
    },
    success: {
      bg: 'bg-success-200/20',
      border: 'border-success-200',
      text: 'text-success-200',
      textContent: 'text-text-primary/80'
    },
    warning: {
      bg: 'bg-warning-200/20',
      border: 'border-warning-200',
      text: 'text-warning-200',
      textContent: 'text-text-primary/80'
    },
    alert: {
      bg: 'bg-alert-200/20',
      border: 'border-alert-200',
      text: 'text-alert-200',
      textContent: 'text-text-primary/80'
    }
  };

  const colors = colorVariants[type];

  return (
    <div className={`flex items-center ${colors.bg} border-l-4 ${colors.border} p-4 mb-8 rounded shadow-sm`}>
      <svg className={`w-6 h-6 ${colors.text} mr-3`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <p className={`text-sm ${colors.textContent} font-medium`}>
        {text}
      </p>
    </div>
  )
}