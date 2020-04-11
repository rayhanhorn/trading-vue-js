//bitwise test ok math.floor
export default class VolbarExt {

    constructor(overlay, ctx, data) {
        this.ctx = ctx
        this.$p = overlay.$props
        this.self = overlay
        this.style = data.raw[6] || this.self
        this.draw(data)
    }

    draw(data) {
        let y0 = this.$p.layout.height
        let w = data.x2 - data.x1
        let h = ~~(data.h)

        this.ctx.fillStyle = data.green ?
            this.style.colorVolUp :
            this.style.colorVolDw

        this.ctx.fillRect(
            ~~(data.x1),
            ~~(y0 - h - 0.5),
            ~~(w),
            ~~(h + 1)
        )

    }

}
