<template>
  <div class="reviews-page">
    <el-card>
      <el-table :data="reviews" v-loading="loading" stripe>
        <el-table-column prop="appointment_no" label="预约编号" width="140" />
        <el-table-column prop="hall_name" label="告别厅" width="100" />
        <el-table-column prop="deceased_name" label="逝者姓名" width="100" />
        <el-table-column prop="family_name" label="家属姓名" width="100" />
        <el-table-column label="评分" width="180">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled :size="16" />
            <span style="margin-left: 8px; color: #f56c6c;">{{ row.rating }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="评价内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="回复" min-width="150">
          <template #default="{ row }">
            <span v-if="row.reply">{{ row.reply }}</span>
            <span v-else style="color: #9ca3af;">暂无回复</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="评价时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadReviews"
          @current-change="loadReviews"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="评价详情" width="500px">
      <div v-if="currentReview" class="detail-content">
        <div class="review-header">
          <el-rate v-model="currentReview.rating" disabled :size="24" />
          <span class="rating-text">{{ currentReview.rating }} 分</span>
        </div>

        <div class="review-info">
          <p><strong>预约编号：</strong>{{ currentReview.appointment_no }}</p>
          <p><strong>告别厅：</strong>{{ currentReview.hall_name }}</p>
          <p><strong>逝者姓名：</strong>{{ currentReview.deceased_name }}</p>
          <p><strong>家属姓名：</strong>{{ currentReview.family_name }}</p>
          <p><strong>评价时间：</strong>{{ currentReview.created_at }}</p>
        </div>

        <div class="review-comment">
          <h4>评价内容</h4>
          <p>{{ currentReview.comment || '暂无评价内容' }}</p>
        </div>

        <div class="review-reply">
          <h4>管理员回复</h4>
          <div v-if="currentReview.reply" class="reply-content">
            {{ currentReview.reply }}
          </div>
          <el-input
            v-else
            v-model="replyText"
            type="textarea"
            :rows="3"
            placeholder="请输入回复内容..."
          />
        </div>

        <div class="detail-actions">
          <el-button v-if="!currentReview.reply" type="primary" @click="submitReply">
            提交回复
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getReviews } from '@/api'

const loading = ref(false)
const reviews = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const currentReview = ref(null)
const replyText = ref('')

const loadReviews = async () => {
  loading.value = true
  try {
    const res = await getReviews({
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.success) {
      reviews.value = res.data
      total.value = res.total
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReviews()
})

const viewDetail = (row) => {
  currentReview.value = { ...row }
  replyText.value = ''
  detailVisible.value = true
}

const submitReply = () => {
  if (!replyText.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  ElMessage.success('回复提交成功（演示功能）')
  currentReview.value.reply = replyText.value
  detailVisible.value = false
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.detail-content {
  padding: 10px 0;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.rating-text {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}

.review-info {
  margin-bottom: 20px;
}

.review-info p {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.review-comment, .review-reply {
  margin-bottom: 20px;
}

.review-comment h4, .review-reply h4 {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.review-comment p {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 6px;
  line-height: 1.6;
  color: #606266;
}

.reply-content {
  background: #ecf5ff;
  padding: 12px 16px;
  border-radius: 6px;
  line-height: 1.6;
  color: #606266;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
</style>
