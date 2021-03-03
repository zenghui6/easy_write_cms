<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keywords" placeholder="标题或内容" style="width: 200px;" class="filter-item" @keyup.enter.native="getList"/>
      
      <el-select v-model="listQuery.level" placeholder="按条件查找" clearable class="filter-item" style="width: 130px">
        <el-option value="" label="全部"/>
        <el-option value="staff" label="普通员工"/>
         <el-option value="admin" label="管理员"/>
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

      <el-table-column label="员工名" width="200">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>

       <el-table-column label="昵称" align="center">
        <template slot-scope="scope">
          {{ scope.row.nickname | ellipsis }}
        </template>
       </el-table-column>

       <el-table-column class-name="status-col" label="等级" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.level | statusFilter">{{ scope.row.level | tans}}</el-tag>
        </template>
      </el-table-column>
       <el-table-column label="是否已删除" align="center">
        <template slot-scope="scope">
          {{ scope.row.isDel }}
        </template>
       </el-table-column>
  

      <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" 
          @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.level == 'staff'" size="mini" type="success"
          @click="toAdmin(row)" >
            提权
          </el-button>
          <el-button v-else size="mini" type="warning"
          @click="toStaff(row)" >
            降权
          </el-button>
          <el-button v-if="!row.isDel" size="mini" type="danger"
          @click="toDelete(row)" >
            删除
          </el-button>
          <el-button v-if="row.isDel" size="mini" type="info"
          @click="toReset(row)" >
            还原
          </el-button>
        </template>
      </el-table-column>
    </el-table>

     <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />



      <!-- 浮空栏 -->
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:40px;">
        <el-form-item label="员工名" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>

        <!-- 饿了么的表单验证是根据 prop 来对应的 -->
        <el-form-item label="昵称" prop="nickName" style="margin-bottom: 30px;">
          <el-input v-model="temp.nickName" />
        </el-form-item>
    
        <el-form-item label="密码" prop="pass">
            <el-input
                :type="passwordType"
                ref="password"
                v-model="temp.pass"
                placeholder="Password"
                name="password"
                tabindex="2"
                auto-complete="on"
                />
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
import { getAccountList,updateAccount, createAccount} from '@/api/admin/admin'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        staff: 'success',
        admin: 'danger',
      }
      return statusMap[status]
    },
    tans(word){
      if (word ==  'staff') return '普通员工'
     else return '管理员'

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
        "level": "",
        "keywords":""
      },
      listLoading: true,

      temp: {
        name:'',
        nickName: '',//封面图，上传后返回Url
        pass:'',
        // level:'',
      },
       passwordType: 'password',


      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name:[{ required: true, message: '标题必填', trigger: 'blur' }],
        nickName:[{ required: true, message: '昵称必填', trigger: 'blur' }],
        pass:[
            { required: true, message: '密码必填', trigger: 'blur' },
            { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        // level:[{ required: true, message: '等级必', trigger: 'blur' }],
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
      getAccountList(this.listQuery).then(response => {
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
    toAdmin(account){
      account.level = 'admin'
      updateAccount(account).then(response =>{
           this.$notify({
          message: '提权成功',
          type: 'success'
        });
        this.getList();
      })
    },
    toStaff(account){
      account.level = 'staff'
      updateAccount(account).then(response =>{
           this.$notify({
          message: '降权成功',
          type: 'success'
        });
        this.getList();
      })
    },
    toDelete(account){
      account.isDel = 'true'
      updateAccount(account).then(response =>{
           this.$notify({
          message: '删除成功',
          type: 'success'
        });
        this.getList();
      })
    },
    toReset(account){
        account.isDel = 'false'
      updateAccount(account).then(response =>{
           this.$notify({
          message: '账号还原成功',
          type: 'success'
        });
        this.getList();
      })
    },


    showPwd() {
        if (this.passwordType === 'password') {
            this.passwordType = ''
        } else {
            this.passwordType = 'password'
        }
        this.$nextTick(() => {
            this.$refs.password.focus()
        })
        },
   resetTemp() {
      this.temp = {
        name:'',
        nickName: '',//封面图，上传后返回Url
        level:'staff',
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
          createAccount(this.temp).then(() => {
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
          updateAccount(tempData).then(() => {
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
  
  

  .svg-container {
    padding: 6px 5px 6px 15px;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }


  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    cursor: pointer;
    user-select: none;
  }
</style>
