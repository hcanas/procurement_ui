<script setup>
  defineProps(['params']);
</script>

<template>
  <div class="w-full flex flex-col">
    <span class="font-bold">{{ params.value.code }}</span>
    <span>{{ params.value.item }}</span>
    <span>
      {{ new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
          .format(new Date(params.value.timeframe_from))
          + ' - '
          + new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
            .format(new Date(params.value.timeframe_to)) }}
    </span>
    <span>{{ new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(params.value.cost - params.value.allocated) }}</span>
    <span>{{ params.value.fund_source.name }}</span>
  </div>
</template>