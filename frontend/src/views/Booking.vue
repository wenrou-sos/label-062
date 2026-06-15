<template>
  <div class="booking-page">
    <div class="page-header">
      <div class="header-content">
        <el-button @click="$router.push('/')" plain>
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
        <h1>在线预约告别仪式</h1>
        <div></div>
      </div>
    </div>

    <div class="booking-content">
      <el-steps :active="step - 1" finish-status="success" align-center class="steps">
        <el-step title="选择告别厅" />
        <el-step title="选择时间" />
        <el-step title="选择服务" />
        <el-step title="填写信息" />
      </el-steps>

      <div class="step-content">
        <div v-if="step === 1" class="step-1">
          <h2>请选择告别厅</h2>
          <div class="hall-grid">
            <div 
              v-for="hall in halls" 
              :key="hall.id"
              class="hall-item"
              :class="{ active: selectedHall?.id === hall.id }"
              @click="selectHall(hall)"
            >
              <img :src="hall.image_url" :alt="hall.name" />
              <div class="hall-info">
                <h3>{{ hall.name }}</h3>
                <p><el-icon><UserFilled /></el-icon> 容纳 {{ hall.capacity }} 人</p>
                <p class="desc">{{ hall.description }}</p>
              </div>
              <div class="check-icon" v-if="selectedHall?.id === hall.id">
                <el-icon :size="24" color="#409eff"><CircleCheckFilled /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div v-if="step === 2" class="step-2">
          <h2>请选择日期和时间段</h2>
          <div class="date-selector">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              :disabled-date="disabledDate"
              value-format="YYYY-MM-DD"
              size="large"
              @change="loadAvailableSlots"
            />
          </div>
          <div class="time-slots" v-if="!slotsLoading && availableSlots.length > 0">
            <h3>可预约时段</h3>
            <div class="slot-grid">
              <div 
                v-for="slot in availableSlots" 
                :key="slot.id"
                class="slot-item"
                :class="{ 
                  active: selectedSlot?.id === slot.id,
                  disabled: !slot.available
                }"
                @click="selectSlot(slot)"
              >
                <div class="slot-time">{{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}</div>
                <div class="slot-name">{{ slot.name }}</div>
                <div class="slot-status">
                  <el-tag v-if="slot.available" type="success">可预约</el-tag>
                  <el-tag v-else type="info">已预约</el-tag>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="slotsLoading" class="loading">
            <el-skeleton :rows="3" animated />
          </div>
          <el-empty 
            v-else-if="!selectedDate" 
            description="请先选择日期" 
            :image-size="80"
          />
          <el-empty 
            v-else-if="!selectedHall" 
            description="请先选择告别厅" 
            :image-size="80"
          />
          <el-empty 
            v-else 
            description="暂无可用时段数据" 
            :image-size="80"
          />
        </div>

        <div v-if="step === 3" class="step-3">
          <h2>请选择服务套餐</h2>
          
          <div class="service-section">
            <h3>司仪服务</h3>
            <div class="package-grid">
              <div 
                v-for="pkg in hostPackages" 
                :key="pkg.id"
                class="package-item"
                :class="{ active: selectedHostPackage?.id === pkg.id }"
                @click="selectHostPackage(pkg)"
              >
                <h4>{{ pkg.name }}</h4>
                <p class="price">¥{{ pkg.price }}</p>
                <p class="desc">{{ pkg.description }}</p>
                <ul class="includes">
                  <li v-for="(item, idx) in pkg.includes" :key="idx">
                    <el-icon><Check /></el-icon> {{ item }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="staff-select" v-if="selectedHostPackage">
              <h4>选择司仪</h4>
              <div class="staff-list">
                <div 
                  v-for="host in hosts" 
                  :key="host.id"
                  class="staff-item"
                  :class="{ active: selectedHost?.id === host.id }"
                  @click="selectHost(host)"
                >
                  <el-avatar :src="host.avatar" :size="60" />
                  <span class="staff-name">{{ host.name }}</span>
                  <span class="staff-desc">{{ host.description }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="service-section">
            <h3>化妆服务</h3>
            <div class="package-grid">
              <div 
                v-for="pkg in makeupPackages" 
                :key="pkg.id"
                class="package-item"
                :class="{ active: selectedMakeupPackage?.id === pkg.id }"
                @click="selectMakeupPackage(pkg)"
              >
                <h4>{{ pkg.name }}</h4>
                <p class="price">¥{{ pkg.price }}</p>
                <p class="desc">{{ pkg.description }}</p>
                <ul class="includes">
                  <li v-for="(item, idx) in pkg.includes" :key="idx">
                    <el-icon><Check /></el-icon> {{ item }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="staff-select" v-if="selectedMakeupPackage">
              <h4>选择化妆师</h4>
              <div class="staff-list">
                <div 
                  v-for="mua in makeupArtists" 
                  :key="mua.id"
                  class="staff-item"
                  :class="{ active: selectedMakeup?.id === mua.id }"
                  @click="selectMakeup(mua)"
                >
                  <el-avatar :src="mua.avatar" :size="60" />
                  <span class="staff-name">{{ mua.name }}</span>
                  <span class="staff-desc">{{ mua.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="step === 4" class="step-4">
          <h2>请填写预约信息</h2>
          <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px" class="booking-form">
            <el-form-item label="逝者姓名" prop="deceased_name">
              <el-input v-model="formData.deceased_name" placeholder="请输入逝者姓名" />
            </el-form-item>
            <el-form-item label="家属姓名" prop="family_name">
              <el-input v-model="formData.family_name" placeholder="请输入您的姓名" />
            </el-form-item>
            <el-form-item label="联系电话" prop="family_phone">
              <el-input v-model="formData.family_phone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input 
                v-model="formData.remark" 
                type="textarea" 
                :rows="3"
                placeholder="有其他需求请在此说明" 
              />
            </el-form-item>
          </el-form>

          <div class="order-summary">
            <h3>预约信息确认</h3>
            <div class="summary-item">
              <span class="label">告别厅：</span>
              <span class="value">{{ selectedHall?.name }}</span>
            </div>
            <div class="summary-item">
              <span class="label">时间：</span>
              <span class="value">{{ selectedDate }} {{ selectedSlot?.name }}</span>
            </div>
            <div class="summary-item" v-if="selectedHost">
              <span class="label">司仪：</span>
              <span class="value">{{ selectedHost.name }} ({{ selectedHostPackage?.name }})</span>
            </div>
            <div class="summary-item" v-if="selectedMakeup">
              <span class="label">化妆师：</span>
              <span class="value">{{ selectedMakeup.name }} ({{ selectedMakeupPackage?.name }})</span>
            </div>
            <div class="summary-item total">
              <span class="label">总计：</span>
              <span class="value price">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <el-button v-if="step > 1" @click="prevStep">上一步</el-button>
          <el-button 
            v-if="step < 4" 
            type="primary" 
            @click="nextStep"
            :disabled="!canProceed"
          >
            下一步
          </el-button>
          <el-button 
            v-if="step === 4" 
            type="primary" 
            @click="submitBooking"
            :loading="submitting"
          >
            提交预约
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  getHalls, 
  getTimeSlots, 
  checkAvailability,
  getStaff,
  getPackages,
  createAppointment
} from '@/api'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)

const step = ref(1)
const halls = ref([])
const timeSlots = ref([])
const availableSlots = ref([])
const slotsLoading = ref(false)
const hosts = ref([])
const makeupArtists = ref([])
const hostPackages = ref([])
const makeupPackages = ref([])

const selectedHall = ref(null)
const selectedDate = ref('')
const selectedSlot = ref(null)
const selectedHost = ref(null)
const selectedMakeup = ref(null)
const selectedHostPackage = ref(null)
const selectedMakeupPackage = ref(null)
const submitting = ref(false)

const formData = ref({
  deceased_name: '',
  family_name: '',
  family_phone: '',
  remark: ''
})

const rules = {
  deceased_name: [{ required: true, message: '请输入逝者姓名', trigger: 'blur' }],
  family_name: [{ required: true, message: '请输入家属姓名', trigger: 'blur' }],
  family_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const totalPrice = computed(() => {
  let total = 0
  if (selectedHostPackage.value) total += parseFloat(selectedHostPackage.value.price)
  if (selectedMakeupPackage.value) total += parseFloat(selectedMakeupPackage.value.price)
  return total
})

const canProceed = computed(() => {
  if (step.value === 1) return selectedHall.value
  if (step.value === 2) return selectedDate.value && selectedSlot.value
  if (step.value === 3) return true
  return true
})

const disabledDate = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() < today.getTime()
}

const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 5)
}

onMounted(async () => {
  const [hallsRes, timeSlotsRes, hostPkgRes, makeupPkgRes, hostsRes, makeupRes] = await Promise.all([
    getHalls(),
    getTimeSlots(),
    getPackages('host'),
    getPackages('makeup'),
    getStaff('host'),
    getStaff('makeup')
  ])
  
  if (hallsRes.success) halls.value = hallsRes.data
  if (timeSlotsRes.success) timeSlots.value = timeSlotsRes.data
  if (hostPkgRes.success) hostPackages.value = hostPkgRes.data
  if (makeupPkgRes.success) makeupPackages.value = makeupPkgRes.data
  if (hostsRes.success) hosts.value = hostsRes.data
  if (makeupRes.success) makeupArtists.value = makeupRes.data

  if (route.query.hallId) {
    const hall = halls.value.find(h => h.id == route.query.hallId)
    if (hall) selectedHall.value = hall
  }
})

watch(step, (newStep) => {
  if (newStep === 2 && selectedHall.value && selectedDate.value) {
    loadAvailableSlots()
  }
})

watch(selectedHall, (newHall) => {
  if (step.value === 2 && newHall && selectedDate.value) {
    loadAvailableSlots()
  }
})

const selectHall = (hall) => {
  selectedHall.value = hall
}

const loadAvailableSlots = async () => {
  selectedSlot.value = null
  if (!selectedHall.value || !selectedDate.value) {
    availableSlots.value = []
    return
  }
  
  slotsLoading.value = true
  try {
    const res = await checkAvailability(selectedHall.value.id, selectedDate.value)
    if (res.success) {
      availableSlots.value = res.data
    }
  } finally {
    slotsLoading.value = false
  }
}

const selectSlot = (slot) => {
  if (!slot.available) return
  selectedSlot.value = slot
}

const selectHostPackage = (pkg) => {
  selectedHostPackage.value = pkg
  if (!selectedHost.value && hosts.value.length > 0) {
    selectedHost.value = hosts.value[0]
  }
}

const selectMakeupPackage = (pkg) => {
  selectedMakeupPackage.value = pkg
  if (!selectedMakeup.value && makeupArtists.value.length > 0) {
    selectedMakeup.value = makeupArtists.value[0]
  }
}

const selectHost = (host) => {
  selectedHost.value = host
}

const selectMakeup = (mua) => {
  selectedMakeup.value = mua
}

const nextStep = () => {
  if (step.value === 2 && !selectedSlot.value) {
    ElMessage.warning('请选择时间段')
    return
  }
  step.value++
}

const prevStep = () => {
  step.value--
}

const submitBooking = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await createAppointment({
      hall_id: selectedHall.value.id,
      time_slot_id: selectedSlot.value.id,
      appointment_date: selectedDate.value,
      deceased_name: formData.value.deceased_name,
      family_name: formData.value.family_name,
      family_phone: formData.value.family_phone,
      host_id: selectedHost.value?.id,
      makeup_id: selectedMakeup.value?.id,
      host_package_id: selectedHostPackage.value?.id,
      makeup_package_id: selectedMakeupPackage.value?.id,
      remark: formData.value.remark
    })

    if (res.success) {
      ElMessage.success('预约成功！')
      router.push(`/booking/success/${res.data.id}`)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.booking-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 20px;
  margin: 0;
}

.booking-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.steps {
  margin-bottom: 40px;
}

.step-content {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  min-height: 400px;
}

.step-content h2 {
  font-size: 20px;
  margin-bottom: 24px;
  color: #2c3e50;
}

.hall-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.hall-item {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.hall-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.hall-item.active {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

.hall-item img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.hall-info {
  padding: 16px;
}

.hall-info h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.hall-info p {
  color: #909399;
  font-size: 14px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hall-info .desc {
  color: #606266;
  margin-top: 8px;
}

.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
}

.date-selector {
  margin-bottom: 24px;
}

.time-slots h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #606266;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.slot-item {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.slot-item:hover:not(.disabled) {
  border-color: #409eff;
}

.slot-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.slot-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slot-time {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.slot-name {
  color: #606266;
  margin-bottom: 12px;
}

.service-section {
  margin-bottom: 32px;
}

.service-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #2c3e50;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.package-item {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.package-item:hover {
  border-color: #409eff;
}

.package-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.package-item h4 {
  font-size: 16px;
  margin-bottom: 8px;
}

.package-item .price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: 600;
  margin-bottom: 8px;
}

.package-item .desc {
  color: #606266;
  font-size: 13px;
  margin-bottom: 12px;
}

.package-item .includes {
  list-style: none;
  padding: 0;
}

.package-item .includes li {
  font-size: 13px;
  color: #67c23a;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.staff-select h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: #606266;
}

.staff-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.staff-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
}

.staff-item:hover {
  border-color: #409eff;
}

.staff-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.staff-name {
  font-weight: 600;
}

.staff-desc {
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.booking-form {
  max-width: 500px;
  margin-bottom: 32px;
}

.order-summary {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
}

.order-summary h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #2c3e50;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-item .label {
  color: #909399;
}

.summary-item.total {
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
  margin-top: 12px;
}

.summary-item.total .value {
  font-size: 20px;
  font-weight: 600;
}

.summary-item.total .price {
  color: #f56c6c;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.loading {
  padding: 40px 0;
}
</style>
