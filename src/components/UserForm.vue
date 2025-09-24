<template>
  <div class="user-form">
    <h4>User Registration Form</h4>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Name:</label>
        <input id="name" v-model="form.name" type="text" required class="form-input" />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" v-model="form.email" type="email" required class="form-input" />
      </div>

      <div class="form-group">
        <label for="role">Role:</label>
        <select id="role" v-model="form.role" class="form-input">
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancel</button>
        <button type="submit" class="btn btn-primary">Register User</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const emit = defineEmits<{
  close: []
  submit: [data: { name: string; email: string; role: string }]
}>()

const form = reactive({
  name: '',
  email: '',
  role: 'user',
})

const handleSubmit = () => {
  emit('submit', { ...form })
  emit('close')
}
</script>

<style scoped>
.user-form {
  padding: 1rem 0;
}

.user-form h4 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover {
  background: #369870;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style>
