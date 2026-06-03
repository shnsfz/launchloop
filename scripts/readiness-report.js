export function assertReadyReportJson(rawJson, label) {
  let report;

  try {
    report = JSON.parse(rawJson);
  } catch {
    throw new Error(`${label} did not return valid JSON`);
  }

  if (report.status === 'ready') {
    return;
  }

  const score = typeof report.score === 'number' ? `${report.score}/100` : 'unknown score';
  const blockers = Array.isArray(report.blockers)
    ? report.blockers.map((blocker) => blocker.title).filter(Boolean)
    : [];
  const blockerText = blockers.length > 0 ? blockers.join(', ') : 'none listed';

  throw new Error(`${label} is not ready: ${score}, blockers: ${blockerText}`);
}
