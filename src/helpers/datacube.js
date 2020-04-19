
// Main DataHelper class. A container for data,
// which works as a proxy and CRUD interface

import Utils from '../stuff/utils.js'
import DCCore from './dc_core.js'

// Interface methods. Private methods in dc_core.js
export default class DataCube extends DCCore {

    constructor(data = {}) {

        super()
        this.data = data

    }

    // Add new overlay
    add(side, overlay) {

        if (side !== 'onchart' && side !== 'offchart') {
            return
        }

        this.data[side].push(overlay)
        this.update_ids()

        return overlay.id
    }

    // Get all objects matching the query
    get(query) {
        return this.get_by_query(query).map(x => x.v)
    }

    // Get first object matching the query
    get_one(query) {
        return this.get_by_query(query).map(x => x.v)[0]
    }

    // Set data (reactively)
    set(query, data) {

        let objects = this.get_by_query(query)

        for (var obj of objects) {

            let i = obj.i !== undefined ?
                obj.i :
                obj.p.indexOf(obj.v)

            if (i !== -1) {
                this.tv.$set(obj.p, i, data)
            }
        }

        this.update_ids()

    }

    // Merge object or array (reactively)
    merge(query, data) {

        let objects = this.get_by_query(query)

        for (var obj of objects) {
            if (Array.isArray(obj.v)) {
                if (!Array.isArray(data)) continue
                // If array is a timeseries, merge it by timestamp
                // else merge by item index
                if (obj.v[0] && obj.v[0].length >= 2) {
                    this.merge_ts(obj, data)
                } else {
                    this.merge_objects(obj, data, [])
                }
            } else if (typeof obj.v === 'object') {
                this.merge_objects(obj, data)
            }
        }

        this.update_ids()

    }

    // Remove an overlay by query (id/type/name/...)
    del(query) {

        let objects = this.get_by_query(query)

        for (var obj of objects) {

            // Find current index of the field (if not defined)
            let i = obj.i !== undefined ?
                obj.i : obj.p.indexOf(obj.v)

            if (i !== -1) {
                this.tv.$delete(obj.p, i)
            }

        }

        this.update_ids()
    }

    // Update/append data point, depending on timestamp
    update(data) {
		//console.log('offchart')
		//console.log(this.data.offchart[0].data)
		//console.log('onchart')
		//console.log(this.data.chart)
		//console.log(data)
		
        let ohlcv = this.data.chart.data
        let last = ohlcv[ohlcv.length - 1]
        let tick = data['price']
        let volume = data['volume'] || 0
        let candle = data['candle']
        let tf = Utils.detect_interval(ohlcv)
        let t_next = last[0] + tf
        let now = Utils.now()
        let t = now >= t_next ? (now - now % tf) : last[0]
		
        if (candle) {
            // Update the entire candle
            if (candle.length >= 6) {
                t = candle[0]
                this.merge('chart.data', [candle])
            } else {
                this.merge('chart.data', [[t, ...candle]])
            }
        } else if (t >= t_next && tick !== undefined) {
            // And new zero-height candle
            this.merge('chart.data', [[
                t, tick, tick, tick, tick, volume
            ]])
        } else if (tick !== undefined) {
            // Update an existing one
            last[2] = Math.max(tick, last[2])
            last[3] = Math.min(tick, last[3])
            last[4] = tick
            last[5] += volume
            this.merge('chart.data', [last])
        }

        this.update_overlays(data, t)
        return t >= t_next
    }
    // Update/append data point, depending on timestamp
    customUpdate(data) {
        let ohlcv = this.data.chart.data
        let last = ohlcv[ohlcv.length - 1]
        let timestamp = data['timestamp']
        let tick = data['price']
        let volume = data['volume'] || 0
        let candle = data['candle']
        let tf = Utils.detect_interval(ohlcv)
        let t_next = last[0] + tf
        let now = Utils.now()
        let t = timestamp >= t_next ? (now - now % tf) : last[0]

        if (candle) {
            // Update the entire candle
            if (candle.length >= 6) {
                t = candle[0]
                this.merge('chart.data', [candle])
            } else {
                this.merge('chart.data', [[t, ...candle]])
            }
        } else if (t >= t_next && tick !== undefined) {
            // And new zero-height candle
			//console.log(tick+' merge1')
            this.merge('chart.data', [[				
                t, tick, tick, tick, tick, volume
            ]])
        } else if (tick !== undefined) {
            // Update an existing one
            last[2] = Math.max(tick, last[2])
            last[3] = Math.min(tick, last[3])
            last[4] = tick
            last[5] += volume
			//console.log(last+' merge2')
            this.merge('chart.data', [last])
        }

        this.update_overlays(data, t)
        return t >= t_next
    }
	// Update/append data point, depending on timestamp
    oiupdate(data) {
        let ohlc = this.data.offchart[0].data
        let last = ohlc[ohlc.length - 1]
        let timestamp = data['timestamp']
        let tick = data['oi']
        let tf = Utils.detect_interval(ohlc)
        let t_next = last[0] + tf
        let now = Utils.now()
        let t = timestamp >= t_next ? (now - now % tf) : last[0]

		//console.log(ohlc)
		//console.log(last)        
		//console.log(tick)

		if (t >= t_next && tick !== undefined) {
            // And new zero-height candle
            this.merge('offchart.OpenInterest.data', [[
                t, tick, tick, tick, tick
            ]])
        } else if (tick !== undefined) {
            // Update an existing one
            last[2] = Math.max(tick, last[2])
            last[3] = Math.min(tick, last[3])
            last[4] = tick
            this.merge('offchart.OpenInterest.data', [last])
        }
		
        this.update_overlays(data, t)
        return t >= t_next
    }

    batchUpdate(dataMap) {
        if (dataMap.has('ohlcv')) {
            const newOhlcv = dataMap.get('ohlcv')
            let oldOhlcv = this.data.chart.data

            let last = oldOhlcv[oldOhlcv.length - 1]
            let tf = Utils.detect_interval(oldOhlcv)
            let t_next = last[0] + tf
            let now = Utils.now()
            
            let newArr = []

            let existingCandleNeedsUpdate = false

            newOhlcv.forEach(data => {
                let timestamp = data[0]
                let price = data[1]
                let volume = data[2]
                let t = timestamp >= t_next ? (now - now % tf) : last[0]

                if (t >= t_next && price !== undefined) {
                    // And new zero-height candle
                    if (newArr.length > 0) {
                        // Data exists in new array
                        let lastNewData = newArr[newArr.length - 1]
                        if (t == lastNewData[0]) {
                            // Check if last data in new array matches the new data timestamp
                            lastNewData[2] = Math.max(price, lastNewData[2])
                            lastNewData[3] = Math.min(price, lastNewData[3])
                            lastNewData[4] = price
                            lastNewData[5] += volume
                        } else {
                            newArr.push([t, price, price, price, price, volume])
                        }
                    } else {
                        // No existing data in new array
                        newArr.push([t, price, price, price, price, volume])
                    }
                } else if (price !== undefined) {
                    // Update an existing one
                    existingCandleNeedsUpdate = true
                    last[2] = Math.max(price, last[2])
                    last[3] = Math.min(price, last[3])
                    last[4] = price
                    last[5] += volume
                }
            })

            if (existingCandleNeedsUpdate) {
                newArr = [last, ...newArr]
            }

            this.merge('chart.data', newArr)
        }

        if (dataMap.has('oi')) {
            const newOhlc = dataMap.get('oi')

            const oiIndex = this.data.offchart.findIndex(value => value.type == 'OpenInterest')

            if (oiIndex !== -1) {
                const oldOhlc = this.data.offchart[oiIndex].data

                let last = oldOhlc[oldOhlc.length - 1]
                let tf = Utils.detect_interval(oldOhlc)
                let t_next = last[0] + tf
                let now = Utils.now()
                
                let newArr = []

                let existingCandleNeedsUpdate = false

                newOhlc.forEach(data => {
                    let timestamp = data[0]
                    let price = data[1]
                    let t = timestamp >= t_next ? (now - now % tf) : last[0]

                    if (t >= t_next && price !== undefined) {
                        // And new zero-height candle
                        if (newArr.length > 0) {
                            // Data exists in new array
                            let lastNewData = newArr[newArr.length - 1]
                            if (t == lastNewData[0]) {
                                // Check if last data in new array matches the new data timestamp
                                lastNewData[2] = Math.max(price, lastNewData[2])
                                lastNewData[3] = Math.min(price, lastNewData[3])
                                lastNewData[4] = price
                            } else {
                                newArr.push([t, price, price, price, price])
                            }
                        } else {
                            // No existing data in new array
                            newArr.push([t, price, price, price, price])
                        }
                    } else if (price !== undefined) {
                        // Update an existing one
                        existingCandleNeedsUpdate = true
                        last[2] = Math.max(price, last[2])
                        last[3] = Math.min(price, last[3])
                        last[4] = price
                    }
                })

                if (existingCandleNeedsUpdate) {
                    newArr = [last, ...newArr]
                }

                this.merge('offchart.OpenInterest.data', newArr)
            }
        }

        if (dataMap.has('funding')) {
            const newFunding = dataMap.get('funding')

            const fundingIndex = this.data.offchart.findIndex(value => value.type == 'FundingRate')

            if (fundingIndex !== -1) {
                const oldFunding = this.data.offchart[fundingIndex].data

                let last = oldFunding[oldFunding.length - 1]
                let tf = Utils.detect_interval(oldFunding)
                let t_next = last[0] + tf
                let now = Utils.now()
                
                let newArr = []

                newFunding.forEach(data => {
                    let timestamp = data[0]
                    let funding = data[1]
                    let t = timestamp >= t_next ? (now - now % tf) : last[0]

                    newArr.push([t, funding])
                })

                this.merge('offchart.FundingRate.data', newArr)
            }
        }

        if (dataMap.has('liq')) {
            const newLiq = dataMap.get('liq')

            const liqIndex = this.data.onchart.findIndex(value => value.type == 'Liquidations')

            if (liqIndex !== -1) {
                const oldLiq = this.data.onchart[liqIndex].data

                let last = oldLiq[oldLiq.length - 1]
                let tf = Utils.detect_interval(oldLiq)
                let t_next = last[0] + tf
                let now = Utils.now()
                
                let newArr = []

                let existingCandleNeedsUpdate = false

                newLiq.forEach(data => {
                    let timestamp = data[0]
                    let qty = data[1]
                    let side = data[2].toLowerCase()
                    let t = timestamp >= t_next ? (now - now % tf) : last[0]

                    if (t >= t_next && qty !== undefined) {
                        // And new zero-height candle
                        if (newArr.length > 0) {
                            // Data exists in new array
                            let lastNewData = newArr[newArr.length - 1]
                            if (t == lastNewData[0]) {
                                // Check if last data in new array matches the new data timestamp
                                if (side == 'buy') {
                                    lastNewData[1] += qty
                                } else if (side == 'sell') {
                                    lastNewData[2] += qty
                                }
                            } else {
                                if (side == 'buy') {
                                    newArr.push([t, qty, 0])
                                } else if (side == 'sell') {
                                    newArr.push([t, 0, qty])
                                }
                            }
                        } else {
                            // No existing data in new array
                            if (side == 'buy') {
                                newArr.push([t, qty, 0])
                            } else if (side == 'sell') {
                                newArr.push([t, 0, qty])
                            }
                        }
                    } else if (qty !== undefined) {
                        // Update an existing one
                        existingCandleNeedsUpdate = true
                        if (side == 'buy') {
                            last[1] += qty
                        } else if (side == 'sell') {
                            last[2] += qty
                        }
                    }
                })

                if (existingCandleNeedsUpdate) {
                    newArr = [last, ...newArr]
                }

                this.merge('onchart.Liquidations.data', newArr)
            }
        }
    }

    // Lock overlays from being pulled by query_search
    // TODO: subject to review
    lock(query) {
        let objects = this.get_by_query(query)
        objects.forEach(x => {
            if (x.v && x.v.id && x.v.type) {
                x.v.locked = true
            }
        })
    }

    // Unlock overlays from being pulled by query_search
    //
    unlock(query) {
        let objects = this.get_by_query(query, true)
        objects.forEach(x => {
            if (x.v && x.v.id && x.v.type) {
                x.v.locked = false
            }
        })
    }

    // Show indicator
    show(query) {
        if (query === 'offchart' || query === 'onchart') {
             query += '.'
        } else if (query === '.') {
            query = ''
        }
        this.merge(query + '.settings', { display: true })
    }

    // Hide indicator
    hide(query) {
        if (query === 'offchart' || query === 'onchart') {
             query += '.'
        } else if (query === '.') {
             query = ''
        }
        this.merge(query + '.settings', { display: false })
    }

    // Set data loader callback
    onrange(callback) {
        this.loader = callback
        setTimeout(() =>
            this.tv.set_loader(callback ? this : null), 0
        )
    }

}