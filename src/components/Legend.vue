<template>
<div class="trading-vue-legend"
     v-bind:style="calc_style">
    <div v-if="grid_id === 0"
         class="trading-vue-ohlcv"
        :style = "{ 'max-width': common.width + 'px' }">
        <span class="t-vue-title"
             :style="{ color: common.colors.colorTitle }">
              {{common.title_txt}}
        </span>
        O<span class="t-vue-lspan" >{{ohlcv[0]}}</span>
        H<span class="t-vue-lspan" >{{ohlcv[1]}}</span>
        L<span class="t-vue-lspan" >{{ohlcv[2]}}</span>
        C<span class="t-vue-lspan" >{{ohlcv[3]}}</span>
        V<span class="t-vue-lspan" >{{ohlcv[4]}}</span>
    </div>
    <div class="t-vue-ind" v-for="ind in this.indicators">
        <span class="t-vue-iname">{{ind.name}}</span>
        <button-group
            v-bind:buttons="common.buttons"
            v-bind:ov_id="ind.id"
            v-bind:grid_id="grid_id"
            v-bind:index="ind.index"
            v-bind:tv_id="common.tv_id"
            v-bind:display="ind.v"
            v-on:legend-button-click="button_click">
        </button-group>
        <span class="t-vue-ivalues" v-if="ind.v">
            <span class="t-vue-lspan t-vue-ivalue"
                  v-for="v in ind.values" :style="{ color: v.color }">
                {{v.value}}
            </span>
        </span>
        <span v-if="ind.unk" class="t-vue-unknown">
            (Unknown type)
        </span>
    </div>
</div>
</template>
<script>

import ButtonGroup from './ButtonGroup.vue'
import Utils from '../stuff/utils.js'

export default {
    name: 'ChartLegend',
    props: [
        'common', 'values', 'grid_id', 'meta_props'
    ],
    components: { ButtonGroup },
    computed: {
        ohlcv() {
            const prec = this.layout.prec
            const format = (n, d) => parseFloat(n.toFixed(d))

            if (!this.$props.values || !this.$props.values.ohlcv) {
                const candlesIndex = this.json_data.findIndex(data => data.type == 'Candles')

                if (this.json_data[candlesIndex].data.length != 0) {
                    const candlesData = this.json_data[candlesIndex].data

                    if (candlesData[candlesData.length - 1] != undefined) {
                        return [
                            format(candlesData[candlesData.length - 1][1], prec),
                            format(candlesData[candlesData.length - 1][2], prec),
                            format(candlesData[candlesData.length - 1][3], prec),
                            format(candlesData[candlesData.length - 1][4], prec),
                            candlesData[candlesData.length - 1][5] ? format(candlesData[candlesData.length - 1][5], 2) : '0.00'
                        ]
                    }
                }
                return Array(6).fill('n/a')                
            }
            
            return [
                format(this.$props.values.ohlcv[1], prec),
                format(this.$props.values.ohlcv[2], prec),
                format(this.$props.values.ohlcv[3], prec),
                format(this.$props.values.ohlcv[4], prec),
                this.$props.values.ohlcv[5] ?
                    format(this.$props.values.ohlcv[5], 2) :
                    'n/a'
            ]
        },
        indicators() {
            const values = this.$props.values
            const f = this.format
            var types = {}
            return this.json_data.filter(
                x => x.settings.legend !== false && !x.main
            ).map(x => {
                if (!(x.type in types)) types[x.type] = 0
                const id = x.type + `_${types[x.type]++}`

                let valuesArr = this.n_a(1)

                if (x.data.length != 0) {
                    const lastData = x.data[x.data.length - 1]
                    let lastValueArr = Object.values(lastData)
                    lastValueArr.shift()

                    if (x.type == 'OpenInterest') {
                        valuesArr = [
                            {
                                value: 'Low: '+Utils.changeNumberFormat(lastValueArr[2], 2)
                            },
                            {
                                value: 'High: '+Utils.changeNumberFormat(lastValueArr[1], 2)
                            }
                        ]
                    } else {
                        valuesArr = lastValueArr.map(value => {
                            if (x.type == 'FundingRate' || x.type == 'Volatility') {
                                return {value: `${(value * 100).toFixed(3)}%`}
                            } else {
                                if (Math.abs(value) >= 1.0e+6) {
                                    return {value: Utils.changeNumberFormat(value, 2)}
                                } else {
                                    return {value: value.toFixed(2)}
                                }
                            }
                        })
                    }
                }

                return {
                    v: 'display' in x.settings ? x.settings.display : true,
                    name: x.name || id,
                    index: this.json_data.indexOf(x),
                    id: id,
                    values: values ? f(id, values) : valuesArr,
                    unk: !(id in (this.$props.meta_props || {}))
                }
            })
        },
        calc_style() {
            let top = this.layout.height > 150 ? 10 : 5
            return {
                top: `${this.layout.offset + top}px`,
            }
        },
        layout() {
            const id = this.$props.grid_id
            return this.$props.common.layout.grids[id]
        },
        json_data() {
            return this.$props.common.data
        }
    },
    methods: {
        format(id, values) {
            let meta = this.$props.meta_props[id] || {}
            // Matches Overlay.data_colors with the data values
            // (see Spline.vue)
            if (!values[id]) return this.n_a(1)

            // Custom formatter
            if (meta.legend) return meta.legend(values[id])

            return values[id].slice(1).map((x, i) => {
                const cs = meta.data_colors ? meta.data_colors() : []
                if (typeof x == 'number') {
                    // Show 8 digits for small values
                    x = x.toFixed(x > 0.001 ? 4 : 8)
                }
                return {
                    value: x,
                    color: cs ? cs[i] : undefined
                }
            })
        },
        n_a(len) {
            return Array(len).fill({ value: 'n/a' })
        },
        button_click(event) {
            this.$emit('legend-button-click', event)
        }
    }
}
</script>
<style>
.trading-vue-legend {
    position: relative;
    z-index: 100;
    font-size: 1.25em;
    margin-left: 10px;
    pointer-events: none;
}
.trading-vue-ohlcv {
    pointer-events: none;
    margin-bottom: 0.5em;
    font-size: 1.1em;
    color: steelblue;
}
.t-vue-lspan {
    font-variant-numeric: tabular-nums;
    font-weight: 100;
    font-size: 1.3em;
    color: #EEE; /* TODO: move => params */
    margin-left: 0.1em;
    margin-right: 0.2em;
}
.t-vue-title {
    margin-right: 0.25em;
    font-size: 2em;
    font-weight: 200;
}
.t-vue-ind {
    margin-left: 0.2em;
    margin-bottom: 0.5em;
    font-size: 1.2em;
    color: steelblue;
}
.t-vue-ivalue {
    margin-left: 0.5em;
    font-size: 1.0em;
}
.t-vue-unknown {
    color: #999999; /* TODO: move => params */
}
</style>
