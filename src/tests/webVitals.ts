import { onCLS, onINP, onLCP, onTTFB, onFCP } from "web-vitals";

function getViewName() {
  return window.location.pathname;
}

function formatMetric(metric: any) {
  return {
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // good | needs-improvement | poor
    delta: metric.delta,
    id: metric.id,
  };
}

function logMetric(metric: any) {
  const view = getViewName();
  const m = formatMetric(metric);

  console.log(
    `[WebVitals][${view}] ${m.name}: ${m.value} (${m.rating})`
  );
}

export function reportWebVitals() {
  onCLS(logMetric);
  onINP(logMetric);
  onLCP(logMetric);
  onTTFB(logMetric);
  onFCP(logMetric);
}