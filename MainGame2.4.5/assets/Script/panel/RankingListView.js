cc.Class({
    extends: cc.Component,
    properties: {
        backButton: cc.Node,
        rankingScrollView: cc.Sprite,//显示排行榜
        shareTicket: null,
    },
    onLoad() {
    },
    start() {
        if (this.shareTicket != null) {
            let shareNode = new cc.Node();
            shareNode.addComponent(cc.Label).string = "群排行";
            shareNode.setPosition(-260, 503);
            this.node.addChild(shareNode);
        }
    },

    showRank: function (messageType, score) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            // 发消息给子域
            // setTimeout(() => {
            if (this.shareTicket != null) {
                window.wx.getOpenDataContext().postMessage({
                    messageType: messageType,
                    MAIN_MENU_NUM: "x1",
                    shareTicket: this.shareTicket
                });
            } else {
                window.wx.postMessage({
                    messageType: messageType,
                    score: score,
                    MAIN_MENU_NUM: "x1"
                });
            }
            // }, 1000);
        } else {
            let gameTypeNode = new cc.Node();
            gameTypeNode.addComponent(cc.Label).string = "暂无排行榜数据";
            this.node.addChild(gameTypeNode);
            cc.log("获取排行榜数据。" + messageType);
        }
    },

    shareButtonFunc: function (event) {
    },

    backButtonFunc: function (event) {
        this.node.destroy();
    },

    onDestroy() {
    }
});
