'use strict'

const request = require('request-promise')

module.exports = (apiKey, apiKeyRegion) => {
  class Bard {
    constructor (apiKey, apiKeyRegion) {
      this.region = apiKeyRegion
      this.apiKey = apiKey

      // some constants
      this.baseURL = `https://${this.region}.api.pvp.net/api/lol`
      this.globalBaseURL = 'https://global.api.pvp.net/api/lol'
      this.championmasteryBaseURL = `https://${this.region}.api.pvp.net/championmastery/location`
      this.observerModeBaseURL = `https://${this.region}.api.pvp.net/observer-mode/rest`
      this.ddragonVersion = '6.5.1'

      this.apiVersion = {
        'champion': 'v1.2',
        'championmastery': '',
        'current-game': 'v1.0',
        'featured-games': 'v1.0',
        'game': 'v1.3',
        'league': 'v2.5',
        'lol-static-data': 'v1.2',
        'lol-status': 'v1.0',
        'match': 'v2.2',
        'matchlist': 'v2.2',
        'stats': 'v1.3',
        'summoner': 'v1.4',
        'team': 'v2.4'
      }

      this.platformID = {
        'na': 'NA1',
        'tr': 'TR1',
        'eune': 'EUN1',
        'euw': 'EUW1',
        'lan': 'LA1',
        'las': 'LA2',
        'oce': 'OC1',
        'br': 'BR1',
        'ru': 'RU',
        'kr': 'KR'
      }
    }

    // basic helper function to create an API url
    makeAPIRequest (apiName, url, requestRegion, parameters) { // default args pls nodeJS :(
      if (!apiName) { return } // gotta have an api name
      requestRegion = requestRegion || this.region
      url = url.length > 1 ? url.join('/') : url[0]
      parameters = Object.assign({}, parameters, { api_key: this.apiKey }) // null and undefined are ignored, in case parameters is null
      let fullURL

      if (apiName === 'championmastery') {
        fullURL = `${this.championmasteryBaseURL}/${this.platformID[requestRegion]}/${url}`
      } else if (apiName === 'current-game' || apiName === 'featured-games') {
        fullURL = `${this.observerModeBaseURL}/${this.platformID[requestRegion]}/${url}`
      } else if (apiName === 'lol-static-data') {
        fullURL = `${this.globalBaseURL}/lol/static-data/${requestRegion}/${this.apiVersion[apiName]}/${url}`
      } else if (apiName === 'lol-status') {
        fullURL = `http://status.leagueoflegends.com/${url}`
      } else {
        fullURL = `${this.baseURL}/${requestRegion}/${apiName}/${this.apiVersion[apiName]}/${url}`
      }

      console.log(fullURL)

      return request(Object.assign({}, parameters, { uri: fullURL, json: true }))
    }

    // let's iterate over the different APIs
    // champion
    champions () {
      return this.makeAPIRequest('lol-static-data', ['champion']).then((resp) => {
        return Object.keys(resp.data).map((key) => {
          return new BardChampion(resp.data[key])
        })
      })
    }

    championByName (champName) {
      champName = [champName.slice(0, 1).toUppercase(), champName.slice(1, -1).toLowerCase()].join()
      return this.makeAPIRequest('lol-static-data', ['champion']).then((resp) => {
        return new BardChampion(resp.data[champName])
      })
    }

    championList () {
      return this.makeAPIRequest('champion', ['champion'])
    }

    championInfo (id) {
      return this.makeAPIRequest('champion', ['champion', id])
    }

    championsFreeList () {
      return this.makeAPIRequest('champion', ['champion'], this.region, { 'freeToPlay': 'true' })
    }

    // championMastery
    playerChampionMasteryList (playerId) {
      return this.makeAPIRequest('championmastery', ['player', playerId, 'champions'])
    }

    playerChampionMastery (playerId, championId) {
      return this.makeAPIRequest('championmastery', ['player', playerId, 'champion', championId])
    }

    playerChampionMasteryScore (playerId) {
      return this.makeAPIRequest('championmastery', ['player', playerId, 'score'])
    }

    playerChampionMasteryTopChampions (playerId, count) { // boy these function names are getting longer
      count = count || 3
      return this.makeAPIRequest('championmastery', ['player', playerId, 'topchampions'], this.region, { count: count })
    }

    // current-game
    playerCurrentGame (playerId) {
      return this.makeAPIRequest('current-game', ['consumer', 'getSpectatorGameInfo', this.platformID[this.region], playerId])
    }

    // featured-games
    featuredGames () {
      return this.makeAPIRequest('featured-games', ['featured'])
    }

    // game
    playerRecentGames (playerId) {
      return this.makeAPIRequest('game', ['by-summoner', playerId, 'recent'])
    }

    // league
    playerLeague (playerId) {
      return this.makeAPIRequest('league', ['by-summoner', playerId])
    }

    playerLeagueEntry (playerId) {
      return this.makeAPIRequest('league', ['by-summoner', playerId, 'entry'])
    }

    teamLeague (teamId) {
      return this.makeAPIRequest('league', ['by-team', teamId])
    }

    teamLeagueEntry (teamId) {
      return this.makeAPIRequest('league', ['by-team', teamId, 'entry'])
    }

    leagueChallenger () {
      return this.makeAPIRequest('league', ['challenger'])
    }

    leagueMaster () {
      return this.makeAPIRequest('league', ['master'])
    }

    // lol-static-data
    championDataAll (dataType) {
      dataType = dataType || 'all'
      return this.makeAPIRequest('lol-static-data', ['champion'], this.region, { champData: dataType })
    }

    championData (champId, dataType) {
      dataType = dataType || 'all'
      return this.makeAPIRequest('lol-static-data', ['champion', champId], this.region, { champData: dataType })
    }

    itemDataAll (dataType) {
      dataType = dataType || 'all'
      return this.makeAPIRequest('lol-static-data', ['item'], this.region, { itemData: dataType })
    }

    itemData (itemId, dataType) {
      dataType = dataType || 'all'
      return this.makeAPIRequest('lol-static-data', ['item', itemId], this.region, { itemData: dataType })
    }

    mapData () {
      return this.makeAPIRequest('lol-static-data', ['map'])
    }

    masteryDataAll (dataType) {
      dataType = dataType || 'all'
      return this.makeAPIRequest('lol-static-data', ['mastery'], this.region, { masteryListData: dataType })
    }

    masteryData (masteryId, dataType) {
      dataType = dataType || 'all'
      return this.makeAPIRequest('lol-static-data', ['mastery', masteryId], this.region, { masteryListData: dataType })
    }

    runeDataAll (dataType) {
      dataType = dataType || 'all'
      return this.makeAPIRequest('lol-static-data', ['rune'], this.region, { runeData: dataType })
    }

    runeData (runeId, dataType) {
      dataType = dataType || 'all'
      return this.makeAPIRequest('lol-static-data', ['rune', runeId], this.region, { runeData: dataType })
    }

    summonerSpellDataAll (dataType) {
      dataType = dataType || 'all'
      return this.makeAPIRequest('lol-static-data', ['summoner-spell'], this.region, { summonerSpellData: dataType })
    }

    summonerSpellData (ssId, dataType) {
      dataType = dataType || 'all'
      return this.makeAPIRequest('lol-static-data', ['summoner-spell', ssId], this.region, { summonerSpellData: dataType })
    }

    // lol-status
    statusAll () {
      return this.makeAPIRequest('lol-status', ['shards'])
    }

    statusRegion (regionId) {
      return this.makeAPIRequest('lol-status', ['shards', regionId])
    }

    // match
    match (matchId) {
      return this.makeAPIRequest('match', [matchId], this.region, { includeTimeline: 'true' })
    }

    // matchlist
    playerRecentMatches (playerId, params) {
      return this.makeAPIRequest('matchlist', ['by-summoner', playerId], this.region, params)
    }

    // stats
    playerRankedStats (playerId, season) {
      season = season || 'SEASON2016'
      return this.makeAPIRequest('stats', ['by-summoner', playerId, 'ranked'], this.region, { season: season })
    }

    playerStats (playerId, season) {
      season = season || 'SEASON2016'
      return this.makeAPIRequest('stats', ['by-summoner', playerId, 'summary'], this.region, { season: season })
    }

    // summoner
    playerByName (playerName, region) {
      region = region || this.region
      return this.makeAPIRequest('summoner', ['by-name', playerName], region, {}).then((resp) => {
        return Object.keys(resp).map((key) => {
          return new BardPlayer(this, resp[key], region)
        })[0]
      })
    }

    playersByName (playerNames, region) {
      region = region || this.region
      return this.makeAPIRequest('summoner', ['by-name', playerNames.join(',')], region, {}).then((resp) => {
        return Object.keys(resp).map((key) => {
          return new BardPlayer(this, resp[key], region)
        })
      })
    }

    player (playerId, region) {
      region = region || this.region
      return this.makeAPIRequest('summoner', [playerId], region, {}).then((resp) => {
        return Object.keys(resp).map((key) => {
          return new BardPlayer(this, resp[key], region)
        })[0]
      })
    }

    players (playerIds, region) {
      region = region || this.region
      return this.makeAPIRequest('summoner', [playerIds.join(',')], region, {}).then((resp) => {
        return Object.keys(resp).map((key) => {
          return new BardPlayer(this, resp[key], region)
        })
      })
    }

    playerMasteryPages (playerId) {
      this.makeAPIRequest('summoner', [playerId, 'masteries'])
    }

    playerName (playerId) {
      return this.makeAPIRequest('summoner', [playerId, 'name'])
    }

    playerRunePages (playerId) {
      return this.makeAPIRequest('summoner', [playerId, 'runes'])
    }

    // team
    playerTeams (playerId) {
      return this.makeAPIRequest('team', ['by-summoner', playerId])
    }

    team (teamId) {
      return this.makeAPIRequest('team', [teamId])
    }
  }

  class BardResponse {
    constructor (bard, data) {
      this.bard = bard // bard passes itself when creating a response so the response can call up additional data as needed
      this.rawData = data
    }
  }

  class BardPlayer extends BardResponse {
    constructor (bard, data, region) {
      super(bard, data)
      this.id = data.id
      this.name = data.name
      this.profileIcon = data.profileIconId
      this.level = data.summonerLevel
    }

    profileIconURL () {
      return new Promise((resolve) => {
        resolve(`http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/profileicon/${this.profileIconId}.png`)
      })
    }

    championMasteryList () {
      return this.bard.playerChampionMasteryList(this.id)
    }

    championMastery (champId) {
      return this.bard.playerChampionMastery(this.id, champId)
    }

    championMasteryScore () {
      return this.bard.playerChampionMasteryScore(this.id)
    }

    championMasteryTop (count) {
      return this.bard.playerChampionMasteryTopChampions(this.id, count)
    }

    currentGame () {
      return this.bard.playerCurrentGame(this.id)
    }

    recentGames () {
      return this.bard.playerRecentGames(this.id)
    }

    league () {
      return this.bard.playerLeague(this.id)
    }

    leagueEntry () {
      return this.bard.playerLeagueEntry(this.id)
    }

    // don't ask me the distinction between a match and a game i really don't know
    recentMatches () {
      return this.bard.playerRecentMatches(this.id)
    }

    rankedStats () {
      return this.bard.playerRankedStats(this.id)
    }

    stats () {
      return this.bard.playerStats(this.id)
    }

    masteryPages () {
      return this.bard.playerMasteryPages(this.id)
    }

    runePages () {
      return this.bard.playerRunePages(this.id)
    }

    teams () {
      return this.bard.playerTeams(this.id)
    }
  }

  class BardChampion extends BardResponse {
    constructor (bard, data) {
      super(bard, data)
      this.name = data.name
      this.key = data.key
      this.id = data.id
      this.title = data.title
    }

    // spells + passive and image URLs
    spells () {
      return this.bard.championData(this.id, 'spells').then((resp) => { return resp.spells })
    }

    passive () {
      return this.bard.championData(this.id, 'passive').then((resp) => { return resp.passive })
    }

    spellQ () {
      return this.spells().then((resp) => { return resp[0] })
    }

    spellW () {
      return this.spells().then((resp) => { return resp[1] })
    }

    spellE () {
      return this.spells().then((resp) => { return resp[2] })
    }

    spellR () {
      return this.spells().then((resp) => { return resp[3] })
    }

    ultimate () {
      return this.spellR()
    }

    imgSquareURL () {
      // everything returns promises
      return new Promise((resolve) => {
        resolve(`http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/champion/${this.key}.png`)
      })
    }

    imgSplashURL (skinID) {
      skinID = skinID || '0'
      return new Promise((resolve) => {
        resolve(`http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${this.key}_${skinID}.jpg`)
      })
    }

    imgLoadingScreenURL (skinID) {
      skinID = skinID || '0'
      return new Promise((resolve) => {
        resolve(`http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${this.key}_${skinID}.jpg`)
      })
    }

    imgPassiveURL () {
      return this.passive().then((resp) => {
        return `http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/passive/${resp.image.full}`
      })
    }

    imgPassiveSpriteURL () {
      return this.passive().then((resp) => {
        return `http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/passive/${resp.image.sprite}`
      })
    }

    imgSpellQURL () {
      return this.spellQ().then((resp) => {
        return `http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/spell/${resp.image.full}`
      })
    }

    imgSpellQSpriteURL () {
      return this.spellQ().then((resp) => {
        return `http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/spell/${resp.image.sprite}`
      })
    }

    imgSpellWURL () {
      return this.spellW().then((resp) => {
        return `http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/spell/${resp.image.full}`
      })
    }

    imgSpellWSpriteURL () {
      return this.spellW().then((resp) => {
        return `http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/spell/${resp.image.sprite}`
      })
    }

    imgSpellEURL () {
      return this.spellE().then((resp) => {
        return `http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/spell/${resp.image.full}`
      })
    }

    imgSpellESpriteURL () {
      return this.spellE().then((resp) => {
        return `http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/spell/${resp.image.sprite}`
      })
    }

    imgSpellRURL () {
      return this.spellR().then((resp) => {
        return `http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/spell/${resp.image.full}`
      })
    }

    imgSpellRSpriteURL () {
      return this.spellR().then((resp) => {
        return `http://ddragon.leagueoflegends.com/cdn/${this.bard.ddragonVersion}/img/spell/${resp.image.sprite}`
        // i'd like to take line 500 to thank my fans :^)
      })
    }

    imgUltimateURL () {
      return this.imgSpellRURL()
    }

    imgUltimateSpriteURL () {
      return this.imgSpellRSpriteURL()
    }

    // ally tips
    allyTips () {
      return this.bard.championData(this.id, 'allytips').then((resp) => { return resp.allytips })
    }

    blurb () {
      return this.bard.championData(this.id, 'blurb').then((resp) => { return resp.blurb })
    }

    enemyTips () {
      return this.bard.championData(this.id, 'enemytips').then((resp) => { return resp.enemytips })
    }

    info () {
      return this.bard.championData(this.id, 'info').then((resp) => { return resp.info })
    }

    lore () {
      return this.bard.championData(this.id, 'lore').then((resp) => { return resp.lore })
    }

    // TODO recommended items

    skins () {
      return this.bard.championData(this.id, 'skins').then((resp) => {
        resp.skins.map((skin) => {
          return new BardSkin(this.bard, skin, this)
        })
      })
    }

    stats () {
      return this.bard.championData(this.id, 'stats').then((resp) => { return resp.stats })
    }

    tags () {
      return this.bard.championData(this.id, 'tags').then((resp) => { return resp.tags })
    }
  }

  class BardSkin extends BardResponse {
    constructor (bard, data, champion) {
      super(bard, data)
      this.champion = champion
      this.id = data.id
      this.num = data.num
      this.name = data.name
    }

    imgSplashURL () {
      return this.champion.imgSplashURL(this.num)
    }

    imgLoadingScreenURL () {
      return this.champion.imgLoadingScreenURL(this.num)
    }
  }

  return new Bard(apiKey, apiKeyRegion)
}
