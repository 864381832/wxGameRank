cc.Class({
    extends: cc.Component,
    name: "RankingView",
    properties: {
        groupFriendButton: cc.Node,
        friendButton: cc.Node,
        gameOverButton: cc.Node,
        rankingScrollView: cc.Sprite,//显示排行榜
    },
    onLoad() {
    },
    start() {
        if (CC_WECHATGAME) {
            window.wx.showShareMenu({withShareTicket: true});//设置分享按钮，方便获取群id展示群排行榜
            window.wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: "x1"
            });
        }
    },
    friendButtonFunc(event) {
        if (CC_WECHATGAME) {
            // 发消息给子域
            window.wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: "x1"
            });
        } else {
            cc.log("获取好友排行榜数据。x1");
        }
    },

    groupFriendButtonFunc: function (event) {
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                success: (res) => {
                    if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                        window.wx.postMessage({
                            messageType: 5,
                            MAIN_MENU_NUM: "x1",
                            shareTicket: res.shareTickets[0]
                        });
                    }
                }
            });
        } else {
            cc.log("获取群排行榜数据。x1");
        }
    },

    gameOverButtonFunc: function (event) {
        if (CC_WECHATGAME) {
            window.wx.postMessage({// 发消息给子域
                messageType: 4,
                MAIN_MENU_NUM: "x1"
            });
        } else {
            cc.log("获取横向展示排行榜数据。x1");
        }
    },

    submitScoreButtonFunc(){
        let score = 123;
        if (CC_WECHATGAME) {
            window.wx.postMessage({
                messageType: 3,
                MAIN_MENU_NUM: "x1",
                score: score,
            });
        } else {
            cc.log("提交得分: x1 : " + score)
        }
    },
});
