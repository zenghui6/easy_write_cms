<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keywords" placeholder="标题或内容" style="width: 200px;" class="filter-item" @keyup.enter.native="getList"/>
      
      <el-select v-model="listQuery.status" placeholder="按条件查找" clearable class="filter-item" style="width: 130px">
        <el-option value="" label="全部"/>
        <el-option value="draft" label="草稿"/>
         <el-option value="wait" label="待审核"/>
        <el-option value="reviewed" label="已审核"/>
        <el-option value="deleted" label="删除"/>
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
      @click="handleCreate">
        添加
      </el-button>

    </div>
    <br>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @sort-change="sortChange"
    >
      <el-table-column align="center" prop="update_at" label="更新时间" width="200"
              sortable="custom" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.updateAt }}</span>
        </template>
      </el-table-column>

      <el-table-column label="轮播图名称" width="200">
        <template slot-scope="scope">
          {{ scope.row.swiperName }}
        </template>
      </el-table-column>

       <el-table-column label="轮播图地址" align="center">
        <template slot-scope="scope">
          {{ scope.row.swiperPic | ellipsis }}
        </template>
       </el-table-column>

       <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.swiperStatus | statusFilter">{{ scope.row.swiperStatus | tans}}</el-tag>
        </template>
      </el-table-column>
  

      <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" 
          @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.swiperStatus =='draft'" size="mini" type="success"
          @click="toWait(row)" >
            提审
          </el-button>
          <el-button v-if="row.swiperStatus!='deleted'" size="mini" type="danger"
          @click="toDelete(row)" >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

     <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />



      <!-- 浮空栏 -->
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:40px;">
        <el-form-item label="名称" prop="title">
          <el-input v-model="temp.swiperName" />
        </el-form-item>
        <el-form-item prop="封面图" style="margin-bottom: 30px;">
            <el-upload
                class="avatar-uploader"
                action="http://localhost:8000/picture/OSSupload"
                :show-file-list="true"
                :on-success="handleAvatarSuccess"
                :on-remove="handleRemove"
                :before-upload="beforeAvatarUpload">
                <img v-if="temp.swiperPic" :src="temp.swiperPic" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
        </el-form-item>

     
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { getSwiperList,updateSwiper, createSwiper} from '@/api/admin/swiper'
import {deletePic} from '@/api/admin/picture'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        reviewed: 'success',
        draft: 'info',
        deleted: 'danger',
        wait: 'gray',
        published: 'warning'
      }
      return statusMap[status]
    },
  tans(word){
      if (word ==  'reviewed') return '已审阅'
      else if (word ==  'draft') return '草稿'
     else if(word== 'deleted') return '删除'
     else if(word == 'published') return '已上架'
     else return '待审'
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listQuery: {
        "page" : 1,
        "size" : 10,
        "direction": "DESC",
        "status": "",
        "keywords":""
      },
      listLoading: true,

      temp: {
        swiperName:'',
        swiperPic: '',//封面图，上传后返回Url
        swiperStatus:'draft',
      },


      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        swiperTitle:[{ required: true, message: '标题必填', trigger: 'blur' }],
        swiperPic:[{ type: 'date', required: true, message: '图片内容必填', trigger: 'change' }],//封面图，上传后返回
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getSwiperList(this.listQuery).then(response => {
         const { data } = response
        this.list = data.data
        this.total = response.data.total
        console.log(this.list);
        this.listLoading = false
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'update_at') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.direction = 'ASC'
      } else {
        this.listQuery.direction = 'DESC'
      }
      this.getList()
    },
    getSortClass: function(key) {
      const sort = this.listQuery.direction
      return sort === `+${key}` ? 'ASC' : 'DESC'
    },
    goCreate(){
      this.$router.push('/client/swiper/create')
    },
    edit(id){
      this.$router.push('/client/swiper/edit/'+id)
    },
    toWait(swiper){
      swiper.swiperStatus = 'wait'
      updateSwiper(swiper).then(response =>{
           this.$notify({
          message: '提审成功，待审核',
          type: 'success'
        });
        this.getList();
      })
    },
    toDelete(swiper){
      swiper.swiperStatus = 'deleted'
      updateSwiper(swiper).then(response =>{
           this.$notify({
          message: '删除成功',
          type: 'success'
        });
        this.getList();
      })
    },



   resetTemp() {
      this.temp = {
         swiperName:'',
        swiperPic: '',//封面图，上传后返回Url
        swiperStatus:'draft',
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createSwiper(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateSwiper(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },

    // 图片上传
    handleAvatarSuccess(res, file) {
        this.temp.swiperPic = res.data.url
      },
    beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      },
    // 移除图片
    handleRemove() {
        let file = this.temp.swiperPic.split('?')[0].split('/')
        let picName = file[file.length - 1]
        console.log(picName);
         deletePic(picName)
        this.temp.swiperPic = ''
    },

  }
}

</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
