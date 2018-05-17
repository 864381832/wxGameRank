cc.Class({
    extends: cc.Component,

    properties: {
        rankingScrollView: cc.ScrollView,
        scrollViewContent: cc.Node,
        prefabRankItem: cc.Prefab,
        prefabGameOverRank: cc.Prefab,
        gameOverRankLayout: cc.Node,
        loadingLabel: cc.Node,//加载文字
    },

    start() {
        this.removeChild();
        if (window.wx != undefined) {
            window.wx.onMessage(data => {
                cc.log("接收主域发来消息：", data)
                if (data.messageType == 0) {
                    this.removeChild();
                } else if (data.messageType == 1) {
                    this.fetchFriendData(data.MAIN_MENU_NUM);
                } else if (data.messageType == 3) {
                    this.submitScore(data.MAIN_MENU_NUM, data.score);
                } else if (data.messageType == 4) {
                    this.gameOverRank(data.MAIN_MENU_NUM);
                } else if (data.messageType == 5) {
                    this.fetchGroupFriendData(data.MAIN_MENU_NUM, data.shareTicket);
                }
            });
        } else {
            this.fetchFriendData(1000);
            // this.gameOverRank(1000);
        }
    },
    submitScore(MAIN_MENU_NUM, score) { //提交得分
        if (window.wx != undefined) {
            window.wx.getUserCloudStorage({
                // 以key/value形式存储
                keyList: ["x" + MAIN_MENU_NUM],
                success: function (getres) {
                    console.log('getUserCloudStorage', 'success', getres)
                    if (getres.KVDataList.length != 0) {
                        if (getres.KVDataList[0].value > score) {
                            return;
                        }
                    }
                    // 对用户托管数据进行写数据操作
                    window.wx.setUserCloudStorage({
                        KVDataList: [{key: "x" + MAIN_MENU_NUM, value: "" + score}],
                        success: function (res) {
                            console.log('setUserCloudStorage', 'success', res)
                        },
                        fail: function (res) {
                            console.log('setUserCloudStorage', 'fail')
                        },
                        complete: function (res) {
                            console.log('setUserCloudStorage', 'ok')
                        }
                    });
                },
                fail: function (res) {
                    console.log('getUserCloudStorage', 'fail')
                },
                complete: function (res) {
                    console.log('getUserCloudStorage', 'ok')
                }
            });
        } else {
            cc.log("提交得分:" + MAIN_MENU_NUM + " : " + score)
        }
    },
    removeChild() {
        this.node.removeChildByTag(1000);
        this.rankingScrollView.node.active = false;
        this.scrollViewContent.removeAllChildren();
        this.gameOverRankLayout.active = false;
        this.gameOverRankLayout.removeAllChildren();
        this.loadingLabel.string = "玩命加载中...";
        this.loadingLabel.active = true;
    },
    fetchFriendData(MAIN_MENU_NUM) {
        this.removeChild();
        this.rankingScrollView.node.active = true;
        if (window.wx != undefined) {
            wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    this.loadingLabel.active = false;
                    console.log('success', userRes.data)
                    let userData = userRes.data[0];
                    //取出所有好友数据
                    wx.getFriendCloudStorage({
                        keyList: ["x" + MAIN_MENU_NUM],
                        success: res => {
                            console.log("wx.getFriendCloudStorage success", res);
                            let data = res.data;
                            data.sort((a, b) => {
                                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                    return 0;
                                }
                                if (a.KVDataList.length == 0) {
                                    return 1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return -1;
                                }
                                return b.KVDataList[0].value - a.KVDataList[0].value;
                            });
                            for (let i = 0; i < data.length; i++) {
                                var playerInfo = data[i];
                                var item = cc.instantiate(this.prefabRankItem);
                                item.getComponent('RankItem').init(i, playerInfo);
                                this.scrollViewContent.addChild(item);
                                if (data[i].avatarUrl == userData.avatarUrl) {
                                    let userItem = cc.instantiate(this.prefabRankItem);
                                    userItem.getComponent('RankItem').init(i, playerInfo);
                                    userItem.y = -354;
                                    this.node.addChild(userItem, 1, 1000);
                                }
                            }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                            this.loadingLabel.string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        } else {
            let userData = {nickname: "徐小燕11"};
            let data = new Array();
            for (let i = 0; i < 12; i++) {
                data[i] = {
                    KVDataList: [{key: "x1", value: "12" + i}],
                    avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/9h9G1VucURhfeXmbIicrXRnuJAvxdBfAC3xeSvfvjsYAfhJahJvU9ic2dTUpn5icLich8QDGeB0ojwUWfJia16O1yXQ/132",
                    nickname: "徐小燕" + i,
                    openid: "sadfsdg" + i
                }
            }
            data.sort((a, b) => {
                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                    return 0;
                }
                if (a.KVDataList.length == 0) {
                    return 1;
                }
                if (b.KVDataList.length == 0) {
                    return -1;
                }
                return b.KVDataList[0].value - a.KVDataList[0].value;
            });
            for (let i = 0; i < data.length; i++) {
                // this.drawRankItem(i,data[i]);
                let playerInfo = data[i];
                let item = cc.instantiate(this.prefabRankItem);
                item.getComponent('RankItem').init(i, playerInfo);
                this.scrollViewContent.addChild(item);
                if (data[i].nickname == userData.nickname) {
                    let userItem = cc.instantiate(this.prefabRankItem);
                    userItem.getComponent('RankItem').init(i, playerInfo);
                    userItem.y = -354;
                    this.node.addChild(userItem);
                }
            }
        }
    },
    fetchGroupFriendData(MAIN_MENU_NUM, shareTicket) {
        this.removeChild();
        this.rankingScrollView.node.active = true;
        if (window.wx != undefined) {
            wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    console.log('success', userRes.data)
                    let userData = userRes.data[0];
                    //取出所有好友数据
                    wx.getGroupCloudStorage({
                        shareTicket: shareTicket,
                        keyList: ["x" + MAIN_MENU_NUM],
                        success: res => {
                            console.log("wx.getGroupCloudStorage success", res);
                            this.loadingLabel.active = false;
                            let data = res.data;
                            data.sort((a, b) => {
                                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                    return 0;
                                }
                                if (a.KVDataList.length == 0) {
                                    return 1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return -1;
                                }
                                return b.KVDataList[0].value - a.KVDataList[0].value;
                            });
                            for (let i = 0; i < data.length; i++) {
                                var playerInfo = data[i];
                                var item = cc.instantiate(this.prefabRankItem);
                                item.getComponent('RankItem').init(i, playerInfo);
                                this.scrollViewContent.addChild(item);
                                if (data[i].avatarUrl == userData.avatarUrl) {
                                    let userItem = cc.instantiate(this.prefabRankItem);
                                    userItem.getComponent('RankItem').init(i, playerInfo);
                                    userItem.y = -354;
                                    this.node.addChild(userItem, 1, 1000);
                                }
                            }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                            this.loadingLabel.string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        } else {
            let userData = {nickname: "徐小燕11"};
            let data = new Array();
            for (let i = 0; i < 12; i++) {
                data[i] = {
                    KVDataList: [{key: "x1", value: "12" + i}],
                    avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/9h9G1VucURhfeXmbIicrXRnuJAvxdBfAC3xeSvfvjsYAfhJahJvU9ic2dTUpn5icLich8QDGeB0ojwUWfJia16O1yXQ/132",
                    nickname: "徐小燕" + i,
                    openid: "sadfsdg" + i
                }
            }
            data.sort((a, b) => {
                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                    return 0;
                }
                if (a.KVDataList.length == 0) {
                    return 1;
                }
                if (b.KVDataList.length == 0) {
                    return -1;
                }
                return b.KVDataList[0].value - a.KVDataList[0].value;
            });
            for (let i = 0; i < data.length; i++) {
                // this.drawRankItem(i,data[i]);
                let playerInfo = data[i];
                let item = cc.instantiate(this.prefabRankItem);
                item.getComponent('RankItem').init(i, playerInfo);
                this.scrollViewContent.addChild(item);
                if (data[i].nickname == userData.nickname) {
                    let userItem = cc.instantiate(this.prefabRankItem);
                    userItem.getComponent('RankItem').init(i, playerInfo);
                    userItem.y = -354;
                    this.node.addChild(userItem);
                }
            }
        }
    },

    gameOverRank(MAIN_MENU_NUM) {
        this.removeChild();
        this.gameOverRankLayout.active = true;
        if (window.wx != undefined) {
            wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    cc.log('success', userRes.data)
                    let userData = userRes.data[0];
                    //取出所有好友数据
                    wx.getFriendCloudStorage({
                        keyList: ["x" + MAIN_MENU_NUM],
                        success: res => {
                            cc.log("wx.getFriendCloudStorage success", res);
                            this.loadingLabel.active = false;
                            let data = res.data;
                            data.sort((a, b) => {
                                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                    return 0;
                                }
                                if (a.KVDataList.length == 0) {
                                    return 1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return -1;
                                }
                                return b.KVDataList[0].value - a.KVDataList[0].value;
                            });
                            for (let i = 0; i < data.length; i++) {
                                if (data[i].avatarUrl == userData.avatarUrl) {
                                    if ((i - 1) >= 0) {
                                        if ((i + 1) >= data.length && (i - 2) >= 0) {
                                            let userItem = cc.instantiate(this.prefabGameOverRank);
                                            userItem.getComponent('GameOverRank').init(i - 2, data[i - 2]);
                                            this.gameOverRankLayout.addChild(userItem);
                                        }
                                        let userItem = cc.instantiate(this.prefabGameOverRank);
                                        userItem.getComponent('GameOverRank').init(i - 1, data[i - 1]);
                                        this.gameOverRankLayout.addChild(userItem);
                                    } else {
                                        if ((i + 2) >= data.length) {
                                            let node = new cc.Node();
                                            node.width = 200;
                                            this.gameOverRankLayout.addChild(node);
                                        }
                                    }
                                    let userItem = cc.instantiate(this.prefabGameOverRank);
                                    userItem.getComponent('GameOverRank').init(i, data[i], true);
                                    this.gameOverRankLayout.addChild(userItem);
                                    if ((i + 1) < data.length) {
                                        let userItem = cc.instantiate(this.prefabGameOverRank);
                                        userItem.getComponent('GameOverRank').init(i + 1, data[i + 1]);
                                        this.gameOverRankLayout.addChild(userItem);
                                        if ((i - 1) < 0 && (i + 2) < data.length) {
                                            let userItem = cc.instantiate(this.prefabGameOverRank);
                                            userItem.getComponent('GameOverRank').init(i + 2, data[i + 2]);
                                            this.gameOverRankLayout.addChild(userItem);
                                        }
                                    }
                                }
                            }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                            this.loadingLabel.string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        } else {
            let userData = {nickname: "徐小燕2"};
            let data = new Array();
            for (let i = 0; i < 6; i++) {
                data[i] = {
                    KVDataList: [{key: "x1", value: "12" + i}],
                    avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/9h9G1VucURhfeXmbIicrXRnuJAvxdBfAC3xeSvfvjsYAfhJahJvU9ic2dTUpn5icLich8QDGeB0ojwUWfJia16O1yXQ/132",
                    nickname: "徐小燕" + i,
                    openid: "sadfsdg" + i
                }
            }
            data.sort((a, b) => {
                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                    return 0;
                }
                if (a.KVDataList.length == 0) {
                    return 1;
                }
                if (b.KVDataList.length == 0) {
                    return -1;
                }
                return b.KVDataList[0].value - a.KVDataList[0].value;
            });
            for (let i = 0; i < data.length; i++) {
                if (data[i].nickname == userData.nickname) {
                    if ((i - 1) >= 0) {
                        if ((i + 1) >= data.length && (i - 2) >= 0) {
                            let userItem = cc.instantiate(this.prefabGameOverRank);
                            userItem.getComponent('GameOverRank').init(i - 2, data[i - 2]);
                            this.gameOverRankLayout.addChild(userItem);
                        }
                        let userItem = cc.instantiate(this.prefabGameOverRank);
                        userItem.getComponent('GameOverRank').init(i - 1, data[i - 1]);
                        this.gameOverRankLayout.addChild(userItem);
                    } else {
                        if ((i + 2) >= data.length) {
                            let node = new cc.Node();
                            node.width = 200;
                            this.gameOverRankLayout.addChild(node);
                        }
                    }
                    let userItem = cc.instantiate(this.prefabGameOverRank);
                    userItem.getComponent('GameOverRank').init(i, data[i], true);
                    // userItem.y = -354;
                    this.gameOverRankLayout.addChild(userItem);
                    if ((i + 1) < data.length) {
                        let userItem = cc.instantiate(this.prefabGameOverRank);
                        userItem.getComponent('GameOverRank').init(i + 1, data[i + 1]);
                        this.gameOverRankLayout.addChild(userItem);
                        if ((i - 1) < 0 && (i + 2) < data.length) {
                            let userItem = cc.instantiate(this.prefabGameOverRank);
                            userItem.getComponent('GameOverRank').init(i + 2, data[i + 2]);
                            this.gameOverRankLayout.addChild(userItem);
                        }
                    }
                }
            }
        }
    },
});
