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

      <el-table-column label="标题" width="200">
        <template slot-scope="scope">
          {{ scope.row.videoTitle }}
        </template>
      </el-table-column>
      <el-table-column label="作者" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.videoAuthor }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频简介" align="center">
        <template slot-scope="scope">
          {{ scope.row.videoProfile | ellipsis }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.videoStatus | statusFilter">{{ scope.row.videoStatus | tans}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" 
          @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.videoStatus =='draft'" size="mini" type="success"
          @click="toWait(row)" >
            提审
          </el-button>
          <el-button v-if="row.videoStatus!='deleted'" size="mini" type="danger"
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
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.videoTitle" />
        </el-form-item>
         <el-form-item label="简介" prop="title">
          <el-input v-model="temp.videoProfile" />
        </el-form-item>
        <el-form-item label="日期" prop="timestamp">
          <el-date-picker v-model="temp.videoDate" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" format="yyyy-MM-dd HH:mm:ss"  placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="temp.videoAuthor"  style="width: 200px;"/>
        </el-form-item>

        <el-form-item label="封面图" prop="封面图" style="margin-bottom: 30px;">
            <el-upload
                class="avatar-uploader"
                action="http://localhost:8000/picture/OSSupload"
                :show-file-list="true"
                :on-success="handleAvatarSuccess"
                :on-remove="handleRemove"
                :before-upload="beforeAvatarUpload">
                <img v-if="temp.videoPic" :src="temp.videoPic" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
        </el-form-item>

        <el-form-item label="视频上传" prop="Video">
  <!-- action必选参数, 上传的地址 -->
            <el-upload class="avatar-uploader el-upload--text" 
            action="http://localhost:8000/picture/OSSupload"
            :show-file-list="false" 
            :on-success="handleVideoSuccess" 
            :before-upload="beforeUploadVideo" 
            :on-progress="uploadVideoProcess">
                <video v-if="temp.videoUrl !='' && videoFlag == false" :src="temp.videoUrl" class="avatar" controls="controls">您的浏览器不支持视频播放</video>
                <i v-else-if="temp.videoUrl =='' && videoFlag == false" class="el-icon-plus avatar-uploader-icon"></i>
                <el-progress v-if="videoFlag == true" type="circle" :percentage="videoUploadPercent" style="margin-top:30px;"></el-progress>
            </el-upload>
            <P class="text">请保证视频格式正确，且不超过10M</P>
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
import { getVideoList,updateVideo, createVideo} from '@/api/admin/video'
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
        videoTitle:'',
        videoProfile:'',
        videoUrl: '',//上传后返回
        videoPic: '',//封面图，上传后返回
        videoDate: new Date(),
        videoStatus:'draft',
        videoAuthor:'',
      },

    //   视频上传相关
    videoFlag:'',
    videoUploadPercent:0,

      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        videoTitle:[{ required: true, message: '标题必填', trigger: 'blur' }],
        videoProfile:'',
        videoUrl:[{ type: 'date', required: true, message: '视频内容必填', trigger: 'change' }],//上传后返回
        videoPic:'',//封面图，上传后返回
        videoDate: [{ type: 'date', required: true, message: '视频发布日期必填', trigger: 'change' }],
        videoAuthor:'',
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
      getVideoList(this.listQuery).then(response => {
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
      this.$router.push('/client/video/create')
    },
    edit(id){
      this.$router.push('/client/video/edit/'+id)
    },
    toWait(video){
      video.videoStatus = 'wait'
      updateVideo(video).then(response =>{
           this.$notify({
          message: '提审成功，待审核',
          type: 'success'
        });
        this.getList();
      })
    },
    toDelete(video){
      video.videoStatus = 'deleted'
      updateVideo(video).then(response =>{
           this.$notify({
          message: '删除成功',
          type: 'success'
        });
        this.getList();
      })
    },



   resetTemp() {
      this.temp = {
        videoTitle:'',
        videoProfile:'',
        videoUrl:'',//上传后返回
        videoPic: '',//封面图，上传后返回
        videoDate:'',
        videoStatus:'draft',
        videoAuthor:'',
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
          createVideo(this.temp).then(() => {
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
          updateVideo(tempData).then(() => {
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
        this.temp.videoPic = res.data.url
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
        let file = this.temp.videoPic.split('?')[0].split('/')
        let picName = file[file.length - 1]
        console.log(picName);
         deletePic(picName)
        this.temp.videoPic = ''
    },


    // 视频上传
    beforeUploadVideo(file) {
        const isLt10M = file.size / 1024 / 1024  < 20;
        if (['video/mp4', 'video/ogg', 'video/flv','video/avi','video/wmv','video/rmvb'].indexOf(file.type) == -1) {
            this.$message.error('请上传正确的视频格式');
            return false;
        }
        if (!isLt10M) {
            this.$message.error('上传视频大小不能超过20MB哦!');
            return false;
        }
    },
    handleVideoSuccess(res, file) {                               //获取上传图片地址
        this.videoFlag = false;
        this.videoUploadPercent = 0;
        console.log(res);
        if(res.code == 200){
            this.temp.videoUrl = res.data.url;
        }else{
            this.$message.error('视频上传失败，请重新上传！');
        }
    },
    uploadVideoProcess (event, file, fileList) {
        console.log(event.percent, file, fileList)
        this.videoFlag = true
        // this.videoUploadPercent = file.percentage.toFixed(0)
        // this.videoUploadPercent = event.percent.toFixed(0)
        this.videoUploadPercent = Math.floor(event.percent)
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
