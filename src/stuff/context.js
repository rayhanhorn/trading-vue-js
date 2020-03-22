// Canvas context for text measurments

function Context($p) {

    let el = document.createElement('canvas')
    let ctx = el.getContext('2d', { alpha: false, desynchronized: true, preserveDrawingBuffer: false });
    ctx.font = $p.font

    return ctx

}

export default Context
