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
  cstFPS = 30;

let bufferOptions = {};

let currentFormatName = "square",
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

// ─── Loading progress tracking ─────────────────────────────────────────────────
//
// Two-phase bar:
//   Phase 1 — preload()  : 2 JSONs + 4 fonts resolved via callbacks  →  0% … 75%
//   Phase 2 — setup()    : 8 heavy synchronous steps (buffers, cam…)  → 75% … 100%
//
// setProgress() and hideLoadingScreen() live in functions.js

const PRELOAD_ASSET_COUNT = 6; // 2 loadJSON + 4 loadFont
const PRELOAD_WEIGHT = 0.75; // preload phase fills 75% of the bar
let preloadDone = 0;

function onAssetLoaded() {
  preloadDone++;
  setProgress((preloadDone / PRELOAD_ASSET_COUNT) * PRELOAD_WEIGHT);
}

// ─── p5 lifecycle ──────────────────────────────────────────────────────────────

function preload() {
  // Pass a success callback to every loader so we can count completions.
  // loadJSON already had callbacks; loadFont ones are added here.

  jsonData = loadJSON("./assets/urls2.json", (data) => {
    transformToImages(data);
    onAssetLoaded();
  });

  formats = loadJSON("./assets/formats.json", (e) => {
    console.log(e);
    currentFormat = formats[currentFormatName];
    cnvW = currentFormat.width + formats["bleeds"].size * 2;
    cnvH = currentFormat.height + formats["bleeds"].size * 2;
    onAssetLoaded();
  });

  opsReg = loadFont(
    "./assets/fonts/OPS/OPSFavorite-Regular.otf",
    onAssetLoaded,
  );
  font_pathR = loadFont("./assets/fonts/Path/Path-R.otf", onAssetLoaded);
  font_pathRMono = loadFont(
    "./assets/fonts/Path/Path-RMono.otf",
    onAssetLoaded,
  );
  metaF = loadFont("./assets/fonts/mn128_clean_META.otf", onAssetLoaded);
}

let outputPixelD;

function setup() {
  // Preload is guaranteed done when setup() runs → snap to 75%
  setProgress(PRELOAD_WEIGHT);

  colorMode(RGB, 255, 255, 255, 1);
  angleMode(DEGREES);
  rectMode(CENTER);
  imageMode(CENTER);
  noSmooth();

  outputPixelD = 1;

  bufferOptions = {
    width: cnvW,
    height: cnvH,
    density: outputPixelD,
    textureFiltering: LINEAR,
  };

  cnv = createCanvas(cnvW, cnvH, WEBGL);
  cnv.parent("#canvas-container");
  document.querySelector("main").remove();

  pixelDensity(outputPixelD);

  // ── nudge bar through the 8 heavy setup steps (75% → 100%) ───────────────
  const SETUP_STEPS = 8;
  let setupDone = 0;
  const nudge = () => {
    setupDone++;
    setProgress(
      PRELOAD_WEIGHT + (setupDone / SETUP_STEPS) * (1 - PRELOAD_WEIGHT),
    );
  };

  infosGraphics = createGraphics(cnvW * outputPixelD, cnvH * outputPixelD, P2D);
  nudge();
  titleGraphics = createGraphics(cnvW, cnvH, WEBGL);
  nudge();
  mergeGraphics = createGraphics(cnvW * outputPixelD, cnvH * outputPixelD, P2D);
  nudge();

  JointsBuffer = createFramebuffer();
  nudge();
  textBuffer = createFramebuffer(bufferOptions);
  nudge();

  cam = createCamera();
  cam.perspective(2.5 * atan(height / 2 / 800));
  initCamSettings = { isOrtho: true };
  setCamera(cam);
  nudge();

  const lineWeight = 3;
  matrix = new Matrix(4, 2, 4, cellSize, 25, lineWeight);
  listVertices = matrix.getMinVertices();
  listEdges = createEdges(listVertices, cellSize);
  const edgeMap = buildEdgeMap(listEdges);
  listCells = findCells(listVertices, edgeMap);
  nudge();

  myScene = new Scene(xRot, yRot, zRot, yPos, sceneScale, sceneRotSpeed);
  loadInputs(() => {
    // One-time click on the second .select-l-btn (index 1)
    const btns = document.querySelectorAll(".select-l-btn");
    if (btns[1]) btns[1].click();
  });
  nudge();
  // → setupDone is now 8/8, bar is at 100%

  // ── wire up file upload inputs ─────────────────────────────────────────────
  const uploadTitleInput = select("#uploadTitle");
  const uploadInfosInput = select("#uploadInfos");
  uploadTitleInput.changed(() => {
    handleFile(select(".layer-title"), uploadTitleInput.elt.files);
  });
  uploadInfosInput.changed(() => {
    handleFile(select(".layer-infos"), uploadInfosInput.elt.files);
  });

  updateRenderAreaTransform();

  // ── 100% reached → short pause so user sees it, then fade out ─────────────
  setProgress(1);
  setTimeout(() => hideLoadingScreen(), 300);
}

function draw() {
  frameRate(cstFPS);

  if (textBuffer) {
    textBuffer.begin();
    setCamera(cam);
    clear();
    imageMode(CENTER);
    rectMode(CENTER);
    if (
      compoLayers[currentFormatName].titre2 &&
      selectAll(".active-layer-btn")[0].html() == "2"
    ) {
      fill("red");
      rect(0, 0, cnvW, cnvH);
      image(compoLayers[currentFormatName].titre2, 0, 0, cnvW, cnvH);
    } else {
      clear();
    }
    textBuffer.end();
  }

  push();
  beginClip({ invert: true });
  if (
    compoLayers[currentFormatName].titre2 &&
    selectAll(".active-layer-btn")[0].html() == "2"
  ) {
    titleGraphics.imageMode(CENTER);
    titleGraphics.rectMode(CENTER);
    titleGraphics.pixelDensity(outputPixelD);
    titleGraphics.image(
      compoLayers[currentFormatName].titre2,
      width / 2,
      height / 2,
      width,
      height,
    );
    background(255);
    image(titleGraphics, -width / 2, -height / 2);
  } else if (selectAll(".active-layer-btn")[0].html() == "1") {
    background(255);
  } else if (selectAll(".active-layer-btn")[0].html() == "0") {
    clear();
  }
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

  push();

  scale(myScene.scale);
  rotateX(
    myScene.xRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.xRot),
  );
  rotateY(
    myScene.yRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.yRot),
  );
  rotateZ(
    myScene.zRot + frameCount * 10 * myScene.rotSpeed * toZero(myScene.zRot),
  );
  translate(0, myScene.yPos, 0);

  push();
  if (matrix) {
    // matrix.showVertices([0])
  }
  pop();

  push();
  for (let i = 0; i < listEdges.length; i += 1) {
    if (listEdges[i]) {
      if (listEdges[i].render) {
        listEdges[i].showBox();
      }
    }
  }
  pop();

  push();
  animateEdges(select("#anim-edges-checkbox"), 160, 160, 72);

  if (listCells) {
    for (let cell of listCells) {
      // cell.showWireFrame()
      // cell.showDebug()
    }
  }

  if (listFilters.length != 0) {
    filter(listFilters[0], 0.85);
  }
  pop();

  pop();
}
