import TradingVue from './TradingVue.vue'
import DataCube from './helpers/datacube.js'
import Overlay from './mixins/overlay.js'
import Utils from './stuff/utils.js'
import Constants from './stuff/constants.js'
import OIPrice from './components/primitives/oi_price.js'
import OICandle from './components/primitives/oi_candle.js'
import Candle from './components/primitives/candle.js'
import Volbar from './components/primitives/volbar.js'
import Liqbar from './components/primitives/liqbar.js'
import { layout_cnv, layout_vol, layout_liq_bar } from
    './components/js/layout_cnv.js'


TradingVue.install = function (Vue) {
    Vue.component(TradingVue.name, TradingVue)
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(TradingVue)
    window.TradingVueLib = {
        TradingVue, Overlay, Utils, Constants,
        Candle, Volbar, Liqbar, layout_cnv, layout_vol, layout_liq_bar,
        DataCube, OICandle, OIPrice
    }
}

export default TradingVue

export {
    TradingVue, Overlay, Utils, Constants,
    Candle, Volbar, Liqbar, layout_cnv, layout_vol, layout_liq_bar,
    DataCube, OICandle, OIPrice
}
