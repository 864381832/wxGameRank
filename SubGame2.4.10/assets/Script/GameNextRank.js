cc.Class({
    extends: cc.Component,
    properties: {
        backSprite: cc.Node,
        avatarImgSprite: cc.Sprite,
        nickLabel: cc.Label,
        topScoreLabel: cc.Label,
    },
    start() {

    },

    init: function (data) {
        let avatarUrl = data.avatarUrl;
        let nick = data.nickname;
        let grade = data.KVDataList.length != 0 ? data.KVDataList[0].value : 0;
        this.createImage(avatarUrl);
        this.nickLabel.string = nick;
        this.topScoreLabel.string = grade.toString();
    },
    createImage(avatarUrl) {
        cc.assetManager.loadRemote(avatarUrl, {ext: '.jpg'}, (err, texture) => {
            this.avatarImgSprite.spriteFrame = new cc.SpriteFrame(texture);
        });
    }

});
