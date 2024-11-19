let matrix, cam, cam2, initCamSettings, listVertices = [], listEdges = [], listCells = [], listFaces = [], listInfos = []
let JointsBuffer, textBuffer
let opsReg, font_pathR, font_pathRMono
let formats, cnvW, cnvH

const listFonts = [
  "Path-R",
  "Path-RMono",
  "Path-RBold",
  "Path-RHeavy",
  "Path-C",
  "Path-CBold",
  "Path-CHeavy"
]

function preload() {
  formats = loadJSON('./assets/formats.json', () => {
    cnvW = formats["aff"].width + formats["bleeds"].size*2
    cnvH = formats["aff"].height + formats["bleeds"].size*2
  })
  opsReg = loadFont('./assets/fonts/OPS/OPSFavorite-Regular.otf')
  font_pathR = loadFont('./assets/fonts/Path/Path-R.otf')
  font_pathRMono = loadFont('./assets/fonts/Path/Path-RMono.otf')
}

function setup() {
  colorMode(RGB, 255, 255, 255, 1)
  angleMode(DEGREES)
  rectMode(CENTER)
  createCanvas(cnvW, cnvH, WEBGL)

  JointsBuffer = createFramebuffer()
  textBuffer = createFramebuffer()

  textGraphics = createGraphics(WiW, WiH, P2D)
  randomSeed(1)

  cam = createCamera()
  cam.ortho()
  initCamSettings = cam
  // cam.perspective(2.5 * atan(height / 2 / 800));
  // ortho()

  // cam2 = textBuffer.createCamera()
  // cam2.set(cam)

  const lineWeight = 3
  matrix = new Matrix(4, 2, 4, cellSize, 25, lineWeight)
  listVertices = matrix.getMinVertices()

  listEdges = createEdges(listVertices, cellSize)
  const edgeMap = buildEdgeMap(listEdges)
  listCells = findCells(listVertices, edgeMap)

  listInfos = createInfos()
}

function draw() {
  background(255)
  // debugMode()

  if (textBuffer) {

    textBuffer.begin()
    clear()
    // setCamera(cam2)
    // let fovy2 = map(mouseX, 0, WiW, .2, 8) * atan(height / 2 / 800)
    // cam2.frustum()
    // cam2.perspective(fovy2, width/height, .001, 10000)
    resetMatrix()
    
    push()
    if (listInfos) {
      for (const txt of listInfos) {
        txt.show()
      }
    }

    pop()
    textBuffer.end()
  }

  setCamera(cam)

  push()
  beginClip({ invert: true })
  texture(textBuffer)
  plane(width, height)
  endClip()
  pop()

  let options = {
    disableTouchActions: true,
    freeRotation: false
  }

  orbitControl(2,2,2, options)
  frameRate(30)

  // let fovy = map(mouseY, 0, WiH, 0.1, 7)
  // perspective(fovy * atan(height / 2 / 800), 16/9, 1*0.001, 1*10000)

  // push for grid layer elements
  push()
  // rotateY(45)
  // rotateZ(-5)
  // rotateX(-5)

  push()
  if (matrix) {
    // matrix.showVertices([0])
  }
  pop()

  push()
  if (listEdges) {
    for (let i = 0; i < listEdges.length; i += 1) {
      listEdges[i].showBox(8)
      // listEdges[i].showJoints(true, true)
    }
  }
  pop()

  push()
  if (listCells) {
    for (let cell of listCells) {
      // cell.showWireFrame()
      if (cell.id % 3 == 0) {
        // cell.showEdges(15)
      }
      if (frameCount % 1 == 0) {
        if (cell.id == floor(random() * listCells.length) && cell.id % 5 == 0) {
          let randomMove = int(-50 + random(100))
          cell.moveEdges(randomMove)
          let randomSize = floor(-100 + random(200))
          cell.resizeEdges(randomSize)
        }
      }
      // cell.showDebug()
      // cell.showFaces(['left', 'right', 'top'])
    }
  }

  if (listFaces) {
    for (let i = 0; i < listFaces.length; i += 1) {
      // listFaces[i].show()
    }
    for (const face of listFaces) {
      // face.show()
    }
  }
  pop()

  pop()

  // showBleeds(formats["bleeds"].size)
  // pop grid layer elements
  keyAction()
}
