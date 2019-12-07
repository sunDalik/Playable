import {getCrossProduct} from "./utils/math_utils";

export function collisionCheck(vertexData1, vertexData2) {
    const lines1 = getLinesByVertexData(vertexData1);
    const lines2 = getLinesByVertexData(vertexData2);

    for (const line1 of lines1) {
        for (const line2 of lines2) {
            if (linesIntersect(line1[0], line1[1], line1[2], line1[3], line2[0], line2[1], line2[2], line2[3])) {
                return true;
            }
        }
    }

    if (pointInsideParallelogram(vertexData1[0], vertexData1[1],
        vertexData2[0], vertexData2[1], vertexData2[2], vertexData2[3], vertexData2[4], vertexData2[5], vertexData2[6], vertexData2[7])) {
        return true;
    } else if (pointInsideParallelogram(vertexData2[0], vertexData2[1],
        vertexData1[0], vertexData1[1], vertexData1[2], vertexData1[3], vertexData1[4], vertexData1[5], vertexData1[6], vertexData1[7])) {
        return true;
    }

    return false;
}

export function getLinesByVertexData(vertexData) {
    return [[vertexData[0], vertexData[1], vertexData[2], vertexData[3]],
        [vertexData[2], vertexData[3], vertexData[4], vertexData[5]],
        [vertexData[4], vertexData[5], vertexData[6], vertexData[7]],
        [vertexData[6], vertexData[7], vertexData[0], vertexData[1]]]
}

// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
// from stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
export function linesIntersect(a, b, c, d, p, q, r, s) {
    const det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}

//returns true if the point (a,b) is inside parallelogram (p0,p1,p2,p3)
// (p0 is the upper left corner, p1 is the upper right etc.)
export function pointInsideParallelogram(a, b, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
    const skewedLeft = p0x < p3x;
    const notSkewed = p0x === p3x;
    let x1, x2, y1, y2, k, xp;
    if (skewedLeft) {
        x1 = p0x;
        y1 = p0y;
        x2 = p2x;
        k = (p1y - p0y) / (p1x - p0x);
        y2 = y1 + (x2 - x1) * k;
        xp = getCrossProduct(x1, y1, x2, y2, x1, y1, a, b);
        if (xp < 0) return false;

        y2 = p2y;
        k = (p2y - p3y) / (p2x - p3x);
        y1 = y2 - (x2 - x1) * k;
        xp = getCrossProduct(x1, y1, x2, y2, x1, y1, a, b);
        if (xp > 0) return false;

        x1 = p0x;
        y1 = p0y;
        x2 = p3x;
        y2 = p3y;
        xp = getCrossProduct(x1, y1, x2, y2, x1, y1, a, b);
        if (xp > 0) return false;

        x1 = p1x;
        y1 = p1y;
        x2 = p2x;
        y2 = p2y;
        xp = getCrossProduct(x1, y1, x2, y2, x1, y1, a, b);
        if (xp < 0) return false;
    } else {
        x1 = p3x;
        x2 = p1x;
        y2 = p1y;
        k = (p1y - p0y) / (p1x - p0x);
        y1 = y2 - (x2 - x1) * k;
        xp = getCrossProduct(x1, y1, x2, y2, x1, y1, a, b);
        if (xp < 0) return false;

        y1 = p3y;
        k = (p2y - p3y) / (p2x - p3x);
        y2 = y1 + (x2 - x1) * k;
        xp = getCrossProduct(x1, y1, x2, y2, x1, y1, a, b);
        if (xp > 0) return false;

        x1 = p0x;
        y1 = p0y;
        x2 = p3x;
        y2 = p3y;
        xp = getCrossProduct(x1, y1, x2, y2, x1, y1, a, b);
        if (notSkewed) {
            if (xp > 0) return false;
        } else {
            if (xp < 0) return false;
        }

        x1 = p1x;
        y1 = p1y;
        x2 = p2x;
        y2 = p2y;
        xp = getCrossProduct(x1, y1, x2, y2, x1, y1, a, b);
        if (notSkewed) {
            if (xp < 0) return false;
        } else {
            if (xp > 0) return false;
        }
    }

    return true;
}