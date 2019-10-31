function cubicBezier(t, P0, P1, P2, P3) {
    return Math.pow(1 - t, 3) * P0 + 3 * P1 * Math.pow(1 - t, 2) * t + 3 * P2 * (1 - t) * Math.pow(t, 2) + P3 * Math.pow(t, 3);
}