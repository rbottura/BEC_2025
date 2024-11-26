let matrix, listVertices = [], listEdges = [], listCells = [], listFaces = [], listInfos = []
let JointsBuffer, textBuffer
let cam, cam2, initCamSettings 
let opsReg, font_pathR, font_pathRMono, metaF
let formats, objFormat, cnvW, cnvH, cnv, seed = 1
let currentFormatName = "poster", currentFormat
let xRot = 0, yRot = 0, zRot = 0, sceneRotSpeed = 0, sceneZdist = 0, sceneScale = 1, myScene
let listScenesVariables = [xRot, yRot, zRot, sceneScale, sceneRotSpeed]
let listFilters = []

function preload() {
  formats = loadJSON('./assets/formats.json', (e) => {
    console.log(e)
    // objFormat = JSON.parse(e)
    currentFormat = formats[currentFormatName]
    // updateLayersOptions(currentFormatName, currentFormat.index, currentFormat.hasLayers)
    cnvW = currentFormat.width + formats["bleeds"].size * 2
    cnvH = currentFormat.height + formats["bleeds"].size * 2
  })
  opsReg = loadFont('./assets/fonts/OPS/OPSFavorite-Regular.otf')
  font_pathR = loadFont('./assets/fonts/Path/Path-R.otf')
  font_pathRMono = loadFont('./assets/fonts/Path/Path-RMono.otf')
  metaF = loadFont('./assets/fonts/mn128_clean_META.otf')
}

function setup() {
  colorMode(RGB, 255, 255, 255, 1)
  angleMode(DEGREES)
  rectMode(CENTER)
  listFilters.push(THRESHOLD)
  cnv = createCanvas(cnvW, cnvH, WEBGL)
  cnv.parent('#canvas-container')
  document.querySelector('main').remove()

  pixelDensity(1)

  JointsBuffer = createFramebuffer()
  textBuffer = createFramebuffer()
  textBuffer.pixelDensity(1)

  textGraphics = createGraphics(WiW, WiH, P2D)

  cam = createCamera()
  cam.perspective(2.5 * atan(height / 2 / 800));
  // cam.ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 8000)
  initCamSettings = {"isOrtho" : false}

  // cam2 = textBuffer.createCamera()
  // cam2.set(cam)

  const lineWeight = 3
  matrix = new Matrix(4, 2, 4, cellSize, 25, lineWeight)
  listVertices = matrix.getMinVertices()

  listEdges = createEdges(listVertices, cellSize)
  const edgeMap = buildEdgeMap(listEdges)
  listCells = findCells(listVertices, edgeMap)

  myScene = new Scene(xRot, yRot, zRot, sceneScale, sceneRotSpeed)

  loadInputs()
  setCamera(cam)
}

function draw() {
  // randomSeed(seed)
  // background(255)
  frameRate(30)
  // debugMode()
  clear()

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
        // console.log('oueoue')
      }
    }

    pop()
    textBuffer.end()
  }


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

  if( (currentFormatName == 'full')){
    if ((mouseX>= width/4) && (mouseX<=3*width/4) && (mouseY>=height/4) && (mouseY<=3*height/4)){
      orbitControl(2, 2, 2, options)
    }
  } else {
    orbitControl(2, 2, 2, options)
  }

  // let fovy = map(mouseY, 0, WiH, 0.1, 7)
  // perspective(fovy * atan(height / 2 / 800), 16/9, 1*0.001, 1*10000)

  // push for grid layer elements
  push()

  scale(myScene.scale)

  rotateX(myScene.xRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.xRot))
  rotateY(myScene.yRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.yRot))
  rotateZ(myScene.zRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.zRot))

  push()
  if (matrix) {
    // matrix.showVertices([0])
  }
  pop()

  push()
  // console.log(xRot)
  if (listEdges) {
    for (let i = 0; i < listEdges.length; i += 1) {
      // listEdges[i].thickness = 15
      if (listEdges[i].render) {
        listEdges[i].showBox()
      }
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
          // let randomMove = 100 * noise(0.005 * frameCount);
          // cell.moveEdges(randomMove)
          // let randomSize = floor(-100 + random(200))
          // cell.resizeEdges(randomSize)
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
  
  if(listFilters.length != 0){
    filter(listFilters[0], .85)
  }
  pop()

  pop()
  // pop grid layer elements

  // showBleeds(formats["bleeds"].size)
}
