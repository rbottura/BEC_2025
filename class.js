const BECcolors = ['rgb(0,115,220)', 'rgb(228, 5, 20)', 'rgb(0,167,115)', 'rgb(255,212,0)', 'rgb(0,0,0)']
const BECcolorsId = ['blue', 'red', 'green', 'yellow', 'black']
class Matrix {
    constructor(gridX, gridY, gridZ, cellSize, offset, lineWeight) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.gridZ = gridZ;
        this.cellSize = cellSize;
        this.offset = offset; // Offset to extend edges beyond the vertices
        this.lineWeight = lineWeight

        this.gridVertices = this.calculateVertices();
    }

    // Pre-calculate all vertices of all cells in the grid
    calculateVertices() {
        const vertices = [];
        for (let x = 0; x < this.gridX; x++) {
            for (let y = 0; y < this.gridY; y++) {
                for (let z = 0; z < this.gridZ; z++) {
                    // Calculate the center of each cell
                    let centerX = (x - (this.gridX - 1) / 2) * this.cellSize;
                    let centerY = (y - (this.gridY - 1) / 2) * this.cellSize;
                    let centerZ = (z - (this.gridZ - 1) / 2) * this.cellSize;

                    // Calculate vertices of this cell (cube)
                    let cubeVertices = this.calculateCubeVertices(centerX, centerY, centerZ);
                    vertices.push(cubeVertices);
                }
            }
        }
        return vertices;
    }

    // Function to calculate vertices of a single cube given its center and size
    calculateCubeVertices(cx, cy, cz) {
        let s = this.cellSize / 2;
        return [
            createVector(cx - s, cy - s, cz - s),
            createVector(cx + s, cy - s, cz - s),
            createVector(cx + s, cy + s, cz - s),
            createVector(cx - s, cy + s, cz - s),
            createVector(cx - s, cy - s, cz + s),
            createVector(cx + s, cy - s, cz + s),
            createVector(cx + s, cy + s, cz + s),
            createVector(cx - s, cy + s, cz + s)
        ];
    }
    showVertices(col) {
        for (const point of this.minGridVerices) {
            push()
            translate(point)
            fill(col)
            // noFill()
            noStroke()
            // stroke('black')

            strokeWeight(3)
            box(16, 16, 16)
            // sphere(16, 16, 16)
            pop()
        }
    }
    getMinVertices() {
        this.minGridVerices = mergeUniqueArrays(...this.gridVertices);
        // console.log(this.minGridVerices)
        return this.minGridVerices
    }
}

class Edge {
    constructor(pointA, pointB, color, coloreId, index) {
        this.pointA = pointA; // First endpoint as p5.Vector
        this.pointB = pointB; // Second endpoint as p5.Vector
        this.color = color;
        this.colorId = coloreId
        this.index = index

        this.jSize = 10
        this.edgeOffset = -50
        this.edgeSize = 200
        this.edgeEaseSize = 200
        this.thickness = 1
        this.scale = 1
        this.rotate = 0

        this.render = true

        this.joints = getOffsetVector(this.pointA, this.pointB, this.edgeOffset / 2);

        let [v1, v2] = this.joints
        this.vMid = p5.Vector.add(v1, v2)
        this.axis = getEdgeAxis(v1, v2)
        this.vMid.div(2)

        this.x = this.vMid.x
        this.y = this.vMid.y
        this.z = this.vMid.z

        this.ex = this.x
        this.ey = this.y
        this.ez = this.z

        this.eScale = this.scale
        this.eRotate = this.rotate
    }
    easing() {
        // console.log("easing")
        this.x = easeIn(this.x, this.ex, .1)
        this.y = easeIn(this.y, this.ey, .1)
        this.z = easeIn(this.z, this.ez, .1)

        this.scale = easeIn(this.scale, this.eScale, .1)
        this.rotate = easeIn(this.rotate, this.eRotate, .1)

        this.edgeSize = easeIn(this.edgeSize, this.edgeEaseSize, .1)
    }
    show(thickness) {
        stroke(this.color);
        strokeWeight(thickness);

        let [v1, v2] = this.joints
        beginShape(LINES)
        vertex(v1.x, v1.y, v1.z);
        vertex(v2.x, v2.y, v2.z);
        endShape()
    }
    showBox(thickness, iColor) {

        push()
        this.easing()
        translate(this.x, this.y, this.z)
        fill(this.color)
        if (iColor) { fill(iColor) }

        noStroke()

        scale(this.scale + this.index * 0.001)
        // sphere(20, 10, 10)
        if (this.axis == "X") {
            // rotateX(this.index*0.1)
            box(this.edgeSize + this.edgeOffset, this.thickness, this.thickness)
        } else if (this.axis == "Y") {
            // rotateY(this.index*0.1)
            box(this.thickness, this.edgeSize + this.edgeOffset, this.thickness)
        } else if (this.axis == "Z") {
            // rotateZ(this.index*0.1)
            box(this.thickness, this.thickness, this.edgeSize + this.edgeOffset)
        }
        pop()
    }

    showJoints(j1, j2) {
        let [v1, v2] = this.joints
        push()
        // noStroke()
        stroke('black')
        strokeWeight(.5)
        noFill()
        // fill('black')
        if (j1) {
            push()
            translate(v1)
            sphere(this.jSize, 16, 16)
            pop()
        }
        if (j2) {
            push()
            translate(v2)
            sphere(this.jSize, 16, 16)
            pop()
        }
        pop()
    }
    updateThickness(val) {
        this.thickness = val
    }
    resize(newSize) {
        this.edgeEaseSize += newSize
    }
    move(x, y, z) {
        this.ex += x
        this.ey += y
        this.ez += z
    }
}

class Cell {
    constructor(center, edges, index, colors) {
        this.center = center; // p5.Vector representing the center of the cell
        this.edges = edges;   // Array of Edge objects
        this.id = index
        this.cellsize = cellSize
        this.fColors = colors

        this.faces = {
            bottom: {
                color: this.fColors[0],
                posVec: createVector(this.center.x, this.center.y + this.cellsize / 2 - .1, this.center.z),
                rotVec: createVector(90, 0, 0),
                scale: 1
            },
            top: {
                color: this.fColors[1],
                posVec: createVector(this.center.x, this.center.y - this.cellsize / 2 + .1, this.center.z),
                rotVec: createVector(90, 0, 0),
                scale: 1,
            },
            back: {
                color: this.fColors[2],
                posVec: createVector(this.center.x, this.center.y, this.center.z - this.cellsize / 2 + .1),
                rotVec: createVector(0, 0, 0),
                scale: 1,
            },
            front: {
                color: this.fColors[3],
                posVec: createVector(this.center.x, this.center.y, this.center.z + this.cellsize / 2 - .1),
                rotVec: createVector(0, 0, 0),
                scale: 1,
            },
            left: {
                color: this.fColors[4],
                posVec: createVector(this.center.x - this.cellsize / 2 + .1, this.center.y, this.center.z),
                rotVec: createVector(0, 90, 0),
                scale: 1,
            },
            right: {
                color: this.fColors[5],
                posVec: createVector(this.center.x + this.cellsize / 2 - .1, this.center.y, this.center.z),
                rotVec: createVector(0, 90, 0),
                scale: 1,
            }
        }
        this.facesNameList = ['left', 'right', 'top', 'bottom', 'front', 'back']
        for (let i = 0; i < 6; i++) {
            let f = this.faces[this.facesNameList[i]]
            let newFace = new Face(2, f.posVec, f.rotVec, this.fColors[i], .2, .5, f, i, this.index)
            listFaces.push(newFace)
        }
    }
    showDebug() {
        push();
        translate(this.center.x, this.center.y, this.center.z);
        textFont(opsReg)
        textSize(32)
        fill('black')
        text(this.id, 0, 0)

        fill(0, 0, 0, 255)
        noStroke()
        sphere(5)
        pop()
    }
    showEdges(val) {
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].showBox(val)
        }
    }
    showEdge(edgeId) {
        for (let i = 0; i < this.edges.length; i++) {
            if (i == edgeId) {
                this.edges[i].scale = .5
                this.edges[i].color = 'purple'
            }
        }
    }
    scaleEdges(val) {
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].scale = val
        }
    }
    moveEdges(dist) {
        for (let i = 0; i < this.edges.length; i++) {
            let mx = 0, my = 0, mz = 0
            if (this.edges[i].axis == "X") { mx = dist }
            if (this.edges[i].axis == "Y") { my = dist }
            if (this.edges[i].axis == "Z") { mz = dist }
            this.edges[i].move(mx, my, mz)
        }
    }
    resizeEdges(val) {
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].resize(val)
        }
    }
    showWireFrame() {
        push()
        translate(this.center.x, this.center.y, this.center.z)
        noFill()
        stroke('black')
        strokeWeight(.5)
        scale(1)
        box(cellSize, cellSize, cellSize)
        pop()
    }
    showFaces(arrayFaces) {
        noStroke()
        for (const face of arrayFaces) {
            let col = this.faces[face].color
            let pos = this.faces[face].posVec
            let s = this.faces[face].scale
            let r = this.faces[face].rotVec
            push()
            fill(col)
            translate(pos)
            rotateX(r.x)
            rotateY(r.y)
            rotateZ(r.z)
            scale(s)
            box(this.cellsize, this.cellsize, 1)
            pop()
        }
    }
}

class Face {
    constructor(thickness, pos, rotation, color, alpha, scale, name, index, cellIndex) {
        this.pos = pos
        this.thickness = thickness
        this.rot = rotation
        this.color = color
        this.alpha = alpha
        this.scale = scale
        this.name = name
        this.index = index
        this.cellIndex = cellIndex
    }
    show() {
        noStroke()

        push()
        fill(this.color)
        this.color.setAlpha(this.alpha)
        translate(this.pos)
        rotateX(this.rot.x)
        rotateY(this.rot.y)
        rotateZ(this.rot.z)
        scale(this.scale)
        box(cellSize, cellSize, this.thickness)
        pop()

    }
}

class InfoText {
    constructor(x, y, z, font, size, text, align, buffer) {

        this.x = x
        this.y = y
        this.z = z
        this.posV = createVector(this.x, this.y, this.z)
        this.font = font
        this.size = size
        this.txt = text
        this.align = align

        this.pg = buffer
    }

    show() {
        push()
        // noStroke()
        // scale(1, -1, 1)
        // stroke('black')
        // strokeWeight(5)
        // fill('red')
        // plane(width, height)
        fill('black')
        // noFill()
        translate(-width / 2, -height / 2, 5)
        translate(this.posV)
        textFont(this.font)
        textAlign(CENTER, CENTER)
        // textLeading(2)
        textSize(this.size)
        // this.txt2p = this.font.textToPoints(this.txt, this.posV.x, this.posV.y, this.size)
        // scale(10)
        // textStyle(ITALIC)
        text(this.txt, 0, 0)
        // rect(0,0,width,height)
        pop()

    }
}

class BECRenderer {
    constructor(canvas) {
        this.c = canvas

        this.sceneRotationSpeed = 1
        this.prevSceneRotationSpeed = 1
        this.paramContainer = select('#parameters-container')

        this.btns = selectAll('.player-btn')
        this.gearBtn = this.btns[0]
        this.playBtn = this.btns[1]
        this.scrnBtn = this.btns[2]
        this.saveBtn = this.btns[3]
        this.camBtn = this.btns[4]

        this.gearBtn.mouseClicked(() => this.showParameters(isHidden(this.paramContainer.elt)))
        this.playBtn.mouseClicked(() => this.playPause(isLooping()))
        this.saveBtn.mouseClicked(() => this.saveFrame())
        this.camBtn.mouseClicked(() => this.changeCamera()) 
    }
    showParameters(showing) {
        console.log(showing)
        if (showing) {
            // this.paramContainer.show()
            this.paramContainer.elt.style.display = 'flex'
        } else {
            this.paramContainer.hide()
        }
    }
    playPause(play) {
        if (!play) {
            this.playBtn.innerHTML = '⏸️'
            loop()
        } else {
            this.playBtn.innerHTML = '▶️'
            noLoop()
        }
    }
    saveFrame() {
        saveCanvas(currentFormatName, 'png')
    }
    resetOribitControl() {
        resetMatrix();
    }
    changeCamera(){
        changeCamera(cam, 'toggle')
    }
}

class Scene {
    constructor(xRot, yRot, zRot, s, rotSpeed){
        this.xRot = xRot; 
        this.yRot = yRot; 
        this.zRot = zRot; 
        this.scale = s; 
        this.rotSpeed = rotSpeed;
    }
}