import moment from 'moment'
import { destinations, schedules } from '@/api/explorer'
import { lineToObject } from '@/utils/tool'
import { landName } from '@/utils/filter'

const explorer = {
  state: {
    local: 'shanghai',
    date: moment().format('YYYY-MM-DD'),
    list: [],
    waits: {},
    schedules: {}
  },
  mutations: {
    SET_LIST: (state, data) => {
      data.forEach(item => {
        const { id, ancestors } = item
        item.aid = lineToObject(id)['__id__']

        for (const ancestorsItem of ancestors) {
          if (ancestorsItem.type === 'land') {
            item.landName = landName(ancestorsItem.id)
          }
        }

        item.type = item.type.toLowerCase()
        // 提取坐标
        item.coordinates = [0, 0]
        if (
          item.relatedLocations &&
          item.relatedLocations[0] &&
          item.relatedLocations[0]['coordinates'] &&
          item.relatedLocations[0]['coordinates'][0]
        ) {
          let coordinates = item.relatedLocations[0]['coordinates'][0]
          const { latitude, longitude } = coordinates
          coordinates = [latitude, longitude].map(parseFloat)
          coordinates[0] = coordinates[0] + 0.0003
          coordinates[1] = coordinates[1] - 0.0001
          item.coordinates = coordinates
        }

        // 提取主图
        item.finderListMobileSquare = item.medias.filter(_ => {
          return _.type === 'finderListMobileSquare'
        })[0]
      })
      state.list = data
    },
    SET_WAITS: (state, data) => {
      const waits = {}
      data.forEach(item => {
        const { fpList, waitList, endTime } = item

        if (fpList && fpList.length > 0) {
          item.fpAvailable = true
          const [utime, fpStartTime] = fpList[0]
          item.fpStatus = true
          item.fpUtime = utime
          if (fpStartTime === 'FASTPASS is Not Available') {
            item.fpStatus = false
          } else {
            item.fpStartTime = moment(fpStartTime, 'HH:mm:ss').format('H:mm')

            let fpEndTime = moment(fpStartTime, 'HH:mm:ss')
              .add(1, 'h')
              .format('H:mm')
            if (fpEndTime > moment(endTime, 'HH:mm:ss')) {
              fpEndTime = moment(endTime, 'HH:mm:ss').format('H:mm')
            }
            item.fpEndTime = fpEndTime
          }
        }

        if (waitList && waitList.length > 0) {
          const [utime, postedWaitMinutes, status] = item.waitList[0]
          item.status = status
          item.utime = utime
          item.postedWaitMinutes = postedWaitMinutes
        }
        waits[item.id] = item
      })

      const { list } = state
      list.forEach(item => {
        const wait = waits[item.aid]
        if (wait && wait['waitList'] && wait.status == 'Operating') {
          // item.icon = L.divIcon({
          //   className: 'att-marker att-marker--wait',
          //   popupAnchor: [17, 57],
          //   html: `
          //     <div class="att-marker__content">
          //       <div class="att-marker__desc">等候</div>
          //       <div class="att-marker__num">${wait.waitList[0][1]}</div>
          //       <div class="att-marker__desc">分钟</div>
          //     </div>
          //     <div class="att-marker__tip__container">
          //       <div class="att-marker__tip">
          //     </div>
          //   `
          // })
        }
      })

      state.waits = waits
    },
    SET_SCHEDULES: (state, data) => {
      let activities = []
      for (const item of data) {
        activities = activities.concat(item.body.activities)
      }
      data = {}
      activities.forEach(item => {
        const aid = lineToObject(item.id)['__id__']
        if (item.schedule && item.schedule.schedules) {
          data[aid] = item.schedule.schedules
        }
      })
      state.schedules = data
    }
  },
  actions: {
    // 获取项目列表
    async getDestinationsList({ commit, state }, type) {
      // let key = `destinationsList-${type}`
      const data = await destinations(state.local, type)
      // this.updateCache(key, data)
      commit('SET_LIST', data)
    },

    // // 获取等待时间
    // async getAttractionsWait({ commit, state }) {
    //   const data = await Attractions(state.local, state.date)

    //   commit('SET_WAITS', data)
    // },

    // 获取时间表
    async getSchedules({ commit, state }) {
      const data = await schedules(state.local, state.date)

      // this.updateCache(key, data)
      // wepy.setStorageSync('destinationsSchedules', data)
      // wepy.setStorageSync('destinationsSchedulesCache', date)
      // return data
      commit('SET_SCHEDULES', data)
    }
  }
}

export default explorer