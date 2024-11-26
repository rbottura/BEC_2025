function edgesSize() {
    let slider = createSlider(0, 50, 1, 1)
    let textVal = createP('1')
    slider.parent('#edges-size')
    console.log()
    select('#edge-size-box').child(textVal)
    slider.changed(() => {
        let v = slider.value()
        console.log(v)
        for (const edge of listEdges) {
            edge.updateThickness(v)
        }
        textVal.elt.innerHTML = v
    })
}

function updateSeed() {
    let txtArea = createInput(1)
    txtArea.id = 'seed-txt-input'
    txtArea.parent('#seed-input')
    seed = txtArea.value()
    txtArea.changed(() => {
        seed = txtArea.value()
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
    let numbInput = createInput(85)
    numbInput.size(10)
    let nEdge = numbInput.value()
    let btn = createButton('generate')
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
    btn.mousePressed(() => updateEdgesRender(nEdge, listInputElt, listBtn))
}

function updateEdgesRender(nEdge, listInputElt, listBtn) {
    let [colors, colorsId] = getRandomColors(BECcolors, 170)
    nEdge = parseInt(nEdge)
    let changedEdges = []
    changedEdges = getArrayOfRandomUniqueInt(nEdge, 0, 170)
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
    let btn
    if (typeof edgeBtn == 'object') {
        btn = edgeBtn.elt
    }
    btn.style.borderColor = edge.color
    if (edgeBtn.checked()) {
        edge.render = true
        btn.style.backgroundColor = edge.color
        lb.elt.style.opacity = 1
        // customBox.elt.style.backgroundColor =  edge.color
    } else {
        edge.render = false
        btn.style.backgroundColor = '#999'
        lb.elt.style.opacity = .5
        // lb.elt.filter = 'invert(1)'
        // customBox.elt.style.backgroundColor =  '#fff'
    }
}

function resizeRender(format, name, page) {
    if (!page) {
        page = select('#page')
    }
    let w = parseInt(format.width)
    let h = parseInt(format.height)

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
    console.log(btns)
    btns.forEach(btn => {
        btn.elt.addEventListener('click', (e) => {
            console.log(e)
            // if (currentFormatName == 'full' && e.target.innerHTML != 'full') {
            //     toggleFullScreen()
            // }
            resizeRender(formats[e.target.innerHTML], e.target.innerHTML)
            if (e.target.innerHTML == "full") {
                toggleFullScreen()
            }
        })
    })
}

function createAxisSliders() {
    let xSlider = createSlider(0, 90, 0, 1)
    let ySlider = createSlider(0, 90, 0, 1)
    let zSlider = createSlider(0, 90, 0, 1)
    let scaleSlider = createSlider(0.2, 2, 1, .1)
    let speedSlider = createSlider(0, 0.1, 0, 0.005)

    let sliders = [
        xSlider,
        ySlider,
        zSlider,
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
        let sliderNames = ['x', 'y', 'z', 's', 'speed']
        let sliderWrapper = createDiv()
        sliderWrapper.addClass('slider-input-wrapper')

        let label = createElement('label', sliderNames[index])
        label.addClass('slider-label')

        let valueFeedback = createInput()
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
function updateSceneScale(val) {
    return map(val, 0, 500, 0.2, 3)
}
function updateRotationSpeed(val) {
    return map(val, 0, 10, 0, 0.05, true)
}

function updateLayersOptions(formatName, formatIndex, hasLayers) {
    const posterPath = "./img/1-Poster/"
    const posterPathT = "1-Titres/"
    const posterPathI = "2-Infos/"
    const posterTitle = "BEC-Poster_Titres-RL-02-"
    const posterInfos = "BEC-Poster_Infos-RL-02-"
    const smPath = "./img/2-SocialMedia/"
    const listF = ["poster/", "3-Landscape/", "2-Portrait/", "1-Square/"]
    const fileFormat = '.png'
    const nbrCompoPoster = 8
    const nbrCompoSm = 1
    let pagelayerTitle = select('.layer-title')
    let pagelayerInfos = select('.layer-infos')
    console.log(pagelayerTitle)

    let layersLabel = select('.format-layer-selection-label')
    console.log(formatName)
    console.log(formatIndex)

    if (hasLayers) {
        let titreLayerContainer = select('#layer-titre-wrapper')
        let infosLayerContainer = select('#layer-infos-wrapper')
        titreLayerContainer.html('')
        infosLayerContainer.html('')
        layersLabel.html(formatName)

        if (formatName == "poster") {
            for (let i = 0; i < nbrCompoPoster + 1; i++) {
                let tBtn = createDiv(i)
                let iBtn = createDiv(i)
                if(i == 0){
                    tBtn.addClass('active-layer-btn')
                    iBtn.addClass('active-layer-btn')
                }
                tBtn.addClass('select-l-btn')
                iBtn.addClass('select-l-btn')
                let pathT = posterPath + posterPathT + posterTitle + i + fileFormat
                let pathI = posterPath + posterPathI + posterInfos + i + fileFormat
                tBtn.mouseClicked(() => { toggleLayers(pagelayerTitle, pathT, tBtn) })
                iBtn.mouseClicked(() => { toggleLayers(pagelayerInfos, pathI, iBtn) })
                titreLayerContainer.child(tBtn)
                infosLayerContainer.child(iBtn)
            }
        } else {
            for (let i = 0; i < nbrCompoSm + 1; i++) {
                let tBtn = createDiv(i)
                let iBtn = createDiv(i)
                if(i == 0){
                    tBtn.addClass('active-layer-btn')
                    iBtn.addClass('active-layer-btn')
                }
                tBtn.addClass('select-l-btn')
                iBtn.addClass('select-l-btn')
                let pathT = smPath + listF[formatIndex] + "titre" + i + fileFormat
                let pathI = smPath + listF[formatIndex] + "infos" + i + fileFormat
                tBtn.mouseClicked(() => { toggleLayers(pagelayerTitle, pathT, tBtn) })
                iBtn.mouseClicked(() => { toggleLayers(pagelayerInfos, pathI, iBtn) })
                titreLayerContainer.child(tBtn)
                infosLayerContainer.child(iBtn)
            }
        }
    }
}

function toggleLayers(layernode, path, btn) {
    changeLayerCss(btn.parent(), btn)
    layernode.style('backgroundImage', 'url(' + path + ')')
}