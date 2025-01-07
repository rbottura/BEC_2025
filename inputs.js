function edgesSize() {
    let slider = createSlider(0, 50, 10, 1)
    slider.id('edgesSizesSlider')
    slider.addClass('slider')
    let textVal = createP('10')
    slider.parent('#edges-size')
    console.log()
    randomThicknessBtn = createButton('random thickness')
    select('#edge-size-box').child(textVal)
    select('#edge-size-box').child(randomThicknessBtn)
    randomThicknessBtn.mouseClicked(() => {
        edgesThicker()
    })
    slider.changed(() => {
        let v = slider.value()
        console.log(v)
        for (const edge of listEdges) {
            edge.updateThickness(v)
        }
        textVal.elt.innerHTML = v
    })
}

function createSwitchEdges() {
    let container = select('#list-edges-container')
    let arrBtn = [], arrInput = []

    // console.log(container)
    for (const edge of listEdges) {
        let n = `${edge.index}`
        let edgeBtn = createCheckbox(n, true)

        edgeBtn.elt.style.borderColor = edge.color
        edgeBtn.elt.id = edge.index
        edgeBtn.addClass('edge-select-btn')
        container.child(edgeBtn)

        edgeBtn.changed(() => updateEdgeCheck(edge, edgeBtn))
        updateEdgeCheck(edge, edgeBtn)
        arrBtn.push(edgeBtn)
        arrInput.push(select('input', edgeBtn).elt)
    }
    return [arrBtn, arrInput]
}

function randomEdgesGenerator(listBtn, listInputElt) {
    let container = select('#edges-color-random')
    let numbInput = createInput(25)
    numbInput.id('EdgesGenInput')
    numbInput.size(10)
    let nEdge = numbInput.value()
    let btn = createButton('generate')
    btn.id('EdgesRandoGenBtn')
    container.child(numbInput)
    container.child(btn)
    let arrVal = []
    numbInput.input((val) => {
        let firstDigits
        console.log(arrVal)
        if (0 <= numbInput.value() && numbInput.value() <= listEdges.length) {
            arrVal.push(val.data)
            nEdge = numbInput.value()
        } else if (arrVal.length != 0) {
            firstDigits = parseInt(arrVal.reduce((accumulator, currentValue) => accumulator + currentValue))
            arrVal = []
            numbInput.value(firstDigits)
            alert('chose an integer between 0 and 170')
        } else {
            numbInput.value(0)
            alert('chose an integer between 0 and 170')
        }
    })
    btn.mousePressed(() => {
        listVisibleEdges = []
        updateEdgesRender(nEdge, listInputElt, listBtn)
    })
}

function updateEdgesRender(nEdge, listInputElt, listBtn) {
    // let [colors, colorsId] = getRandomColors(BECcolors, listEdges.length)
    let [colors, colorsId] = [[4], ['black']]
    nEdge = parseInt(nEdge)
    let changedEdges = []
    changedEdges = getArrayOfRandomUniqueInt(nEdge, 0, listEdges.length)
    console.log(changedEdges.length)

    for (let i = 0; i < listEdges.length; i++) {
        if (`${listEdges[i].index}` == `${changedEdges[0]}` && changedEdges.length != 0) {
            changedEdges.shift()
            listInputElt[i].checked = true
        } else {
            listInputElt[i].checked = false
        }
        updateEdgeCheck(listEdges[i], listBtn[i], colors[i], colorsId[i])
    }
}

function updateEdgeCheck(edge, edgeBtn, newColor, newColorId) {
    if (edge.color != newColor && newColor) {
        edge.color = newColor
        edge.colorId = newColorId
    }
    // console.log(edge.color)
    let lb = select('span', edgeBtn)
    // console.log(edgeBtn)
    if (edge.color == 'rgb(0,0,0)') {
        lb.elt.style.color = "white"
    } else {
        lb.elt.style.color = "black"
    }
    let btn = edgeBtn
    if (typeof edgeBtn == 'object') {
        btn = edgeBtn.elt
    }
    btn.style.borderColor = edge.color
    if (edgeBtn.checked()) {
        edge.render = true
        btn.style.backgroundColor = edge.color
        lb.elt.style.opacity = 1
        listVisibleEdges.push(edge)
        // customBox.elt.style.backgroundColor =  edge.color
    } else {
        edge.render = false
        btn.style.backgroundColor = '#999'
        lb.elt.style.opacity = .5
        listVisibleEdges = listVisibleEdges.filter((e) => { return e.index !== edge.index })
    }
}

function resizeRender(format, name, page) {
    if (!page) {
        page = select('#page')
    }
    let w = parseInt(format.width)
    let h = parseInt(format.height)
    cnvW = w
    cnvH = h

    for (let graph of [infosGraphics, mergeGraphics, titleGraphics]) {
        graph.remove()
        titleGraphics = createGraphics(w, h)
        infosGraphics = createGraphics(w, h)
        mergeGraphics = createGraphics(w, h)
    }

    let sameFormat = (JSON.stringify(format) === JSON.stringify(currentFormat))
    // console.log(sameFormat)
    if (!sameFormat) {

        currentFormat = format
        currentFormatName = name
        let renderContainerElt = select('#render-window-wrapper')

        resizeCanvas(w, h)
        changeCamera(cam, initCamSettings)

        renderContainerElt.size(w, h)
        page.size(w, h)
    } else {
        // only handle the first call of the function, not used after
        page.size(w, h)
    }
    updateLayersOptions(currentFormatName, currentFormat.index, currentFormat.hasLayers)
}

function initSizesBtns() {
    let btns = selectAll('.page-size-btn')
    btns.forEach(btn => {
        btn.elt.addEventListener('click', (e) => {
            if (fullscreen() && e.target.innerHTML != 'full') {
                toggleFullScreen()
            }
            resizeRender(formats[e.target.innerHTML], e.target.innerHTML)
            if (e.target.innerHTML == "full") {
                toggleFullScreen()
            }
        })
    })
}

let xSlider, ySlider, zSlider, yTranslateSlider, scaleSlider, speedSlider, randomThicknessBtn
function createAxisSliders() {
    xSlider = createSlider(-180, 180, xRot, 10)
    ySlider = createSlider(-180, 180, yRot, 10)
    zSlider = createSlider(-180, 180, zRot, 10)
    yTranslateSlider = createSlider(-100, 100, yPos, 10)
    scaleSlider = createSlider(0.2, 2, sceneScale, .1)
    speedSlider = createSlider(0, 0.1, sceneRotSpeed, 0.005)

    let sliders = [
        xSlider,
        ySlider,
        zSlider,
        yTranslateSlider,
        scaleSlider,
        speedSlider
    ]

    class SliderInput {
        constructor(input, label, feedback, wrapper, index) {
            this.input = input
            this.label = label
            this.feedback = feedback

            this.nodeInput = input.elt
            this.nodeLabel = label.elt
            this.nodeFeedback = feedback.elt

            this.index = index
            this.wrapper = wrapper
            if (this.wrapper) {
                this.wrap()
            }
        }
        wrap() {
            this.wrapper.elt.append(...this.nodesArr())
        }
        nodesArr() {
            return [this.nodeLabel, this.nodeInput, this.nodeFeedback]
        }
        updateValue(elt, val) {
            let arrSceneVar = Object.keys(myScene)
            myScene[arrSceneVar[this.index]] = val
            if (elt == this.input) {
                this.feedback.value(val)
            } else {
                console.log(elt)
                this.input.value(val)
            }
        }
    }

    let container = document.querySelector('#axis-container')
    let arr = []
    sliders.forEach((slider, index) => {
        slider.addClass('slider')
        let sliderNames = ['x', 'y', 'z', 'yPos', 's', 'speed', 'r-size']
        let sliderWrapper = createDiv()
        sliderWrapper.addClass('slider-input-wrapper')

        let label = createElement('label', sliderNames[index])
        label.addClass('slider-label')

        let valueFeedback = createInput(listScenesVariables[index])
        valueFeedback.addClass('input-box')
        valueFeedback.size(40)

        let sInput = new SliderInput(slider, label, valueFeedback, sliderWrapper, index)
        arr.push(sliderWrapper.elt)

        linkSliderToInputArea(slider, (elt, value) => sInput.updateValue(elt, value))
        linkSliderToInputArea(valueFeedback, (elt, value) => sInput.updateValue(elt, value))
    })
    container.append(...arr)
}

function linkSliderToInputArea(sceneInput, callback) {
    sceneInput.input(() => callback(sceneInput, sceneInput.value()))
}

function updateLayersOptions(formatName) {
    let pagelayerTitle = select('.layer-title')
    let pagelayerInfos = select('.layer-infos')
    let layersLabel = select('.format-layer-selection-label')
    let titreLayerContainer = select('#layer-titre-wrapper')
    let infosLayerContainer = select('#layer-infos-wrapper')
    titreLayerContainer.html('')
    infosLayerContainer.html('')

    if (jsonData[formatName]) {
        layersLabel.html(formatName)

        let nbrComposByFormat = Object.values(jsonData[formatName]).length / 2
        for (let i = 0; i < nbrComposByFormat; i++) {
            let f = jsonData[formatName]
            let tUrl = f['titre' + (i)]
            let iUrl = f['infos' + (i)]
            let tBtn = createDiv(i)
            let iBtn = createDiv(i)
            tBtn.addClass('select-l-btn')
            iBtn.addClass('select-l-btn')
            tBtn.mouseClicked(() => { toggleLayers(pagelayerTitle, tUrl, tBtn) })
            iBtn.mouseClicked(() => { toggleLayers(pagelayerInfos, iUrl, iBtn) })
            titreLayerContainer.child(tBtn)
            infosLayerContainer.child(iBtn)
            if (i == 0) {
                tBtn.elt.click()
                iBtn.elt.click()
            }
        }
    } else {
        layersLabel.html("NONE")
        pagelayerTitle.style('background-image', 'none')
        pagelayerInfos.style('background-image', 'none')
    }
}

function toggleLayers(layernode, path, btn) {
    changeLayerCss(btn.parent(), btn)
    layernode.style('backgroundImage', 'url(' + path + ')')
    myBECRender.updateRenderedLayer(btn.parent(), btn.html())
}

function canvasFiltering() {
    let btn = createCheckbox('threshold', true)
    let container = select('#canvas-filtering-container')
    container.child(btn)
    btn.input(() => {
        if (btn.checked()) {
            listFilters.push(THRESHOLD)
        } else {
            listFilters = []
        }
    })
}

function animateEdges(btn, distMax, sMax, freq) {
    let isTriggered = frameCount % (freq * parseInt(frameRate())) == 0
    // console.log(isTriggered)
    if (btn) {
        btn = select('input', btn.elt)
        if (btn.checked() && listVisibleEdges.length != 0 && isTriggered) {
            for (const edge of listVisibleEdges) {
                let dist = floor(random(distMax) - distMax / 2)
                let size = floor(random(sMax) - sMax / 2)
                let mx = 0, my = 0, mz = 0
                if (edge.axis == "X") { mx = dist }
                if (edge.axis == "Y") { my = dist }
                if (edge.axis == "Z") { mz = dist }
                edge.move(mx, my, mz)
                edge.resize(size)
            }
        }
    }
}