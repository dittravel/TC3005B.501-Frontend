/**
* Info Card Component
* 
* Reusable card component for displaying key information with a value and title
* Designed for use in summary sections and dashboards (por jeemplo las cartitas de permisos)
*/

interface Props {
  value: string | number;
  type?: "success" | "alert" | "warning" | "info";
  title: string;
}

const colors = {
  "success": "text-success-400",
  "alert": "text-alert-400",
  "warning": "text-warning-400",
  "info": "text-secondary"
};

/**
* Info Card Component
* @param {string} title - The title or label for the information being displayed
* @param {string | number} value - The main value or statistic to display
* @returns {JSX.Element} A styled card component displaying the information
*/
export default function InfoCard({ 
  value,
  title,
  type = "info",
}: Props) {
  return (
    <div className="card">
      <p className={`text-2xl font-extrabold m-0 ${colors[type]}`}>{value}</p>
      <p className="text-sm text-text-secondary">{title}</p>
    </div>
  );
}