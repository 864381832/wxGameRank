cc.Class({
    extends: cc.Component,
    name: "RankingView",
    properties: {
        groupFriendButton: cc.Node,
        friendButton: cc.Node,
        gameOverButton: cc.Node,
        rankingScrollView: cc.Sprite,//显示排行榜
        shareTicket: null,//群信息
    },
    onLoad() {
    },
    start() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            window.wx.showShareMenu({withShareTicket: true});//设置分享按钮，方便获取群id展示群排行榜
            setTimeout(() => {
                window.wx.postMessage({
                    messageType: 1,
                    MAIN_MENU_NUM: "x1"
                });
            }, 1000);
            let info = window.wx.getSystemInfoSync();
            cc.log(info);
            this.shareTicket = info.shareTicket;
        }
    },
    friendButtonFunc(event) {
        this.loadingLayer("panel/RankingListView", node => {
            node.getComponent(cc.Component).showRank(1);
        });
    },

    loadingLayer(panelName, onFaction) {//加载图层
        cc.loader.loadRes(panelName, (err, prefab) => {
            if (!err) {
                let node = cc.instantiate(prefab);
                if (onFaction) {
                    onFaction(node);
                }
                cc.director.getScene().children[0].addChild(node);
            }
        });
    },

    groupFriendButtonFunc: function (event) {
        this.loadingLayer("panel/RankingListView", node => {
            if (this.shareTicket) {
                node.getComponent(cc.Component).shareTicket = this.shareTicket;
            }
            node.getComponent(cc.Component).showRank(5);
        });
    },

    gameOverButtonFunc: function (event) {
        this.loadingLayer("panel/RankingListView", node => {
            node.getComponent(cc.Component).showRank(4);
        });
    },

    gameNextRankButtonFunc: function (event) {
        this.loadingLayer("panel/RankingListView", node => {
            node.getComponent(cc.Component).showRank(6, 0);
        });
    },
    gameNextRank2ButtonFunc: function (event) {
        this.loadingLayer("panel/RankingListView", node => {
            node.getComponent(cc.Component).showRank(7, 0);
        });
    },

    submitScoreButtonFunc() {
        let score = 123 + (Math.floor(Math.random() * 10));
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
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
