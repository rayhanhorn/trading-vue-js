//bitwise mathfloor test ok
// Candle object for Candles overlay

export default class CandleExt {

    constructor(overlay, ctx, data) {
        this.ctx = ctx
        this.self = overlay
        this.style = data.raw[6] || this.self
        this.draw(data)
    }

    draw(data) {

        const body_color = data.c <= data.o ?
            this.style.colorCandleUp :
            this.style.colorCandleDw

        const wick_color = data.c <= data.o ?
            this.style.colorWickUp :
            this.style.colorWickDw

        const wick_color_sm = this.style.colorWickSm

		//Avoid floating-point coordinates and use integers instead
		//Saving the browser to do extra calculations to create the anti-aliasing effect. 
        let w = Math.round(Math.max(data.w, 1))
        let hw = Math.max(~~(w * 0.5), 1)
        let h = Math.round(Math.abs(data.o - data.c))
        let max_h = data.c === data.o ? 1 : 2

        this.ctx.strokeStyle = w > 1 ? wick_color : wick_color_sm

        this.ctx.beginPath()
        this.ctx.moveTo(
            ~~(data.x) - 0.5,
            ~~(data.h)
        )
        this.ctx.lineTo(
            ~~(data.x) - 0.5,
            ~~(data.l)
        )

        this.ctx.stroke()

        if (data.w > 1.5 || data.o === data.c) {

            this.ctx.fillStyle = body_color

            // TODO: Move common calculations to layout.js
            let s = data.c >= data.o ? 1 : -1
            this.ctx.fillRect(
                ~~(data.x - hw -1),
                ~~(data.o - 1),
                ~~(hw * 2 + 1),
                ~~(s * Math.max(h, max_h))
            )

        } else {

            this.ctx.strokeStyle = body_color

            this.ctx.beginPath()
            this.ctx.moveTo(
                ~~(data.x) - 0.5,
                ~~(Math.min(data.o, data.c)),
            )
            this.ctx.lineTo(
                ~~(data.x) - 0.5,
                ~~(Math.max(data.o, data.c)),
            )

            this.ctx.stroke()

        }

    }

}