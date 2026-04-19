// Formaldehyde (HCHO / CH2O) safety bands in ppm.
// Mirrors the ESP32 device classification:
//   SAFE_LIMIT   = 0.08 ppm (WHO indoor-air guideline)
//   DANGER_LIMIT = 0.75 ppm (OSHA PEL, 8-hr TWA)
//   ppm <= SAFE_LIMIT        -> "safe"
//   SAFE_LIMIT < ppm < DANGER_LIMIT -> "warning"
//   ppm >= DANGER_LIMIT      -> "danger"
export const SAFE_LIMIT_PPM = 0.08;
export const DANGER_LIMIT_PPM = 0.75;

export const SAFETY_LEVELS = {
    SAFE: {
        key: 'SAFE',
        label: 'Safe',
        description: 'At or below WHO indoor-air guideline (0.08 ppm)',
        badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
        dot: 'bg-emerald-500',
    },
    WARNING: {
        key: 'WARNING',
        label: 'Warning',
        description: 'Above WHO guideline, below OSHA PEL',
        badge: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30',
        dot: 'bg-yellow-500',
    },
    DANGER: {
        key: 'DANGER',
        label: 'Danger',
        description: 'At or above OSHA PEL (0.75 ppm)',
        badge: 'bg-red-500/15 text-red-500 border-red-500/30',
        dot: 'bg-red-500',
    },
    UNKNOWN: {
        key: 'UNKNOWN',
        label: 'Unknown',
        description: 'No valid reading',
        badge: 'bg-muted text-muted-foreground border-border',
        dot: 'bg-muted-foreground',
    },
    // Distinct from UNKNOWN: the device explicitly told us the sensor is
    // not responding (firmware sets level: "offline" and omits ch2o_ppm).
    // Styled in muted red so it visually separates from a real DANGER reading
    // while still signaling that something needs attention.
    OFFLINE: {
        key: 'OFFLINE',
        label: 'Offline',
        description: 'Sensor not reporting',
        badge: 'bg-red-500/10 text-red-400 border-red-500/30',
        dot: 'bg-red-400',
    },
};

export const getSafetyLevel = (ch2oPpm) => {
    if (ch2oPpm == null || Number.isNaN(ch2oPpm)) return SAFETY_LEVELS.UNKNOWN;
    if (ch2oPpm <= SAFE_LIMIT_PPM) return SAFETY_LEVELS.SAFE;
    if (ch2oPpm < DANGER_LIMIT_PPM) return SAFETY_LEVELS.WARNING;
    return SAFETY_LEVELS.DANGER;
};

// Map a device-provided label string (e.g. "safe", "warning", "danger") onto
// one of the SAFETY_LEVELS. Returns null when no match is found so the caller
// can fall back to classifying by ppm.
export const getSafetyLevelByLabel = (label) => {
    if (typeof label !== 'string') return null;
    const normalized = label.trim().toLowerCase();
    if (!normalized) return null;
    for (const level of Object.values(SAFETY_LEVELS)) {
        if (level.label.toLowerCase() === normalized) return level;
        if (level.key.toLowerCase() === normalized) return level;
    }
    return null;
};
