

export default class Crosshair {
	
    constructor(comp) {	
        this.comp = comp
        this.$p = comp.$props
        this.data = this.$p.sub
        this._visible = false
        this.locked = false
        this.layout = this.$p.layout		
	}
	
    update(x, y) {
        this.x = Math.round(this.$p.cursor.x);
        this.y = Math.round(y);
	}
	
    draw(ctx) {
		
        // Update reference to the grid
        this.layout = this.$p.layout
		
        if (!this.visible) return
		
        // Adjust x here cuz there is a delay between
        // update() and draw()
		
		ctx.save()
		let dpr = window.devicePixelRatio || 1
		if (dpr < 1) dpr = 1
		
		this.x = Math.round(this.$p.cursor.x);
		this.y = Math.round(this.y);
		this.w = (this.layout.width*dpr);
		this.h = (this.layout.height*dpr);		
        
		if (this.$p.cursor.grid_id === this.layout.id) {
			// H
			ctx.strokeStyle = this.$p.colors.colorCross
			ctx.beginPath()
			ctx.setLineDash([5])
            ctx.moveTo(0, this.y)
            ctx.lineTo(this.w - 0.5, this.y)			
			ctx.stroke()
			ctx.setLineDash([])			
			ctx.strokeStyle = undefined
		}		
        
		if (this.x >= 0) {
			// V
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
			ctx.beginPath()			
			ctx.lineWidth = 5
			ctx.moveTo(this.x, 0)
			ctx.lineTo(this.x, this.h)			
			ctx.stroke()
			ctx.lineWidth = undefined
			ctx.strokeStyle = undefined
		}
		
		ctx.restore()
	}
	
    hide() {
        this.visible = false
        this.x = undefined
        this.y = undefined
	}
	
    get visible() {
        return this._visible
	}
	
    set visible(val) {
        this._visible = val
	}
	
}
