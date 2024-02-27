<template>
  <div>
    <p>{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
import axios from '../../node_modules/axios';
import { ref } from 'vue'

const msg = ref('Open');


function getMessage() {
  const path = 'http://localhost:5000/ping';
  axios.get(path)
    .then((res) => {
      console.log(res.data)
      msg.value = res.data;
    })
    .catch((error) => {
      console.error(error);
    });

  console.log(msg)
}

getMessage()
</script>

