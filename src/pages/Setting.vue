<template>
  <div class="settings-container">
    <div>
      <div style="font-size: 20px;font-weight: bold;">轮盘设置</div>
      <div style="font-size: 15px;opacity: 0.7;">自定义轮盘选项和配置</div>
    </div>

    <div class="color-usage">
      <div style="flex: 1;">转盘选项</div>
      <div style="flex: 1;margin-left: 250px;">
        <span>已使用 {{ new Set(usedColors).size }}/24 个选项</span>
      </div>
    </div>

    <div class="options-container">
      <div v-for="(option, index) in options" :key="index" class="option-item">
        <div class="color-indicator" :style="{ backgroundColor: option.color }"></div>
        <div class="option-text-container" @click="editIndex !== index ? enterEdit(index) : null">
          <span v-if="editIndex !== index">{{ option.text }}</span>
          <input v-else v-model="editText" @blur="saveEdit(index)" @keyup.enter="saveEdit(index)"
            @keyup.esc="cancelEdit" ref="editInput" class="edit-input">
        </div>
        <button class="delete-button" @click.stop="removeOption(index)">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <button class="add-button" @click="addOption">
      <i class="fas fa-plus"></i> 添加选项
    </button>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, nextTick } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update-options']);

// 编辑状态和颜色数据保持不变...
const editIndex = ref(-1);
const editText = ref('');
const editInput = ref(null);

const allColors = [
  '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3', '#33FFF3',
  '#FFA500', '#FFC0CB', '#800000', '#008000', '#000080', '#808000',
  '#800080', '#008080', '#808080', '#C0C0C0', '#FF1493', '#1E90FF',
  '#32CD32', '#4B0082', '#7FFF00', '#FFD700', '#B22222', '#F0FFFF'
];

const enterEdit = (index) => {
  editIndex.value = index;
  editText.value = props.options[index].text;
  nextTick(() => {
    editInput.value?.focus();
  });
};

const saveEdit = (index) => {
  if (editText.value.trim()) {
    const newOptions = [...props.options];
    newOptions[index].text = editText.value.trim();
    emit('update-options', newOptions);
  }
  editIndex.value = -1;
};

const addOption = () => {
  if (props.options.length >= 24) return;

  const availableColors = allColors.filter(color =>
    !props.options.some(opt => opt.color === color)
  );

  if (availableColors.length > 0) {
    const newColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    const newOptions = [...props.options, {
      text: `选项 ${props.options.length + 1}`,
      color: newColor
    }];
    emit('update-options', newOptions);
  }
};

const removeOption = (index) => {
  if (props.options.length <= 2) return;
  const newOptions = [...props.options];
  newOptions.splice(index, 1);
  emit('update-options', newOptions);
};

const usedColors = computed(() => props.options.map(opt => opt.color));
</script>

<style scoped>
.settings-container {
  max-width: 600px;
  height: 580px;
  margin: 0 auto;
  padding: 20px;
  background-color: #121212;
  color: white;
  border-radius: 10px;
}

.color-usage {
  display: flex;
  margin: 20px 0;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.color-swatch {
  width: 20px;
  height: 20px;
  margin: 2px;
  border-radius: 3px;
  border: 1px solid #333;
}

.used-color {
  border: 1px solid white;
}

.options-container {
  height: 400px;
  /* 固定6个选项的高度 */
  min-height: 400px;
  overflow-y: auto;
  margin: 20px 0;
  padding-right: 10px;
  scrollbar-width: thin;
  scrollbar-color: #333 #1e1e1e;
}

.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: #1e1e1e;
  border-radius: 10px;
}

.options-container::-webkit-scrollbar-thumb {
  background-color: #333;
  border-radius: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #1e1e1e;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #333;
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: #555;
  background-color: #252525;
}

.color-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 15px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.option-text-container {
  margin-left: 10px;
  width: 100px;
  flex: 1;
}

.option-text-container span {
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  transition: color 0.2s ease;
}


.edit-input:focus {
  outline: none;
  border-color: #888;
}

.option-text-container span:hover {
  text-decoration: underline;
  color: #f0f0f0;
}

.edit-input {
  width: 400px;
  height: 25px;
  padding: 0 10px;
  background-color: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 3px;
  padding: 5px;
}

.delete-button {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  margin-left: auto;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.delete-button:hover {
  background-color: #ff6666;
}

.add-button {
  font-size: 20px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.add-button i {
  margin-right: 10px;
}

/* 颜色选择器样式 */
.settings-container {
  position: relative;
}

.color-picker {
  position: absolute;
  background-color: #252525;
  border-radius: 8px;
  border: 1px solid #555;
  padding: 12px;
  z-index: 100;
  width: 220px;
}

.color-picker-header {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.color-wheel {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(red, orange, yellow, lime, aqua, blue, magenta, red);
  position: relative;
  overflow: hidden;
}

.color-wheel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.7) 100%);
}

.color-wheel-pointer {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.color-preview {
  width: 100%;
  height: 40px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #555;
  position: relative;
}

.color-preview-indicator {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #555;
}

.color-slider {
  width: 100%;
  height: 10px;
  margin-bottom: 20px;
  background: linear-gradient(to right, #000, #888, #fff);
  border-radius: 5px;
  position: relative;
  cursor: pointer;
}

.slider-pointer {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  top: -5px;
  transform: translateX(-50%);
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.rgb-inputs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.rgb-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
}

.rgb-label {
  font-size: 12px;
  margin-bottom: 5px;
  color: #ccc;
}

.rgb-input {
  width: 60px;
  padding: 5px;
  background-color: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  text-align: center;
}

.hex-input-container {
  margin-bottom: 15px;
}

.hex-input {
  width: 100%;
  padding: 5px;
  background-color: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  text-align: center;
}

.color-toggle-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.color-toggle-button {
  background-color: #444;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.color-toggle-button:hover {
  background-color: #555;
}
</style>