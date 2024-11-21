function resetGrid(cellX, cellY, cellZ) {

}

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
        // if (edge.colorId == 'black') {
        //     let lb = select('span', edgeBtn)
        //     lb.elt.style.color = "white"
        // }
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
    let nEdge = numbInput.value()
    let btn = createButton('generate')
    container.child(numbInput)
    container.child(btn)
    numbInput.input(() => nEdge = numbInput.value())
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
        btn.style.backgroundColor = '#ddd'
        lb.elt.style.opacity = .25
        // customBox.elt.style.backgroundColor =  '#fff'
    }
}

function edgesByColor() {
    let edColorSelect = createSelect(true)
    edColorSelect.parent('#edges-color-select')
    edColorSelect.option('red')
    edColorSelect.option('green')
    edColorSelect.option('blue')
    edColorSelect.option('yellow')
    edColorSelect.option('black')

    edColorSelect.changed(() => {

    })
}