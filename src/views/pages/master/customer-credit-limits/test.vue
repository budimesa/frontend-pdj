<template>
    
</template>

<script setup>
import { computed, ref } from 'vue';


const props = defineProps(['formDialog', 'onHide', 'isSaving']);
const emit = defineEmits(['update:formDialog']);

const formData = ref({
  customer_id: null,
  limit_amount: null,
  is_unlimited: false,
});

const submitted = ref(false);
const { customers } = useCustomers(); // Assuming this composable returns a list of customers

const filteredCustomers = computed(() => {
  return customers.value.filter(customer => customer.type === 'regular'); // Adjust 'type' as per your data structure
});

function save() {
  submitted.value = true;

  if (!formData.value.customer_id || (!formData.value.limit_amount && !formData.value.is_unlimited)) {
    return; // Early return if validation fails
  }

  // Perform the save logic (e.g., API call)
  // Reset the form after saving if needed
}

function hideDialog() {
  emit('update:formDialog', false);
  formData.value = {
    customer_id: null,
    limit_amount: null,
    is_unlimited: false,
  };
  submitted.value = false;
}
</script>
