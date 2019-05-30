const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        navigation: [{
                typeid: 0,
                title: '日常任务'
            },
            {
                typeid: 1,
                title: '主线任务'
            },
            {
                typeid: 2,
                title: '支线任务'
            }
        ],
        currentbar: 0,
        reward: [2, 4, 6, 8],
        taskData: [],
        checkedShow: true,
        animationData: {},
        today: '',
        taskcountDis: false,     // 次数input禁用控制变量
        datepickerDis: false,    // 日期选择器禁用控制器

        addTaskData: {
            taskname: '',
            taskcount: '',
            indexType: 0,
            type: ['请选择任务类型', '日常任务', '主线任务', '支线任务'],
            indexDiff: 0,
            difficulty: ['请选择任务难度', '简单', '普通', '中等', '困难'],
            due: '',
            checkcount: 0,
            lastwork: null,

            status: {
                finished: false,
                expired: false,
                today: false,
            }


        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            today: (new Date()).Format('yyyy-MM-dd'),
            userData: wx.getStorageSync('userData'),
            taskData: wx.getStorageSync('taskData')
        })
        this.getExp()
    },
    onShow: function() {
        const animation = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
        })

        this.animation = animation
        this.getExp()
    },
    // 数据监听器
    watch: {
        currentbar: function(newVal) {
            switch (newVal) {
                case 0:
                    this.setData({
                        reward: [2, 4, 6, 8]
                    });
                    break // 日常任务
                case 1:
                    this.setData({
                        reward: [2, 4, 6, 8]
                    });
                    break // 主线任务
                case 2:
                    this.setData({
                        reward: [1, 3, 5, 7]
                    });
                    break // 支线任务
            }
        }
    },
    // 计算属性
    computed: {
        expiredNum: {
            require: ['taskData', 'currentbar'],
            fn({
                taskData,
                currentbar
            }) {
                var result = 0
                taskData.forEach(item => {
                    if (item.typeid === currentbar && item.status.expired) {
                        result++
                    }
                })
                return result
            }
        },
        checkedNum: {
            require: ['taskData', 'currentbar'],
            fn({
                taskData,
                currentbar
            }) {
                var result = 0
                taskData.forEach(item => {
                    if (item.typeid === currentbar && item.status.finished) {
                        result++
                    }
                })
                return result
            }
        }
    },
    checkedShowChange: function() {
        this.setData({
            checkedShow: !this.data.checkedShow
        })
    },
    // 切换tab事件
    changeTab: function(e) {
        var typeid = e.currentTarget.dataset.typeid
        this.setData({
            currentbar: typeid
        })
    },
    // 复选框选中事件
    checkboxChange: function(e) {
        var taskindex = e.currentTarget.dataset.taskindex
        var user = this.data.userData
        var task = this.data.taskData
        var item = task[taskindex]
    
        // 处理任务次数逻辑
        item.checkcount++
        item.status.today = true
        item.status.checked = true
        if (item.checkcount === item.count && item.count !== 0) {
            item.status.finished = true
        }
        task[taskindex] = item
    
        // 处理任务奖励逻辑
        var money = 0
        money = this.data.reward[item.difficulty]
        user.money += money

        // 增加经验
        user.exp += money;
        this.getExp()
        
    
        // 处理'已完成'列表数量
        var checkedNum = this.data.checkedNum
        if (item.status.finished) {
            checkedNum++
        }

        // 如果已过期的任务完成后，'已过期'的数量需要修改
        var expiredNum = this.data.expiredNum
        if (item.status.expired && item.status.finished) {
            item.status.expired = false
            expiredNum--
        }
    
        // 修改数据，渲染列表
        this.setData({
            userData: user,
            taskData: task,
            checkedNum: checkedNum,
            expiredNum: expiredNum
        })
    
        // 如果日常未完成则取消复选框勾选
        if (item.checkcount <= item.count || item.count === 0) {
            setTimeout(() => {
                item.status.checked = false
                task[taskindex] = item
                this.setData({
                taskData: task
                })
                // 修改对应Storage
                wx.setStorageSync('taskData', this.data.taskData)
                wx.setStorageSync('userData', this.data.userData)
            }, 700);
        }

        // 添加收入记录
        var option = {
            optid: 0,
            type: 0,
            key: item._id,
            title: item.title,
            time: new Date().Format('yyyy-MM-dd hh:mm:ss'),
            money: this.data.reward[item.typeid]
        }
        var recordData = wx.getStorageSync('recordData')
        if (recordData) {
            option.optid = recordData.length
            recordData.push(option)
        }
        else {
            recordData = []
            recordData.push(option)
        }
        wx.setStorageSync('recordData', recordData)
    },

    clickButton() {
        var data = {
            taskname: '',
            taskcount: '',
            indexType: 0,
            type: ['请选择任务类型', '日常任务', '主线任务', '支线任务'],
            indexDiff: 0,
            difficulty: ['请选择任务难度', '简单', '普通', '中等', '困难'],
            due: new Date().Format('yyyy-MM-dd'),
            checkcount: 0,
            lastwork: null,

            status: {
                finished: false,
                expired: false,
                today: false,
            }
        }

        this.setData({
            addTaskData: data,
            showModal: true,
        })
    },

    close_mask: function() {
        this.setData({
            showModal: false
        })
    },

    getTaskName(e) {
        var val = e.detail.value
        this.setData({
            'addTaskData.taskname': val
        })

    },

    getTaskCount(e) {
        var val = e.detail.value
        this.setData({
            'addTaskData.taskcount': val
        })
    },

    bindPickerChangeType(e) {
        var str = 'addTaskData.indexType'
        // 如果是日常任务，开启taskcount输入框，禁用时间选择器
        if (Number(e.detail.value) === 1) {
            this.setData({
                "addTaskData.taskcount": '',
                "addTaskData.due": '无',
                taskcountDis: false,
                datepickerDis: true,
            })
        }
        // 不是日常任务，禁用taskcount输入框，开启时间选择器，默认设count为1
        else if (Number(e.detail.value === 2 || Number(e.detail.value) === 3)) {
            this.setData({
                "addTaskData.taskcount": 1,
                "addTaskData.due": new Date().Format('yyyy-MM-dd'),
                taskcountDis: true,
                datepickerDis: false
            })
        }
        this.setData({
            [str]: e.detail.value
        })

    },

    bindPickerChangeDiff(e) {
        var str = 'addTaskData.indexDiff'
        this.setData({
            [str]: e.detail.value
        })
    },

    bindDateChange(e) {
        var str = 'addTaskData.due'
        this.setData({
            [str]: e.detail.value
        })
    },

    addTask() {
        var data = this.data.addTaskData
        console.log(data)


        // 错误检测
        if (data.taskname.length == 0) {
            wx.showToast({
                title: '请输入任务名',
                duration: 2000,
                mask: true,
                icon: 'none'
            })
            return
        } else if (data.indexType === 0) {
            wx.showToast({
                title: '请选择任务类型',
                duration: 2000,
                mask: true,
                icon: 'none'
            })
            return
        } else if (data.indexDiff === 0) {
            wx.showToast({
                title: '请选择任务难度',
                duration: 2000,
                mask: true,
                icon: 'none'
            })
            return
        }

        console.log('taskcount', data.taskcount)

        if (data.taskcount.length === 0) {
            // indexType为1才是‘日常任务’，并且data.indexType的类型是string
            if (Number(data.indexType) === 1) {
                data.taskcount = 0;
            } else if (Number(data.indexType) === 2 || Number(data.indexType) === 3) {
                data.taskcount = 1;
            }

        } else {
            data.taskcount = Number(data.taskcount);
            let re = /^[1-9]+[0-9]*]*$/
            if (!re.test(String(data.taskcount))) {
                wx.showToast({
                    title: '次数必须为正整数！',
                    duration: 2000,
                    mask: true,
                    icon: 'none'
                })
                return
            }
        }

        if (data.due.length == 0) {
            data.due = null;
        }

        // 把日常任务的due字段置为null
        if (data.typeid === 0) {
            data.due = null
        }

        // 构造新任务对象
        var newtask = {
          title: data.taskname,
          typeid: data.indexType - 1,
          difficulty: data.indexDiff - 1,
          due: data.due,
          count: data.taskcount,
          checkcount: 0,

          lastwork: null,
          status: {
              finished: false,
              expired: false,
              today: false,
          }
        }

        const db = wx.cloud.database()
        db.collection('taskData').add({
            data: {

                title: data.taskname,
                typeid: data.indexType - 1,
                difficulty: data.indexDiff - 1,
                due: data.due,
                count: data.taskcount,
                checkcount: 0,

                lastwork: null,
                status: {
                    finished: false,
                    expired: false,
                    today: false,
                }

            },
            success: res => {
                this.setData({
                    taskData: this.data.taskData,
                    showModal: false
                })

                // 在返回结果中会包含新创建的记录的 _id
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
                wx.showToast({
                    title: '新增任务成功',
                })
                
                // 新任务对象加上_id字段
                newtask._id = res._id
                var taskData = this.data.taskData
                taskData.push(newtask)

                // 渲染视图层
                this.setData({
                  taskData: taskData,
                  showModal: false
                })
                wx.setStorageSync('taskData', this.data.taskData)
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '新增任务失败'
                })
                console.error('[数据库] [新增记录] 失败：', err)
                return
            }
        })
    }, 
    getExp() {
        var level = this.data.userData.level
        var myexp = this.data.userData.exp
        var exp = app.globalData.levelExp[level + 1]

        if (myexp > exp) {
            myexp -= exp;
            level++;
        }

        this.data.userData.level = level
        this.data.userData.exp = myexp

        this.setData({
            percent: ((myexp / exp) * 100),
            userData: this.data.userData
        })
    }
})