const WiW = window.innerWidth, WiH = window.innerHeight
const cellSize = 200

function calculateCubeVertices(cx, cy, cz, s) {
    let halfSize = s / 2;

    // Define the 8 vertices relative to the center (cx, cy, cz)
    let vertices = [
        createVector(cx - halfSize, cy - halfSize, cz - halfSize),
        createVector(cx + halfSize, cy - halfSize, cz - halfSize),
        createVector(cx + halfSize, cy + halfSize, cz - halfSize),
        createVector(cx - halfSize, cy + halfSize, cz - halfSize),
        createVector(cx - halfSize, cy - halfSize, cz + halfSize),
        createVector(cx + halfSize, cy - halfSize, cz + halfSize),
        createVector(cx + halfSize, cy + halfSize, cz + halfSize),
        createVector(cx - halfSize, cy + halfSize, cz + halfSize)
    ];

    return vertices;
}

function mergeUniqueArrays(...arrays) {
    // Flatten all arrays into a single array
    const combinedArray = arrays.flat();

    // Use a Set to store unique JSON representations of the objects
    const uniqueObjects = new Set();

    // Filter combinedArray for unique objects only
    const result = combinedArray.filter(item => {
        const itemString = JSON.stringify(item);
        if (uniqueObjects.has(itemString)) {
            return false; // Duplicate, so skip it
        }
        uniqueObjects.add(itemString);
        return true; // Not a duplicate, so include it
    });

    return result;
}

// Function to create unique edges for each pair of adjacent points
function createEdges(points, cellSize) {
    const edges = [];
    const uniqueEdges = new Set();
    let edgeCounter = 0

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const p1 = points[i];
            const p2 = points[j];

            // Check if p1 and p2 are adjacent along one axis by cellSize
            const isAdjacent = (
                (p1.dist(p2) === cellSize) &&
                ((p1.x === p2.x && p1.y === p2.y) || // Adjacent along z-axis
                    (p1.x === p2.x && p1.z === p2.z) || // Adjacent along y-axis
                    (p1.y === p2.y && p1.z === p2.z))   // Adjacent along x-axis
            );

            if (isAdjacent) {
                // Create a unique key for the edge using integer coordinates for fast comparison
                const edgeKey = `${Math.min(p1.x, p2.x)},${Math.min(p1.y, p2.y)},${Math.min(p1.z, p2.z)}-${Math.max(p1.x, p2.x)},${Math.max(p1.y, p2.y)},${Math.max(p1.z, p2.z)}`;

                // Only add edge if it's unique
                if (!uniqueEdges.has(edgeKey)) {
                    uniqueEdges.add(edgeKey);
                    let edgeColor = BECcolors[floor(random() * 5)]
                    edges.push(new Edge(p1, p2, edgeColor, edgeCounter))
                    edgeCounter++
                }
            }
        }
    }
    return edges;
}

function easeIn(from, to, speed) {
    return from + (to - from) * speed;
}

// Helper function to add or subtract offset
function getOffsetVector(v1, v2, offset) {
    let direction = p5.Vector.sub(v2, v1).normalize().mult(offset);
    return [p5.Vector.sub(v1, direction), p5.Vector.add(v2, direction)];
}

// Function to check if a neighbor exists at a given offset
function hasNeighbor(point, points, offset) {
    const neighbor = p5.Vector.add(point, offset);
    return points.some(p => p5.Vector.dist(p, neighbor) < 0.01);
}

// Helper to generate a unique key for an edge
function getEdgeKey(p1, p2) {
    // Sort the points to create a unique identifier regardless of order
    const sortedPoints = [p1, p2].sort((a, b) => a.toString().localeCompare(b.toString()));
    return `${sortedPoints[0].toString()}-${sortedPoints[1].toString()}`;
}

// Function to build an edge map for efficient lookup
function buildEdgeMap(listEdges) {
    const edgeMap = {};
    for (let edge of listEdges) {
        const key = getEdgeKey(edge.pointA, edge.pointB);
        edgeMap[key] = edge;
    }
    return edgeMap;
}

// Function to find the correct edges for a cell based on its vertices
function getEdgesForCell(vertices, edgeMap) {
    const edges = [];

    // Define the edges for the bottom, vertical, and top layers
    const bottomEdges = [[0, 1], [1, 3], [3, 2], [2, 0]];
    const verticalEdges = [[0, 4], [1, 5], [2, 6], [3, 7]];
    const topEdges = [[4, 5], [5, 7], [7, 6], [6, 4]];

    // Helper to add an existing edge from edgeMap based on vertices indices
    function addEdge(idx1, idx2) {
        const p1 = vertices[idx1];
        const p2 = vertices[idx2];
        const edgeKey = getEdgeKey(p1, p2);

        // Add the edge from edgeMap if it exists
        if (edgeMap[edgeKey]) {
            edges.push(edgeMap[edgeKey]);
        }
    }

    // Add all required edges for the cell
    bottomEdges.forEach(([i, j]) => addEdge(i, j));
    verticalEdges.forEach(([i, j]) => addEdge(i, j));
    topEdges.forEach(([i, j]) => addEdge(i, j));

    return edges;
}

// Function to create cells from points using existing edges in edgeMap
function findCells(points, edgeMap) {
    const cells = [];
    let cellIndex = 0

    for (let point of points) {
        // Check if this point has neighbors to form a cube
        const xNeighbor = hasNeighbor(point, points, createVector(cellSize, 0, 0));
        const yNeighbor = hasNeighbor(point, points, createVector(0, cellSize, 0));
        const zNeighbor = hasNeighbor(point, points, createVector(0, 0, cellSize));

        if (xNeighbor && yNeighbor && zNeighbor) {
            // Calculate the cell vertices and midpoint
            const vertices = [
                point,
                p5.Vector.add(point, createVector(cellSize, 0, 0)),
                p5.Vector.add(point, createVector(0, cellSize, 0)),
                p5.Vector.add(point, createVector(cellSize, cellSize, 0)),
                p5.Vector.add(point, createVector(0, 0, cellSize)),
                p5.Vector.add(point, createVector(cellSize, 0, cellSize)),
                p5.Vector.add(point, createVector(0, cellSize, cellSize)),
                p5.Vector.add(point, createVector(cellSize, cellSize, cellSize))
            ];
            const midpoint = p5.Vector.add(point, createVector(cellSize / 2, cellSize / 2, cellSize / 2));

            // Get the edges for this cell using the edge map
            const edges = getEdgesForCell(vertices, edgeMap);
            const facesColors = []
            cells.push(new Cell(midpoint, edges, cellIndex, getRandomColors(6)));
            cellIndex++
        }
    }
    console.log(cells)
    return cells;
}

function createInfos() {
    const titre = 'HABITER'
    const sTitre = "Expositions, rencontres, ateliers autour"
    const sTitre2 = "des arts numériques et hybrides"
    const date = "18.04 - 21.06"
    const nomBEC = "1RE BIENNALE EN COMMUN(S"

    let arr = []

    console.log(titre.length)
    let titreSize = width/titre.length*1.8
    push()
    textSize(titreSize)
    let w = textWidth(titre)
    let titreHeight = titreSize*0.5
    let titreInfos = new InfoText(width / 2 - w / 2, titreHeight, 0, font_pathRMono, titreSize, titre, '', textGraphics)
    arr.push(titreInfos)
    pop()

    return arr
}

function getRandomColors(number) {
    let arr = []
    for (let i = 0; i < number; i++) {
        let randColor = color(BECcolors[floor(random(BECcolors.length))])
        arr.push(randColor)
    }
    // console.log(arr)
    return arr
}

function getEdgeAxis(pA, pB) {
    if (pA.x != pB.x) {
        return "X"
    } else if (pA.y != pB.y) {
        return "Y"
    } else if (pA.z != pB.z) {
        return "Z"
    }
}

// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight);
// }

function resizeToFormat(format) {
    let w = width, h = height
    let f = format
    let obj = formats[f]
    if ((f == "16/9" || f == "9/16" || f == "sqr") && (w != obj.width) || (h != obj.height)) {
        resizeCanvas(obj.width, obj.height)
        resetText()
        resetEdges()
        let aspect = obj.width/obj.height
        cam = undefined
        cam = initCamSettings
    }
}

function resetText() {
    listInfos = []
    listInfos = createInfos()
}

function resetEdges(){
    listEdges = []
    listEdges = createEdges(listVertices, cellSize)
}
function keyAction() {
    if (keyIsDown(65)) {
        resizeToFormat("16/9")
    }
    if (keyIsDown(90)) {
        resizeToFormat("9/16")
    }
    if (keyIsDown(69)) {
        resizeToFormat("sqr")
    }
}