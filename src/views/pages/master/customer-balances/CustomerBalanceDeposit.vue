<template>
    <div class="card">
        <h1 class="text-2xl font-bold mb-4">Customer Balance Deposit</h1>
        <Toolbar class="mb-6">
            <template #start>
                <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
            </template>
            <template #end>
                <Button label="Export" icon="pi pi-upload" severity="help" />
            </template>
        </Toolbar>
    </div>
</template>


<script setup>
</script>