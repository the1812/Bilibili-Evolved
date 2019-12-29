(async () => {
  const html = await import("aboutHtml")
  document.body.insertAdjacentHTML('beforeend', html)
  dq('.bilibili-evolved-about').addEventListener('be:about-load', () => {
    const nameSorter = (a, b) => a.charCodeAt(0) - b.charCodeAt(0)
    const userSorter = (a, b) => nameSorter(a.name, b.name)
    const clientTypeMatch = GM.info.script.name.match(/Bilibili Evolved \((.*)\)/)
    const clientType = clientTypeMatch ? clientTypeMatch[1] : 'Stable'
    new Vue({
      el: '.bilibili-evolved-about',
      data: {
        version: settings.currentVersion,
        clientType,
        logoImage: null,
        logoImageDark: null,
        branch: null,
        authors: [
          {
            name: 'Grant Howard',
            link: 'https://github.com/the1812'
          },
          {
            name: 'Coulomb-G',
            link: 'https://github.com/Coulomb-G'
          }
        ],
        contributors: [
          {
            name: 'PleiadeSubaru',
            link: 'https://github.com/Etherrrr'
          },
          {
            name: 'Lets-Halloween',
            link: 'https://github.com/Lets-Halloween'
          },
        ].sort(userSorter),
        fetching: true,
        participants: [],
        websites: [
          {
            name: 'GitHub',
            link: 'https://github.com/the1812/Bilibili-Evolved/'
          },
          {
            name: 'Greasy Fork',
            link: 'https://greasyfork.org/zh-CN/scripts/373563-bilibili-evolved'
          }
        ],
        components: [
          {
            name: 'Vue.js',
            link: 'https://cn.vuejs.org/index.html'
          },
          {
            name: 'JSZip',
            link: 'https://stuk.github.io/jszip/'
          },
          {
            name: 'jQuery',
            link: 'http://jquery.com/'
          },
          {
            name: 'debounce',
            link: 'https://github.com/component/debounce/'
          },
          {
            name: 'Slip.js',
            link: 'https://github.com/kornelski/slip'
          },
          {
            name: 'MDI',
            link: 'https://materialdesignicons.com'
          },
          {
            name: 'Lodash',
            link: 'https://lodash.com/',
          },
        ]
      },
      mounted () {
        // this.init()
        dq('.bilibili-evolved-about').addEventListener('be:about-load-community', () => {
          this.init()
        }, { once: true })
      },
      methods: {
        async getLogos () {
          this.logoImage = await Ajax.getText(`https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/images/bilibili-evolved-wide.svg`)
          this.logoImageDark = await Ajax.getText(`https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/images/bilibili-evolved-wide-dark.svg`)
        },
        async init () {
          this.branch = /Preview|Local/.test(clientType) ? 'preview' : 'master'
          this.getLogos()
          const allParticipants = new Set()
          let issues = []
          let page = 1
          do {
            issues = await Ajax.getJson(`https://api.github.com/repos/the1812/Bilibili-Evolved/issues?state=all&direction=asc&per_page=100&page=${page}`)
              .catch(() => {
                issues = [{
                  name: '电波无法到达(´･_･`)',
                  link: null
                }]
              })
            page++
            for (const issue of issues) {
              allParticipants.add(issue.user.login)
            }
          }
          while (issues.length > 0)
          this.participants = [...allParticipants].map(name => {
            return {
              name,
              link: `https://github.com/${name}`
            }
          }).filter(({ link }) => {
            return !this.authors.some(it => it.link === link) &&
              !this.contributors.some(it => it.link === link)
          }).sort(userSorter)
          this.fetching = false
        }
      }
    })
  }, { once: true })
})()
