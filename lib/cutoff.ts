export interface RecruitmentStatus {
  isClosed: boolean;
  isStarted: boolean;
  isUrgent: boolean; // cutoff within 24 hours
  cutoffDate: Date;
  startDate: Date;
  timeRemainingMs: number; // milliseconds remaining until cutoff
  formattedRemaining: string;
  statusLabel: string;
}

export function getRecruitmentStatus(eventStartDate: Date | string | number): RecruitmentStatus {
  const start = new Date(eventStartDate);
  const now = new Date();
  
  // Recruitment cutoff is exactly 24 hours BEFORE event start
  const cutoffTime = start.getTime() - 24 * 60 * 60 * 1000;
  const cutoffDate = new Date(cutoffTime);
  const isStarted = now.getTime() >= start.getTime();
  const isClosed = isStarted || now.getTime() >= cutoffTime;
  const timeRemainingMs = Math.max(0, cutoffTime - now.getTime());

  // Urgency: if cutoff is less than 24 hours away (meaning event starts in < 48 hours) and not closed
  const isUrgent = !isClosed && timeRemainingMs <= 24 * 60 * 60 * 1000;

  let formattedRemaining = "";
  if (isClosed) {
    formattedRemaining = isStarted ? "EVENT STARTED" : "RECRUITMENT CLOSED";
  } else {
    const totalSeconds = Math.floor(timeRemainingMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
      formattedRemaining = `${days}D ${hours}H LEFT`;
    } else if (hours > 0) {
      formattedRemaining = `${hours}H ${minutes}M LEFT`;
    } else {
      formattedRemaining = `${minutes}M LEFT`;
    }
  }

  let statusLabel = "RECRUITING";
  if (isStarted) {
    statusLabel = "EVENT STARTED";
  } else if (isClosed) {
    statusLabel = "RECRUITMENT CLOSED";
  } else if (isUrgent) {
    statusLabel = "🔥 URGENT";
  }

  return {
    isClosed,
    isStarted,
    isUrgent,
    cutoffDate,
    startDate: start,
    timeRemainingMs,
    formattedRemaining,
    statusLabel,
  };
}

export function checkRecruitmentAllowed(eventStartDate: Date | string | number): { allowed: boolean; reason?: string } {
  const status = getRecruitmentStatus(eventStartDate);
  if (status.isStarted) {
    return { allowed: false, reason: "This event has already started." };
  }
  if (status.isClosed) {
    return { allowed: false, reason: "Recruitment closed 24 hours before the event." };
  }
  return { allowed: true };
}
