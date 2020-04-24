//bitwise test NOT ok math.floor. too much for 32bit__int

export default class LiqbarExt {

    constructor(overlay, ctx, data) {
        this.ctx = ctx
        this.$p = overlay.$props
        this.self = overlay
        this.style = data.raw[6] || this.self
        this.draw(data)
    }

    draw(data) {
        let y0 = this.$p.layout.height
        let w = (data.x2 - data.x1) / 2
        let h1 = data.h1
        let h2 = data.h2

        let top = h1 > h2 ? h1 : h2

        this.ctx.strokeStyle = "white"
        this.ctx.lineWidth = 0.5

        this.ctx.strokeRect(
            data.x1,
            y0 - top - 1,
            w * 2 + 1,
            top + 1
        )

        // this.ctx.fillStyle = data.green ?
        //     this.style.colorVolUp :
        //     this.style.colorVolDw
        
        this.ctx.fillStyle = this.style.colorVolUp

        this.ctx.fillRect(
            data.x1 + 0.5,
            y0 - h1 - 0.5,
            w - 0.5,
            h1 + 1
        )

        this.ctx.fillStyle = this.style.colorVolDw

        this.ctx.fillRect(
            data.x1 + w,
            y0 - h2 - 0.5,
            w - 0.5,
            h2 + 1
        )
    }

}