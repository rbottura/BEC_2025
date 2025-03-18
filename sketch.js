let matrix,
  listVertices = [],
  listEdges = [],
  listCells = [],
  listFaces = [],
  listInfos = [];
let JointsBuffer, textBuffer, infosGraphics, titleGraphics, mergeGraphics;
let cam, cam2, initCamSettings;
let opsReg, font_pathR, font_pathRMono, metaF;
let formats,
  objFormat,
  cnvW,
  cnvH,
  cnv,
  seed = 1,
  cstFPS = 12;

let bufferOptions = {};

let currentFormatName = "poster",
  currentFormat;
let xRot = -25,
  yRot = 35,
  zRot = 0,
  yPos = 0,
  sceneRotSpeed = 0,
  sceneZdist = 0,
  sceneScale = 0.8,
  randomThicknessValue,
  myScene;
let listScenesVariables = [xRot, yRot, zRot, sceneScale, sceneRotSpeed];

let listFilters = [];
let jsonData,
  compoLayers = {};

P5Capture.setDefaultOptions({
  format: "png",
  framerate: cstFPS,
});

function preload() {
  jsonData = loadJSON("./assets/urls2.json", transformToImages);
  formats = loadJSON("./assets/formats.json", (e) => {
    console.log(e);
    // objFormat = JSON.parse(e)
    currentFormat = formats[currentFormatName];
    // updateLayersOptions(currentFormatName, currentFormat.index, currentFormat.hasLayers)
    cnvW = currentFormat.width + formats["bleeds"].size * 2;
    cnvH = currentFormat.height + formats["bleeds"].size * 2;
  });
  opsReg = loadFont("./assets/fonts/OPS/OPSFavorite-Regular.otf");
  font_pathR = loadFont("./assets/fonts/Path/Path-R.otf");
  font_pathRMono = loadFont("./assets/fonts/Path/Path-RMono.otf");
  metaF = loadFont("./assets/fonts/mn128_clean_META.otf");
}

let outputPixelD = 4;
function setup() {
  colorMode(RGB, 255, 255, 255, 1);
  angleMode(DEGREES);
  rectMode(CENTER);
  imageMode(CENTER);
  noSmooth();

  bufferOptions = {
    width: cnvW,
    height: cnvH,
    density: outputPixelD,
    textureFiltering: LINEAR,
  };
  // line below put threshold filter ON as default
  // listFilters.push(THRESHOLD)

  cnv = createCanvas(cnvW, cnvH, WEBGL);
  cnv.parent("#canvas-container");
  document.querySelector("main").remove();

  pixelDensity(outputPixelD);
  infosGraphics = createGraphics(cnvW * outputPixelD, cnvH * outputPixelD, P2D);
  titleGraphics = createGraphics(cnvW, cnvH, WEBGL);
  mergeGraphics = createGraphics(cnvW * outputPixelD, cnvH * outputPixelD, P2D);

  JointsBuffer = createFramebuffer();
  textBuffer = createFramebuffer(bufferOptions);

  cam = createCamera();
  cam.perspective(2.5 * atan(height / 2 / 800));
  initCamSettings = { isOrtho: true };

  const lineWeight = 3;
  matrix = new Matrix(2, 2, 2, cellSize, 25, lineWeight);
  listVertices = matrix.getMinVertices();

  listEdges = createEdges(listVertices, cellSize);
  const edgeMap = buildEdgeMap(listEdges);
  listCells = findCells(listVertices, edgeMap);

  myScene = new Scene(xRot, yRot, zRot, yPos, sceneScale, sceneRotSpeed);

  loadInputs();
  // Add load button to load downloaded data file
  let loadButton = createFileInput(loadJsonData);

  // Only accept files with .json extension
  loadButton.attribute('accept', '.json');
  loadButton.id('loadDataBtn')

  setCamera(cam);

  const uploadTitleInput = select("#uploadTitle");
  const uploadInfosInput = select("#uploadInfos");
  uploadTitleInput.changed(() => {
    handleFile(select(".layer-title"), uploadTitleInput.elt.files);
  });
  uploadInfosInput.changed(() => {
    handleFile(select(".layer-infos"), uploadInfosInput.elt.files);
  });

  select(".p5c-container").position(550, 50);
}

function draw() {
  frameRate(cstFPS);

  if (textBuffer) {
    textBuffer.begin();
    setCamera(cam)
    clear();
    // resetMatrix();
    imageMode(CENTER);
    rectMode(CENTER)
    background('yellow')
    // push();
    if (
      compoLayers[currentFormatName].titre2 &&
      selectAll(".active-layer-btn")[0].html() == "2"
    ) {
      // translate(-width/2, -height/2)
      fill('red')
      rect(0, 0, cnvW, cnvH)
      image(compoLayers[currentFormatName].titre2, 0, 0, cnvW, cnvH);
      // image(titleGraphics, 0, 0, width, height);
    } else {
      clear();
    }
    // resetMatrix();
    // pop();
    textBuffer.end();
  }


  push();
  beginClip({ invert: true });
  if (
    compoLayers[currentFormatName].titre2 &&
    selectAll(".active-layer-btn")[0].html() == "2"
  ) {
    titleGraphics.imageMode(CENTER)
    titleGraphics.rectMode(CENTER)
    titleGraphics.pixelDensity(outputPixelD)
    // titleGraphics.translate(-width/2, -height/2)
    titleGraphics.image(compoLayers[currentFormatName].titre2, width / 2, height / 2, width, height)
    background(255);
    image(titleGraphics, -width / 2, -height / 2)
  } else if (selectAll(".active-layer-btn")[0].html() == "1") {
    background(255);
  } else if (selectAll(".active-layer-btn")[0].html() == "0") {
    // console.log('clear')
    clear()
  }

  // textureMode(NORMAL);
  // textureWrap(REPEAT)
  // texture(textBuffer);

  // plane(width, height);
  // box(width, height, width)
  endClip();
  pop();


  let options = {
    disableTouchActions: true,
    freeRotation: false,
  };

  if (currentFormatName == "full") {
    if (
      mouseX >= width / 4 &&
      mouseX <= (3 * width) / 4 &&
      mouseY >= height / 4 &&
      mouseY <= (3 * height) / 4
    ) {
      orbitControl(2, 2, 2, options);
    }
  } else {
    orbitControl(2, 2, 2, options);
  }

  // push for grid layer elements
  push();

  scale(myScene.scale);

  rotateX(
    myScene.xRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.xRot)
  );
  rotateY(
    myScene.yRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.yRot)
  );
  rotateZ(
    myScene.zRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.zRot)
  );

  translate(0, myScene.yPos, 0);

  push();
  if (matrix) {
    // matrix.showVertices([0])
  }
  pop();

  push();
  
  for (let i = 0; i < listEdges.length; i += 1) {
    // listEdges[i].thickness = 15
    if (listEdges[i]) {
      if (listEdges[i].render) {
        listEdges[i].showBox();
      }
    }
    // listEdges[i].showJoints(true, true)
  }
  pop();

  push();
  // console.log()
  animateEdges(select("#anim-edges-checkbox"), 160, 160, 72);

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

  if (listFilters.length != 0) {
    filter(listFilters[0], .85)
  }

  pop();

  pop();
  // pop grid layer elements

  // showBleeds(formats["bleeds"].size)
}
