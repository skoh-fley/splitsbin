const moment = require('moment')
require("moment-duration-format")(moment)

import { applyTips } from '../tooltips'
import { ts } from '../time'

import consumer from '../channels/consumer'
import raceChat from './race-chat.js'
import raceDisclaimer from './race-disclaimer.js'
import raceNav from './race-nav.js'
import raceNotes from './race-notes.js'

export default {
  components: {
    raceChat,
    raceDisclaimer,
    raceNav,
    raceNotes
  },
  computed: {
    title: function() {
      if (this.race === null) {
        return ''
      }
      if (this.race.game === null && this.race.category === null && this.race.notes === null) {
        return 'Untitled race'
      }
      return `${(this.race.game || {}).name} ${(this.race.category || {}).name} ${(this.race.notes || '').split('\n')[0]}`
    },
  },
  created: async function() {
    this.error = false

    const headers = new Headers()
    if (localStorage.getItem('splitsio_access_token')) {
      headers.append('Authorization', `Bearer ${localStorage.getItem('splitsio_access_token')}`)
    }

    let url = `/api/v4/races/${this.raceId}`
    let join_token
    if (window.gon.race) {
      join_token = window.gon.race.join_token
    }
    if (!join_token) {
      join_token = new URLSearchParams(window.location.search).get('join_token')
    }
    if (join_token) {
      url = `${url}?join_token=${join_token}`
    }

    const response = await fetch(url, {
      headers: headers
    })
    if (!response.ok) {
      throw (await response.json()).error || response.statusText
    }

    this.globalSubscription = consumer.subscriptions.create('Api::V4::GlobalRaceChannel', {
      connection() {},

      disconnected() {},

      received(data) {
        switch(data.type) {
          // TODO: update races on game page with this info
          case '...':
            ''
            break;
        }
      }
    })

    this.raceSubscription = consumer.subscriptions.create({
      channel:       'Api::V4::RaceChannel',
      race_id:       this.raceId,
      join_token:    (window.gon.race || {}).join_token
    }, {
      connected: () => {
        // Clean up disconnect if its shown
        // Maybe utilize state to update the page?
      },

      disconnected: () => {
        // Maybe show disconnects?
      },

      received: (data) => {
        switch(data.type) {
          case 'race_entries_updated:html':
            document.getElementById('entries-table').innerHTML = data.data.entries_html
            document.getElementById('stats-box').innerHTML = data.data.stats_html
            break

          case 'race_start_scheduled:html':
            document.getElementById('stats-box').innerHTML = data.data.stats_html
            break
          case 'race_start_scheduled':
            this.race = data.data.race
            break

          case 'race_updated':
            this.race = data.data.race
            break

          case 'race_ended':
            this.race = data.data.race
            break

          case 'race_ended:html':
            document.getElementById('entries-table').innerHTML = data.data.entries_html
            document.getElementById('stats-box').innerHTML = data.data.stats_html
            break

          case 'new_message:html':
            document.getElementById('input-list-item').insertAdjacentHTML('afterend', data.data.chat_html)
            applyTips()
            break

          case 'new_attachment:html':
            document.getElementById('attachments').innerHTML = data.data.attachments_html
            break
        }
      }
    })

    document.addEventListener('turbolinks:visit', () => {
      consumer.subscriptions.remove(this.raceSubscription)
    }, {once: true})

    this.race = (await response.json()).race
    this.loading = false
  },
  data: () => ({
    error: false,
    globalSubscription: null,
    loading: true,
    race: null,
    raceSubscription: null,
  }),
  methods: {
  },
  name: 'race',
  props: ['race-id'],
}
