export default {
  data: () => ({
    error: null,
    loading: false,
  }),
  methods: {
    createPublic: async function() {
      return this.create('public')
    },
    createSecret: async function() {
      return this.create('secret')
    },
    createInviteOnly: async function() {
      return this.create('invite_only')
    },
    create: async function(visibility) {
      try {
        this.loading = true
        this.error = null

        const response = await fetch(`/api/v4/races`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('splitsio_access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            game_id: this.gameId,
            category_id: this.categoryId,
            visibility: visibility,
          })
        })

        if (!response.ok) {
          throw (await response.json()).error || response.statusText
        }

        Turbolinks.visit((await response.json()).race.path)
      } catch(error) {
        this.error = `Error: ${error}`
      } finally {
        this.loading = false
      }
    },
  },
  name: 'race-create',
  props: ['game-id', 'category-id'],
}