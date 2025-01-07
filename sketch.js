let matrix, listVertices = [], listEdges = [], listCells = [], listFaces = [], listInfos = []
let JointsBuffer, textBuffer, infosGraphics, titleGraphics, mergeGraphics
let cam, cam2, initCamSettings
let opsReg, font_pathR, font_pathRMono, metaF
let formats, objFormat, cnvW, cnvH, cnv, seed = 1

let currentFormatName = "poster", currentFormat
let xRot = -25, yRot = 35, zRot = 0, yPos = 0, sceneRotSpeed = 0, sceneZdist = 0, sceneScale = .8, randomThicknessValue, myScene
let listScenesVariables = [xRot, yRot, zRot, sceneScale, sceneRotSpeed]

let listFilters = []
let jsonData, compoLayers = {}

function preload() {
  jsonData = loadJSON('./assets/urls.json', transformToImages)
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

  // line below put threshold filter ON as default
  // listFilters.push(THRESHOLD)

  cnv = createCanvas(cnvW, cnvH, WEBGL)
  cnv.parent('#canvas-container')
  document.querySelector('main').remove()

  let outputPixelD = 4
  pixelDensity(outputPixelD)
  infosGraphics = createGraphics(cnvW * outputPixelD, cnvH * outputPixelD, P2D)
  titleGraphics = createGraphics(cnvW * outputPixelD, cnvH * outputPixelD, P2D)
  mergeGraphics = createGraphics(cnvW * outputPixelD, cnvH * outputPixelD, P2D)

  JointsBuffer = createFramebuffer()
  textBuffer = createFramebuffer()
  textBuffer.pixelDensity(1)

  cam = createCamera()
  cam.perspective(2.5 * atan(height / 2 / 800));
  initCamSettings = { "isOrtho": true }

  const lineWeight = 3
  matrix = new Matrix(2, 2, 2, cellSize, 25, lineWeight)
  listVertices = matrix.getMinVertices()

  listEdges = createEdges(listVertices, cellSize)
  const edgeMap = buildEdgeMap(listEdges)
  listCells = findCells(listVertices, edgeMap)

  myScene = new Scene(xRot, yRot, zRot, yPos, sceneScale, sceneRotSpeed)

  loadInputs()
  setCamera(cam)

  const uploadTitleInput = select('#uploadTitle');
  const uploadInfosInput = select('#uploadInfos');
  uploadTitleInput.changed(() => {
    handleFile(select('.layer-title'), uploadTitleInput.elt.files)
  });
  uploadInfosInput.changed(() => {
    handleFile(select('.layer-infos'), uploadInfosInput.elt.files)
  });
}

function draw() {

  frameRate(30)
  clear()

  if (textBuffer) {

    textBuffer.begin()
    clear()
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

  if ((currentFormatName == 'full')) {
    if ((mouseX >= width / 4) && (mouseX <= 3 * width / 4) && (mouseY >= height / 4) && (mouseY <= 3 * height / 4)) {
      orbitControl(2, 2, 2, options)
    }
  } else {
    orbitControl(2, 2, 2, options)
  }

  // push for grid layer elements
  push()

  scale(myScene.scale)

  rotateX(myScene.xRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.xRot))
  rotateY(myScene.yRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.yRot))
  rotateZ(myScene.zRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.zRot))

  translate(0, myScene.yPos, 0)

  push()
  if (matrix) {
    // matrix.showVertices([0])
  }
  pop()

  push()
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
  // console.log()
  animateEdges(select('#anim-edges-checkbox'), 80, 80, .2)

  if (listCells) {
    for (let cell of listCells) {
      // cell.showWireFrame()
      // cell.showFaces(['left', 'right', 'top', 'bottom', 'front', 'back'])
      // cell.showFaces(['left', 'right', 'top'])

      // cell.showDebug()
    }
  }

  // if (listFaces) {
  //   for (const face of listFaces) {
  //     if (face.render) {
  //       face.show()
  //     }
  //   }
  // }

  // if (listFilters.length != 0) {
  //   filter(listFilters[0], .85)
  // }

  pop()

  pop()
  // pop grid layer elements

  // showBleeds(formats["bleeds"].size)
}
