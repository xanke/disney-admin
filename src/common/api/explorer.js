import request from '@/utils/request'

const base = 'wait-times-service'
const cdn = 'https://park-explorer.17disney.com'

export default {
  destinations: function destinations(local) {
    return request({
      url: `${base}/destinations/park/${local}`,
      method: 'get'
    })
  },

  destinationsRaw: function destinationsRaw(local) {
    return request({
      url: `${base}/destinations/raw/${local}`,
      method: 'get'
    })
  },

  updateDestinationsId: function updateDestinationsId(id, data) {
    return request({
      url: `${base}/destinations/park/destinations/${id}`,
      method: 'put',
      data
    })
  },

  schedules: function schedules(local, date) {
    return request({
      url: `${base}/explorer/park/schedules/${local}/${date}`,
      method: 'get'
    })
  }
}
