<template>
  <div class="app-container">
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="display: flex; width: 100%; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <div style="font-size: 20px;font-weight: bold;">转动结果</div>
          <div style="font-size: 15px;opacity: 0.7;">点击转盘或「转动转盘」按钮开始转动</div>
        </div>

        <div style="display: flex;gap:10px;height: 40px;">
          <button class="spin-button" @click="startSpin" :disabled="isSpinning">
            <svg class="spin-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <polygon points="5,3 17,10 5,17" fill="white" />
            </svg>
            转动转盘
          </button>
          <button class="reset-button" @click="resetWheel" :disabled="isSpinning">
            <svg class="reset-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M4 10a6 6 0 1 1 2 4.47" stroke="currentColor" stroke-width="2" fill="none" />
              <polyline points="4 14 4 10 8 10" stroke="currentColor" stroke-width="2" fill="none" />
            </svg>
            重置轮盘
          </button>

        </div>
      </div>

      <!-- 转盘容器 -->
      <div class="wheel-app">
        <!-- 转盘容器 -->
        <div class="wheel-wrapper">
          <canvas ref="wheelCanvas" width="400" height="400" class="wheel-canvas" @click="startSpin"></canvas>

          <!-- 指针（放在下方） -->
          <div class="pointer"></div>

          
        </div>

        <!-- 结果显示 -->
        <div class="result-display" v-if="result">
          <div>抽取结果：</div>
          <p>{{ result }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => [],
  }
});

const wheelCanvas = ref(null);
const isSpinning = ref(false);
const rotation = ref(0);
const result = ref('');

// 转盘配置
const wheelConfig = computed(() => {
  const radius = 180;
  const centerX = 200;
  const centerY = 200;
  const anglePerSection = props.options.length > 0 
    ? (2 * Math.PI) / props.options.length 
    : 0;

  return { radius, centerX, centerY, anglePerSection };
});

// 初始化/重绘转盘
const drawWheel = () => {
  const canvas = wheelCanvas.value;
  if (!canvas || props.options.length === 0) return;
  
  const ctx = canvas.getContext('2d');
  const { radius, centerX, centerY, anglePerSection } = wheelConfig.value;
  
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 保存当前状态
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation.value);
  
  // 绘制每个扇形区域
  props.options.forEach((option, index) => {
    const startAngle = index * anglePerSection;
    const endAngle = startAngle + anglePerSection;
    
    // 绘制扇形
    ctx.beginPath();
    ctx.fillStyle = option.color;
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    
    // 绘制扇形边界
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制文字
    ctx.save();
    ctx.rotate(startAngle + anglePerSection / 2);
    ctx.fillStyle = getContrastColor(option.color);
    ctx.font = `bold ${Math.min(16, radius / 8)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 文字换行处理
    const maxWidth = radius * 0.8;
    let fontSize = Math.min(16, radius / 8);
    let text = option.text;
    
    ctx.font = `bold ${fontSize}px Arial`;
    while (ctx.measureText(text).width > maxWidth && fontSize > 10) {
      fontSize -= 1;
      ctx.font = `bold ${fontSize}px Arial`;
    }
    
    ctx.fillText(text, radius * 0.6, 0);
    ctx.restore();
  });
  
  // 绘制中心圆
  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.arc(0, 0, radius * 0.15, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 恢复状态
  ctx.restore();
  
  // 绘制转盘外框
  ctx.beginPath();
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 8;
  ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
  ctx.stroke();
};

// 开始旋转（17-28圈，3-5秒
const startSpin = () => {
  if (isSpinning.value || props.options.length === 0) return;
  
  isSpinning.value = true;
  result.value = '';
  
  // 1. 随机选择目标区域（确保公平）
  const targetIndex = Math.floor(Math.random() * props.options.length);
  
  // 2. 在目标区域内随机偏移（避免停在分界线上）
  const sectionAngle = wheelConfig.value.anglePerSection;
  const angleOffset = Math.random() * sectionAngle * 0.8; // 80%区域范围
  const targetAngle = targetIndex * sectionAngle + angleOffset;

  // 3. 计算需要旋转的圈数（23-34圈）
  const rotations = 23 + Math.floor(Math.random() * 12);
  
  // 4. 计算最终停止位置（指针指向目标区域中间）
  // 指针在下方（π/2），目标应该在正上方（3π/2）
  const targetRotation = (rotations * 2 * Math.PI) + 
                       (3 * Math.PI / 2 - targetAngle);

  // 固定旋转时间（2-4秒）
  const duration = 2000 + Math.random() * 2000;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 使用缓动函数
    const easeProgress = easeOutQuart(progress);
    rotation.value = easeProgress * targetRotation;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rotation.value = targetRotation;
      isSpinning.value = false;
      result.value = props.options[targetIndex].text;
      
      // 调试验证（可选）
      console.log('应指向:', targetIndex, '实际:', 
        Math.floor(((3*Math.PI/2 - rotation.value % (2*Math.PI) + 2*Math.PI) % (2*Math.PI)) / sectionAngle) % props.options.length
      );
    }
  };
  
  requestAnimationFrame(animate);
};

// 计算指针指向的区域（备用验证方法）
const calculatePointerResult = () => {
  // 标准化旋转角度（0到2π之间）
  const normalizedRotation = rotation.value % (2 * Math.PI);
  // 指针在下方（π/2位置）
  const pointerAngle = Math.PI / 2;
  // 计算扇区索引
  const sectionIndex = Math.floor(
    ((pointerAngle - normalizedRotation + 2 * Math.PI) % (2 * Math.PI)) / 
    wheelConfig.value.anglePerSection
  );
  return props.options[sectionIndex % props.options.length].text;
};

// 更强烈的缓出效果
const easeOutQuart = (t) => {
  return 1 - Math.pow(1 - t, 4);
};

// 重置转盘
const resetWheel = () => {
  if (isSpinning.value || props.options.length === 0) return;
  
  // 计算第一个选项中心角度
  const firstOptionCenterAngle = wheelConfig.value.anglePerSection / 2;
  
  // 指针在正上方（3π/2），第一个选项应该在正下方（π/2）
  rotation.value = (3 * Math.PI / 2) - firstOptionCenterAngle;
  result.value = '';
  
  // 立即重绘
  drawWheel();
  
  // 验证
  console.log('重置后指向:', getCurrentIndex());
};

// 获取当前指向的选项索引
const getCurrentIndex = () => {
  const normalizedRotation = ((rotation.value % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
  const pointerAngle = Math.PI / 2; // 指针在下方
  let adjustedAngle = pointerAngle - normalizedRotation;
  adjustedAngle = ((adjustedAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
  
  return Math.floor(adjustedAngle / wheelConfig.value.anglePerSection) % props.options.length;
};

// 辅助函数：获取对比色
const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// 监听变化
watch(() => props.options, resetWheel, { deep: true });
watch(rotation, drawWheel);

onMounted(resetWheel);
</script>

<style scoped>
.app-container {
  flex-direction: column;
  height: 620px;
  align-items: center;
  justify-content: center;
  background-color: #1a1a1a;
  color: white;
  padding: 20px;
  border-radius: 12px;
  box-sizing: border-box;
}

.wheel-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 20px 20px;
  width: 100%;
}

.wheel-wrapper {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 0 auto 5px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.wheel-wrapper:hover {
  transform: scale(1.02);
}

.wheel-canvas {
  border-radius: 50%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  display: block;
}

/* 正三角形指针（尖头朝上） */
.pointer {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 35px solid #ff4d4f;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.spin-hint, .empty-hint { 
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  text-align: center;
  width: 80%;
}

.empty-hint {
  color: rgba(255, 0, 0, 0.8);
}

.control-buttons {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}



.reset-button:hover {
  background-color: #40a9ff;
}

.reset-button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.result-display {
  margin-top: 30px;
  padding: 15px 30px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  text-align: center;
  animation: fadeIn 0.5s ease;
  min-width: 200px;
}

.result-display p {
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
  color: #ffd700;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .wheel-wrapper {
    width: 300px;
    height: 300px;
  }
  
  .wheel-canvas {
    width: 300px;
    height: 300px;
  }
  
  .pointer {
    top: -15px;
    border-left-width: 15px;
    border-right-width: 15px;
    border-bottom-width: 25px;
  }
  
}

.spin-button,
.reset-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background-color: #1769ff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  transition: background 0.2s;
}

.spin-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.spin-icon,
.reset-icon {
  display: inline-block;
  vertical-align: middle;
}

.result-display {
  margin-top: 10px;
  text-align: center;
  font-size: 20px;
  padding: 5px 30px 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  animation: fadeIn 0.5s ease-in-out;
}



.result-display p {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 0;
  color: #ffd700;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>