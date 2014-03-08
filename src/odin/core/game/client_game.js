if (typeof(define) !== "function") {
    var define = require("amdefine")(module);
}
define([
        "odin/base/device",
        "odin/base/socket.io",
        "odin/base/time",
        "odin/math/mathf",
        "odin/core/game/config",
        "odin/core/game/game",
        "odin/core/game/log",
        "odin/core/renderer/canvas",
        "odin/core/game_object",
        "odin/core/components/component",
        "odin/core/scene",
        "odin/core/input/input",
        "odin/core/input/handler",
        "odin/core/assets/assets",
        "odin/core/assets/asset_loader"
    ],
    function(Device, io, Time, Mathf, Config, Game, Log, GameObject, Component, Scene, Assets, AssetLoader) {
        "use strict";


        var stamp = Time.stamp;


        function ClientGame(opts) {
            opts || (opts = {});
            Config.fromJSON(opts);

            Game.call(this, opts);

            this.io = undefined;
            this._sessionid = undefined;

            this._inputStamp = 0;
            this._deltaState = Config.SCENE_SYNC_RATE + Config.FAKE_LAG;
            this._lag = Config.FAKE_LAG;
        }

        Game.extend(ClientGame);


        ClientGame.prototype.connect = function(handler) {
            var self = this,
                socket = this.io = io.connect(Config.host + ":" + Config.port);


            socket.on("connect", function() {
                if (!self._sessionid) self._sessionid = this.socket.sessionid;
                if (self._sessionid !== this.socket.sessionid) location.reload();

                socket.emit("client_device", Device);
            });

            socket.on("server_ready", function(game, assets) {
                Assets.fromServerJSON(assets);

                AssetLoader.load(function() {
                    self.fromServerJSON(game);

                    socket.emit("client_ready");

                    self.emit("connect", socket);
                    if (handler) handler.call(self, socket);
                });
            });

            socket.on("server_sync_input", function(timeStamp) {

                self._inputStamp = timeStamp - (Config.FAKE_LAG * 2);
                socket.emit("client_sync_input", Input.toSYNC(), stamp());
            });

            var lastState = 0;
            socket.on("server_sync_scene", function(jsonScene, serverTimeStamp) {
                var scene = self.scene,
                    timeStamp, lag;

                if (!scene) return;

                timeStamp = stamp();
                lag = timeStamp - serverTimeStamp + Config.FAKE_LAG;

                self._lag = lag;
                self._deltaState = timeStamp - (lastState || (timeStamp - Config.SCENE_SYNC_RATE - lag));
                lastState = timeStamp - lag;

                self.emit("serverSyncScene", jsonScene);
                if (Config.SYNC_SERVER_SCENE) scene.fromSYNC(jsonScene);
            });

            socket.on("server_setScene", function(scene_id) {
                var scene = self.findByServerId(scene_id);

                self.setScene(scene);
            });


            var canvasOnResize;
            socket.on("server_setCamera", function(camera_id) {
                if (!self.scene) {
                    Log.error("Socket:server_setCamera: can't set camera without an active scene, use ServerGame.setScene first");
                    return;
                }
                var camera = self.scene.findByServerId(camera_id),
                    canvas = self.canvas;

                if (!camera) {
                    Log.error("Socket:server_setCamera: can't find camera in active scene");
                    return;
                }

                self.setCamera(camera);

                if (canvasOnResize) canvas.off("resize", canvasOnResize);
                canvas.on("resize", (canvasOnResize = function() {

                    socket.emit("client_resize", this.pixelWidth, this.pixelHeight);
                }));
                socket.emit("client_resize", canvas.pixelWidth, canvas.pixelHeight);
            });

            socket.on("server_addScene", function(scene) {

                self.addScene(new Scene().fromServerJSON(scene));
            });

            socket.on("server_addGameObject", function(scene_id, gameObject) {
                var scene = self.findByServerId(scene_id);
                if (!scene) return;

                scene.addGameObject(new GameObject().fromServerJSON(gameObject));
            });

            socket.on("server_addComponent", function(scene_id, gameObject_id, component) {
                var scene = self.findByServerId(scene_id);
                if (!scene) return;

                var gameObject = scene.findByServerId(gameObject_id);
                if (!gameObject) return;

                gameObject.addComponent(new Component._types[component._type].fromServerJSON(component));
            });


            socket.on("server_removeScene", function(scene_id) {

                self.removeScene(self.findByServerId(scene_id));
            });

            socket.on("server_removeGameObject", function(scene_id, gameObject_id) {
                var scene = self.findByServerId(scene_id);
                if (!scene) return;

                scene.removeGameObject(scene.findByServerId(gameObject_id));
            });

            socket.on("server_removeComponent", function(scene_id, gameObject_id, component_type) {
                var scene = self.findByServerId(scene_id);
                if (!scene) return;

                var gameObject = scene.findByServerId(gameObject_id);
                if (!gameObject) return;

                gameObject.removeComponent(gameObject.getComponent(component_type));
            });

            return this;
        };


        ClientGame.prototype.disconnect = function() {
            var socket = this.io;

            socket.disconnect();
            socket.removeAllListeners();
            this._sessionid = undefined;

            return this;
        };


        return ClientGame;
    }
);
