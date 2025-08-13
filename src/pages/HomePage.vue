<template>
  <div class="home-page">
    <div class="turntable-container">
      <div class="turntable">
        <div class="turntable-arrow"></div>
        <div class="turntable-text">转 盘</div>
      </div>
    </div>
    <p style="text-align: center; opacity: 0.6; font-size: 18px; margin: 10px 0 20px 0">
      转动自定义转盘从您的选项中随机选择，用于决策制定、游戏和公平选择。
    </p>
    <div class="nav-bar">
      <div>常用模板</div>
      <p style="opacity: 0.6; margin: 10px 0">快速选择预设模板或自定义轮盘选项</p>

      <div class="nav-bar-grid">
        <div v-for="template in templates" :key="template.id" class="nav-bar-grid-item"
          :class="{ 'selected': selectedTemplateId === template.id }">
          <div style="font-size: 22px ; cursor: pointer" @click="selectTemplate(template.id)">
            {{ template.iconPlaceholder }}
          </div>
          <div>{{ template.name }}</div>
          <div>{{ template.options.length }}项</div>
        </div>
      </div>
    </div>
    <!-- 数据展示 -->

    <div style="display: flex; width: 80%; margin: 20px auto 20px;">
      <div style="flex: 1;margin-right: 10px;">
        <RouterView :options="currentOptions" />
      </div>
      
      <div style="flex: 1;margin-left: 10px;">
        <Setting :options="currentOptions" @update-options="handleOptionsUpdate" />
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterView } from 'vue-router';
import Setting from './Setting.vue';

// 定义模板类型
interface Template {
  id: number;
  name: string;
  iconPlaceholder: string;
  options: { text: string; color: string }[];
}

// 数据
const templates: Template[] = [
   { 
    id: 1, 
    name: '用餐', 
    iconPlaceholder: '🍽️', 
    options: [
      { text: '中餐', color: '#FF5733' },
      { text: '西餐', color: '#33FF57' },
      { text: '日料', color: '#3357FF' },
      { text: '火锅', color: '#F3FF33' },
      { text: '烧烤', color: '#FF33F3' },
      { text: '快餐', color: '#33FFF3' }
    ]
  },
  { 
    id: 2, 
    name: '娱乐', 
    iconPlaceholder: '🎮', 
    options: [
      { text: '电影', color: '#FF5733' },
      { text: '游戏', color: '#33FF57' },
      { text: '运动', color: '#3357FF' },
      { text: '音乐', color: '#F3FF33' },
      { text: '阅读', color: '#FF33F3' },
      { text: '旅行', color: '#33FFF3' }
    ]
  },
  {
    id: 3,
    name: '颜色',
    iconPlaceholder: '🎨',
    options: [
      { text: '红色', color: '#FF5733' },
      { text: '绿色', color: '#33FF57' },
      { text: '蓝色', color: '#3357FF' },
      { text: '黄色', color: '#F3FF33' },
      { text: '紫色', color: '#FF33F3' },
      { text: '青色', color: '#33FFF3' }
    ]
  },
  {
    id: 4,
    name: '学习',
    iconPlaceholder: '📚',
    options: [
      { text: '数学', color: '#FF5733' },
      { text: '英语', color: '#33FF57' },
      { text: '语文', color: '#3357FF' },
      { text: '历史', color: '#F3FF33' },
      { text: '阅读', color: '#FF33F3' }
    ]
  },
  {
    id: 5,
    name: '自定义',
    iconPlaceholder: '✏️',
    options: [
      { text: '选项一', color: '#FF5733' },
      { text: '选项二', color: '#33FF57' }
    ]
  },

];

const selectedTemplateId = ref(1);
const currentOptions = ref([...templates[0].options]);

const selectTemplate = (id: number) => {
  selectedTemplateId.value = id;
  const template = templates.find(t => t.id === id);
  if (template) {
    currentOptions.value = [...template.options];
  }
};

const handleOptionsUpdate = (newOptions: any[]) => {
  currentOptions.value = newOptions;
};
</script>

<style>
.home-page {
  top: 0;
  left: 0;
  position: absolute;
  color: white;
  width: 100%;
  background-color: black;
}

.turntable {
  font-size: 50px;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}

.nav-bar {
  width: 80%;
  margin: 0 auto 0;
  background-color: #1e1e1e;
  padding: 12px;
  box-sizing: border-box;
  border-radius: 12px;
}

.nav-bar-grid {
  display: flex;
  justify-content: center;
  margin: 10px 10px;
  gap: 20px;
}

.nav-bar-grid-item {
  display: grid;
  width: 250px;
  height: 100px;
  font-size: 14px;
  text-align: center;
  padding: 5px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.nav-bar-grid-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.nav-bar-grid-item.selected {
  border-color: #64b5f6;
  box-shadow: 0 0 10px rgba(100, 181, 246, 0.5);
  background-color: rgba(100, 181, 246, 0.1);
}
</style>

<style>
.home-page {
  top: 0;
  left: 0;
  position: absolute;
  color: white;
  width: 100%;
  background-color: black;
}

.turntable {
  font-size: 50px;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}

.nav-bar {
  width: 80%;
  margin: 0 auto 0;
  background-color: #1e1e1e;
  padding: 12px;
  box-sizing: border-box;
  border-radius: 12px;
}

.nav-bar-grid {
  display: flex;
  justify-content: center;
  margin: 10px 10px;
  gap: 20px;
}

.nav-bar-grid-item {
  display: grid;
  width: 250px;
  height: 100px;
  font-size: 14px;
  text-align: center;
  padding: 5px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.nav-bar-grid-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.nav-bar-grid-item.selected {
  border-color: #64b5f6;
  box-shadow: 0 0 10px rgba(100, 181, 246, 0.5);
  background-color: rgba(100, 181, 246, 0.1);
}
</style>
