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
      @click="goCreate">
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
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="作者" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文章内容" align="center">
        <template slot-scope="scope">
          {{ scope.row.article | ellipsis }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status | tans}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" 
          @click="edit(row.id)">
            编辑
          </el-button>
          <el-button v-if="row.status =='draft'" size="mini" type="success"
          @click="toWait(row)" >
            提审
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger"
          @click="toDelete(row)" >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

     <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />


  </div>
</template>

<script>
import { getArticleList,updateArticle} from '@/api/admin/article'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        reviewed: 'success',
        draft: 'info',
        deleted: 'danger',
        wait: 'gray'
      }
      return statusMap[status]
    },
    tans(word){
      if (word ==  'reviewed') return '已审阅'
      else if (word ==  'draft') return '草稿'
     else if(word== 'deleted') return '删除'
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
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
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
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
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
      getArticleList(this.listQuery).then(response => {
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
      this.$router.push('/client/article/create')
    },
    edit(id){
      this.$router.push('/client/article/edit/'+id)
    },
    toWait(article){
      article.status = 'wait'
      updateArticle(article).then(response =>{
           this.$message({
          message: '提审成功，待审核',
          type: 'success'
        });
        this.getList();
      })
    },
    toDelete(article){
      article.status = 'deleted'
      updateArticle(article).then(response =>{
           this.$message({
          message: '删除成功',
          type: 'success'
        });
        this.getList();
      })
    },
  }
}

</script>
