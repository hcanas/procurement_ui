<script setup>
  document.title = 'Forbidden';
  
  const back = () => history.back();
</script>

<template>
  <div class="w-full h-full bg-gray-50 flex justify-center items-center p-24">
    <div class="w-full h-full bg-white rounded-xl shadow-lg flex flex-col justify-center items-center space-y-6">
      <p class="text-5xl text-red-600 font-medium">403</p>
      <p class="text-2xl text-red-600 font-medium">Access Denied</p>
      <p class="text-gray-500">Sorry, but you don't have permission to access this page.</p>
      <div>
        <button @click="back()" class="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-lg">
          <div class="flex items-center space-x-2">
            <i class="fas fa-left-long" />
            <span>Return</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>