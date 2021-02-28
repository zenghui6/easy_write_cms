<template>
  <div class="columns">
    <div class="column is-full">
      <el-card
        class="box-card"
        shadow="never"
      >
      
        <div>
          <el-form
            ref="ruleForm"
            :model="ruleForm"
            :rules="rules"
            class="demo-ruleForm"
          >
          <el-row>
              <el-col :span="8">
                 <el-form-item label-width="60px" label="标题:" class="postInfo-container-item" >
              <el-input
                v-model="ruleForm.title"
                placeholder="输入文章标题"
              />
            </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item prop="title" label-width="90px" label="作者:" class="postInfo-container-item">
            <el-input
                placeholder="请输入作者"
                v-model="ruleForm.author"
                clearable>
            </el-input>
            </el-form-item>
              </el-col>

              <el-col :span="10">
                  <el-form-item label-width="120px" label="发布时间:" class="postInfo-container-item">
                    <el-date-picker v-model="ruleForm.createAt" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" format="yyyy-MM-dd HH:mm:ss" placeholder="Select date and time" />
                  </el-form-item>
                </el-col>
          </el-row>
           

            <!--Markdown-->
            <div id="vditor" >
              {{ruleForm.article}}
            </div>


            <br>
            <el-form-item>
              <el-button
                type="primary"
                @click="submitForm('ruleForm')"
              >草稿
              </el-button>
               <el-button
                type="success"
                @click="submitForm('ruleForm')"
              >提审
              </el-button>
              <el-button @click="resetForm('ruleForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { createArticle ,fetchArticle} from '@/api/admin/article'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
export default {
  name: 'ArticleDetail',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      contentEditor: {},
      ruleForm: {
        id:'',
        title: '', // 标题
        author: '',
        pic:'111',
        createAt: undefined,
        article: '', // 内容

        tempRoute: {}
      },
      rules: {
        title: [
          { required: true, message: '请输入标题名称', trigger: 'blur' },
          {
            min: 1,
            max: 25,
            message: '长度在 1 到 25 个字符',
            trigger: 'blur'
          }
        ],
        author: [
          { required: true, message: '请输入作者', trigger: 'blur' },
          {
            min: 1,
            max: 25,
            message: '长度在 1 到 25 个字符',
            trigger: 'blur'
          },
        ],
         createAt: [
          { required: true, message: '请输入日期', trigger: 'blur' },
    
      ]
      }
    }
  },
  computed:{
  
  },
 
  created(){
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
      console.log(this.ruleForm.article);
    }

    this.tempRoute = Object.assign({}, this.$route)
  },
  mounted() {
    console.log("mounted");
    this.contentEditor = new Vditor('vditor', {
      height: 500,
      placeholder: '此处为话题内容……',
      theme: 'classic',
      counter: {
        enable: true,
        type: 'markdown'
      },
      preview: {
        delay: 0,
        hljs: {
          style: 'monokai',
          lineNumber: true
        }
      },
      tab: '\t',
      typewriterMode: true,
      toolbarConfig: {
        pin: true
      },
      cache: {
        enable: false
      },
      after:() => {
        let vm = this
        this.contentEditor.setValue(this.ruleForm.article)
      },
      mode: 'sv'
    })
  },
  methods: {
     fetchData(id) {
      fetchArticle(id).then(response => {
        this.ruleForm = response.data
        this.contentEditor.setValue(response.data.article)

        // 设置页面头
        this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setPageTitle() {
      const title = 'Edit Article'
      document.title = `${title} - ${this.ruleForm.id}`
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (
            this.contentEditor.getValue().length === 1 ||
            this.contentEditor.getValue() == null ||
            this.contentEditor.getValue() === ''
          ) {
            alert('话题内容不可为空')
            return false
          }
     
          this.ruleForm.article = this.contentEditor.getValue()
          createArticle(this.ruleForm).then((response) => {
            const { data } = response
            setTimeout(() => {
                 this.$message({
                message: "保存成功",
                type: "success",
                duration: 2000,
              });
              this.$router.push({
               path: this.redirect || '/client/article',
              })
            }, 800)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.contentEditor.setValue('')
      this.ruleForm.tags = ''
      this.ruleForm.author = ''
      this.ruleForm.createAt = undefined
    }
  }
}
</script>

<style>
</style>