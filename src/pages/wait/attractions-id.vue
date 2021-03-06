<template>
  <div class="page">
    <el-container>
      <el-aside width="300px">
        <att-list-select @click-item="selectAtt" v-model="aid" :data="activeAttList"></att-list-select>
      </el-aside>
      <el-main>
        <el-card v-if="att" class="card-bottom">
          <div slot="header" class="clearfix">
            <span class="card__title">{{att.name}}</span>
          </div>
          <el-row>
            <!-- <att-media type="finderDetailMobileHero" :medias="att.medias"></att-media> -->
            <div class="att-desc-list">
              <ul class="att-desc-list__list">
                <li class="att-desc-list__item">
                  <div class="att-desc-list__num">{{att.runDefault}}人/分钟</div>
                  <div class="att-desc-list__desc">承载量</div>
                </li>
                <li class="att-desc-list__item">
                  <div class="att-desc-list__num">{{att.groupNum}}人</div>
                  <div class="att-desc-list__desc">每组人数</div>
                </li>
                <li class="att-desc-list__item">
                  <div class="att-desc-list__num">{{att.runInterval}}秒</div>
                  <div class="att-desc-list__desc">运行间隔</div>
                </li>
                <li class="att-desc-list__item">
                  <div class="att-desc-list__num">{{att.runTimer}}秒</div>
                  <div class="att-desc-list__desc">游玩时长</div>
                </li>
              </ul>
            </div>
          </el-row>
        </el-card>

        <el-card class="card-bottom">
          <el-radio-group v-model="dateMode">
            <el-radio-button label="today">今天</el-radio-button>
            <el-radio-button label="yestday">昨天</el-radio-button>
            <el-radio-button label="7d">最近7天</el-radio-button>
            <el-radio-button label="30d">最近30天</el-radio-button>
          </el-radio-group>
          <el-date-picker v-model="dateRang" format="yyyy-MM-dd" value-format="yyyy-MM-dd" :type="dateType" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          <att-date-select @select-date="clickDate" style="margin-top: 16px" v-model="dateRang"></att-date-select>
        </el-card>

        <el-card v-if="dateType==='daterange'">
          <div slot="header" class="clearfix">
            <span>日平均等候时间</span>
          </div>
          <charts-att-count :data="attCount" xAxisKey="date" :indexList="['waitAvg']"></charts-att-count>
        </el-card>

        <el-card class="card-bottom" v-if="dateType==='date'">
          <div slot="header" class="clearfix">
            <span>每日等候时间</span>
          </div>
          <charts-att-wait :data="attWait"></charts-att-wait>
        </el-card>
        <el-card v-if="dateType==='date' && att && attWait.fpList && attWait.fpList.length > 0">
          <div slot="header" class="clearfix">
            <span>快速通行证</span>
          </div>
          <charts-att-fp :att="att" :data="attWait"></charts-att-fp>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ChartsAttCount from '@/components/Charts/ChartsAttCount'
import ChartsAttWait from '@/components/Charts/ChartsAttWait'
import ChartsAttFp from '@/components/Charts/ChartsAttFp'
import Waits from '@/common/api/waits'
import moment from 'moment'
import base from '@/common/mixins/base'

const DATE_FORMAT = 'YYYY-MM-DD'
export default {
  mixins: [base],

  components: { ChartsAttCount, ChartsAttWait, ChartsAttFp },

  props: {
  },

  data() {
    return {
      filters: {
        hotLevel: 3,
        type: 'attraction'
      },
      aid: 'attTronLightcyclePowerRun',
      attWait: {},
      attCount: [],
      dateMode: 'today',
      dateRang: moment().format(DATE_FORMAT)
    }
  },

  computed: {
    ...mapState({
      attsWait: state => state.wait.attsWait,
      attLoading: state => state.wait.loading
    }),
    dateType() {
      const { dateRang } = this
      if (typeof dateRang === 'string') {
        return 'date'
      } else {
        return 'daterange'
      }
    },

    att() {
      return this.attFind(this.aid)
    },
    activeAttList() {
      const { type, hotLevel } = this.filters
      return this.attListFilter(type, hotLevel)
    }
  },

  watch: {
    'dateMode'(val) {
      if (val === 'today') {
        this.dateRang = moment().format(DATE_FORMAT)
      } else if (val === 'yestday') {
        this.dateRang = moment().subtract(1, 'days').format(DATE_FORMAT)
      } else if (val === '7d') {
        const st = moment().subtract(7, 'days').format(DATE_FORMAT)
        const et = moment().subtract(0, 'days').format(DATE_FORMAT)
        this.dateRang = [st, et]
      } else if (val === '30d') {
        const st = moment().subtract(30, 'days').format(DATE_FORMAT)
        const et = moment().subtract(0, 'days').format(DATE_FORMAT)
        this.dateRang = [st, et]
      }
    },
    'dateRang'(val) {
      this.init()
    }
  },
  mounted() {
    this.getDestinationsList()
    this.init()
  },
  methods: {
    async init() {
      const { dateType } = this
      if (dateType === 'date') {
        this.getAttWait()
      } else {
        this.getAttCount()
      }
    },

    async getAttCount() {
      const { local, aid } = this
      const [st, et] = this.dateRang
      const attCount = await Waits.attractionsIdCount(local, aid, { st, et })
      this.attCount = attCount.reverse()
    },

    async getAttWait() {
      const { local, aid } = this
      const date = this.dateRang
      this.attWait = await Waits.attractionsId(local, date, aid)
    },
    clickDate(date) {
      this.dateRang = date
    },
    selectAtt(id) {
      this.aid = id
      this.init()
    }
  }
}
</script>
