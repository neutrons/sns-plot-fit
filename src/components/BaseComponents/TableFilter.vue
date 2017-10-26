<template>
<div>
    <div class="filter-selection input-group">
        <span class="select-tag input-group-addon"><i class="fa fa-filter" aria-hidden="true"></i> Filter:</span>
        <select class="group-selection form-control input-sm" v-model="filterChoice">
            <option>All</option>
            <option v-for="job in jobs">{{ job }}</option>
        </select>
    </div>

    <button class="btn-sort btn btn-sm btn-default" v-if="sortToggle" @click="sortByDate('descending')"><i class="fa fa-sort-amount-asc" aria-hidden="true"></i> Date Modified</button>
    <button class="btn-sort btn btn-sm btn-default" v-else @click="sortByDate('ascending')"><i class="fa fa-sort-amount-desc" aria-hidden="true"></i> Date Modified</button>
</div>
</template>

<script>

export default {
  props: {

  },
  data: function() {
    return {
        filterChoice: 'All',
        sortToggle: true
    }
  },
  computed: {
    jobs() {
        var jobs = this.$store.getters.getGroups('1D');

        return jobs.reduce(function(prev, cur) {
                if (prev.indexOf(cur) < 0) prev.push(cur);
                
                return prev;
            }, []);
    }
  },
  methods: {
    sortByDate(direction) {
        this.sortToggle = !this.sortToggle;
        this.$emit('sort-by-date', direction);
    }
  },
  watch: {
      filterChoice() {
          this.$emit('filter-job', this.filterChoice);
      }
  }
}
</script>

<style scoped>
.filter-selection {
    width: 100%;
    margin-bottom: 5px
}

.btn-sort {
    width: 100%;
    margin-bottom: 5px;
}
</style>