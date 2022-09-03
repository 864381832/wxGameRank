cc.Class({
    extends: cc.Component,

    properties: {
        rankingScrollView: cc.ScrollView,
        scrollViewContent: cc.Node,
        selfRankItem: cc.Node,
        prefabRankItem: cc.Prefab,
        prefabGameOverRank: cc.Prefab,
        gameOverRankLayout: cc.Node,
        gameNextRankNode: cc.Node,
        gameNextRankNode2: cc.Node,
        loadingLabel: cc.Node,//加载文字
    },

    onLoad() {
        this.removeChild();
        this.CC_WECHATGAME = true;
        if (this.CC_WECHATGAME) {
            window.wx.onMessage(data => {
                cc.log("接收主域发来消息：", data)
                if (data.messageType == 0) {//移除排行榜
                    this.removeChild();
                } else if (data.messageType == 1) {//获取好友排行榜
                    this.fetchFriendData(data.MAIN_MENU_NUM);
                } else if (data.messageType == 3) {//提交得分
                    this.submitScore(data.MAIN_MENU_NUM, data.score);
                } else if (data.messageType == 4) {//获取好友排行榜横向排列展示模式
                    this.gameOverRank(data.MAIN_MENU_NUM);
                } else if (data.messageType == 5) {//获取群排行榜
                    this.fetchGroupFriendData(data.MAIN_MENU_NUM, data.shareTicket);
                } else if (data.messageType == 6) {//获取即将超越
                    this.gameNextRank(data.MAIN_MENU_NUM, data.score);
                } else if (data.messageType == 7) {//获取即将超越2
                    this.gameNextRank2(data.MAIN_MENU_NUM, data.score);
                } else if (data.messageType == 10) {//世界排行榜数据
                    this.fetchWorldData(data.worldData, data.userData);
                }
            });
        } else {
            // this.fetchFriendData(1000);
            // this.gameOverRank(1000);
            // this.gameNextRank(1000, 120);
            this.gameNextRank2(1000, 120);
        }
    },
    submitScore(MAIN_MENU_NUM, score) { //提交得分
        if (this.CC_WECHATGAME) {
            window.wx.getUserCloudStorage({
                // 以key/value形式存储
                keyList: ["x" + MAIN_MENU_NUM],
                success: function (getres) {
                    console.log('getUserCloudStorage', 'success', getres)
                    if (getres.KVDataList.length != 0) {
                        window.wx.setUserCloudStorage({
                            KVDataList: [{
                                key: "Classic",
                                value: "{\"wxgame\":{\"score\":" + (getres.KVDataList[0].value > score ? getres.KVDataList[0].value : score) + ",\"update_time\": " + Date.now() + "}}"
                            }],
                        });
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
        this.rankingScrollView.node.active = false;
        this.selfRankItem.active = false;
        this.scrollViewContent.removeAllChildren();
        this.gameOverRankLayout.active = false;
        this.gameOverRankLayout.removeAllChildren();
        this.gameNextRankNode.active = false;
        this.gameNextRankNode2.active = false;
        this.loadingLabel.getComponent(cc.Label).string = "玩命加载中...";
        this.loadingLabel.active = true;
    },
    fetchFriendData(MAIN_MENU_NUM) {
        this.removeChild();
        this.rankingScrollView.node.active = true;
        if (this.CC_WECHATGAME) {
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
                                let playerInfo = data[i];
                                let item = cc.instantiate(this.prefabRankItem);
                                item.getComponent('RankItem').init(i, playerInfo);
                                this.scrollViewContent.addChild(item);
                                if (data[i].avatarUrl == userData.avatarUrl) {
                                    this.selfRankItem.active = true;
                                    this.selfRankItem.getComponent('RankItem').init(i, playerInfo);
                                }
                            }
                            if (data.length <= 8) {
                                let layout = this.scrollViewContent.getComponent(cc.Layout);
                                layout.resizeMode = cc.Layout.ResizeMode.NONE;
                            }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                            this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        }
    },
    fetchGroupFriendData(MAIN_MENU_NUM, shareTicket) {
        this.removeChild();
        this.rankingScrollView.node.active = true;
        if (this.CC_WECHATGAME) {
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
                                    this.selfRankItem.active = true;
                                    this.selfRankItem.getComponent('RankItem').init(i, playerInfo);
                                }
                            }
                            if (data.length <= 8) {
                                let layout = this.scrollViewContent.getComponent(cc.Layout);
                                layout.resizeMode = cc.Layout.ResizeMode.NONE;
                            }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                            this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        }
    },

    gameOverRank(MAIN_MENU_NUM) {
        this.removeChild();
        this.gameOverRankLayout.active = true;
        if (this.CC_WECHATGAME) {
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
                            this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        }
    },

    gameNextRank(MAIN_MENU_NUM, score) {
        this.removeChild();
        this.loadingLabel.active = false;
        if (this.CC_WECHATGAME) {
            if (score == 0) {
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
                                return -1;
                            }
                            if (b.KVDataList.length == 0) {
                                return 1;
                            }
                            return a.KVDataList[0].value - b.KVDataList[0].value;
                        });
                        this.gameNextRankData = data;
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].KVDataList.length != 0 && score < data[i].KVDataList[0].value) {
                                this.gameNextRankNode.active = true;
                                this.gameNextRankNode.getComponent(cc.Component).init(data[i]);
                                break;
                            }
                        }
                    },
                    fail: res => {
                        console.log("wx.getFriendCloudStorage fail", res);
                    },
                });
            } else {
                if (this.gameNextRankData != undefined) {
                    let data = this.gameNextRankData;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].KVDataList.length != 0 && score < data[i].KVDataList[0].value) {
                            this.gameNextRankNode.active = true;
                            this.gameNextRankNode.getComponent(cc.Component).init(data[i]);
                            break;
                        }
                    }
                } else {
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
                                    return -1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return 1;
                                }
                                return a.KVDataList[0].value - b.KVDataList[0].value;
                            });
                            for (let i = 0; i < data.length; i++) {
                                if (data[i].KVDataList.length != 0 && score < data[i].KVDataList[0].value) {
                                    this.gameNextRankNode.active = true;
                                    this.gameNextRankNode.getComponent(cc.Component).init(data[i]);
                                    break;
                                }
                            }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                        },
                    });
                }
            }
        }
    },

    gameNextRank2(MAIN_MENU_NUM, score) {
        this.removeChild();
        this.loadingLabel.active = false;
        if (this.CC_WECHATGAME) {
            if (score == 0) {
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
                                return -1;
                            }
                            if (b.KVDataList.length == 0) {
                                return 1;
                            }
                            return a.KVDataList[0].value - b.KVDataList[0].value;
                        });
                        this.gameNextRankData = data;
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].KVDataList.length != 0 && score < data[i].KVDataList[0].value) {
                                this.gameNextRankNode2.active = true;
                                this.gameNextRankNode2.getComponent(cc.Component).init(data[i]);
                                break;
                            }
                        }
                    },
                    fail: res => {
                        console.log("wx.getFriendCloudStorage fail", res);
                    },
                });
            } else {
                if (this.gameNextRankData != undefined) {
                    let data = this.gameNextRankData;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].KVDataList.length != 0 && score < data[i].KVDataList[0].value) {
                            this.gameNextRankNode2.active = true;
                            this.gameNextRankNode2.getComponent(cc.Component).init(data[i]);
                            break;
                        }
                    }
                } else {
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
                                    return -1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return 1;
                                }
                                return a.KVDataList[0].value - b.KVDataList[0].value;
                            });
                            for (let i = 0; i < data.length; i++) {
                                if (data[i].KVDataList.length != 0 && score < data[i].KVDataList[0].value) {
                                    this.gameNextRankNode2.active = true;
                                    this.gameNextRankNode2.getComponent(cc.Component).init(data[i]);
                                    break;
                                }
                            }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                        },
                    });
                }
            }
        }
    },

    fetchWorldData(worldData, userData) {
        this.removeChild();
        this.rankingScrollView.node.active = true;
        this.loadingLabel.active = false;
        let data = worldData;
        for (let i = 0; i < data.length; i++) {
            let playerInfo = data[i];
            let item = cc.instantiate(this.prefabRankItem);
            item.getComponent('RankItem').init(i, playerInfo);
            this.scrollViewContent.addChild(item);
        }
        if (data.length <= 8) {
            let layout = this.scrollViewContent.getComponent(cc.Layout);
            layout.resizeMode = cc.Layout.ResizeMode.NONE;
        }
        this.selfRankItem.active = true;
        this.selfRankItem.getComponent('RankItem').init(userData.rank, userData);
    },
});
