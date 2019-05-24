const desireData = require('../../data/desireData.js')
const userData = require('../../data/userData.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    price: [10, 20, 30, 40]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      desireData: desireData.desireData,
      userData: userData.userData
    })
  },
  buyDesire: function (e) {
    var desireid = e.currentTarget.dataset.desireid
    var self = this
    wx.showModal({
      title: '确认',
      content: '确定使用￥' + self.data.price[self.data.desireData[desireid].grade] + ' 购买 \"' + self.data.desireData[desireid].title + '\" 这个欲望吗？',
      success(res) {
        if (res.confirm) {
          self.data.desireData[desireid].get = !self.data.desireData[desireid].get
          self.setData({
            desireData: self.data.desireData
          })
        }
      }
    })
  }
})