<template>
  <main class="not-found">
    <img class="not-found__image" src="@/assets/images/404NotFoundPage.svg" alt="404 Not Found" />

    <h1 class="not-found__title">Oops! Không tìm thấy trang</h1>
    <p class="not-found__description">
      Đường dẫn bạn đang truy cập đã bị thay đổi hoặc không tồn tại.
    </p>

    <RouterLink class="not-found__button" :to="path.salarycomposition"
      >Quay lại trang chủ</RouterLink
    >
  </main>
</template>

<script setup>
import { path } from '@/utils/path'
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  padding: 90px 16px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  color: #000;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  text-align: center;
  box-sizing: border-box;
}

.not-found__image {
  width: min(970px, 72vw);
  max-height: 420px;
  object-fit: contain;
}

.not-found__title {
  margin: 0 0 24px;
  color: #000;
  font-size: 24px;
  font-weight: 700;
  line-height: 29px;
}

.not-found__description {
  margin: 0 0 40px;
  color: #000;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
}

.not-found__button {
  min-width: 195px;
  height: 60px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #004cff;
  color: #fff;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
  text-decoration: none;
  box-sizing: border-box;
}

.not-found__button:hover {
  background: #0042dd;
}
</style>
