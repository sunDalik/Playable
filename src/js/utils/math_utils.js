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
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function hypotenuse(cathetus1, cathetus2) {
    return Math.sqrt(cathetus1 ** 2 + cathetus2 ** 2);
}

export function average(array) {
    if (array.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}

export function easeInOutQuad(time) {
    if (time <= 0.5) return 2 * time * time;
    else {
        time -= 0.5;
        return 2 * time * (1 - time) + 0.5;
    }
}

export function easeOutQuad(time) {
    return -1 * (time) * (time - 2);
}

export function easeInQuad(time) {
    return time * time;
}

export function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function roundToQuarter(value) {
    return (Math.round(value * 4) / 4);
}

export function getBresenhamLine(x0, y0, x1, y1) {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    const line = [];

    while (true) {
        line.push({x: x0, y: y0});

        if ((x0 === x1) && (y0 === y1)) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
    return line;
}
