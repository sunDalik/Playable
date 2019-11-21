export function cubicBezier(t, P0, P1, P2, P3) {
    return Math.pow(1 - t, 3) * P0 + 3 * P1 * Math.pow(1 - t, 2) * t + 3 * P2 * (1 - t) * Math.pow(t, 2) + P3 * Math.pow(t, 3);
}

export function quadraticBezier(t, P0, P1, P2) {
    return Math.pow(1 - t, 2) * P0 + 2 * P1 * t * (1 - t) + P2 * Math.pow(t, 2);
}

export function getCrossProduct(x1, y1, x2, y2, a1, b1, a2, b2) {
    const v1 = {x: x2 - x1, y: y2 - y1};
    const v2 = {x: a2 - a1, y: b2 - b1};
    return v1.x * v2.y - v1.y * v2.x;
}

export function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

}