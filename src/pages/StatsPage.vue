<template>
  <q-page class="q-pa-lg">
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      narrow-indicator
    >
      <q-tab name="teams" label="Teams" />
      <q-tab name="players" label="Players" />
    </q-tabs>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="teams">
        <div>
          <q-select
            filled
            v-model="selectedSeason"
            label="Seasons"
            :options="seasons"
          />
          <q-table
            class="my-sticky-header-column-table"
            title="12ADOH"
            :rows="teams"
            :columns="columns"
            row-key="name"
            :rows-per-page-options="[12]"
            :hide-bottom="true"
            :wrap-cells="true"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="players">
        <div>
          <q-select
            filled
            v-model="selectedSeason2"
            label="Seasons"
            :options="seasons2"
          />
          <q-table
            class="my-sticky-header-column-table"
            title="12ADOH"
            :rows="players"
            :columns="columns2"
            row-key="name"
            :rows-per-page-options="[10, 20]"
            :wrap-cells="true"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { api } from "boot/axios";
import { ref } from "vue";
export default defineComponent({
  name: "StatsPage",
  data() {
    return {
      tab: ref("teams"),
      teams: [],
      players: [],
      selectedSeason: 2022,
      selectedSeason2: 2021,
      seasons: [2020, 2021, 2022],
      seasons2: [2020, 2021],
      columns: [
        {
          name: "name",
          required: true,
          label: "Teams",
          align: "left",
          field: (teams) => teams.teamName,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "record",
          label: "Record",
          field: "record",
          sortable: true,
        },
        { name: "pointsFor", label: "Points For", field: "pointsFor" },
        {
          name: "pointsAgainst",
          label: "Points Against",
          field: "pointsAgainst",
        },
        { name: "rank", label: "Projected Rank", field: "rank" },
      ],
      columns2: [
        {
          name: "name",
          required: true,
          label: "Player",
          align: "left",
          field: (players) => players.playerName,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "averageScore",
          label: "Average Score",
          field: "averageScore",
          sortable: true,
        },
        { name: "totalPoints", label: "Total Points", field: "totalPoints" },
      ],
    };
  },
  created() {
    this.fetchData(this.selectedSeason);
    this.fetchPlayerData(this.selectedSeason2);
  },
  methods: {
    fetchData(selectedSeason) {
      api
        .get(`${selectedSeason}/segments/0/leagues/1136454?view=mTeam`)
        .then((response) => {
          this.teams = response.data.teams
            .map((team) => {
              return {
                teamName: team.location + " " + team.nickname,
                record:
                  team.record.overall.wins +
                  "-" +
                  team.record.overall.losses +
                  "-" +
                  team.record.overall.ties,
                pointsFor: team.record.overall.pointsFor.toFixed(2),
                pointsAgainst: team.record.overall.pointsAgainst.toFixed(2),
                rank: team.currentProjectedRank,
              };
            })
            .sort((a, b) => a.rank - b.rank);
        });
    },
    fetchPlayerData(selectedSeason2) {
      const config = {
        headers: {
          "x-fantasy-filter": JSON.stringify({
            players: {
              limit: 1200,
              sortDraftRanks: {
                sortPriority: 100,
                sortAsc: true,
                value: "STANDARD",
              },
            },
          }),
        },
      };
      api
        .get(
          `${selectedSeason2}/segments/0/leagues/1136454?view=kona_player_info`,
          config
        )
        .then((response) => {
          this.players = response.data.players
            .map((player) => {
              return {
                playerName: player.player.fullName,
                averageScore: player.player.stats
                  .find((stat) => stat.statSplitTypeId == 0)
                  .appliedAverage.toFixed(2),
                totalPoints: player.player.stats
                  .find((stat) => stat.statSplitTypeId == 0)
                  .appliedTotal.toFixed(2),
              };
            })
            .sort((a, b) => b.totalPoints - a.totalPoints);
        });
    },
  },
  watch: {
    selectedSeason() {
      this.fetchData(this.selectedSeason);
    },
    selectedSeason2() {
      this.fetchPlayerData(this.selectedSeason2);
    },
  },
});
</script>
<style lang="sass">
.my-sticky-header-column-table
  /* height or max-height is important */
  height: 100%


  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  max-width: 100%

  td:first-child
    /* bg color is important for td; just specify one */
    background-color: #D3D3D3 !important


  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #fff

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    /* highest z-index */
    z-index: 3

  td:first-child
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0
</style>
